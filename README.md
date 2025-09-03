
---

# 📝 Notion Clone

A **Notion-inspired web app** built with [Next.js](https://nextjs.org), **Clerk Authentication**, Firebase, and TailwindCSS.
This project replicates core features of Notion such as **document editing, workspace management, and real-time sync** – all powered by modern web technologies.

---

## 🚀 Features

* ⚡ **Next.js 14** with App Router
* 🔑 **Clerk Authentication** (Google, GitHub, Email, etc.)
* 🔥 **Firebase Firestore** for real-time sync & data storage
* 🎨 **TailwindCSS + Geist Font** for modern UI
* 🗒️ Notion-like **document editor** (blocks, markdown-style editing)
* 🌙 Dark & Light mode
* 📱 Fully responsive

---

## 📦 Tech Stack

* **Frontend** → Next.js (App Router)
* **Auth** → Clerk
* **Database** → Firebase Firestore
* **UI** → TailwindCSS + Shadcn/UI + Geist Font
* **State Management** → React hooks & Context API

---

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sairishigangarapu/notion-clone.git
cd notion-clone
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Setup environment variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Update `.env.local` with your **Clerk & Firebase configuration values**:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Firebase Firestore
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> 📝 You can find your Clerk keys in the [Clerk Dashboard](https://dashboard.clerk.com).

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

---

## 📂 Project Structure

```bash
notion-clone/
├── app/                 
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Homepage
│   └── dashboard/       # Workspace dashboard
├── components/          # Reusable UI components
├── lib/                 
│   ├── clerk.ts         # Clerk auth config
│   ├── firebase.ts      # Firebase config
├── styles/              # TailwindCSS styles
├── public/              # Static assets
├── .env.example         # Env variable template
├── package.json
└── README.md
```

---

## 📚 Learn More

* [Next.js Documentation](https://nextjs.org/docs) – Next.js features & API
* [Clerk Docs](https://clerk.com/docs) – Authentication setup & usage
* [Firebase Docs](https://firebase.google.com/docs) – Firestore integration
* [TailwindCSS Docs](https://tailwindcss.com/docs) – Styling reference

---

## 🚀 Deployment

The easiest way to deploy this app is with [Vercel](https://vercel.com).

1. Push your repo to GitHub
2. Import into [Vercel Dashboard](https://vercel.com/new)
3. Add your **Clerk** + **Firebase** environment variables in Vercel settings
4. Deploy 🎉

---

## 🤝 Contributing

Contributions are always welcome!

1. Fork the repo
2. Create a new branch (`feature/new-feature`)
3. Commit your changes
4. Push to your branch
5. Open a Pull Request 🚀

---

## 📜 License

This project is licensed under the **MIT License**.

---

🔗 **GitHub Repo**: [sairishigangarapu/notion-clone](https://github.com/sairishigangarapu/notion-clone)

---
