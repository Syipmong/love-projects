# 💖 Will You Be Mine? — Romantic Proposal Web App

A modern, highly animated, romantic, and playful proposal web application crafted with **Vite**, **React**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

Designed to make asking out your favorite person unforgettable, fun, and heartwarming!

---

## ✨ Features

- **🏃‍♂️ The Playful Runaway "NO" Button**:
  - Automatically darts away whenever the mouse hovers or touches near it!
  - Every time she tries to click "NO", the button shrinks (`scale` decreases) and cycles through 16+ playful teasing messages (*"Are you sure? 🥺"*, *"Look at how big YES is! 👉"*, *"Don't break my heart! 😭"*, *"Error 404: 'No' not found! 🚫"*).
  - Triggers cute cartoon boing/whoosh sound effects!

- **❤️ The Magnetic "YES" Button**:
  - Grows larger and more prominent each time she attempts to click "NO".
  - Glows with a warm romantic pink pulse and sparkling icons.

- **🧸 Dynamic Mascot Expressions**:
  - Cute animated mascot updates in real-time to match her teasing count—from sweet anticipation, to pleading puppy eyes, to crying bear, to euphoric victory hugs!

- **🎉 Grand Confetti & Chime Finale**:
  - When she clicks "YES", a multi-cannon burst of heart-colored confetti explodes across the entire screen accompanied by a romantic celebration chime.

- **💌 Interactive Unfolding Love Letter**:
  - Clickable sealed envelope that unfolds into a heartfelt romantic letter with custom handwriting typography.

- **📜 Official Relationship Certificate**:
  - Certified with your names, today's date, and a "Seal of Love" badge.

- **🎟️ Redeemable Date Vouchers**:
  - Interactive cards she can tap to claim (*Late Night Food Run*, *Cozy Movie Marathon*, *Fancy Dinner Date*, *Princess Treatment Day*).

- **🎵 Romantic Melodies**:
  - Built-in Web Audio API synthesizer that plays gentle romantic chords with a toggle button (no external music files needed, 100% reliable).

- **⚡ Instant Personalization & Link Sharing**:
  - Click the **"Personalize"** button in the top left to change her name, your name, and the question.
  - Or simply share a custom link:
    ```
    https://your-domain.com/?to=Maya&from=Liam&q=Will+you+be+my+girlfriend?
    ```

---

## 🚀 Getting Started

### 1. Run Locally
```bash
# Start development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Build for Production
```bash
npm run build
```
The output will be in the `dist/` directory, ready to deploy.

---

## 🌐 Free 1-Click Hosting Options

You can host this project completely free on any of these platforms:

### Option A: Vercel (Recommended — fastest)
1. Push this project to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repo.
4. Click **"Deploy"**! Vercel will automatically detect Vite and give you a free `https://your-app.vercel.app` link.

### Option B: Netlify
1. Drag and drop the `dist/` folder after running `npm run build` directly onto [app.netlify.com/drop](https://app.netlify.com/drop).
2. Instant live link in 10 seconds!

### Option C: GitHub Pages
1. Install `gh-pages`: `npm install -D gh-pages`
2. Add `"deploy": "gh-pages -d dist"` to `package.json` scripts.
3. Run `npm run build && npm run deploy`.

---

## 🎨 Customizing Content in Code

All default messages, letter paragraphs, reasons, and date vouchers can be customized in [`src/config.ts`](file:///c:/aetech/projects/love-projects/src/config.ts).

