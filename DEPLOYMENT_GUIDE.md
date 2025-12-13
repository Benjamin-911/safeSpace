# Deployment Guide for SafeSpace Salone

## ✅ Yes, Convex AI Works in Production!

When you deploy/host this app, Convex AI will work, but you need to follow these steps.

---

## 🚀 Deployment Steps

### 1. Deploy Convex Functions First

Before deploying your Next.js app, you need to deploy your Convex functions:

```bash
# Make sure you're logged into Convex
npx convex deploy

# This will:
# - Deploy all your functions (aiCounselor, users, messages, etc.)
# - Give you a production Convex URL
# - Set up your production database
```

**After deployment, Convex will provide you with:**
- `NEXT_PUBLIC_CONVEX_URL` - Your production Convex URL (e.g., `https://happy-fish-123.convex.cloud`)

---

### 2. Set Environment Variables in Your Hosting Platform

Add these environment variables to your hosting platform (Vercel, Netlify, etc.):

#### Required Variables:

```env
# Convex (Production URL from step 1)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# OpenAI (for chat and audio transcription)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

#### Optional Variables:

```env
# If you want to use different OpenAI models
OPENAI_MODEL=gpt-4o-mini  # Default is gpt-4o-mini
```

---

### 3. How to Add Environment Variables

#### **Vercel:**
1. Go to your project dashboard
2. Settings → Environment Variables
3. Add each variable for "Production"
4. Redeploy your app

#### **Netlify:**
1. Site settings → Environment variables
2. Add each variable
3. Trigger a new deploy

#### **Other Platforms:**
- Check your platform's documentation for environment variable setup

---

## 🎯 AI System Fallback Chain

Your app has a **smart fallback system** that ensures it always works:

### Priority Order:

1. **Convex AI** (Best - offline-capable, Sierra Leone-specific)
   - ✅ Works if Convex is deployed and `NEXT_PUBLIC_CONVEX_URL` is set
   - ✅ No API costs
   - ✅ Culturally tuned for Sierra Leone

2. **OpenAI API** (Fallback #1)
   - ✅ Works if `OPENAI_API_KEY` is set
   - ⚠️ Costs ~$0.50/month for small apps
   - ✅ High quality responses

3. **Local Fallback AI** (Fallback #2 - Always Works)
   - ✅ Always works, no API needed
   - ✅ Free
   - ✅ Good quality, culturally appropriate

**Result:** Your app will **always work**, even if Convex or OpenAI isn't configured!

---

## 📋 Deployment Checklist

### Before Deployment:

- [ ] Run `npx convex deploy` to deploy Convex functions
- [ ] Copy the `NEXT_PUBLIC_CONVEX_URL` from Convex dashboard
- [ ] Get your OpenAI API key (if you want chat + transcription)
- [ ] Test locally with production environment variables

### During Deployment:

- [ ] Add `NEXT_PUBLIC_CONVEX_URL` to hosting platform
- [ ] Add `OPENAI_API_KEY` to hosting platform (optional but recommended)
- [ ] Build the Next.js app: `npm run build`
- [ ] Deploy to your hosting platform

### After Deployment:

- [ ] Test the app - send a message in chat
- [ ] Verify Convex AI is working (check console for "Trying Convex AI...")
- [ ] Test voice messages (requires OpenAI for transcription)
- [ ] Verify database is working (users, messages are saved)

---

## 🔍 How to Verify Convex is Working

### In Browser Console:

After sending a message, check the console:

```
✅ If Convex is working:
"Trying Convex AI..."
"Convex AI response received"

❌ If Convex is NOT working:
"Convex AI not available (run 'npx convex dev'), trying alternatives..."
"Trying OpenAI..."
```

### In Convex Dashboard:

1. Go to https://dashboard.convex.dev
2. Check your project
3. Go to "Data" tab - you should see users and messages
4. Go to "Functions" tab - you should see `aiCounselor:processMessage`

---

## 💰 Cost Breakdown for Production

### Free Tier (No Costs):

- ✅ Convex AI - FREE (offline-capable)
- ✅ Local Fallback AI - FREE
- ✅ Convex Database - FREE tier available
- ✅ Next.js hosting - FREE on Vercel

### Paid (Optional):

- ⚠️ OpenAI API - ~$0.50/month for small apps
  - Chat responses: ~$0.15/1M input tokens
  - Audio transcription: ~$0.006/minute

**Recommendation:** Start with Convex AI (free) and only add OpenAI if you need better responses or audio transcription.

---

## 🛠️ Troubleshooting

### Issue: "Could not find public function for 'aiCounselor:processMessage'"

**Solution:**
1. Run `npx convex deploy` to deploy functions
2. Make sure `NEXT_PUBLIC_CONVEX_URL` is set in production
3. Check Convex dashboard that functions are deployed

### Issue: OpenAI not working in production

**Solution:**
1. Verify `OPENAI_API_KEY` is set in hosting platform
2. Make sure variable name is exactly `OPENAI_API_KEY`
3. Redeploy after adding environment variables

### Issue: Database not saving in production

**Solution:**
1. Check `NEXT_PUBLIC_CONVEX_URL` is correct
2. Verify Convex deployment was successful
3. Check Convex dashboard for any errors

---

## 🎉 Summary

**Yes, Convex AI works in production!** Just make sure to:

1. ✅ Deploy Convex functions: `npx convex deploy`
2. ✅ Set `NEXT_PUBLIC_CONVEX_URL` in your hosting platform
3. ✅ (Optional) Set `OPENAI_API_KEY` for better responses
4. ✅ Your app will always work thanks to the fallback system!

The app is production-ready and will gracefully handle any missing services. 🚀

