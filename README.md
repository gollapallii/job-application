# Job Application Tracker

A beginner-friendly full-stack portfolio project built with React, Django REST Framework, and SQL. It lets you track job applications and includes an optional AI helper powered by Google Gemini.

## Features
- Create, view, update, and delete job applications (CRUD)
- Search by company, role, or notes
- Filter applications by status
- Dashboard counts by status
- Optional Gemini AI helper to draft a short cover-letter paragraph from a job description
- SQLite for local development; PostgreSQL-ready deployment settings
- React/Vite frontend and Django REST API

> AI feature status: the UI and backend integration are implemented, but the feature works only after you add your own Gemini API key in the backend environment. Never put the key in the React `.env` file or commit it to GitHub.

## Tech stack
- Frontend: React, Vite, plain CSS
- Backend: Python, Django, Django REST Framework
- Database: SQLite locally; PostgreSQL for hosted deployment
- AI: Google Gemini API (optional)

## 1. Prerequisites
Install:
- Python 3.11 or newer
- Node.js LTS and npm
- Git

Check:
```bash
python --version
node --version
npm --version
git --version
```

## 2. Run the backend locally

Open a terminal in the project root:

### Windows PowerShell
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py runserver
```

If PowerShell blocks activation, use Command Prompt:
```bat
cd backend
py -m venv .venv
.venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000/`. API endpoint: `http://127.0.0.1:8000/api/applications/`.

### Optional Gemini AI
1. Get an API key from Google AI Studio.
2. Put it in `backend/.env` as `GEMINI_API_KEY=your_key_here`.
3. Restart Django.
4. Use the AI Helper panel in the frontend.

Without a key, the rest of the tracker works; the AI endpoint returns a helpful setup message.

## 3. Run the frontend locally

Open a second terminal:
```bash
cd frontend
npm install
```

Create `frontend/.env` by copying `.env.example`:
```bash
# Windows PowerShell
Copy-Item .env.example .env
```

Then start Vite:
```bash
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

The frontend `.env` value should be:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## 4. Basic checks
- Add an application with company and role.
- Change its status.
- Search for a company or role.
- Delete a test entry.
- Try AI Helper after configuring the Gemini key.
- Verify API directly at `http://127.0.0.1:8000/api/applications/`.

## 5. Push to GitHub
Create a new empty repository on GitHub, for example `job-application-tracker`. Do not initialize it with a README if you already have this one.

From the project root:
```bash
git init
git add .
git commit -m "Build job application tracker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/job-application-tracker.git
git push -u origin main
```
Replace `YOUR-USERNAME` with your GitHub username. Never commit `.env`, API keys, database files, or virtual environments. `.gitignore` is included.

If Git says a remote already exists:
```bash
git remote -v
git remote set-url origin https://github.com/YOUR-USERNAME/job-application-tracker.git
```

## 6. Free-tier deployment outline

Free-tier limits change, and some providers may require a payment method. Verify current terms before deploying.

### Backend (Render or a similar Python host)
- Create a new Web Service connected to your GitHub repository.
- Root directory: `backend`
- Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
- Start command: `gunicorn config.wsgi:application`
- Add environment variables:
  - `SECRET_KEY`: generate a long random secret
  - `DEBUG`: `False`
  - `ALLOWED_HOSTS`: your backend hostname, e.g. `your-api.onrender.com` (no `https://`)
  - `CORS_ALLOWED_ORIGINS`: your deployed frontend URL, e.g. `https://your-app.vercel.app`
  - `DATABASE_URL`: PostgreSQL connection string from your database provider
  - `GEMINI_API_KEY`: optional; add only if using AI
- Ensure the provider's current free plan includes a persistent database. SQLite on an ephemeral web-service filesystem may lose data after redeploy/restart, so use PostgreSQL for hosted use.

### Frontend (Vercel or a similar static host)
- Import the same GitHub repository.
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:
  - `VITE_API_BASE_URL=https://YOUR-BACKEND-HOST`
- Redeploy after setting environment variables.

### After deployment
- Add the frontend origin to backend `CORS_ALLOWED_ORIGINS`.
- Confirm `/api/health/` returns `{"status":"ok"}`.
- Test create/edit/delete and AI feature on the live site.
- Only then add live URLs to your resume. Do not claim deployment before it is verified.

## 7. Resume wording (use only after testing)
**Job Application Tracker | React, Django REST Framework, PostgreSQL**
- Built a full-stack application to manage job applications with CRUD workflows, status filters, search, and dashboard summaries.
- Developed REST API endpoints using Django REST Framework and connected them to a responsive React frontend.
- Integrated an optional Gemini-powered cover-letter assistant with server-side API-key handling.
- Deployed the frontend and backend to cloud hosting and configured PostgreSQL persistence. *(Use this bullet only after deployment is complete.)*

## Troubleshooting
- `python` not recognized: try `py` on Windows.
- PowerShell activation denied: use Command Prompt or allow activation for the current terminal according to your device policy.
- CORS error: ensure `CORS_ALLOWED_ORIGINS` exactly matches the frontend origin, including `https://` and no trailing path.
- Database URL error: confirm `DATABASE_URL` is a valid PostgreSQL URL and that the database is reachable.
- AI helper reports missing key: configure `GEMINI_API_KEY` on the backend only and restart/redeploy.
