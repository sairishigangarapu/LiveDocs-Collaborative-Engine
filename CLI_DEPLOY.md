# 🚀 Deploy via CLI - Quick Commands

## ✅ **Option 1: Deploy Using Vercel CLI** (Fastest)

### Step 1: Login to Vercel
```powershell
vercel login
```
- This will open your browser to authenticate
- Or you can use email/GitHub authentication

### Step 2: Link Your Project (First Time Only)
```powershell
vercel link
```
- Follow the prompts:
  - **Set up and link:** Select existing project
  - **Link to existing project?** Yes
  - **Project name:** notion-clone (or your project name)
  - **Scope:** Your Vercel account/team

### Step 3: Deploy to Production
```powershell
vercel --prod
```
- This will:
  - Build your project
  - Upload to Vercel
  - Deploy to production
  - Give you the live URL

**That's it! Wait 2-3 minutes for build to complete.**

---

## ✅ **Option 2: Check Current Deployment Status**

### See all deployments:
```powershell
vercel ls
```

### Get deployment info:
```powershell
vercel inspect
```

### View logs:
```powershell
vercel logs
```

---

## ✅ **Option 3: Just Push to GitHub** (Auto-Deploy)

Since you already connected GitHub to Vercel:

```powershell
# Your code is already pushed!
# Vercel auto-deploys from GitHub
# Just check the dashboard or run:
vercel ls
```

---

## 🔧 **Set Environment Variables via CLI** (if needed)

### Add a single variable:
```powershell
vercel env add VARIABLE_NAME production
```
Then paste the value when prompted.

### Add all at once from .env.local:
```powershell
# Add each variable:
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production
# ... etc
```

### Pull environment variables (to check what's set):
```powershell
vercel env pull
```

---

## 🎯 **Recommended: Quick Deploy Commands**

### First time setup:
```powershell
vercel login
vercel link
vercel --prod
```

### Future deployments (after code changes):
```powershell
git add .
git commit -m "Your changes"
git push origin master
# Vercel auto-deploys OR:
vercel --prod
```

---

## 📊 **Monitor Deployment**

### Watch build in real-time:
```powershell
vercel --prod --logs
```

### Check latest deployment:
```powershell
vercel ls | Select-Object -First 1
```

---

## 🆘 **Troubleshooting CLI Deployment**

### If "vercel link" fails:
```powershell
# Remove existing link and re-link
Remove-Item -Path .vercel -Recurse -Force
vercel link
```

### If build fails:
```powershell
# Check local build first:
npm run build

# If local build works, deploy:
vercel --prod --force
```

### If environment variables missing:
```powershell
# List current env vars:
vercel env ls

# Add missing ones:
vercel env add VARIABLE_NAME production
```

---

## ✨ **Complete CLI Workflow**

```powershell
# 1. Make sure you're logged in
vercel whoami

# 2. Deploy to production
vercel --prod

# 3. Wait for build (2-3 minutes)
# Output will show:
# ✅ Production: https://notion-clone-xxx.vercel.app

# 4. Open the URL in browser
# Or use:
vercel --prod --open
```

---

## 🎯 **What to Run RIGHT NOW:**

```powershell
# If first time:
vercel login
vercel link
vercel --prod

# If already linked:
vercel --prod
```

**The CLI will show you:**
- ✅ Build progress
- ✅ Deployment URL
- ✅ Any errors in real-time

Much faster than waiting for GitHub auto-deploy!
