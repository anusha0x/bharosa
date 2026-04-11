# 🚀 BHAROSA — Startup Guide (Read This First!)

## Why am I seeing "Could not connect to server"?
Because the **backend server is not running**. The frontend is live but has no one to talk to.
You need to start **3 things** in this order:

---

## Step 1 — Start the Backend (Node.js)

```bash
cd backend

# First time only — create the .env file:
copy .env.example .env
```

Then open `.env` and fill in your MongoDB URI:
```
PORT=3000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/bharosa
JWT_SECRET=any_random_secret_string
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
# Install packages (first time only):
npm install

# Start the server:
npm run dev
```
✅ You should see: `🚀 BHAROSA Backend running at http://localhost:3000`

---

## Step 2 — Start the ML API (Python/FastAPI)

```bash
cd ML-api

# Install Python packages (first time only):
pip install fastapi uvicorn scikit-learn pandas joblib numpy

# Start the ML server:
uvicorn bharosa_ml.api.ml_router:app --host 0.0.0.0 --port 8000 --reload
```
✅ You should see: `Application startup complete.`
📄 API docs at: http://localhost:8000/docs

---

## Step 3 — Start the Frontend (React/Vite)

```bash
cd frontend

# Install packages (first time only):
npm install

# Start the app:
npm run dev
```
✅ Open: http://localhost:5173

---

## All 3 Running? Here's the Flow:

1. Open http://localhost:5173
2. Click **Get Started** → Fill student details form (6 steps)
3. On the Scholarships page — ML will rank schemes for your profile
4. Click **Login** → enter mobile → get OTP in backend terminal (dev mode)
5. After login → Apply, upload documents, track applications

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Could not connect to server" | Backend not running → do Step 1 |
| "ML service unavailable" | ML API not running → do Step 2 (optional, fallback exists) |
| "MongoServerError" | Check MONGODB_URI in backend/.env |
| OTP not received | In dev mode, OTP is printed in the backend terminal |
| CORS error in browser | Make sure FRONTEND_URL=http://localhost:5173 in backend/.env |

