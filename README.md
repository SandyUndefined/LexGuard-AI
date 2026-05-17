# 🛡️ LexGuard AI

**AI-powered legal document analysis.** Upload any contract and instantly identify risky clauses, understand risks in plain English, and get a recommendation: **Safe**, **Negotiate**, or **Avoid**.

![LexGuard AI](https://img.shields.io/badge/Powered%20by-Gemini%20AI-6366f1?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Express%20%7C%20Firestore-8b5cf6?style=flat-square)

---

## 📁 Project Structure

```
LexGuard-AI/
├── client/          # React + Vite + TypeScript + Tailwind
├── server/          # Node.js + Express + TypeScript
├── shared/          # Shared TypeScript types
└── package.json     # Root npm workspace
```

---

## 🚀 Quick Start (Mock Mode — No GCP Required)

Mock mode is **on by default**. You can run the full app without any Google Cloud credentials.

### 1. Install dependencies

```bash
npm install
```

### 2. Set up server environment

```bash
cp server/.env.example server/.env
# MOCK_MODE=true is set by default — no changes needed
```

### 3. Start both servers

```bash
npm run dev
```

- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:3001  
- **Health check:** http://localhost:3001/health

---

## 🌐 Production Setup (Real GCP)

### Prerequisites

1. [Create a GCP project](https://console.cloud.google.com/projectcreate)
2. Enable the following APIs:
   - Vertex AI API
   - Cloud Firestore API
   - Cloud Storage API
3. Create a Firestore database (Native mode)
4. Create a GCS bucket for document storage
5. Create a service account with roles:
   - `Vertex AI User`
   - `Cloud Datastore User`
   - `Storage Object Admin`
6. Download the service account key JSON

### Configure

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
MOCK_MODE=false
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
GCS_BUCKET_NAME=your-bucket-name
VERTEX_AI_LOCATION=us-central1
```

Place your `service-account-key.json` inside the `server/` directory.

---

## 🎯 Features

| Feature | Description |
|---|---|
| 📄 File Upload | PDF, PNG, JPG, WEBP, TXT (up to 20MB) |
| 🎭 Persona Selection | Employee, Freelancer, Customer, Tenant, Vendor |
| 🤖 AI Analysis | Powered by Vertex AI Gemini 1.5 Pro |
| 📊 Risk Scoring | 0–100 score with animated gauge |
| ⚠️ Clause Detection | Color-coded by severity (low/medium/high) |
| 💬 Plain English | No legal jargon — clear risk explanations |
| ✅ Recommendations | Safe / Negotiate / Avoid |
| 📚 History | Browse and search all past analyses |

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS v3 |
| State | Zustand |
| Routing | React Router v6 |
| Animations | Framer Motion, CSS animations |
| Backend | Node.js, Express, TypeScript |
| AI | Vertex AI Gemini 1.5 Pro |
| Database | Cloud Firestore |
| Storage | Google Cloud Storage |
| File Parsing | Multer, pdf-parse |

---

## 🔗 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Server health + mock mode status |
| `/api/analyze` | POST | Upload and analyze a contract |
| `/api/history` | GET | List all past analyses |
| `/api/history/:id` | GET | Get a specific analysis result |

### POST /api/analyze

**Content-Type:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | File | Contract document (PDF/image/text) |
| `persona` | string | `employee` \| `freelancer` \| `customer` \| `tenant` \| `vendor` |

---

## ⚖️ Disclaimer

LexGuard AI provides general information for educational purposes only. It is not a substitute for professional legal advice. Always consult a qualified attorney for important legal decisions.