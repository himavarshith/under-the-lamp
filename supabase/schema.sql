-- =============================================================
-- Under the Lamp — Supabase Database Schema
-- =============================================================

-- 1. Waitlist: ordered queue of sign-ups
create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  phone text,
  reason text,                -- "Why do you want to join UTL?"
  area text,                  -- Bangalore area
  position serial,            -- auto-incrementing queue position
  decline_count int default 0,-- decline twice = moved down the list
  status text not null default 'waiting'
    check (status in ('waiting', 'invited', 'accepted', 'declined', 'expired')),
  created_at timestamptz default now(),
  invited_at timestamptz,
  responded_at timestamptz
);

create index if not exists idx_waitlist_status on waitlist(status);
create index if not exists idx_waitlist_position on waitlist(position);

-- 2. Invitations: tracks each invitation round
create table if not exists invitations (
  id uuid default gen_random_uuid() primary key,
  waitlist_id uuid not null references waitlist(id) on delete cascade,
  month date not null,               -- the month this invite is for (first of month)
  token text not null unique,         -- unique RSVP token
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'expired')),
  sent_at timestamptz default now(),
  expires_at timestamptz not null,    -- 24 hours after sent_at
  responded_at timestamptz
);

create index if not exists idx_invitations_token on invitations(token);
create index if not exists idx_invitations_month on invitations(month);

-- 3. Book of the Month
create table if not exists books (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text not null,
  cover_url text,
  description text,
  month date not null,                 -- first of month (multiple books per month allowed)
  is_current boolean default false,
  created_at timestamptz default now(),
  unique(month, title)                 -- same title can't appear twice in the same month
);

-- Migration for existing deployments (run once in Supabase SQL editor):
-- ALTER TABLE books DROP CONSTRAINT IF EXISTS books_month_key;
-- ALTER TABLE books ADD CONSTRAINT books_month_title_key UNIQUE (month, title);

-- 4. Photo Albums & Photos
create table if not exists albums (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  month date not null unique,
  cover_url text,
  created_at timestamptz default now()
);

create table if not exists photos (
  id uuid default gen_random_uuid() primary key,
  album_id uuid not null references albums(id) on delete cascade,
  url text not null,
  thumbnail_url text,
  caption text,
  position int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_photos_album on photos(album_id);

-- 5. Admin users (simple email-based check)
create table if not exists admins (
  id uuid default gen_random_uuid() primary key,
  email text not null unique
);

-- =============================================================
-- Row Level Security (RLS)
-- =============================================================

alter table waitlist enable row level security;
alter table invitations enable row level security;
alter table books enable row level security;
alter table albums enable row level security;
alter table photos enable row level security;

-- Public can insert into waitlist (sign up)
create policy "Anyone can join waitlist"
  on waitlist for insert
  with check (true);

-- Public can read books and albums/photos
create policy "Public read books"
  on books for select using (true);

create policy "Public insert books"
  on books for insert with check (true);

create policy "Public update books"
  on books for update using (true);

create policy "Public delete books"
  on books for delete using (true);

create policy "Public read albums"
  on albums for select using (true);

create policy "Public read photos"
  on photos for select using (true);

-- Service role (edge functions) can do everything via service key
-- Admin policies would use auth.uid() checks in production
