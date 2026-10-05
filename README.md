# Anureet Private Limited — Digital Services Platform

Professional digital services platform for VLE operators across India.

## Tech Stack
- Next.js 14 (App Router)
- Firebase Authentication + Firestore
- Cashfree Payment Gateway
- Telegram Notifications
- Tailwind CSS
- Vercel Deployment

## Contact
- 📞 +91-9451228744
- ✉️ ahardoi30@gmail.com
- 📍 1/7 Kanshiram Colony, Lucknow Road, Hardoi, UP 241001

## Setup

1. Clone repo
2. `npm install`
3. Copy `.env.local.example` to `.env.local` and fill values
4. `npm run dev`

## Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables (CASHFREE_*, TELEGRAM_*)
4. Deploy

## Admin Login
- Email: ahardoi30@gmail.com
- Password: (set in Firebase Console)

## Firebase Setup

1. Firebase Console → Authentication → Enable Email/Password
2. Create admin user: ahardoi30@gmail.com with password Anu@8744
3. Firestore → Create database in production mode
4. Add security rules (see below)

### Firestore Security Rules
