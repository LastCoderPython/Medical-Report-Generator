# 🏥 Medical Report Generator

An AI‑powered clinical documentation tool that helps physicians generate structured medical reports from natural‑language notes. Built with **Next.js (App Router)**, **Supabase** for auth and persistence, and **Tambo AI** for LLM‑powered report generation.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Tambo AI](https://img.shields.io/badge/Tambo%20AI-Generative%20UI-000000?style=for-the-badge)](https://tambo.co)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

---

## 🚀 Overview

`Medical Report Generator` streamlines documentation for healthcare providers by:

- Accepting clinical notes in **natural language**  
- Using **Tambo AI** to generate structured reports  
- Storing reports securely in **Supabase** with Row‑Level Security  
- Offering a **responsive UI** with light/dark mode and easy logout

---

## ✨ Key Features

- **🩺 AI‑Generated Reports**  
  Describe patient findings in plain text and get a formatted medical report.

- **🔐 Authentication & RBAC**  
  Login with Supabase Auth; users see only their own reports.

- **🗂 Report Management**  
  Save, view, edit, and delete reports with a clean UI.

- **🌙 Dark/Light Mode**  
  Toggle theme via `next-themes` with `ThemeProvider` and `ThemeToggle`.

- **🛡️ Secure Environment**  
  API keys and Supabase credentials are stored securely

- **📤 GitHub Ready**  
  `.env.example` documents required variables.

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | Next.js 16 (App Router), React Server Components, Client Components |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **UI** | Lucide React Icons |
| **AI/LLM** | Tambo AI SDK (`@tambo-ai/react`) |
| **Backend / Auth** | Supabase (Auth, Postgres RLS) |
| **Deployment** | Vercel |
| **Version Control** | Git + GitHub |

---

## 📦 Project Structure (Simplified)

```text
medical-report-generator/
├── app/
│   ├── auth/
│   │   └── login/
│   ├── components/
│   │   ├── ChatInterface.tsx        # Main report‑generation UI
│   │   ├── Header.tsx              # Header with logo, title, theme toggle, logout
│   │   ├── SavedReports.tsx        # Saved reports list
│   │   ├── ThemeProvider.tsx       # next-themes wrapper
│   │   ├── ThemeToggle.tsx         # Theme switch button
│   │   └── TamboWrapper.tsx        # Wraps app in TamboProvider
│   ├── lib/
│   │   └── supabase.ts             # Supabase client
│   ├── globals.css                 # Global styles + Tailwind config
│   ├── icon.png                    # App icon / favicon
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home/dashboard with auth guard
├── public/                         # Static assets
├── .env.example                    # Environment template
├── .env.local                      # Local env (ignored)
├── .gitignore                      # Excludes .env.local, .next, etc.
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚙️ Setup & Local Development

### 1. Prerequisites

- Node.js (v18+ recommended)
- npm / yarn
- Supabase project
- Tambo AI project (API key)

### 2. Clone the repo

```bash
git clone https://github.com/LastCoderPython/Medical-Report-Generator.git
cd Medical-Report-Generator
```

### 3. Install dependencies

```bash
npm install
```

### 4. Environment variables

Create `.env.local` (not tracked in Git):

```text
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Tambo AI
NEXT_PUBLIC_TAMBO_API_KEY=your_tambo_api_key
```

You can copy the template from `.env.example`:

```text
NEXT_PUBLIC_TAMBO_API_KEY=your_tambo_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 Database Setup (Supabase)

Run this in the Supabase SQL Editor to create the `reports` table:

```sql
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_mrn TEXT,
  patient_age INTEGER,
  patient_gender TEXT,
  report_type TEXT,
  report_content TEXT,
  diagnosis TEXT,
  exam_date DATE,
  specialty TEXT,
  icd10_codes TEXT[],
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);
```

This ensures each user only sees and manages their own reports.

---

## 🚀 Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "Add complete docs and dark mode / logout"
git push origin main
```

### 2. Import project in Vercel

- Go to [Vercel](https://vercel.com) → Import project
- Select your GitHub repo
- During import, set the Framework to **Next.js**

### 3. Add environment variables

In **Project Settings → Environment Variables**, add:

| Variable | Value | Environment |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | All |
| `NEXT_PUBLIC_TAMBO_API_KEY` | Your Tambo API key | All |

### 4. Deploy

Vercel will build and deploy automatically. Visit the generated URL (e.g., `https://medical-report-generator.vercel.app`).

---

## 🧩 How It Works

### Auth Guard (`page.tsx`)

- Checks `supabase.auth.getUser()`
- Redirects unauthenticated users to `/auth/login`

### Report Generation (`ChatInterface`)

- Sends user input to Tambo AI
- Receives structured report text
- Lets user save it to Supabase

### Saved Reports (`SavedReports.tsx`)

- Fetches reports scoped to `auth.uid()`
- Allows view, edit, delete (with RLS enforcing ownership)

### Theme & UI (`Header`, `ThemeToggle`)

- `next-themes` provides light/dark mode via CSS variables
- `ThemeToggle` lives in the header next to the title
- All text is black in light mode, light on dark backgrounds

### Logout (`Header`)

- Clicking the logout button calls `supabase.auth.signOut()`
- Redirects to `/auth/login` via `useRouter`

---

## 🔒 Security & Best Practices

### Sensitive Data Protection

- `.env.local` is ignored; `.env.example` is public template
- Supabase environment variables are never logged

### Row‑Level Security (RLS)

- Users can only `SELECT`, `INSERT`, or `DELETE` rows where `user_id = auth.uid()`
- Prevents unauthorized access to other users' reports

### Authentication

- Leverages Supabase email auth
- No raw secrets in client code

### HTTPS & Modern Practices

- Vercel enforces HTTPS
- Next.js best practices (App Router, SSR, RSC)

---

## 📝 Usage Flow

### Signup / Login

Navigate to the app → log in via Supabase.

### Generate Report

1. Enter patient details and clinical findings
2. Click "Generate" (or equivalent)
3. Review AI‑generated report

### Save Report

1. Click "Save" to store the report in Supabase
2. The report is linked to your user ID

### Manage Reports

- View list of saved reports
- Click any report to view details
- Edit or delete as needed

### Toggle Theme / Logout

- Click the ☀️/🌙 button to switch modes
- Click "Logout" to sign out securely

---

## 📈 Future Enhancements

- **PDF Export** – Export reports as PDF for EHR integration
- **Templates** – Pre‑defined templates by specialty (Radiology, Cardiology, etc.)
- **Multilingual Support** – Generate reports in regional languages
- **Voice Input** – Speech‑to‑text for clinical notes
- **Collaboration** – Share reports with team members with fine‑grained permissions
- **Audit Logs** – Track who edited what and when

---

## 📄 License

MIT License – free to use, modify, and distribute for personal and commercial projects.

---

**Made with ❤️ for healthcare professionals and developers alike.**

⚠️ **Use responsibly and always verify AI‑generated content in real clinical settings.**