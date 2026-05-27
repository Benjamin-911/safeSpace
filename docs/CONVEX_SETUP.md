# Convex Database Setup Guide

## ✅ Migration Complete!

The codebase has been migrated from localStorage to Convex. All pages now use Convex queries and mutations.

## 🚀 Setup Instructions

### Step 1: Initialize Convex

Run this command in your terminal:

```bash
npx convex dev
```

This will:
- Create a Convex account (if you don't have one)
- Generate a deployment URL
- Add `NEXT_PUBLIC_CONVEX_URL` to your `.env.local` file
- Start the Convex development server

### Step 2: Verify Setup

After running `npx convex dev`, check that:
1. `.env.local` now contains `NEXT_PUBLIC_CONVEX_URL`
2. The Convex dashboard opens in your browser
3. Your schema is synced

### Step 3: Test the App

1. Start your Next.js dev server (if not already running):
   ```bash
   npm run dev
   ```

2. Register a new user or login
3. Send messages in the chat
4. Verify data persists after page refresh

## 📊 What Changed

### Updated Files:
- ✅ `convex/schema.ts` - Added email field and index
- ✅ `convex/users.ts` - Added getUserByEmail and getUserById queries
- ✅ `convex/messages.ts` - Already configured correctly
- ✅ `app/chat/page.tsx` - Now uses Convex queries/mutations
- ✅ `app/page.tsx` - Registration uses Convex
- ✅ `app/login/page.tsx` - Login uses Convex
- ✅ `components/chat-message.tsx` - Updated for Convex document format
- ✅ `lib/user-session.ts` - New helper for managing user session

### Data Flow:
1. **Registration/Login** → Creates/retrieves user → Stores Convex ID in localStorage
2. **Chat** → Uses Convex ID to query messages → Real-time updates
3. **Messages** → Saved via Convex mutations → Automatically synced

## 🔄 Migration Notes

### Previous (localStorage):
- Data stored in browser localStorage
- Not persistent across devices
- Limited to single browser

### New (Convex):
- ✅ Cloud database with real-time sync
- ✅ Persistent across devices
- ✅ Scalable and production-ready
- ✅ Automatic real-time updates

## ⚠️ Important Notes

1. **First Run**: You need to run `npx convex dev` before the app will work
2. **Existing Data**: Previous localStorage data will not be migrated automatically
3. **Session Management**: User ID is stored in localStorage, but actual data is in Convex

## 🐛 Troubleshooting

### "Convex URL not configured"
- Run `npx convex dev` to initialize Convex
- Check that `.env.local` has `NEXT_PUBLIC_CONVEX_URL`

### "User not found" errors
- Clear localStorage and register a new user
- Old localStorage users won't work with Convex

### Build errors
- Run `npx convex dev` to generate types
- Make sure `convex/_generated` folder exists

## 🎯 Next Steps

After setup, you can:
- View data in Convex dashboard
- Set up authentication (if needed)
- Deploy to production
- Add more database queries/functions

Happy coding! 🚀

