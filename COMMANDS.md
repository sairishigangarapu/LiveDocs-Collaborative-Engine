# Quick Command Reference

## Vercel Deployment (Recommended)

### Option 1: Via Dashboard (Easiest)
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Add environment variables
4. Click Deploy

### Option 2: Via CLI
```powershell
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

## Cloudflare Pages Deployment

```powershell
# Login
npx wrangler login

# First time setup
npx wrangler pages project create notion-clone

# Build
npm run build

# Deploy
npx wrangler pages deploy .next --project-name=notion-clone
```

## Local Testing

```powershell
# Development
npm run dev

# Production build test
npm run build
npm start
```

## Troubleshooting

If build fails, check:
1. All environment variables are set
2. Node version is 18+ or 20+
3. Dependencies are installed: `npm install`
4. Build succeeds locally: `npm run build`
