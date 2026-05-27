# Setting Up GitHub Repository

## Step 1: Create GitHub Repository

1. Go to https://github.com
2. Sign in or create an account
3. Click the **"+"** icon in the top right → **"New repository"**
4. Fill in:
   - **Repository name**: `safeSpace` (or any name you want)
   - **Description**: "Mental health support platform for Sierra Leone"
   - **Visibility**: Choose Public or Private
   - **DO NOT** check "Initialize with README" (we already have code)
5. Click **"Create repository"**

## Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

### Option A: If you haven't pushed yet (your case)

```bash
# Make sure you're in your project directory
cd "c:\Users\ANGEL MABORNEH\safeSpace"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/safeSpace.git

# Push your code
git branch -M main
git push -u origin main
```

### Option B: If you already have commits

```bash
git remote add origin https://github.com/YOUR_USERNAME/safeSpace.git
git branch -M main
git push -u origin main
```

## Step 3: Verify

1. Go to your GitHub repository page
2. You should see all your files
3. Check that `.env.local` is NOT visible (it's in .gitignore ✅)

## Step 4: Deploy to Vercel

Now that your code is on GitHub:

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_CONVEX_URL=https://perfect-anteater-505.convex.cloud`
   - `OPENAI_API_KEY=sk-your-key` (optional)
5. Click "Deploy"

## Troubleshooting

### Issue: "remote origin already exists"

```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/safeSpace.git
```

### Issue: Authentication failed

If you get authentication errors:

**Option 1: Use Personal Access Token**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` permissions
3. Use token as password when pushing

**Option 2: Use GitHub Desktop**
- Download GitHub Desktop: https://desktop.github.com
- Much easier for beginners!

**Option 3: Use SSH (advanced)**
- Set up SSH keys with GitHub
- Use SSH URL instead of HTTPS

