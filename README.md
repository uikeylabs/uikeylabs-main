# 🚀 UIKEY LABS — Enterprise Web Engineering & Free Co-Branded Shop QR Portal

Official website, 10 Live Industry Demos (`demos/`), Client Quotation PDF Generator, and **Free Co-Branded Merchant UPI QR Standee + POS Database System** for **UIKEY LABS** (Chhindwara, MP & Pan-India).

---

## 🌟 Key Features Included
1. **⚡ <1.0s High-Speed Agency Website (`index.html`):**
   - Bilingual Toggle (**🇬🇧 English ⇄ 🇮🇳 हिंदी / Hinglish**)
   - Interactive **Website Speed & SEO Loss Calculator (`#speed-audit`)**
   - **Official GST Quotation / Bill PDF Generator (`#payment`)**
   - **10 Complete Multi-Page Industry Demos (`demos/`)** — Clinic, School, Restaurant, Real Estate, E-Commerce, CA/Law, Salon, Gym, Coaching, Wedding Planner.
2. **🏪 Free Merchant UPI QR Standee & Quick-Bill POS (`#shop-qr-generator`):**
   - **Merchant Sign Up & Sign In (`UL-100` to `UL-999`)**
   - **One-Time Profile Setup:** Shopkeepers save their Business Name, Category, Mobile Number, and UPI ID once.
   - **Daily Counter POS Mode:** Enter only the **Bill Amount (`₹`)** — scanning the QR on any app (GPay, PhonePe, Paytm, BHIM) automatically locks that exact amount (`&am=`).
   - **Corporate FinTech Standee Poster (`1000×1480px PNG` + `A4 Print PDF`)** with **UIKEY LABS** branding & centered QR logo (`Level H` 30% error correction).
3. **⚡ 3-Tier Hybrid Database Engine (`Supabase Cloud PostgreSQL ➔ Local SQLite ➔ Browser LocalStorage`):**
   - Works **100% automatically** on **GitHub Pages / Vercel / Netlify**!
   - Includes [`supabase_schema.sql`](./supabase_schema.sql) for 1-click **Supabase Cloud PostgreSQL** setup.
   - Includes [`server.py`](./server.py) (`uikeylabs_merchants.db`) for local SQLite testing (`http://localhost:8080`).

---

## 🐙 How to Upload to `https://github.com/uikeylabs` & Go Live on GitHub Pages (FREE)

### Option A: Official Root Domain (`https://uikeylabs.github.io`) — RECOMMENDED! 🌟
1. Go to [https://github.com/new](https://github.com/new) while logged into **`uikeylabs`**.
2. Name the repository **`uikeylabs.github.io`** (Public) and click **Create repository**.
3. Run these commands in your terminal (already initialized for you!):

```bash
git remote remove origin 2>$null
git remote add origin https://github.com/uikeylabs/uikeylabs.github.io.git
git branch -M main
git push -u origin main
```
4. Your website will automatically go live at:
   👉 **`https://uikeylabs.github.io/`** 🎉

### Option B: Project Repository (`https://uikeylabs.github.io/uikeylabs/`)
If you name your repository **`uikeylabs`** (`https://github.com/uikeylabs/uikeylabs`):
```bash
git remote remove origin 2>$null
git remote add origin https://github.com/uikeylabs/uikeylabs.git
git branch -M main
git push -u origin main
```
Then go to **Settings ➔ Pages ➔ Branch: `main` ➔ Save**, and it will be live at:
👉 **`https://uikeylabs.github.io/uikeylabs/`** 🎉

---

## ⚡ How to Connect Supabase Cloud Database (For GitHub Pages Production)
Because GitHub Pages hosts static HTML/JS files, connecting **Supabase Cloud** makes your Merchant Sign Up, Sign In, and Counter Bills work globally across all devices:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) ➔ **New Project**.
2. Open **SQL Editor** ➔ paste the contents of [`supabase_schema.sql`](./supabase_schema.sql) ➔ click **RUN**.
3. Go to **Project Settings ➔ API** and copy your **Project URL** (`https://xyz.supabase.co`) and **`anon` `public` API Key**.
4. Paste them either:
   - Directly in the website's **⚡ Configure Supabase Cloud** box inside `#shop-qr-generator`, OR
   - Permanently inside [`index.html`](./index.html) at line `2542`:
     ```javascript
     var DEFAULT_SUPABASE_CONFIG = {
       url: "https://your-project-id.supabase.co",
       anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     };
     ```
