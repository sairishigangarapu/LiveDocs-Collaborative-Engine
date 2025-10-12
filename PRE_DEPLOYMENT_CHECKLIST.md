# Pre-Deployment Checklist

## ✅ Before You Deploy

### 1. Environment Variables
Make sure you have all these values ready:

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY`
- [ ] `LIVEBLOCKS_PRIVATE_KEY`

### 2. Test Locally
```powershell
npm run build
npm start
```

### 3. Update Clerk URLs
Once deployed, update these in Clerk Dashboard:
- Authorized redirect URLs: `https://your-app.vercel.app`
- Webhook endpoints (if any)

### 4. Update Firebase
Add your deployment domain to Firebase:
- Authentication → Settings → Authorized domains
- Add: `your-app.vercel.app`

### 5. Update Liveblocks
Add your deployment domain to Liveblocks:
- Dashboard → Settings → Allowed domains
- Add: `your-app.vercel.app`

## 🚀 Deploy Now

See `DEPLOYMENT.md` for step-by-step instructions.
