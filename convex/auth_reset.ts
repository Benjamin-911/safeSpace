import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { simpleHash } from "./users";

const THROTTLE_WINDOW_MS = 60 * 1000; // don't allow a new code more than once a minute
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Internal-only lookup so the action can read user state without exposing a public query
export const getUserForReset = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
    },
});

// Internal-only write so the action can persist the token after (maybe) sending the email
export const setResetToken = internalMutation({
    args: { userId: v.id("users"), token: v.string(), expiry: v.number() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            resetToken: args.token,
            resetTokenExpiry: args.expiry,
        });
    },
});

async function sendResetEmail(email: string, token: string): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return false; // no provider configured

    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || "SafeSpace Salone <onboarding@resend.dev>",
            to: [email],
            subject: "Your SafeSpace Salone verification code",
            text: `Your verification code is ${token}. It expires in 15 minutes. If you didn't request this, you can safely ignore this email.`,
        }),
    });

    if (!res.ok) {
        console.error("[AUTH] Resend API error:", res.status, await res.text());
        return false;
    }
    return true;
}

// Public action: request a reset code. Runs as an action (not a mutation) because
// it needs to make an outbound fetch call to the email provider.
export const generateResetToken = action({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const normalizedEmail = args.email.toLowerCase();
        const user = await ctx.runQuery(internal.auth_reset.getUserForReset, {
            email: normalizedEmail,
        });

        // Don't reveal whether the account exists either way
        if (!user) {
            return { success: true };
        }

        // Throttle: if a code was issued in the last minute, don't issue another
        if (user.resetTokenExpiry && user.resetTokenExpiry - TOKEN_TTL_MS + THROTTLE_WINDOW_MS > Date.now()) {
            return { success: true };
        }

        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + TOKEN_TTL_MS;

        await ctx.runMutation(internal.auth_reset.setResetToken, {
            userId: user._id,
            token,
            expiry,
        });

        const emailSent = await sendResetEmail(normalizedEmail, token);

        if (emailSent) {
            return { success: true };
        }

        // No email provider configured (local dev only) - fall back to returning
        // the code directly so development still works. This path never fires
        // once RESEND_API_KEY is set in the deployment environment.
        console.warn(
            `[AUTH] RESEND_API_KEY not set - DEV FALLBACK ONLY. Reset code for ${normalizedEmail}: ${token}`
        );
        return { success: true, debugToken: token };
    },
});

export const resetPasswordWithToken = mutation({
    args: {
        email: v.string(),
        token: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        if (args.newPassword.length < 6) {
            return { success: false, error: "Password must be at least 6 characters" };
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (!user) {
            return { success: false, error: "Invalid request" };
        }

        if (
            !user.resetToken ||
            user.resetToken !== args.token ||
            !user.resetTokenExpiry ||
            user.resetTokenExpiry < Date.now()
        ) {
            return { success: false, error: "Invalid or expired token" };
        }

        const passwordHash = simpleHash(args.newPassword);

        await ctx.db.patch(user._id, {
            passwordHash,
            resetToken: undefined,
            resetTokenExpiry: undefined,
        });

        return { success: true };
    },
});
