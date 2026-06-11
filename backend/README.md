# CredBook — Backend

Express 5 REST API server for the CredBook digital udhar khatha system.

## Tech Stack

- **Node.js** with ES Modules
- **Express 5** for HTTP routing
- **Mongoose 9** for MongoDB ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **PDFKit** for PDF generation
- **Multer** for file uploads
- **node-cron** for scheduled tasks
- **Google Apps Script** for email relay

## Project Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── email.js           # Email API configuration
├── jobs/
│   └── reminderJob.js     # Cron job for scheduled reminders
├── middlewares/
│   ├── authMiddleware.js  # JWT verification
│   └── errorMiddleware.js # Global error handler
├── models/
│   ├── User.js            # Shopkeeper schema
│   ├── Customer.js        # Customer schema
│   ├── Transaction.js     # Transaction schema
│   └── Reminder.js        # Reminder schema
├── routes/
│   ├── authRoutes.js      # Authentication endpoints
│   ├── customerRoutes.js  # Customer CRUD endpoints
│   ├── transactionRoutes.js # Transaction endpoints
│   ├── reminderRoutes.js  # Reminder endpoints
│   └── statementRoutes.js # PDF statement endpoints
├── services/
│   ├── authService.js     # Registration, login, JWT
│   ├── transactionService.js # Transaction logic, balance
│   ├── reminderService.js # Scheduling, conditions
│   ├── notificationService.js # Email sending
│   └── pdfService.js      # PDF generation
├── uploads/               # Receipt images (gitignored)
├── .env                   # Environment variables
├── server.js              # Entry point
└── package.json
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `DB_URL` | — | MongoDB connection string |
| `JWT_SECRET` | — | Secret for JWT signing |
| `CORS_ORIGIN` | `*` | Comma-separated allowed origins |
| `EMAIL_APPS_SCRIPT_URL` | — | Google Apps Script web app URL |
| `EMAIL_FROM_NAME` | `CredBook` | Default sender display name |
| `NODE_ENV` | — | Set to `production` for live |

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| POST | `/register` | 10/15min | Register shopkeeper |
| POST | `/login` | 10/15min | Login shopkeeper |
| GET | `/profile` | — | Get current user profile |

### Customers (`/api/customers`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List customers (search, pagination) |
| GET | `/:id` | Get customer by ID |
| POST | `/` | Create new customer |
| PUT | `/:id` | Update customer |
| DELETE | `/:id` | Delete customer + related data |

### Transactions (`/api/transactions`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customer/:customerId` | Get transactions for customer |
| POST | `/` | Create transaction (multipart/form-data) |
| PUT | `/:id` | Update transaction |
| DELETE | `/:id` | Delete transaction |

**Transaction Types:**
- `give` — You gave credit to customer (increases their debt)
- `take` — Customer paid you back (decreases their debt)

### Reminders (`/api/reminders`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Get today/monthly email count |
| GET | `/` | List reminders (filter by status) |
| GET | `/customer/:customerId` | Get reminders for a customer |
| POST | `/` | Schedule a new reminder |
| POST | `/:id/send-now` | Send reminder immediately |
| POST | `/batch` | Batch schedule for all due customers |
| POST | `/send-test` | Send preview email to customer |
| DELETE | `/:id` | Cancel a reminder |

### Statements (`/api/statements`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customer/:customerId/pdf` | Download PDF statement |

**Query Parameters:**
- `from` — Start date (ISO string)
- `to` — End date (ISO string)

## Database Models

### User

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Shopkeeper name |
| `email` | String | Unique, lowercase |
| `password` | String | bcrypt hashed |
| `phone` | String | Shopkeeper phone |
| `shopName` | String | Business name |
| `currency` | String | Default: `INR` |

### Customer

| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId | Owner shopkeeper |
| `name` | String | Customer name |
| `phone` | String | Unique per user |
| `email` | String | Optional |
| `address` | String | Optional |
| `netBalance` | Number | Auto-managed |
| `reminderIntervalValue` | Number | Start delay value |
| `reminderIntervalUnit` | String | `minutes`/`hours`/`days` |
| `reminderPattern` | String | `none`/`daily`/`weekly`/etc. |
| `repeatIntervalValue` | Number | Repeat interval value |
| `repeatIntervalUnit` | String | `minutes`/`hours`/`days` |
| `reminderMaxCount` | Number | Max sends (null = unlimited) |
| `reminderMinBalance` | Number | Min balance to trigger |

### Transaction

| Field | Type | Notes |
|-------|------|-------|
| `customer` | ObjectId | Reference to Customer |
| `user` | ObjectId | Reference to User |
| `amount` | Number | Min: 0.01 |
| `type` | String | `give` or `take` |
| `description` | String | Optional |
| `date` | Date | Transaction date |
| `receiptImage` | String | File path |

### Reminder

| Field | Type | Notes |
|-------|------|-------|
| `customer` | ObjectId | Reference to Customer |
| `user` | ObjectId | Reference to User |
| `scheduledDate` | Date | When to send |
| `message` | String | Email body |
| `status` | String | `pending`/`sent`/`failed`/`completed` |
| `recurrencePattern` | String | `daily`/`weekly`/`monthly`/`custom` |
| `recurrenceInterval` | Number | Interval value |
| `recurrenceIntervalUnit` | String | `minutes`/`hours`/`days` |
| `recurrenceSentCount` | Number | Times sent |
| `maxRecurrenceCount` | Number | Max sends (null = unlimited) |

## Services

### authService
- `registerUser(data)` — Hash password, create user, return JWT
- `loginUser(email, password)` — Verify credentials, return JWT

### transactionService
- `addTransaction(data)` — Create transaction, update `netBalance`, auto-schedule reminder on `give`
- `updateTransaction(id, data)` — Update transaction, adjust `netBalance`
- `deleteTransaction(id)` — Remove transaction, adjust `netBalance`

### reminderService
- `computeNextDate(reminder, fromDate)` — Calculate next recurrence date
- `checkConditions(reminder)` — Verify balance and time conditions
- `shouldCompleteReminder(reminder)` — Check if max count reached or balance cleared

### notificationService
- `sendNotification(reminder)` — Build email content, send via Google Apps Script

### pdfService
- `generateStatementPDF(user, customer, transactions, options)` — Generate A4 PDF with header, summary, and transaction table

## Cron Jobs

### reminderJob (`* * * * *` — every minute)

**Phase 1 — Process Due Reminders:**
1. Find pending reminders where `scheduledDate <= now`
2. Check conditions (balance, min days)
3. Send notification
4. Complete or reschedule based on recurrence

**Phase 2 — Ensure Coverage:**
1. Find all customers with `netBalance > 0`
2. If no pending/failed reminder exists, create one

## Email Configuration

Uses Google Apps Script as an email relay to bypass SMTP restrictions.

### Setup

1. Create a Google Apps Script project
2. Deploy as Web App (Execute as: Me, Access: Anyone)
3. Set `EMAIL_APPS_SCRIPT_URL` env var to the `/exec` URL

### Email Template

The HTML email includes:
- Shop name header
- Customer name and greeting
- Outstanding balance display
- Contact phone and email
- "Sent via CredBook" footer

## Middleware

| Middleware | Purpose |
|------------|---------|
| `authMiddleware` | JWT Bearer token verification |
| `errorMiddleware` | Global error handler, returns JSON |
| `authLimiter` | Rate limit: 10 requests per 15 minutes |
| CORS | Configurable origins via `CORS_ORIGIN` |

## Development

```bash
# Install dependencies
npm install

# Start with auto-reload
npm run dev

# Start production
node server.js
```

## Deployment (Render)

| Setting | Value |
|---------|-------|
| Root Directory | `backend/` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Health Check | `/` |

**Required Environment Variables:**

```env
PORT=10000
DB_URL=mongodb+srv://...
JWT_SECRET=your_secret
CORS_ORIGIN=https://your-vercel-app.vercel.app
EMAIL_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
EMAIL_FROM_NAME=CredBook
NODE_ENV=production
```

## License

ISC
