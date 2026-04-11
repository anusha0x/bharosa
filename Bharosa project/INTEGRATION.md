# BHAROSA — Full Stack Integration Guide

## Architecture

```
Frontend (React/Vite)  ←→  Backend (Node/Express)  ←→  MongoDB
        ↕                          ↕
   port 5173                  port 3000
                               ↕
                         ML API (FastAPI)
                           port 8000
```

## Quick Start

### 1. Start ML API (Python/FastAPI)
```bash
cd ML-api
pip install fastapi uvicorn scikit-learn pandas joblib
uvicorn bharosa_ml.api.ml_router:app --host 0.0.0.0 --port 8000 --reload
```
Docs available at: http://localhost:8000/docs

### 2. Start Backend (Node/Express)
```bash
cd backend
cp .env.example .env
# Edit .env: set MONGO_URI, JWT_SECRET, NODE_ENV=development
npm install
npm start
```
API runs at: http://localhost:3000
Health check: http://localhost:3000/api/health

### 3. Start Frontend (React/Vite)
```bash
cd frontend
npm install
# .env is pre-configured for local dev
npm run dev
```
App runs at: http://localhost:5173

## What Was Integrated

### New Files Created (Frontend)
| File | Purpose |
|------|---------|
| `src/api/config.ts` | Base URL + auth token fetch wrapper |
| `src/api/auth.ts` | sendOTP, verifyOTP, logout |
| `src/api/student.ts` | Create/update student profile |
| `src/api/schemes.ts` | Fetch schemes + ML ranking |
| `src/api/applications.ts` | Apply, fetch my applications |
| `src/api/documents.ts` | Upload documents (multipart) |
| `src/api/chatbot.ts` | Send messages to backend chatbot |
| `src/context/AuthContext.tsx` | Global auth state (token + user) |

### Updated Components
| Component | What Changed |
|-----------|-------------|
| `LoginPage.tsx` | Real OTP send/verify → saves JWT token |
| `StudentDetailsForm.tsx` | Saves profile to backend; passes data to EligibilityDashboard |
| `EligibilityDashboard.tsx` | Calls ML API first, falls back to backend schemes API |
| `ApplicationTracker.tsx` | Fetches real applications from backend |
| `DocumentUploadPage.tsx` | Uploads files to backend; loads existing docs |
| `ChatBot.tsx` | Calls backend chatbot; local fallback when not logged in |
| `Navbar.tsx` | Shows logged-in user name + logout button |
| `App.tsx` | Wrapped with AuthProvider |
| `Root.tsx` | ChatBot included in layout |
| `vite.config.ts` | Added dev server proxy for /api and /ml |

## API Endpoints Used

### Auth
- `POST /api/auth/send-otp` — sends OTP to mobile
- `POST /api/auth/login` — verifies OTP, returns JWT

### Student Profile
- `POST /api/student/profile` — create profile
- `PUT /api/student/profile` — update profile

### Schemes
- `GET /api/schemes` — list all active schemes
- `POST http://localhost:8000/ml/rank-schemes` — ML-ranked schemes

### Applications
- `POST /api/applications/apply` — apply to scheme
- `GET /api/applications/my` — get my applications

### Documents
- `POST /api/documents/upload` — upload a document (multipart/form-data)
- `GET /api/documents` — list my documents

### Chatbot
- `POST /api/chatbot/message` — send a message, get AI reply

## Notes
- Frontend gracefully falls back to sample/mock data when backend is offline
- JWT token is stored in localStorage under `bharosa_token`
- ML API is optional — if unavailable, backend schemes API is used instead
- Dev OTP is shown in the UI only when `NODE_ENV=development`
