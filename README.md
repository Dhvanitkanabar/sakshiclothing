# Sakshi Clothing E-Commerce Platform

Production-grade e-commerce platform built with a modern decoupled architecture: React (Vite) Customer Storefront, React (Vite) Admin Dashboard, and Node.js (Express) REST API connected to MongoDB.

---

## 🏗️ Architecture & Project Structure

```
sakshiclothing/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/           # Database, Redis, storage setup
│   │   ├── controllers/      # API Request Handlers
│   │   ├── middlewares/      # Auth, CORS, validation, upload
│   │   ├── models/           # Mongoose Data Schemas
│   │   ├── repositories/     # Database Query Abstraction
│   │   ├── routes/           # REST API Route Declarations
│   │   └── services/         # Core Business Logic & Adapters
│   └── .env.example          # Sample environment template
├── frontend/
│   ├── customer/             # Customer Storefront (React + Vite + Tailwind)
│   └── admin/                # Admin Dashboard (React + TypeScript + Tailwind)
├── package.json              # NPM Workspace configuration
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (v6+)

### 2. Installation
Install all dependencies for root, backend, customer, and admin workspaces:
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` in backend and frontends:
```bash
# Backend
cp backend/.env.example backend/.env

# Customer Frontend
cp frontend/customer/.env.example frontend/customer/.env

# Admin Frontend
cp frontend/admin/.env.example frontend/admin/.env
```

### 4. Running the Development Servers
Start all servers concurrently from root:
```bash
npm run dev
```
Or start individually:
- **Backend API**: `npm run dev --workspace=backend` (http://localhost:5000)
- **Customer Store**: `npm run dev --workspace=customer` (http://localhost:3001)
- **Admin Panel**: `npm run dev --workspace=admin` (http://localhost:5173)

---

## 🚀 Production Deployment Architecture

### 1. Database (MongoDB Atlas)
- Provision a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Set `MONGODB_URI` environment variable on your backend server.

### 2. Backend (Render / Railway / Heroku / AWS)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Required Environment Variables**:
  - `PORT`: Server port (automatically provided by cloud platforms like Render)
  - `NODE_ENV`: `production`
  - `MONGODB_URI`: Connection string to MongoDB Atlas
  - `ALLOWED_ORIGINS`: Comma-separated allowed frontend domains (e.g., `https://sakshiclothing.vercel.app,https://admin-sakshiclothing.vercel.app`)
  - `JWT_SECRET`: Random secure string for session authentication
  - `RAZORPAY_KEY_ID`: Razorpay public API key
  - `RAZORPAY_KEY_SECRET`: Razorpay secret key
  - `CLOUDINARY_CLOUD_NAME`: Cloudinary storage name (optional for image hosting)
  - `CLOUDINARY_API_KEY`: Cloudinary API key (optional)
  - `CLOUDINARY_API_SECRET`: Cloudinary API secret (optional)

### 3. Frontends (Vercel / Netlify / Cloudflare Pages)
- **Customer Storefront (`frontend/customer`)**:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variables:
    - `VITE_API_URL`: Backend API URL (e.g. `https://sakshiclothing-api.onrender.com/api/v1`)
    - `VITE_RAZORPAY_KEY_ID`: Razorpay key ID
- **Admin Dashboard (`frontend/admin`)**:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variables:
    - `VITE_API_URL`: Backend API URL (e.g. `https://sakshiclothing-api.onrender.com/api/v1`)

---

## 🔒 Security & Best Practices
- **No Hardcoded Credentials**: Secrets and private keys are never committed to source control.
- **Sanitized Inputs**: Rate limiting, NoSQL query sanitization, XSS filtering enabled.
- **HttpOnly Cookies**: Secure authentication token handling for production environments.
