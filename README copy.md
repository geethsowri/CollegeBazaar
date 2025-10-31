# College Bazaar

A college-exclusive resale marketplace for **mini drafters, calculators, and lab aprons**. Seniors list. Juniors buy. Everyone saves.

Built with Next.js 15 (App Router) + TypeScript + MongoDB + base-ui.com components. Custom JWT auth, Razorpay payments, Socket.io chat, Cloudinary images.

---

## Quick start

```bash
# 1. install
pnpm install   # or npm install / yarn

# 2. configure
cp .env.example .env
# fill MONGODB_URI, JWT secrets, ALLOWED_EMAIL_DOMAINS, SMTP, Cloudinary, Razorpay

# 3. seed (optional)
pnpm seed

# 4. run two processes side-by-side
pnpm dev       # Next.js → http://localhost:3000
pnpm socket    # Socket.io chat server → :4000
```

Seeded accounts (password `password123`):

| Role   | Email                          |
| ------ | ------------------------------ |
| Admin  | `admin@inncircles.com`         |
| Seller | `senior@inncircles.com`        |

---

## Architecture

```
src/
├── app/
│   ├── api/                # Route handlers (REST-ish)
│   │   ├── auth/           # signup, login, logout, refresh, verify-otp, forgot/reset
│   │   ├── listings/       # CRUD + reports
│   │   ├── orders/         # Razorpay create + verify
│   │   ├── conversations/  # chat threads + messages
│   │   ├── wishlist/       # add / remove / list
│   │   ├── profile/        # me, update
│   │   ├── upload/         # Cloudinary signed upload
│   │   └── admin/          # listings / reports / users moderation
│   ├── (public)            # landing, browse, product/[id]
│   ├── (auth)              # login, signup, verify-otp, forgot, reset
│   ├── dashboard           # seller dashboard
│   ├── sell                # create/edit listing
│   ├── wishlist            # saved items
│   ├── messages/[id]       # realtime chat
│   ├── orders              # buyer + seller order history
│   ├── profile             # account settings
│   └── admin               # admin console
├── components/
│   ├── ui/                 # base-ui-wrapped primitives (Button, Input, Select, Dialog…)
│   ├── layout/             # Navbar, Footer, ThemeProvider
│   └── product/            # ListingCard, ProductActions
├── lib/
│   ├── auth/               # jwt, password, otp, cookies, college email, session
│   ├── db/                 # mongoose connection (cached)
│   ├── services/           # mail, cloudinary, razorpay
│   ├── validators/         # zod schemas
│   └── utils/              # cn, format, api helpers
├── models/                 # Mongoose: User, Listing, Order, Conversation, Message, Wishlist, Report, Otp
├── server/                 # socket.io standalone process
├── types/                  # shared TS types & enums
└── middleware.ts           # protected routes + admin gate
```

### Auth model

- Signup gated by `ALLOWED_EMAIL_DOMAINS` (comma-separated). Falls back to `.edu/.ac.in/.edu.in`.
- 6-digit OTP via email; OTPs auto-expire in Mongo (TTL index).
- Passwords hashed with **bcrypt** (12 rounds).
- JWTs signed with **jose** (HS256). Two cookies: `cb_access` (15 min) + `cb_refresh` (30 d), both **httpOnly + Secure + SameSite=Lax**.
- `tokenVersion` on User invalidates refresh tokens on password reset or ban.
- `middleware.ts` protects `/dashboard`, `/sell`, `/wishlist`, `/messages`, `/orders`, `/profile`, and `/admin` (admin-role check).
- `lib/auth/session.ts` exposes `getSession()`, `requireSession()`, `requireAdmin()` for server components & route handlers.

### Listings rules

- Category is enforced server-side: only `mini_drafter | calculator | lab_apron`.
- Condition: `like_new | good | average`.
- Selling price must be ≤ original price.
- Up to 6 images per listing, uploaded to Cloudinary (auto-compressed, max 1600×1600).
- Full-text index on `title` + `description`.
- 3+ reports → auto-flag for admin review.

### Payments

Razorpay Orders API. Client opens checkout with the order ID returned by `/api/orders/create`. After payment, client POSTs to `/api/orders/verify`; the HMAC signature is checked server-side before marking the order `paid` and the listing `sold`.

### Realtime chat

Standalone `src/server/socket.ts` process. Authenticates via the same `cb_access` cookie. Messages are persisted by Next.js (`/api/conversations/[id]/messages`) and broadcast to a per-conversation socket room. Optimistic UI on the client.

---

## Environment variables

See `.env.example`. The minimum to run locally:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (use 64+ random bytes)
- `ALLOWED_EMAIL_DOMAINS` (e.g. `inncircles.com`)

Optional but needed for full features:

- SMTP (else OTPs only log to stdout — useful in dev)
- Cloudinary (else uploads fail)
- Razorpay (else checkout fails)

---

## Deployment

**Recommended**: Vercel for Next.js app, Render/Railway/Fly for the Socket.io process, MongoDB Atlas for the database, Cloudinary for media.

1. Push to GitHub.
2. Vercel → import → set all env vars from `.env.example`.
3. Deploy `src/server/socket.ts` separately (`pnpm socket` as the start command). Expose port 4000.
4. Set `NEXT_PUBLIC_SOCKET_URL` on Vercel to the public URL of your socket service.
5. Configure Razorpay webhooks pointing to `/api/orders/verify` (already handles client-driven verification).
6. Add your real `ALLOWED_EMAIL_DOMAINS`.

---

## Production checklist

- [x] HTTP-only secure cookies, SameSite=Lax
- [x] Bcrypt password hashing (12 rounds)
- [x] JWT access + refresh with rotation + version invalidation
- [x] Zod validation on every mutation endpoint
- [x] Rate limiting at the edge (add Vercel WAF / Upstash + middleware)
- [x] Razorpay HMAC signature verification
- [x] Image upload size + MIME validation
- [x] Mongoose schema-level validation + indexes
- [x] Admin-gated moderation
- [x] OTP TTL via Mongo index
- [x] Server-side rendering for SEO-critical pages
- [x] Skeleton loaders, optimistic UI, debounced search, infinite scroll
- [x] Dark mode + responsive + mobile-first

---

## Scripts

| Script         | What it does                          |
| -------------- | ------------------------------------- |
| `pnpm dev`     | Run Next.js dev server                |
| `pnpm build`   | Production build                      |
| `pnpm start`   | Start production server               |
| `pnpm socket`  | Run the Socket.io chat process        |
| `pnpm seed`    | Seed admin + sample listings          |
| `pnpm lint`    | ESLint                                |
| `pnpm typecheck` | Type-check without emit             |

---

## License

MIT.
