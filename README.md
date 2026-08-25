# ERP Management System (MERN Stack)

A full-featured ERP web application to manage business operations: **Products, Customers,
Suppliers, Sales Orders, Purchase Orders, Goods Receipt Notes (GRN), Invoices**, and
**User Roles** (Admin, Sales, Purchase, Inventory).

Built with **React** (frontend) and **Node.js + Express + MongoDB** (backend), with secure
JWT authentication, role-based access control, a responsive Material-UI, and CRUD operations
for every business entity.

```
the skybrisk/
├── backend/                 → Node.js + Express + MongoDB REST API (all backend files)
│   ├── config/              → db connection, Swagger config
│   ├── controllers/         → route handlers (auth, products, orders, grn, invoices, reports…)
│   ├── middleware/          → JWT auth, role guard, error handler, validation
│   ├── models/              → Mongoose schemas (User, Product, Customer, Supplier, …)
│   ├── routes/              → Express routers per module
│   ├── utils/               → token, pagination, seed script
│   ├── tests/               → Jest + Supertest
│   └── server.js            → app entry point
└── frontend/                → React + Vite + Material-UI single-page app (all frontend files)
    └── src/
        ├── api/             → configured Axios instance (JWT + 401 auto-logout)
        ├── app/             → Redux store
        ├── features/        → Redux slices (auth, ui)
        ├── components/      → Layout, Sidebar, Topbar, DataTable, guards, reusable managers
        ├── hooks/           → useResource (search + pagination fetch hook)
        └── pages/           → Login, Register, Dashboard, Products, …, Reports, Profile
```

---

## Features (mapped to the project brief)

### Frontend (React.js)
- **Responsive layout** with Material-UI, sidebar + topbar navigation with icons.
- **Pages:** Dashboard (metrics + charts), Product Management, Customer & Supplier directories,
  Sales & Purchase Orders, GRN form, Invoice generation, **Reports / Balance Sheet**,
  User Management (Admin), Login/Register, and a **Profile** page.
- **Reports / Balance Sheet:** a consolidated financial statement rolling up Sales, Purchases,
  Goods Received (GRN) and Invoices — with assets/receivables/inventory value, purchase
  expenditure, tax collected, net position, date-range filtering, and PDF export.
- **Money In vs Money Out** (traffic-light view): green/orange/red cards for money received,
  money to receive, money paid out, money to pay, and net cash flow.
- **Payment tracking on Purchase Orders** (Unpaid / Partial / Paid) so money paid to suppliers
  is captured alongside money received from customers (paid invoices).
- **Automatic status flow:** a Purchase Order auto-becomes **Received** when its goods arrive
  via a GRN; a Sales Order auto-**Confirms** when invoiced and auto-**Completes** when the
  invoice is marked Paid. Received goods immediately raise product stock, which is shown live
  in the Sales Order product picker.
- **Routing (React Router v6):** `/dashboard`, `/products`, `/customers`, `/suppliers`,
  `/sales-orders`, `/purchase-orders`, `/grn`, `/invoice`, `/admin`, `/profile` — all behind
  **token-based protected routes**, with an extra **role guard** on `/admin`.
- **State management:** Redux Toolkit — auth state, user role, loading state; global toast
  messages via react-toastify.
- **Auth & authorization:** JWT login, role-based route protection, logout & automatic
  session-expiration handling (401 → auto logout).
- **UI features:** toast alerts, search + filter + pagination on tables, Recharts dashboards,
  Formik + Yup form validation, **PDF invoice export (jsPDF)**.

### Backend (Node.js + Express.js)
- **Core API modules:** Users (register/login/profile + Admin user CRUD), Products, Customers,
  Suppliers, Sales Orders, Purchase Orders, GRN (linked to a Purchase Order), Invoices
  (generated from a Sales Order), plus a Dashboard metrics endpoint.
- **Security:** JWT auth, role-based middleware, passwords hashed with **bcrypt**.
- **Database (MongoDB + Mongoose):** `users`, `products`, `customers`, `suppliers`,
  `salesOrders`, `purchaseOrders`, `grns`, `invoices`.
- **API features:** pagination & filtering (`?page=`, `?limit=`, `?search=`), central error
  handling, validation (express-validator), **Swagger API docs at `/api-docs`**.

### Testing
- Backend: **Jest + Supertest** (`backend/tests/auth.test.js`).
- Frontend: **Vitest + React Testing Library** (`frontend/src/__tests__/Login.test.jsx`).

---

## Prerequisites
- Node.js 18+
- **Local MongoDB** running on `mongodb://127.0.0.1:27017` (the default this project is
  configured for). A MongoDB Atlas URI also works — just change `MONGO_URI` in `backend/.env`.
  On Windows, the MongoDB service typically starts automatically; check with
  `Get-Service MongoDB` in PowerShell.

---

## 1) Backend setup

```bash
cd backend
npm install
cp .env.example .env        # then edit values (MONGO_URI, JWT_SECRET)
npm run seed                # optional: creates demo users + sample data
npm run dev                 # starts API on http://localhost:5000
```

- API docs (Swagger): http://localhost:5000/api-docs
- Health check: http://localhost:5000/

**Seeded demo logins** (after `npm run seed`):

| Role      | Email               | Password      |
|-----------|---------------------|---------------|
| Admin     | admin@erp.com       | admin123      |
| Sales     | sales@erp.com       | sales123      |
| Purchase  | purchase@erp.com    | purchase123   |
| Inventory | inventory@erp.com   | inventory123  |

## 2) Frontend setup

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL defaults to /api (proxied to :5000 in dev)
npm run dev                 # starts app on http://localhost:5173
```

Open http://localhost:5173 and log in.

---

## Business workflow (how the modules connect)

```
Supplier ─▶ Purchase Order ─▶ GRN (goods received) ─▶ Product stock ↑
                 │                                          │
          mark Payment                                      ▼
        (Unpaid/Partial/Paid)                    available in Sales Orders
                 │                                          │
                 ▼                                          ▼
          "Money Out"                     Customer ─▶ Sales Order ─▶ Invoice ─▶ mark Paid
                                                                        │
                                                                        ▼
                                                                  "Money In"
                                          all of the above ─▶ Reports / Balance Sheet
```

1. **Purchase Order** is raised against a **Supplier**. Payment to the supplier is recorded on
   the order as **Unpaid / Partial / Paid** (this is the "money out" side).
2. Creating a **GRN** for that purchase order marks it **Received automatically** and **raises
   product stock** for every item received.
3. That stock is immediately sellable — the **Sales Order** product picker shows live stock.
4. A **Sales Order** is raised for a **Customer**. Generating an **Invoice** auto-**Confirms** the
   order; marking the invoice **Paid** auto-**Completes** it (this is the "money in" side).
5. The **Reports / Balance Sheet** page consolidates everything into a balance sheet plus a
   **green/orange/red "Money In vs Money Out"** view.

---

## Role permissions summary

| Module          | View        | Create/Edit/Delete         |
|-----------------|-------------|----------------------------|
| Products        | All roles   | Admin, Inventory           |
| Customers       | All roles   | Admin, Sales               |
| Suppliers       | All roles   | Admin, Purchase            |
| Sales Orders    | All roles   | Admin, Sales               |
| Purchase Orders | All roles   | Admin, Purchase            |
| GRN             | All roles   | Admin, Inventory, Purchase |
| Invoices        | All roles   | Admin, Sales               |
| User Management | —           | Admin only                 |

---

## API overview

| Module          | Endpoints                                                        |
|-----------------|-----------------------------------------------------------------|
| Auth            | `POST /api/register`, `POST /api/login`, `GET/PUT /api/profile`  |
| Users (Admin)   | `GET/POST /api/users`, `GET/PUT/DELETE /api/users/:id`           |
| Products        | `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id`     |
| Customers       | `GET/POST /api/customers`, `GET/PUT/DELETE /api/customers/:id`   |
| Suppliers       | `GET/POST /api/suppliers`, `GET/PUT/DELETE /api/suppliers/:id`   |
| Sales Orders    | `GET/POST /api/sales-orders`, `GET/PUT/DELETE /api/sales-orders/:id` |
| Purchase Orders | `GET/POST /api/purchase-orders`, `GET/PUT/DELETE /api/purchase-orders/:id` (PUT accepts `paymentStatus`: Unpaid/Partial/Paid, or `amountPaid`) |
| GRN             | `GET/POST /api/grn`, `GET/DELETE /api/grn/:id` (POST marks its PO **Received** and raises stock) |
| Invoices        | `GET/POST /api/invoices`, `GET/PUT/DELETE /api/invoices/:id` (PUT `status: Paid` completes the sales order) |
| Dashboard       | `GET /api/dashboard`                                             |
| Reports         | `GET /api/reports?from=&to=` (balance sheet, money in/out, consolidated report) |

---

## Running tests

```bash
cd backend  && npm test     # Jest + Supertest (needs MongoDB running)
cd frontend && npm test     # Vitest + React Testing Library
```

---

## Deployment

- **Frontend → Vercel:** set `VITE_API_URL` to your deployed backend URL (e.g.
  `https://your-api.onrender.com/api`) and run `npm run build`.
- **Backend → Render/Heroku:** set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` env vars.

---

## Tech stack

| Category        | Technology                                                 |
|-----------------|------------------------------------------------------------|
| Frontend        | React, React Router v6, Redux Toolkit, Axios, Material-UI  |
| Backend         | Node.js, Express.js                                        |
| Database        | MongoDB + Mongoose                                         |
| Authentication  | JWT + bcrypt                                               |
| UI enhancements | Recharts, react-toastify, Formik/Yup, jsPDF               |
| Testing         | Jest + Supertest (backend), Vitest + RTL (frontend)        |
| Docs            | Swagger (OpenAPI) at `/api-docs`                          |
