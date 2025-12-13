# 🚀 Deploy to Vercel - Step by Step Guide

## Prerequisites

✅ **Before starting, make sure you have:**
1. Your Convex URL: `https://perfect-anteater-505.convex.cloud` (from `npx convex deploy`)
2. Your OpenAI API key (optional, but recommended for chat + transcription)
3. A GitHub/GitLab/Bitbucket account (for easiest deployment)
4. Your code committed to a Git repository

---

## Method 1: Deploy via Vercel Website (Easiest) ⭐

### Step 1: Push Your Code to GitHub

If you haven't already:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Push to GitHub
# Create a new repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/safeSpace.git
git push -u origin main
```

### Step 2: Go to Vercel

1. **Visit**: https://vercel.com
2. **Click**: "Sign Up" or "Login"
3. **Choose**: Sign up with GitHub (easiest option)

### Step 3: Import Your Project

1. After logging in, click **"Add New Project"** (big button)
2. You'll see your GitHub repositories
3. **Find and click** on your `safeSpace` repository
4. Click **"Import"**

### Step 4: Configure Project

#### A. Project Settings

Vercel will auto-detect Next.js settings:
- **Framework Preset**: Next.js ✅ (auto-detected)
- **Root Directory**: `./` (leave as is)
- **Build Command**: `npm run build` ✅ (auto-detected)
- **Output Directory**: `.next` ✅ (auto-detected)
- **Install Command**: `npm install` ✅ (auto-detected)

#### B. Add Environment Variables ⚠️ **IMPORTANT**

1. Scroll down to **"Environment Variables"** section
2. Click **"Add"** button for each variable:

   **Variable 1: Convex URL**
   - **Name**: `NEXT_PUBLIC_CONVEX_URL`
   - **Value**: `https://perfect-anteater-505.convex.cloud`
   - **Environments**: ✅ Production ✅ Preview ✅ Development (select all)

   **Variable 2: OpenAI API Key** (optional but recommended)
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-your-actual-openai-key-here`
   - **Environments**: ✅ Production ✅ Preview ✅ Development (select all)

3. Click **"Add"** after each variable to save it

### Step 5: Deploy!

1. Click the big **"Deploy"** button at the bottom
2. Wait for the build to complete (usually 1-2 minutes)
3. **Success!** 🎉

### Step 6: Access Your Live App

1. After deployment, you'll see a success screen
2. Click **"Visit"** or go to your project dashboard
3. Your app is live at: `https://your-project-name.vercel.app`

---

## Method 2: Deploy via Vercel CLI (Command Line)

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser to authenticate.

### Step 3: Deploy

```bash
# Navigate to your project directory
cd "c:\Users\ANGEL MABORNEH\safeSpace"

# Deploy (follow prompts)
vercel
```

**Answer the prompts:**
- Set up and deploy? → **Yes**
- Which scope? → Select your account
- Link to existing project? → **No** (first time)
- What's your project's name? → `safeSpace` (or press Enter)
- In which directory is your code located? → `./` (press Enter)
- Want to override settings? → **No**

### Step 4: Add Environment Variables

```bash
# Add Convex URL
vercel env add NEXT_PUBLIC_CONVEX_URL production
# When prompted, enter: https://perfect-anteater-505.convex.cloud

# Add OpenAI API Key (optional)
vercel env add OPENAI_API_KEY production
# When prompted, enter your OpenAI API key

# Also add to preview and development
vercel env add NEXT_PUBLIC_CONVEX_URL preview
vercel env add NEXT_PUBLIC_CONVEX_URL development
vercel env add OPENAI_API_KEY preview
vercel env add OPENAI_API_KEY development
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

---

## ✅ Verify Deployment

### Check Your Live App

1. **Visit your URL**: `https://your-project.vercel.app`
2. **Test registration**: Register a new user
3. **Test chat**: Send a message
4. **Check console**: Open browser DevTools (F12) → Console
   - Look for: "Trying Convex AI..." or "Convex AI response received"

### Check Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click on your project
3. Check **"Deployments"** tab - should show ✅ successful deployment
4. Check **"Settings"** → **"Environment Variables"** - verify all variables are set

### Check Convex Dashboard

1. Go to https://dashboard.convex.dev
2. Select your project
3. Go to **"Data"** tab - should see users and messages being saved
4. Go to **"Functions"** tab - verify `aiCounselor:processMessage` is deployed

---

## 🔧 Troubleshooting

### Issue: Environment variables not working

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Make sure variables are added for **Production**, **Preview**, and **Development**
3. Click **"Redeploy"** on the latest deployment after adding variables

### Issue: Build fails

**Solution:**
1. Check build logs in Vercel Dashboard → Deployments → Click on failed deployment
2. Make sure all dependencies are in `package.json`
3. Try building locally first: `npm run build`

### Issue: Convex not connecting

**Solution:**
1. Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly (no trailing slash)
2. Check Convex Dashboard - make sure functions are deployed
3. Check browser console for connection errors

### Issue: OpenAI not working

**Solution:**
1. Verify `OPENAI_API_KEY` is set (starts with `sk-`)
2. Check OpenAI dashboard for usage/quota
3. Make sure key has credits available

---

## 📋 Quick Checklist

Before deploying:
- [ ] Code is pushed to GitHub/GitLab
- [ ] Convex is deployed: `npx convex deploy`
- [ ] You have Convex URL: `https://perfect-anteater-505.convex.cloud`
- [ ] You have OpenAI API key (optional)

During deployment:
- [ ] Imported project on Vercel
- [ ] Added `NEXT_PUBLIC_CONVEX_URL` environment variable
- [ ] Added `OPENAI_API_KEY` environment variable (optional)
- [ ] Selected all environments (Production, Preview, Development)
- [ ] Clicked "Deploy"

After deployment:
- [ ] App loads on live URL
- [ ] Can register/login
- [ ] Chat messages work
- [ ] Browser console shows Convex AI working
- [ ] Data saves to Convex database

---

## 🎯 Your Deployment Details

Based on your setup:

**Convex Deployment:**
- URL: `https://perfect-anteater-505.convex.cloud` ✅
- Status: Deployed ✅

**Next.js App:**
- Build: ✅ Successful
- Ready: ✅ Yes

**Environment Variables Needed:**
```
NEXT_PUBLIC_CONVEX_URL=https://perfect-anteater-505.convex.cloud
OPENAI_API_KEY=sk-your-key-here (optional)
```

---

## 🚀 Next Steps After Deployment

1. **Test thoroughly** - Make sure everything works
2. **Set up custom domain** (optional) - In Vercel Settings → Domains
3. **Enable analytics** (optional) - Already included in your app
4. **Monitor usage** - Check Convex and OpenAI dashboards for usage

**You're all set!** Your app is now live and accessible worldwide! 🌍

