# English Learning PWA

A Progressive Web App for school teachers to help ~100 students learn spoken English. Students can join with a code, follow day-wise chapters, practice speaking in Hindi/Bengali, and get real-time English translations.

## Stack

- React + Vite + TypeScript
- Tailwind CSS (mobile-first)
- Supabase (auth, database, storage)
- Lottie React (animated character)
- Web Speech API (TTS + STT)
- MyMemory API (free translation, no key needed)
- vite-plugin-pwa (installable on Android)

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL Editor, run the following schema:

```sql
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  joining_code text unique not null,
  created_at timestamptz default now()
);

create table students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  class text not null,
  joining_code text references schools(joining_code),
  created_at timestamptz default now()
);

create table chapters (
  id uuid primary key default gen_random_uuid(),
  day_number integer not null,
  title text not null,
  content jsonb,
  pdf_url text,
  school_joining_code text references schools(joining_code),
  created_at timestamptz default now()
);

create table progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id),
  chapter_id uuid references chapters(id),
  revision_count integer default 0,
  last_revised_at timestamptz,
  unlocked_at timestamptz default now(),
  unique(student_id, chapter_id)
);
```

3. Enable Row Level Security (RLS) as needed. For a simple setup, you can temporarily allow all operations or create policies.
4. Create a storage bucket named `chapters` (public bucket for PDF storage).
5. Create a teacher account via Supabase Dashboard → Authentication → Users → Invite User.

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these values in your Supabase project: Settings → API.

### 3. Install & Run Locally

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

1. Push code to GitHub.
2. Connect repo to [Vercel](https://vercel.com).
3. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy.

### 5. Add Real App Icons

Replace the placeholder icons in `public/icons/` with your actual app icons:
- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px

## Usage

### For Teachers

1. Go to `/admin` and log in with your Supabase email + password.
2. Create a school and note the joining code.
3. Upload PDF chapters (text is extracted automatically) or type sentences manually.
4. Share the joining code with students.
5. Monitor student progress from the admin dashboard.

### For Students

1. Open the app on their Android phone.
2. Enter the joining code, name, and class.
3. Day 1 is immediately available. Complete 10 revisions to unlock Day 2 (on the next day).
4. Each chapter has a lesson (sentence-by-sentence with audio), a quiz, and a speech practice mode.
5. In Practice mode, speak in Hindi or Bengali — the app shows the English translation.

## Features

- **Day-wise unlocking**: Day N+1 unlocks only after 10 revisions of Day N AND on a new calendar day.
- **Speech practice**: Uses Web Speech API for microphone input (Chrome on Android recommended).
- **Translation**: MyMemory free API — Hindi/Bengali → English.
- **Installable PWA**: Works offline for already-loaded content, installable on Android home screen.
- **Mobile-first**: Large touch targets, bright colors, designed for school kids.
