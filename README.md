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
- Phase 6: Digital Asset Management with Cloudinary
- Phase 7: Cart & Wishlist System
- Phase 8: Enterprise Checkout & Order Management

## Cloudinary Digital Asset Management (DAM)
The backend features a robust DAM system integrated with Cloudinary for global image optimization. 

### Configuration
Update the `.env` file with your Cloudinary credentials:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Folder Structure
Images are automatically routed to their corresponding folders under `sakshi-clothing/`:
- `/products`
- `/categories`
- `/brands`
- `/banners`
- `/misc`

### Upload Flow
1. **Admin Panel**: Drag & Drop images into the `ImageUpload` component.
2. **Backend**: Routes through `POST /api/v1/uploads/image`. Validates mime types (`jpg`, `png`, `webp`) and sizes (Max 10MB).
3. **Cloudinary**: Automatically converts images to `webp` (or optimal formats) and generates thumbnails.
4. **Database**: Saves the `secureUrl`, `publicId`, dimensions, and the associated admin's `uploadedBy` reference in the `Upload` collection.

## Order & Checkout Flow
### 1. Checkout
- User proceeds from the cart to the checkout page.
- Selects or adds a new Shipping Address.
- Confirms the order via \POST /api/v1/orders/checkout\ or \POST /api/v1/orders/buy-now\.
- Cart is automatically cleared upon successful order placement.

### 2. Order Processing
- Order gets created with 'pending' status.
- Snapshots of product prices and details are stored.
- Admin views orders in the Dashboard.
- Status transitions through: \pending -> processing -> packed -> shipped -> outForDelivery -> delivered\.

### 3. Customer Management
- Users can view their order history and track order status in their Profile.
- Users can cancel orders in 'pending' or 'processing' states.
- Invoice generation is supported.

## Address Management APIs
- \GET /api/v1/addresses\ - Fetch user's saved addresses.
- \POST /api/v1/addresses\ - Add a new address.
- \PUT /api/v1/addresses/:id\ - Update an existing address.
- \DELETE /api/v1/addresses/:id\ - Remove an address.
- \PATCH /api/v1/addresses/:id/default\ - Set an address as the default.

## Order Management APIs
- \POST /api/v1/orders/checkout\ - Create an order from the user's cart.
- \POST /api/v1/orders/buy-now\ - Create an order for a single item instantly.
- \GET /api/v1/orders\ - Fetch all orders for the authenticated customer.
- \GET /api/v1/orders/:id\ - Fetch specific order details.
- \PATCH /api/v1/orders/:id/cancel\ - Cancel an order.
- \GET /api/v1/orders/:id/invoice\ - Download HTML invoice.

- \GET /api/v1/orders/admin/all\ - Admin endpoint to view all orders.
- \PATCH /api/v1/orders/admin/:id/status\ - Admin endpoint to update order status.
- \PATCH /api/v1/orders/admin/:id/tracking\ - Admin endpoint to update tracking details.
