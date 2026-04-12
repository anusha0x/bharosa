# Bharosa

A scholarship discovery platform built for students who don't know what they qualify for — and shouldn't have to figure it out alone.

Most government scholarship portals are confusing, outdated, or just don't tell you *why* you're ineligible. Bharosa fixes that. You fill in your details once, and we show you exactly which schemes you're eligible for, what documents you need, how to apply, why or why not eligible, schemes ranked according to approval probability and application tracking.

Built for a hackathon. Built for real students.

---

## What it does

- Matches you to scholarships based on your actual profile using an ML model
- Shows eligibility clearly — not just "you qualify" but why
- Keeps all your documents in one place
- Lets you track every application you've submitted
- Has a video walkthrough on each scholarship detail page so nothing feels overwhelming
- OTP login — no passwords, no friction

---

## Stack

React + Vite on the frontend, Node/Express backend, MongoDB, and a FastAPI service for the ML recommendations. Styled with Tailwind and shadcn/ui.

---

## Running locally

Three things need to be running. Start them in this order.

**Backend** (port 3000)
```bash
cd "Bharosa project/backend"
cp .env.example .env
# fill in your MongoDB URI and JWT secret
npm install
npm run dev
```

**.env format:**
```
PORT=3000
MONGODB_URI=your_mongo_uri
JWT_SECRET=anything
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**ML API** (port 8000)
```bash
cd "Bharosa project/ML-api"
pip install fastapi uvicorn scikit-learn pandas joblib numpy
uvicorn bharosa_ml.api.ml_router:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend** (port 5173)
```bash
cd "Bharosa project/frontend"
npm install
npm run dev
```

Then open http://localhost:5173.

> In dev mode, OTPs are printed in the backend terminal — no SMS needed.

---

## Project structure

```
Bharosa project/
├── frontend/        # React app
├── backend/         # Express API
└── ML-api/          # FastAPI ML service
```

---

## Known issues / things we'd fix with more time

- ML model is trained on a limited dataset — recommendations get better with more user data
- OTP in production needs an SMS provider (we used terminal output for the hackathon)
- DigiLocker integration is simulated — the real API requires government-approved credentials and a formal partnership with MeitY, which is not something you can just sign up for. The flow is there, the UI is there, but actual document fetching from DigiLocker would need that access in a production build

---

Built by Team TechSpirit
