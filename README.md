# Under the Lamp 🪔

A cozy book club web application with an automated waitlist invitation system.

## Features

- **Public Website** — About page, "Join the Waitlist" form, Book of the Month, Photo Gallery
- **Masonry Photo Gallery** — Foldable album folders, organized by month/year
- **Automated Waitlist Engine** — Monthly invitations with 24-hour RSVP cascade
- **Admin Dashboard** — Manage waitlist, upload photos, set book of the month
- **Email Notifications** — Invitation & confirmation emails via Resend

## Tech Stack

| Layer    | Technology                                     |
| -------- | ---------------------------------------------- |
| Frontend | React 19 + Vite + Tailwind CSS v4              |
| Backend  | Supabase (Postgres + Edge Functions + Storage) |
| Email    | Resend (with mock fallback)                    |
| Icons    | Lucide React                                   |
| Fonts    | Playfair Display + Inter                       |

## Quick Start

```bash
# Install dependencies
npm install

# Copy and fill in your Supabase credentials
cp .env.example .env

# Start dev server
npm run dev
```

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the SQL Editor
3. Create a **Storage bucket** named `photos` (set to public)
4. Copy your project URL and anon key into `.env`

### Edge Functions (Waitlist Engine)

```bash
# Use Supabase CLI via npx (no global install needed)
npx supabase@latest link --project-ref wzwzeylfwetlzscqafbx

# Deploy functions
npx supabase@latest functions deploy send-monthly-invites
npx supabase@latest functions deploy handle-rsvp
npx supabase@latest functions deploy expire-invitations

# Set secrets
npx supabase@latest secrets set RESEND_API_KEY=re_xxxxx
npx supabase@latest secrets set SITE_URL=https://underthelamp.club
```

### Cron Schedules (set in Supabase Dashboard)

| Function             | Schedule    | Purpose                                         |
| -------------------- | ----------- | ----------------------------------------------- |
| `expire-invitations` | `0 * * * *` | Every hour — expires overdue invites & cascades |

> `send-monthly-invites` is **not** on a cron — you trigger it manually from the Admin Dashboard whenever you're ready to start a new book month.

## Waitlist Cascade Logic

```
Admin clicks "Send Invites" in dashboard
  → Invite top 4 waiters
    → Person receives email with RSVP link
      → "Yes" → Lock spot, send confirmation ✓
      → "No"  → Mark declined, cascade to next person ↓
      → 24hr timeout → Mark expired, cascade to next person ↓
```

## Project Structure

```
under-the-lamp/
├── public/
│   └── lamp.svg                         # Favicon
├── src/
│   ├── components/
│   │   ├── Layout.jsx                   # Header + Footer + nav
│   │   ├── WaitlistForm.jsx             # Join the waitlist form
│   │   └── BookOfTheMonth.jsx           # Featured book section
│   ├── lib/
│   │   └── supabase.js                  # Supabase client
│   ├── pages/
│   │   ├── Home.jsx                     # Landing page
│   │   ├── Gallery.jsx                  # Masonry photo gallery
│   │   ├── Admin.jsx                    # Admin dashboard
│   │   └── RSVP.jsx                     # RSVP response page
│   ├── App.jsx                          # Routes
│   ├── main.jsx                         # Entry point
│   └── index.css                        # Tailwind + custom theme
├── supabase/
│   ├── schema.sql                       # Database schema
│   └── functions/
│       ├── waitlist-engine/index.js     # Core cascade logic
│       ├── send-monthly-invites/index.js
│       ├── handle-rsvp/index.js
│       └── expire-invitations/index.js
├── .env.example
├── package.json
└── vite.config.js
```

> ⚠️ In production, replace the password gate with Supabase Auth.
