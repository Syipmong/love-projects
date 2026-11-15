# 💖 Love Proposal Platform & SaaS

A modern, multi-chapter romantic proposal platform and storybook built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and a **Node.js + PostgreSQL backend using Raw SQL**.

Now equipped with **Strict Anti-Skip Story Pacing**, a **Live Creator Analytics Dashboard**, **Telemetry Event Tracking**, and **ZeptoMail Transactional Alerts**!

---

## ✨ Core Highlights

### 🛡️ Strict Anti-Skip Story Pacing
She cannot speed-click through your love story:
- **Chapter 1 (An Invitation)**: Must break the wax seal and open the letter to begin.
- **Chapter 2 (Milestones)**: Must click and explore all 4 milestones before the *"Next Chapter"* button unlocks `(Shows live counter: e.g. 2/4 visited)`.
- **Chapter 3 (Memory Polaroids)**: Must tap and read all 4 secret polaroid notes before progressing `(e.g. 3/4 read)`.
- **Chapter 4 (The Unspoken Feeling)**: Must answer the romantic mini-quiz or tap the beating heart before unlocking Chapter 5.
- **Chapter 5 (The Big Question)**: The famous runaway "NO" button darts away and shrinks while "YES" outgrows the screen. Includes a dignified, romantic *"True No"* escape hatch if she genuinely wishes to decline.
- **Chapter 6 (Our Forever)**: Grand celebration with confetti cannons, relationship certificate, secret date mystery safe, date vouchers, and instant WhatsApp notifications.

---

### 📊 PostgreSQL Database & Raw SQL Backend

Connected directly to Prisma Postgres via raw SQL queries (`pg.Pool`):
- **`proposals` table**: Stores personalized proposals (creator email, partner name, question, custom JSON config).
- **`events` table**: Logs every interaction in real-time (`page_view`, `milestone_viewed`, `polaroid_opened`, `heart_tapped`, `quiz_answered`, `no_dodged`, `proposal_accepted`).
- **`responses` table**: Stores her final choice (`yes` or `no`), exact tease/evasion attempts, and timestamp.

#### API Endpoints
- `POST /api/proposals`: Create/update a proposal.
- `GET /api/proposals/:id`: Fetch proposal configuration by ID.
- `POST /api/events`: Telemetry interaction logging.
- `POST /api/response`: Record final answer & trigger email notification.
- `GET /api/dashboard/:id`: Fetch aggregated analytics and recent event activity feed.
- `GET /api/health`: Verify PostgreSQL connectivity.

---

### 📬 Zoho ZeptoMail Integration

When she answers your question, an automated transactional email is instantly dispatched to your email address:
- **SHE SAID YES!** 🎉: Contains her name, answer, playful tease count, and time.
- Configured in `.env`:
  ```env
  ZEPTOMAIL_API_KEY=your_zeptomail_send_mail_token
  ZEPTOMAIL_FROM_EMAIL=alerts@yourdomain.com
  ```

---

### 📈 Live Creator Analytics Dashboard

Click **"Metrics & Dashboard"** in the top navigation bar to see:
- **Current Outcome**: *In Progress / She Said YES! / Declined*
- **Total Interaction Events**: Live counter of all actions taken on the page.
- **Playful Tease Count**: Exact number of times she tried to catch the "NO" button.
- **Real-Time Activity Feed**: Chronological log of every milestone viewed, polaroid unlocked, and question answered with exact timestamps.
- **Alert Email Setup**: Save your email address directly to PostgreSQL.

---

## 🚀 Running the Project

### 1. Start the Backend Server (Port 3001)
```bash
node server/index.js
```

### 2. Start the Frontend Dev Server (Port 5174)
```bash
npm run dev
```

Open [http://localhost:5174/](http://localhost:5174/) to experience the proposal!
