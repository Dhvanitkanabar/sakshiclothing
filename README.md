# Sakshi Clothing E-Commerce Management System

## Project Overview
Sakshi Clothing is a production-grade e-commerce platform featuring a decoupled architecture. It comprises a customer-facing frontend, an admin dashboard, and a secure backend REST API.

## Architecture
- **Frontend (Customer)**: React, Vite, local API integration.
- **Frontend (Admin)**: React, TypeScript, TailwindCSS.
- **Backend**: Node.js, Express, Clean Architecture (Controllers, Services, Repositories).
- **Database**: MongoDB with Mongoose (highly indexed, variants embedded).
- **Authentication**: Stateless Dual JWTs (Access + Refresh) securely stored in HttpOnly cookies to mitigate XSS and CSRF attacks.

## Folder Structure
```
sakshi-clothing/
├── frontend/
│   ├── customer/        # Customer-facing website
│   └── admin/           # Admin dashboard (TypeScript + Tailwind)
├── backend/             # Node.js Express API
├── docs/                # Project documentation
│   ├── architecture/
│   ├── database/
│   ├── api/
│   └── deployment/
├── package.json         # NPM Workspace config
└── README.md
```

## Tech Stack
- **Frontend**: React.js, Vite, TypeScript, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Security**: JWT, Bcrypt, Helmet, Express-Rate-Limit, DOMPurify/XSS

## Installation
1. Clone the repository.
2. Run `npm install` at the root level to install all dependencies across workspaces.
3. Configure environment variables in `backend/.env`.

## Environment Variables
Required variables in `backend/.env`:
- `PORT=5000`
- `NODE_ENV=development`
- `MONGODB_URI=mongodb://localhost:27017/sakshiclothing`
- `JWT_SECRET=supersecretaccess`
- `JWT_EXPIRE=15m`
- `JWT_REFRESH_SECRET=supersecretrefresh`
- `JWT_REFRESH_EXPIRE=7d`
- `CLIENT_URL=http://localhost:5173`

## How to Run Backend
```bash
npm run dev:backend
```

## How to Run Customer Website
```bash
npm run dev:customer
```

## How to Run Admin Dashboard
```bash
npm run dev:admin
```
Or run all simultaneously from the root:
```bash
npm run dev
```

## Phases Completed
- Phase 1: Backend Foundation
- Phase 2: Production Database Models
- Phase 3: Authentication & Project Restructure
- Phase 4: Product Management System
- Phase 5: Category, Brand, CMS and Restructure
