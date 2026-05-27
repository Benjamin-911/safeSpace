# Deploy Next.js App with Environment Variables

## 🚀 Step-by-Step Deployment Guide

---

## Option 1: Deploy to Vercel (Recommended - Easiest for Next.js)

Vercel is made by the creators of Next.js, so it's the easiest option.

### Prerequisites:

1. **Deploy Convex first** (if you haven't already):
   ```bash
   npx convex deploy
   ```
   This gives you the `NEXT_PUBLIC_CONVEX_URL` you'll need.

2. **Have your API keys ready**:
   - `NEXT_PUBLIC_CONVEX_URL` (from Convex dashboard)
   - `OPENAI_API_KEY` (from OpenAI platform)

---

### Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm i -g vercel
```

Or use the web interface (no installation needed).

---

### Step 2: Deploy via Vercel CLI

#### Method A: Using Command Line

```bash
# Make sure you're in your project directory
cd "c:\Users\ANGEL MABORNEH\safeSpace"

# Login to Vercel (if first time)
vercel login

# Deploy (follow the prompts)
vercel

# For production deployment
vercel --prod
```

#### Method B: Using Web Interface (Easier)

1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub, GitLab, or Bitbucket
3. **Click "Add New Project"**
4. **Import your repository**:
   - Connect your Git provider (GitHub/GitLab)
   - Select your `safeSpace` repository
   - Click "Import"

---

### Step 3: Set Environment Variables in Vercel

#### Method A: During Deployment (Web Interface)

1. After importing, you'll see **"Configure Project"**
2. Scroll down to **"Environment Variables"** section
3. Click **"Add"** for each variable:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_CONVEX_URL`
   - Value: `https://your-project.convex.cloud` (from Convex dashboard)
   - Environment: Select all (Production, Preview, Development)

   **Variable 2:**
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-actual-api-key-here`
   - Environment: Select all (Production, Preview, Development)

4. Click **"Deploy"**

#### Method B: After Deployment (Dashboard)

1. Go to your project dashboard on Vercel
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in sidebar
4. Add each variable:
   - Click **"Add New"**
   - Enter name and value
   - Select environments (Production, Preview, Development)
   - Click **"Save"**
5. **Redeploy** your app:
   - Go to **"Deployments"** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

#### Method C: Using CLI

```bash
# Set environment variables
vercel env add NEXT_PUBLIC_CONVEX_URL production
# (It will prompt you to enter the value)

vercel env add OPENAI_API_KEY production
# (It will prompt you to enter the value)

# Pull environment variables locally (optional)
vercel env pull .env.local

# Redeploy
vercel --prod
```

---

### Step 4: Verify Deployment

1. **Check your deployment**:
   - Go to Vercel dashboard
   - Click on your project
   - See your live URL (e.g., `https://safe-space.vercel.app`)

2. **Test the app**:
   - Open your live URL
   - Register/Login
   - Send a message in chat
   - Check browser console for "Trying Convex AI..." messages

3. **Verify environment variables are loaded**:
   - Check browser console for any errors
   - Test voice messages (requires OpenAI key)

---

## Option 2: Deploy to Netlify

### Step 1: Install Netlify CLI

```bash
npm i -g netlify-cli
```

### Step 2: Deploy

```bash
# Build your app first
npm run build

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Step 3: Set Environment Variables

1. Go to **Netlify Dashboard** → Your site
2. **Site settings** → **Environment variables**
3. Click **"Add a variable"**
4. Add:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `OPENAI_API_KEY`
5. **Trigger deploy** → **Clear cache and deploy site**

---

## Option 3: Deploy to Railway

### Step 1: Install Railway CLI

```bash
npm i -g @railway/cli
```

### Step 2: Deploy

```bash
# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Step 3: Set Environment Variables

1. Go to **Railway Dashboard** → Your project
2. Click **"Variables"** tab
3. Click **"New Variable"**
4. Add your variables
5. Redeploy automatically happens

---

## Option 4: Deploy to Other Platforms

### Render, Fly.io, DigitalOcean, etc.

Most platforms follow similar steps:

1. **Connect your Git repository**
2. **Set build command**: `npm run build`
3. **Set start command**: `npm start`
4. **Add environment variables** in platform settings
5. **Deploy**

---

## 🔑 Important Environment Variables

### Required:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### Optional (but recommended):

```env
OPENAI_API_KEY=sk-your-openai-api-key
```

### How to Get Your Values:

#### `NEXT_PUBLIC_CONVEX_URL`:

1. Run `npx convex deploy` locally
2. Go to https://dashboard.convex.dev
3. Select your project
4. Copy the URL from the dashboard (it's displayed prominently)

Or check your `.env.local` file after running `npx convex dev` locally.

#### `OPENAI_API_KEY`:

1. Go to https://platform.openai.com/api-keys
2. Sign in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

---

## 📋 Deployment Checklist

### Before Deployment:

- [ ] Deploy Convex functions: `npx convex deploy`
- [ ] Get `NEXT_PUBLIC_CONVEX_URL` from Convex dashboard
- [ ] Get `OPENAI_API_KEY` (optional but recommended)
- [ ] Test app locally: `npm run dev`
- [ ] Build locally to check for errors: `npm run build`

### During Deployment:

- [ ] Choose deployment platform (Vercel recommended)
- [ ] Connect Git repository
- [ ] Add `NEXT_PUBLIC_CONVEX_URL` environment variable
- [ ] Add `OPENAI_API_KEY` environment variable (optional)
- [ ] Deploy

### After Deployment:

- [ ] Verify app loads on live URL
- [ ] Test registration/login
- [ ] Send a chat message
- [ ] Check browser console for errors
- [ ] Verify Convex AI is working (check console logs)
- [ ] Test voice messages (if OpenAI key is set)

---

## 🐛 Troubleshooting

### Issue: Environment variables not working

**Solution:**
1. Make sure variable names are **exactly** correct (case-sensitive)
2. Variables starting with `NEXT_PUBLIC_` are exposed to the browser
3. Restart/redeploy after adding variables
4. Check if variables are set for the correct environment (Production/Preview)

### Issue: Build fails

**Solution:**
1. Run `npm run build` locally first to catch errors
2. Check build logs in deployment dashboard
3. Make sure all dependencies are in `package.json`
4. Check for TypeScript errors: `npm run lint`

### Issue: Convex not connecting

**Solution:**
1. Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly
2. Check Convex dashboard that functions are deployed
3. Make sure URL doesn't have trailing slash
4. Check browser console for connection errors

### Issue: OpenAI not working

**Solution:**
1. Verify `OPENAI_API_KEY` is set (no extra spaces)
2. Check API key is valid on OpenAI platform
3. Make sure key starts with `sk-`
4. Check usage/billing on OpenAI dashboard

---

## 🎯 Quick Start Commands (Vercel)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Add environment variables (will prompt for values)
vercel env add NEXT_PUBLIC_CONVEX_URL production
vercel env add OPENAI_API_KEY production

# 5. Redeploy with new variables
vercel --prod
```

---

## 💡 Pro Tips

1. **Use Vercel** - It's the easiest for Next.js apps
2. **Test locally first** - Run `npm run build` before deploying
3. **Set all environments** - Add variables for Production, Preview, and Development
4. **Use Vercel dashboard** - Web interface is easier than CLI for first deployment
5. **Check logs** - Use deployment logs to debug issues
6. **Monitor costs** - Keep an eye on OpenAI usage if using paid tier

---

## 🎉 Summary

**Easiest Method: Deploy to Vercel**

1. Go to https://vercel.com
2. Import your Git repository
3. Add environment variables in the deployment screen
4. Click "Deploy"
5. Done! 🚀

Your app will be live at `https://your-project.vercel.app`

Need help? Check the Vercel documentation or your platform's deployment docs!

