import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const generateResetToken = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            // Don't reveal if user exists
            return { success: true };
        }

        // Generate a simple 6-digit code for this demo (production would use longer random string)
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

        await ctx.db.patch(user._id, {
            resetToken: token,
            resetTokenExpiry: expiry,
        });

        console.log(`[AUTH] Reset token for ${args.email}: ${token}`);

        // In a real app, we would send an email here using Resend or similar
        return { success: true, debugToken: token };
    },
});

export const resetPasswordWithToken = mutation({
    args: {
        email: v.string(),
        token: v.string(),
        newPasswordHash: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
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

        await ctx.db.patch(user._id, {
            passwordHash: args.newPasswordHash,
            resetToken: undefined,
            resetTokenExpiry: undefined,
        });

        return { success: true };
    },
});
