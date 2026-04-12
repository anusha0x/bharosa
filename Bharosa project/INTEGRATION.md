# 🇮🇳 BHAROSA — Full Stack Project Guide

BHAROSA is a full-stack scholarship platform that helps students find and apply for schemes easily.  
It combines a React frontend, Node.js backend, and a FastAPI-based ML service for smarter recommendations.

---

## Project Architecture

The project has three main parts working together:

Frontend (React + Vite) → http://localhost:5173  
⬇  
Backend (Node.js + Express) → http://localhost:3000  
⬇  
MongoDB Database  

Along with this:

Backend ↔ ML API (FastAPI) → http://localhost:8000  

---

##  How to Run the Project

Make sure you run everything in this order:

### 1. Start ML API (FastAPI)

```bash
cd ML-api
pip install fastapi uvicorn scikit-learn pandas joblib
uvicorn bharosa_ml.api.ml_router:app --host 0.0.0.0 --port 8000 --reload