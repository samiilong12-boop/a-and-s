# A AND S — Luxury Perfume E-Commerce Platform

A production-oriented luxury perfume e-commerce platform crafted for **A AND S**, a premium fragrance brand in Cairo, Egypt.

---

## Brand Identity & Design System
- **Colors:**
  - Luxury Black `#080A0A` (primary canvas)
  - Light Turquoise Green `#66D9C5` (primary brand accent)
  - Deep Teal `#0B665D` (secondary surfaces and borders)
  - Warm Ivory `#F5F2EB` (content areas & text)
  - Champagne Gold `#C6A66B` (restrained luxury accents < 5%)
- **Typography:**
  - Headings: `Bodoni Moda` (high-contrast editorial serif)
  - Body & UI: `Jost` (clean modern sans-serif)

---

## Key Features & Stage A Scope
- **Egyptian Market First:**
  - Store currency: **Egyptian Pound (EGP)**.
  - Financial calculations stored strictly as **integer piasters (minor units)** to eliminate floating-point rounding errors.
  - **Cash on Delivery (COD) only** at launch, with orders starting in `PENDING_CONFIRMATION` pending phone or WhatsApp verification.
  - Complete courier cash collection & remittance tracking lifecycle (`PENDING_COLLECTION` → `COLLECTED_BY_COURIER` → `REMITTED_TO_STORE`).
  - Egyptian mobile phone validation (11 digits: `010`, `011`, `012`, `015`).
  - Governorate shipping rate calculation with complimentary luxury shipping on orders over **1,000 EGP**.
- **Catalog & Merchandising:**
  - 120 curated demo luxury fragrance formulations with complete olfactory pyramids (top, heart, base notes), concentrations (Extrait, EDP, EDT), and variants (50ml, 100ml).
  - Multi-attribute search, filtering, and sorting.
- **Administration Dashboard:**
  - Located at `/admin`.
  - Real-time sales analytics: Gross merchandise sales, net sales, estimated COGS, estimated gross profit (strictly separated from revenue).
  - Orders management with phone call/WhatsApp direct triggers and permitted state transitions.
  - Inventory movements log and low-stock alerts.
- **Public Order Tracker:**
  - `/track-order` for client self-service status lookups.

---

## Deploying to GitHub and Vercel

### 1. Push to GitHub
```bash
git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Import the repository in [Vercel](https://vercel.com).
2. Set Framework Preset: **Next.js**.
3. In **Environment Variables**, configure:
   - `DATABASE_URL`: Your PostgreSQL connection string (e.g. from Vercel Postgres, Neon, or Supabase).
   - `SESSION_SECRET`: A secure 32+ character random secret string.
   - `NEXT_PUBLIC_STORE_NAME`: `A AND S`
   - `NEXT_PUBLIC_STORE_CURRENCY`: `EGP`
4. The build command will automatically execute `prisma generate && next build`.

---

## Local Development Setup

1. **Clone & install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

3. **Database (PostgreSQL via Docker Compose):**
   ```bash
   docker compose up -d
   ```

4. **Run database migrations & Prisma Client:**
   ```bash
   npx prisma generate
   ```

5. **Run test suite:**
   ```bash
   npm test
   ```

6. **Start local dev server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) for the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) for the admin portal.
