# CredBook — Digital Udhar Khatha

A full-stack web application for shopkeepers to manage credit (udhar) given to customers, record payments, send automated email reminders, and generate PDF account statements.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 + Tailwind CSS 4 |
| Backend | Express 5 + Node.js (ES Modules) |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Email | Google Apps Script (Gmail relay) |
| PDF | PDFKit |
| Hosting | Vercel (frontend) + Render (backend) |

## Project Structure

```
digital-udhar-khatha/
├── backend/
│   ├── config/          # DB, email configuration
│   ├── jobs/            # Cron jobs (reminder scheduler)
│   ├── middlewares/      # Auth, error, rate-limit
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic
│   ├── uploads/         # Receipt images
│   └── server.js        # Entry point
└── frontend/
    ├── src/
    │   ├── auth/        # Auth context, service, hook
    │   ├── components/  # Reusable UI components
    │   ├── customers/   # Customer service, utils
    │   ├── layouts/     # Dashboard + Auth layouts
    │   ├── pages/       # Route page components
    │   ├── reminders/   # Reminder service
    │   ├── statements/  # PDF statement service
    │   ├── transactions/# Transaction service, utils
    │   └── utils/       # Axios, formatters, constants
    ├── index.html
    └── vite.config.js
```

## Features

- **Shopkeeper Registration & Login** with JWT authentication
- **Customer Directory** with search and responsive table/card views
- **Credit Ledger** — record "You Gave" (credit) and "You Got" (payment) transactions
- **Receipt Image Upload** on transactions
- **Auto-Balance Tracking** — net balance auto-adjusts with each transaction
- **Automated Email Reminders** — configurable per-customer schedule
- **Batch Reminder Scheduling** — schedule reminders for all due customers at once
- **PDF Statement Generation** — formatted A4 statements with transaction history
- **Test Email Preview** — verify email setup before enabling automated reminders
- **Responsive Design** — works on desktop and mobile

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google account (for Apps Script email relay)
- Vercel account (for frontend deployment)
- Render account (for backend deployment)

### Installation

```bash
# Clone repository
git clone https://github.com/1Manojkumar1/Digital-Udhaar-Khatha.git
cd digital-udhar-khatha

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

**Backend** — create `backend/.env`:

```env
PORT=5000
DB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/digital-udhar-khatha
JWT_SECRET=your_strong_random_secret_key
CORS_ORIGIN=http://localhost:5173,https://your-vercel-app.vercel.app
EMAIL_APPS_SCRIPT_URL=https://script.google.com/macros/s/your-script-id/exec
EMAIL_FROM_NAME=CredBook
NODE_ENV=development
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### Running Locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

## Deployment

### Frontend (Vercel)

| Setting | Value |
|---------|-------|
| Root Directory | `frontend/` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Env Var | `VITE_API_URL` = your Render backend URL |

### Backend (Render)

| Setting | Value |
|---------|-------|
| Root Directory | `backend/` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Health Check | `/` |

**Required Render Environment Variables:**

```env
PORT=10000
DB_URL=mongodb+srv://...
JWT_SECRET=your_secret
CORS_ORIGIN=https://your-vercel-app.vercel.app
EMAIL_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
EMAIL_FROM_NAME=CredBook
NODE_ENV=production
```

### Google Apps Script Setup

1. Go to [script.google.com](https://script.google.com)
2. Create new project, paste the email relay code (see `backend/README.md`)
3. Deploy as Web App → Execute as **Me**, Who has access **Anyone**
4. Copy the `/exec` URL and add as `EMAIL_APPS_SCRIPT_URL` in Render

## API Overview

| Resource | Base Path | Endpoints |
|----------|-----------|-----------|
| Auth | `/api/auth` | register, login, profile |
| Customers | `/api/customers` | CRUD + search |
| Transactions | `/api/transactions` | CRUD by customer |
| Reminders | `/api/reminders` | CRUD + send-now + batch + send-test |
| Statements | `/api/statements` | PDF generation |

See `backend/README.md` for full API documentation.

## License

ISC
