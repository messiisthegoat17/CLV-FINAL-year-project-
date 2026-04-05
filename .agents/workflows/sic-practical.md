---
description: Resume SIC Practical - Fix login/register on live Vercel website
---

# SIC PRACTICAL — Resume Context

**Conversation ID:** 9ac46396-2a23-4d12-b758-75562d631e43

## Project Info
- **GitHub Repo:** https://github.com/messiisthegoat17/CLV-FINAL-year-project-
- **Live Vercel Site:** https://clvpredictionproject.vercel.app
- **Local Git Repo:** `e:\Code\FIINal Year Project with backend of SQL lite\CLV-FINAL-year-project-`
- **Active Dev Folder:** `e:\Code\FIINal Year Project with backend of SQL lite\CLV FINAL year project'`

## Problem
Login and account creation are broken on the live Vercel website.

## Root Causes Identified
1. **Frontend calls `localhost:8000`** — `VITE_API_URL` is not set in Vercel dashboard
2. **`render.yaml` had `rootDir: backend`** — but GitHub repo has backend files at ROOT (no `backend/` folder exists in repo)
3. **`.env` file is publicly exposed on GitHub** — contains live database credentials
4. **Render backend may not be properly deployed** — due to above config mismatch

## What Was Done (Before Pausing)
- Created `render.yaml` in `CLV-FINAL-year-project-` local folder (fixed — no rootDir)
- Updated `.gitignore` in local folder to exclude `.env` and `*.db`
- Browser subagent was in the middle of editing `src/context/AuthContext.tsx` directly on GitHub web editor (was cancelled/timed out mid-edit)

## What Still Needs To Be Done
1. **Verify/Complete GitHub edits** — Check if render.yaml and .gitignore were committed on GitHub. AuthContext.tsx edit was NOT completed.
2. **Edit `AuthContext.tsx` on GitHub** — Change `const BACKEND_URL` line to use `VITE_API_URL`
3. **Deploy backend on Render** — New Web Service (Free tier), Root Directory = blank (files at root), Start Command = `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Set `VITE_API_URL` in Vercel** — Add environment variable pointing to the Render live URL
5. **Redeploy on Vercel** — This is mandatory after adding env var (Vite bakes env vars at build time)
6. **Remove `.env` from GitHub** — Use `git rm --cached .env` or delete via GitHub web

## Key Files
- `src/context/AuthContext.tsx` line 22: `const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';`
- `render.yaml` (fixed version - no rootDir needed since files are at repo root)
- `backend/requirements.txt` (in dev folder) and `requirements.txt` (in git repo root)

## Resume Steps
1. Read this file
2. Go to https://github.com/messiisthegoat17/CLV-FINAL-year-project- and check what commits were made
3. Check if `AuthContext.tsx` still has the old localhost fallback or the VITE_API_URL version
4. Continue from whatever step was not completed
