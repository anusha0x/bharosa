# 🇮🇳 BHAROSA – Backend API

Production-ready Node.js + Express + MongoDB backend for the BHAROSA Scholarship Platform.

---

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Register, OTP login, profile
│   ├── studentController.js   # Student profile CRUD
│   ├── schemeController.js    # Scholarships + eligibility engine
│   ├── applicationController.js # Apply, track, status
│   ├── documentController.js  # Multer file uploads
│   ├── notificationController.js # Notifications
│   ├── digilockerController.js # Simulated DigiLocker
│   └── chatbotController.js   # Rule-based chatbot
├── middleware/
│   ├── auth.js                # JWT protect + adminOnly
│   ├── errorHandler.js        # Global error handler
│   └── upload.js              # Multer config
├── models/
│   ├── User.js
│   ├── StudentProfile.js
│   ├── Scheme.js
│   ├── Application.js
│   ├── Notification.js
│   └── Document.js
├── routes/
│   ├── auth.js
│   ├── student.js
│   ├── schemes.js
│   ├── applications.js
│   ├── documents.js
│   ├── notifications.js
│   ├── digilocker.js
│   └── chatbot.js
├── services/
│   ├── eligibilityEngine.js   # Matching logic
│   └── notificationService.js # Notification helpers
├── utils/
│   ├── jwt.js                 # Token + OTP generators
│   └── seedData.js            # DB seed script
├── uploads/                   # Uploaded files (gitignored)
├── .env.example
├── package.json
└── server.js
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/bharosa
JWT_SECRET=your_very_long_random_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

> **MongoDB Atlas:** Create a free cluster at https://cloud.mongodb.com, then copy the connection string.

### 3. Seed the Database

```bash
npm run seed
```

This inserts **10 real Indian scholarship schemes** and creates an **admin account**:
- Mobile: `9999999999`
- Password: `admin@bharosa123`

### 4. Run the Server

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:5000**

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register with name + mobile |
| POST | `/api/auth/send-otp` | Public | Request OTP for login |
| POST | `/api/auth/login` | Public | Login with OTP or password |
| GET | `/api/auth/profile` | Private | Get logged-in user |
| PUT | `/api/auth/profile` | Private | Update name/aadhaar |

### Student Profile
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/student/profile` | Private | Create student profile |
| GET | `/api/student/profile` | Private | Get own profile |
| PUT | `/api/student/profile` | Private | Update profile |
| GET | `/api/student/profile/:id` | Private | Get profile by ID |

### Schemes
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/schemes` | Public | Get all schemes (with filters) |
| GET | `/api/schemes/:id` | Public | Get scheme details |
| GET | `/api/schemes/eligible/:studentId` | Private | Get matched schemes with scores |
| POST | `/api/schemes` | Admin | Create new scheme |
| PUT | `/api/schemes/:id` | Admin | Update scheme |
| DELETE | `/api/schemes/:id` | Admin | Delete scheme |

### Applications
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/applications/apply` | Private | Apply to a scheme |
| GET | `/api/applications/my` | Private | Get my applications |
| GET | `/api/applications/status/:appId` | Private | Get status + timeline |
| GET | `/api/applications/:id` | Private | Get single application |
| PUT | `/api/applications/:id/status` | Admin | Update status |

### Documents
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/documents/upload` | Private | Upload document (multipart) |
| GET | `/api/documents` | Private | Get my uploaded docs |
| DELETE | `/api/documents/:id` | Private | Delete a document |

### DigiLocker
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/digilocker/verify` | Private | Simulate DigiLocker verification |
| GET | `/api/digilocker/status` | Private | Get verification status |

### Notifications
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/notifications/:userId` | Private | Get all notifications |
| PUT | `/api/notifications/read` | Private | Mark as read |
| DELETE | `/api/notifications/:id` | Private | Delete notification |

### Chatbot
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/chatbot/message` | Private | Send message, get response |

---

## 🔐 Authentication

All protected routes require a `Bearer` token in the header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📤 Document Upload Example

```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "document=@aadhaar.pdf" \
  -F "docType=aadhaar"
```

Valid `docType` values: `aadhaar`, `income`, `caste`, `marksheet`, `bank`, `photo`, `other`

---

## 🤖 Chatbot Intents

The chatbot responds intelligently to these message types:
- `"check eligibility"` / `"am I eligible"` → Queries DB and returns matched schemes
- `"required documents"` → Returns document checklist
- `"application status"` → Returns real application statuses from DB
- `"upcoming deadlines"` → Lists real scheme deadlines
- `"my profile"` → Shows current profile summary
- `"digilocker"` → Explains DigiLocker process
- `"hello"` / `"hi"` → Greeting
- General fallback for other queries

---

## 🌱 Seeded Scholarship Schemes

| # | Scheme | Category | Amount |
|---|--------|----------|--------|
| 1 | National Merit Scholarship | All | ₹50,000/yr |
| 2 | SC/ST Pre-Matric | SC, ST | ₹15,000/yr |
| 3 | Girls Education Empowerment | All (Female) | ₹30,000/yr |
| 4 | Minority Higher Education | Minority | ₹25,000/yr |
| 5 | OBC Post-Matric | OBC | ₹20,000/yr |
| 6 | ST Top Class Education | ST | ₹75,000+/yr |
| 7 | Maharashtra Swadhar Yojana | SC (Maharashtra) | ₹51,000/yr |
| 8 | EWS Central Sector | General/EWS | ₹20,000/yr |
| 9 | Rajasthan Ambedkar DBT | SC, OBC (Rajasthan) | ₹10,000/yr |
| 10 | Begum Hazrat Mahal | Minority (Female) | ₹5,000–6,000/yr |

---

## 🔗 Frontend Integration

Update your frontend API base URL to:
```
http://localhost:5000/api
```

Store the JWT token from login in `localStorage` and send it with every protected request.

---

## 🛡️ Security Notes

- Change `JWT_SECRET` to a long random string in production
- Never commit `.env` to git (it's in `.gitignore`)
- Enable HTTPS in production
- Remove `devOtp` field from OTP response in production
