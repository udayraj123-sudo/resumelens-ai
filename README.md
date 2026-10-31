# ResumeLens AI

An AI-powered resume screening web app. Recruiters post jobs with required skills, candidates apply with a PDF resume, and AI rates every profile out of 10 with a short reason. Recruiters can then hire a candidate and send a formatted acceptance email in one click.

**Live demo:** https://resumelens-ai-chi.vercel.app

## Features

**Candidate portal**
- Pick an open job, then submit name, email, optional phone and a PDF resume (up to 4 MB)
- Check application status using only the email (no login needed)
- Shows "Under Review" or "Hired" with the joining date

**Admin dashboard** (password protected)
- Add, edit and delete jobs with their required skills
- Candidate rankings sorted by AI score, with filter by job
- Matched and missing skills shown for every candidate, plus a one-line reason
- View the uploaded resume securely
- Hire a candidate with a joining date (next Monday, 7 days from today, or custom) and an optional personal message
- A professionally formatted acceptance email is sent to the candidate automatically

**AI scoring**
- Base score = matched skills / required skills x 10
- AI adjusts the score by up to +1 or -1 based on projects and experience
- Scores are stored with matched skills, missing skills and a reason

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js (App Router), React, JavaScript |
| Styling | Tailwind CSS, Manrope font |
| Database and storage | Supabase (Postgres, private Storage bucket) |
| AI | Google Gemini API (`@google/genai`) |
| Email | Nodemailer with Gmail SMTP |
| Hosting | Vercel (with a daily cron to keep Supabase active) |

## How it works

1. Admin creates a job and lists the required skills.
2. A candidate applies; the PDF is saved in a private Supabase bucket.
3. The server sends the PDF and job details to Gemini and stores the score.
4. Admin reviews the ranked list, opens the resume and hires the best candidate.
5. The candidate receives an acceptance email and sees "Hired" on the status page.

## Security notes

- Admin login uses a server-side check and an HMAC-signed, httpOnly cookie; all admin API routes verify it.
- The Supabase secret key is used only on the server; row level security is enabled.
- Resumes are in a private bucket and opened through short-lived signed URLs.
- Secrets live in environment variables and are never committed.

## Run it locally

1. Clone the repo and install packages:

```bash
git clone https://github.com/udayraj123-sudo/resumelens-ai.git
cd resumelens-ai
npm install
```

2. Create a free Supabase project and run this SQL in the SQL Editor:

```sql
create table jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  skills text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  resume_path text not null,
  score numeric(3,1),
  matched_skills text[] not null default '{}',
  missing_skills text[] not null default '{}',
  reason text,
  status text not null default 'applied' check (status in ('applied','hired')),
  joining_date date,
  hire_message text,
  hired_at timestamptz,
  created_at timestamptz not null default now()
);

alter table jobs enable row level security;
alter table applications enable row level security;
grant all on jobs, applications to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', false, 10485760, array['application/pdf']);
```

3. Create a file named `.env.local` in the project root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-supabase-secret-key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.5-flash-lite
ADMIN_PASSWORD=choose-a-strong-password
ADMIN_SESSION_SECRET=a-long-random-string
GMAIL_USER=your-sender@gmail.com
GMAIL_APP_PASSWORD=your-16-letter-app-password
```

- Get a free Gemini key from Google AI Studio.
- For `GMAIL_APP_PASSWORD`, turn on 2-Step Verification on the Gmail account and create an App Password.

4. Start the app:

```bash
npm run dev
```

Open http://localhost:3000. The admin area is at `/admin`.

## Deploy

Push to GitHub, import the repo in Vercel, add the same environment variables, and deploy. `vercel.json` already includes a daily cron that calls `/api/keepalive` so the free Supabase project does not pause.

## Project structure

```text
app/
  api/            apply, jobs, status, keepalive, admin routes
  admin/          login and dashboard pages
  candidate/      candidate portal
components/       Navbar, Footer, Logo, CandidateRankings, HireModal
lib/              supabase client, admin auth, Gemini scoring, mailer
```

## Author

Built by **Udayraj Yadav** (S.Y.B.Sc IT) as a college project and portfolio piece.
GitHub: [@udayraj123-sudo](https://github.com/udayraj123-sudo)