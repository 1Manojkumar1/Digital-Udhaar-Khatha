# CredBook — Frontend

React 19 single-page application for the CredBook digital udhar khatha system.

## Tech Stack

- **React 19** with Vite 8
- **Tailwind CSS 4** for styling
- **React Router DOM 7** for routing
- **Axios** for API requests
- **Lucide React** for icons

## Project Structure

```
frontend/src/
├── auth/
│   ├── AuthContext.jsx      # React context for auth state
│   ├── auth.service.js      # API calls (login, register, profile)
│   └── useAuth.js           # Hook to consume auth context
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx    # Login form
│   │   └── RegisterForm.jsx # Registration form
│   ├── common/
│   │   ├── Loader.jsx       # Full-page spinner
│   │   ├── ErrorBoundary.jsx # React error boundary
│   │   ├── Modal.jsx        # Glassmorphic modal
│   │   ├── SearchBar.jsx    # Customer search input
│   │   └── ReceiptPreviewModal.jsx # Image preview
│   ├── customers/
│   │   ├── CustomerForm.jsx    # Create/edit customer
│   │   ├── CustomerTable.jsx   # Desktop table view
│   │   ├── CustomerCard.jsx    # Mobile card view
│   │   ├── CustomerProfile.jsx # Customer detail summary
│   │   ├── CustomerTransactions.jsx # Transaction timeline
│   │   └── ReminderButton.jsx  # Schedule reminder button
│   ├── transactions/
│   │   ├── TransactionForm.jsx   # Create/edit transaction
│   │   ├── TransactionTable.jsx  # Transaction history
│   │   └── TransactionSummary.jsx # Total give/take cards
│   ├── statements/
│   │   └── StatementGenerator.jsx # PDF download form
│   ├── twilio/
│   │   └── EmailStatus.jsx      # Email count badge
│   └── layouts/
│       ├── DashboardLayout.jsx   # Sidebar + navbar + content
│       └── AuthLayout.jsx        # Split-screen auth layout
├── customers/
│   ├── customer.service.js  # API calls for customers
│   ├── customer.utils.js    # Formatting helpers
│   └── useCustomers.js      # Data fetching hook
├── pages/
│   ├── Login.jsx            # Login page
│   ├── Register.jsx         # Registration page
│   ├── Dashboard.jsx        # Overview with stats
│   ├── Customers.jsx        # Customer directory
│   ├── CustomerDetails.jsx  # Single customer ledger
│   ├── Transactions.jsx     # Transaction management
│   ├── Statements.jsx       # PDF statement generator
│   └── Reminders.jsx        # Reminder management
├── reminders/
│   └── reminder.service.js  # API calls for reminders
├── statements/
│   └── statement.service.js # API call for PDF download
├── transactions/
│   ├── transaction.service.js # API calls for transactions
│   ├── transaction.utils.js   # Formatting helpers
│   └── useTransactions.js     # Data fetching hook
├── utils/
│   ├── axiosInstance.js     # Axios with interceptors
│   ├── formatters.js        # Currency/date formatters
│   └── constants.js         # App constants
├── App.jsx                  # Router setup
└── main.jsx                 # Entry point
```

## Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/login` | Login | Public | Shopkeeper login |
| `/register` | Register | Public | Shopkeeper registration |
| `/` | Dashboard | Private | Overview with stats |
| `/customers` | Customers | Private | Customer directory |
| `/customers/:id` | CustomerDetails | Private | Customer ledger |
| `/transactions` | Transactions | Private | Transaction management |
| `/statements` | Statements | Private | PDF statement generator |
| `/reminders` | Reminders | Private | Reminder management |
| `*` | Redirect to `/` | — | Catch-all |

## Key Features

### Authentication
- JWT-based auth with `AuthContext` provider
- Token stored in localStorage (`udhar_token`)
- Auto-logout on 401 responses via Axios interceptor
- Route guards: `PrivateRoute` (requires auth), `PublicRoute` (redirects if logged in)

### Customer Management
- Create, edit, delete customers
- Search by name or phone
- Responsive table (desktop) / card (mobile) views
- Configure per-customer reminder intervals

### Transaction Ledger
- "You Gave" (credit) / "You Got" (payment) toggle
- Receipt image upload (JPEG/PNG/GIF, 5MB max)
- Auto-balance tracking via `netBalance`
- Transaction timeline with running balance

### Email Reminders
- Send preview email to verify setup
- Schedule individual or batch reminders
- Configurable: start delay, repeat interval, min balance
- Send now, cancel, or reschedule reminders

### PDF Statements
- Select customer and optional date range
- Download formatted A4 PDF with:
  - Shop header and customer info
  - Summary box (total give/take/net)
  - Transaction ledger table with running balance

## State Management

- **Auth**: React Context (`AuthContext`) with `useAuth` hook
- **Data**: Custom hooks (`useCustomers`, `useTransactions`) with local state
- **No Redux/Zustand** — all state is page-scoped

## API Integration

**Base URL**: `import.meta.env.VITE_API_URL`

**Axios Instance** (`utils/axiosInstance.js`):
- Request interceptor: attaches `Bearer <token>` header
- Response interceptor: auto-logout on 401, error propagation

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Deployment (Vercel)

| Setting | Value |
|---------|-------|
| Root Directory | `frontend/` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Framework | Vite |
| Env Var | `VITE_API_URL` = backend URL |

SPA rewrites are handled by the Vite config — all routes fallback to `index.html`.
