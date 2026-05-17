# LexGuard AI

AI-powered contract risk review for hackathon demos. Upload a contract, choose a persona, get a scored report, inspect risky clauses, and export a printable report.

## Demo Flow

1. Open the landing page.
2. Click **Analyze a Contract**.
3. Upload your own contract text file.
4. Select the persona that matches your role.
5. Run the analysis.
6. Review the Results page.
7. Click **Export Report** to open a printable HTML report that can be saved as PDF.

Mock mode is supported for local development without Google Cloud credentials, but it does not preload reports. Real mode uses Vertex AI Gemini, Firestore, and Google Cloud Storage.

## Project Structure

```text
LexGuard-AI/
├── client/          # React + Vite + TypeScript + Tailwind
├── server/          # Express + TypeScript API
├── shared/          # Shared TypeScript types
├── Dockerfile       # Cloud Run API container
├── firebase.json    # Firebase Hosting + Cloud Run rewrites
└── package.json     # npm workspaces
```

## Quick Start

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Health: `http://localhost:3001/health`

`server/.env.example` defaults to `MOCK_MODE=true`, so the app runs without GCP setup.
`client/.env.example` points the Vite app at the local backend with `VITE_API_URL=http://localhost:3001`.

## Real GCP Setup

Enable these APIs in your Google Cloud project:

- Vertex AI API
- Cloud Firestore API
- Cloud Storage API
- Cloud Run Admin API
- Cloud Build API
- Artifact Registry API

Create:

- Firestore database in Native mode
- GCS bucket for uploaded documents
- Cloud Run service account with:
  - `Vertex AI User`
  - `Cloud Datastore User`
  - `Storage Object Admin`

For local real-mode development, copy `server/.env.example` to `server/.env` and set:

```env
MOCK_MODE=false
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
GCS_BUCKET_NAME=your-bucket-name
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-1.5-pro
FIRESTORE_REPORTS_COLLECTION=reports
CORS_ORIGINS=http://localhost:5173,https://lex-guard-ai-eight.vercel.app
```

Do not commit service account JSON files. They are ignored by `.gitignore`.

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | API health |
| `POST` | `/api/analyze-text` | Analyze pasted text |
| `POST` | `/api/upload-document` | Upload PDF, PNG, JPG, JPEG, or TXT |
| `GET` | `/api/reports` | List report summaries |
| `GET` | `/api/reports/:id` | Fetch one report |
| `GET` | `/api/reports/:id/export` | Printable HTML export |

The client uses the enhanced report API for the demo path.

Health check response:

```json
{
  "status": "ok",
  "service": "LexGuard Backend"
}
```

## Scoring

Severity weights:

| Severity | Weight |
|---|---:|
| Low | 10 |
| Medium | 35 |
| High | 70 |
| Critical | 95 |

`overallRiskScore` is the rounded average of clause severity weights.

Risk bands:

- `0-30`: Safe
- `31-70`: Negotiate
- `71-100`: Avoid

## Document Upload

Accepted files:

- PDF
- PNG
- JPG / JPEG
- TXT

TXT is read directly. PDF and image extraction currently use modular placeholder extractors in `server/src/services/documentExtraction.ts`, ready for Document AI or Vision API integration.

## Vercel Frontend + Cloud Run Backend

Your Vercel frontend should call Cloud Run directly with a Vite environment variable:

```env
VITE_API_URL=https://YOUR-CLOUD-RUN-URL
```

Set this in Vercel:

1. Open your Vercel project.
2. Go to **Settings → Environment Variables**.
3. Add `VITE_API_URL`.
4. Use your Cloud Run service URL as the value.
5. Redeploy the Vercel frontend.

The frontend has a backend status badge. On app load it calls:

```text
https://YOUR-CLOUD-RUN-URL/health
```

If the badge is offline on Vercel, check:

- `VITE_API_URL` is set for the Vercel environment you deployed.
- Cloud Run allows unauthenticated requests.
- Backend `CORS_ORIGINS` includes `https://lex-guard-ai-eight.vercel.app`.
- The Cloud Run service responds to `/health`.

### Deploy API to Cloud Run

From the repo root:

```bash
PROJECT_ID=lexguard-496608
REGION=us-central1
SERVICE=lexguard-api
BUCKET=your-gcs-bucket
VERCEL_ORIGIN=https://lex-guard-ai-eight.vercel.app
SERVICE_ACCOUNT=lexguard-api@$PROJECT_ID.iam.gserviceaccount.com

gcloud config set project $PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

gcloud run deploy $SERVICE \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --service-account $SERVICE_ACCOUNT \
  --set-env-vars MOCK_MODE=false,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GCS_BUCKET_NAME=$BUCKET,VERTEX_AI_LOCATION=$REGION,FIRESTORE_REPORTS_COLLECTION=reports,CORS_ORIGINS=$VERCEL_ORIGIN
```

Cloud Run injects `PORT`; the server falls back to `8080` when `PORT` is not set.
The backend also includes `http://localhost:5173` and `https://lex-guard-ai-eight.vercel.app` in its default CORS allowlist.

After deploy:

```bash
BACKEND_URL=$(gcloud run services describe $SERVICE --region $REGION --format="value(status.url)")
curl $BACKEND_URL/health
```

Set `VITE_API_URL=$BACKEND_URL` in Vercel and redeploy the frontend.

## Firebase Hosting + Cloud Run Deployment

The repo includes:

- `Dockerfile` for the Express API on Cloud Run
- `firebase.json` for Firebase Hosting static assets and `/api/**` rewrites to Cloud Run

The included `firebase.json` assumes:

- Cloud Run service: `lexguard-api`
- Region: `us-central1`
- Hosting public directory: `client/dist`

Edit `firebase.json` if your Cloud Run service or region differs.

### 1. Build and Test Locally

```bash
npm run type-check
npm run build
```

### 2. Deploy API to Cloud Run

From the repo root:

```bash
PROJECT_ID=your-project-id
REGION=us-central1
BUCKET=your-gcs-bucket
SERVICE_ACCOUNT=lexguard-api@$PROJECT_ID.iam.gserviceaccount.com

gcloud config set project $PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

gcloud run deploy lexguard-api \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --service-account $SERVICE_ACCOUNT \
  --set-env-vars MOCK_MODE=false,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GCS_BUCKET_NAME=$BUCKET,VERTEX_AI_LOCATION=$REGION,FIRESTORE_REPORTS_COLLECTION=reports,CORS_ORIGINS=https://$PROJECT_ID.web.app
```

Cloud Run deploys source with `gcloud run deploy --source .`; because this repo has a Dockerfile, Cloud Run builds that container.

### 3. Deploy Frontend to Firebase Hosting

```bash
npm run build --workspace=client
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only hosting
```

Firebase Hosting serves `client/dist` and rewrites `/api/**` to the Cloud Run service configured in `firebase.json`.

## Useful Scripts

```bash
npm run dev          # client + server
npm run type-check   # server + client type checks
npm run build        # shared + server + client builds
```

## References

- Firebase Hosting quickstart: https://firebase.google.com/docs/hosting/quickstart
- Firebase Hosting + Cloud Run rewrites: https://firebase.google.com/docs/hosting/cloud-run
- Cloud Run source deploy: https://cloud.google.com/run/docs/deploying-source-code

## Disclaimer

LexGuard AI provides general information for educational purposes only. It is not legal advice. Consult a qualified attorney for important contracts.
