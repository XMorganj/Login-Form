# CLAUDE.md

## Project Overview

**StarGifts** — a celebrity fan gift site. Fans browse celebrity profiles, add gifts to a cart, and pay via Stripe (card) or Bitcoin (CoinGate sandbox). Admins manage celebrities, products, and orders through a protected dashboard.

Stack: Node.js + Express backend, MongoDB + Mongoose, vanilla HTML/CSS/JS frontend. No build system — the server serves static files from `public/`.

---

## Repository Structure

```
Login-Form/
├── server/
│   ├── server.js           # Express entry point — mounts all routes, serves static files
│   ├── seed.js             # One-time seed: creates admin user + sample data
│   ├── config/
│   │   └── db.js           # Mongoose connection
│   ├── models/
│   │   ├── User.js         # Fan + admin accounts; password hashed via bcrypt pre-save hook
│   │   ├── Celebrity.js    # Profile, bio, social links, photo, cover photo
│   │   ├── Product.js      # Gift items linked to a celebrity
│   │   └── Order.js        # Cart checkout result; holds Stripe intent ID or CoinGate order ID
│   ├── middleware/
│   │   └── auth.js         # protect (JWT check) + adminOnly (role check)
│   └── routes/
│       ├── auth.js         # POST /api/auth/register, /login; GET /api/auth/me
│       ├── celebrities.js  # CRUD /api/celebrities — public GET, admin POST/PUT/DELETE
│       ├── products.js     # CRUD /api/products — public GET, admin POST/PUT/DELETE
│       ├── payments.js     # Stripe intent + confirm; Bitcoin CoinGate create + callback
│       └── orders.js       # GET /api/orders (admin all), /api/orders/my (fan), PUT status
├── public/
│   ├── index.html          # Home — hero, featured celebrities, popular gifts
│   ├── celebrities.html    # Browse all celebrities with category filter + search
│   ├── celebrity.html      # Single celebrity profile + their gift catalog
│   ├── shop.html           # All gifts with category filter
│   ├── checkout.html       # Shipping form + Stripe card element + Bitcoin tab
│   ├── order-success.html  # Post-payment confirmation
│   ├── login.html          # Fan/admin login
│   ├── register.html       # Fan registration
│   ├── css/main.css        # All frontend styles (dark gold theme)
│   ├── js/
│   │   ├── api.js          # Thin fetch wrapper — API.get/post/put/del/uploadForm
│   │   ├── auth.js         # Auth.setSession/logout/isLoggedIn; updates navbar UI
│   │   ├── cart.js         # Cart stored in localStorage; Cart.add/remove/setQty/total
│   │   └── toast.js        # showToast(message, type) helper
│   ├── img/
│   │   └── placeholder.svg # Fallback image for missing photos
│   └── admin/
│       ├── index.html      # Single-page admin dashboard (celebrities, products, orders)
│       └── css/admin.css   # Admin-specific styles
├── uploads/                # Auto-created by server on start; stores uploaded images
├── .env                    # Local secrets — never commit
├── .env.example            # Template showing required env vars
├── .gitignore
└── package.json
```

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in:
- `MONGODB_URI` — local or Atlas connection string
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — from Stripe dashboard (use test keys)
- `COINGATE_API_TOKEN` — from CoinGate sandbox account
- `JWT_SECRET` — any long random string

### 3. Seed the database (first run only)
```bash
node server/seed.js
# Creates admin@stargifts.com / admin123 + a sample celebrity + product
```

### 4. Run
```bash
npm run dev    # nodemon (development)
npm start      # node (production)
```
Open `http://localhost:3000`.

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register fan account |
| POST | `/api/auth/login` | — | Login; returns JWT + user |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/celebrities` | — | List (filter: `?category=music&featured=true&search=`) |
| GET | `/api/celebrities/:slug` | — | Single celebrity by slug |
| POST | `/api/celebrities` | Admin | Create (multipart/form-data) |
| PUT | `/api/celebrities/:id` | Admin | Update |
| DELETE | `/api/celebrities/:id` | Admin | Soft-delete (sets `active: false`) |
| GET | `/api/products` | — | List (filter: `?celebrity=id&category=`) |
| POST | `/api/products` | Admin | Create |
| PUT | `/api/products/:id` | Admin | Update |
| DELETE | `/api/products/:id` | Admin | Soft-delete |
| POST | `/api/payments/stripe/create-intent` | — | Create Stripe PaymentIntent + Order |
| POST | `/api/payments/stripe/confirm/:orderId` | — | Confirm payment + decrement stock |
| POST | `/api/payments/bitcoin/create` | — | Create CoinGate order + Order doc |
| POST | `/api/payments/bitcoin/callback` | — | CoinGate webhook (raw body) |
| GET | `/api/payments/order/:id` | — | Fetch single order |
| GET | `/api/orders/my` | JWT | Fan's own orders |
| GET | `/api/orders` | Admin | All orders (paginated) |
| PUT | `/api/orders/:id/status` | Admin | Update order status |

---

## Key Conventions

### Authentication
- JWT stored in `localStorage` under key `token`; user object under `user`.
- `Auth.setSession(token, user)` / `Auth.logout()` in `public/js/auth.js`.
- Admin panel (`/admin/`) checks `user.role === 'admin'` client-side; server enforces it on every admin API call via the `adminOnly` middleware.

### Cart
- Lives in `localStorage` under `fan_cart` as an array of `{ productId, name, price, image, quantity }`.
- `Cart.add(product)` increments quantity if already in cart.
- Cart is cleared via `Cart.clear()` after successful payment.

### File uploads
- Multer stores files in `uploads/celebrities/` and `uploads/products/` (auto-created).
- Routes accept multipart/form-data for POST/PUT on celebrities and products.
- `API.uploadForm(method, path, formData)` in `api.js` handles multipart requests with auth header but without setting `Content-Type` (browser sets boundary automatically).

### Payments
- **Stripe**: `POST /stripe/create-intent` → client-side `stripe.confirmCardPayment()` → `POST /stripe/confirm/:id` marks order paid.
- **Bitcoin**: `POST /bitcoin/create` → CoinGate returns `payment_url` and `payment_address` → user pays on-chain → CoinGate hits `/bitcoin/callback` → order marked paid.
- In sandbox mode, CoinGate uses `https://api-sandbox.coingate.com`.

### Soft deletes
- Celebrities and Products are never hard-deleted. `DELETE` routes set `active: false`.
- All public GET routes filter by `{ active: true }`.

### Slug generation
- Celebrity slugs are auto-generated from `name` on create if not provided: lowercase, spaces → hyphens, non-alphanumeric stripped.

---

## Admin Panel

URL: `/admin/`  
Login with an account that has `role: admin` (use seed credentials to start).

Panels:
- **Dashboard** — live stats (celebrity count, product count, orders, revenue) + recent orders table
- **Celebrities** — add/edit/delete celebrities; upload photo and cover photo; set social links and featured flag
- **Products** — add/edit/delete products; link to celebrity; set price and stock
- **Orders** — view all orders; update status (pending → processing → shipped → delivered)

---

## Design System

Color variables (in `public/css/main.css`):
| Variable | Value | Use |
|----------|-------|-----|
| `--gold` | `#c9a84c` | Brand accent, prices, active states |
| `--gold-light` | `#e8c97a` | Hover, gradients |
| `--accent` | `#e94560` | Error states, destructive actions |
| `--dark2` | `#1a1a2e` | Page background |
| `--dark` | `#0d0d0d` | Cards, navbar, sidebar |

Button classes: `.btn-gold`, `.btn-outline`, `.btn-accent`, `.btn-sm`, `.btn-block`  
Grid classes: `.grid.grid-3`, `.grid.grid-4` (auto-fill responsive)

---

## Known Issues / Production Checklist

| Item | Notes |
|------|-------|
| Stripe publishable key hardcoded in `checkout.html` | Move to a `/api/config` endpoint that reads from `.env` |
| No email notifications | Add Nodemailer/SendGrid for order confirmation emails |
| No rate limiting | Add `express-rate-limit` on auth + payment routes |
| No HTTPS enforcement | Required before going live; use nginx or a hosting platform |
| JWT in localStorage | Acceptable for fan sites; for higher security use httpOnly cookies |
| CoinGate callback not verified | Add HMAC signature check on `/bitcoin/callback` |
| `opacity: none` in `formstyle.css` | Legacy file from old login form — invalid CSS value |
| Old `form.html` + `formstyle.css` | Legacy files; can be removed once site goes live |
