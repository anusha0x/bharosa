# 🇮🇳 BHAROSA – Backend API

This is the backend for the **BHAROSA Scholarship Platform**.  
It is built using **Node.js, Express, and MongoDB**, and handles everything from user authentication to scholarship matching and applications.

The goal of this backend is to keep things simple, scalable, and easy to understand for developers.

---

##  Project Structure (Quick Overview)

The project is organized in a clean and modular way:

backend/
│
├── config/ → database connection  
├── controllers/ → main logic for each feature  
├── middleware/ → auth, error handling, file uploads  
├── models/ → MongoDB schemas  
├── routes/ → API endpoints  
├── services/ → core logic (eligibility, notifications)  
├── utils/ → helper functions  
├── uploads/ → user uploaded files (ignored in git)  
├── server.js → main entry point  

---

##  Getting Started

### 1. Install dependencies

```bash
cd backend
npm install