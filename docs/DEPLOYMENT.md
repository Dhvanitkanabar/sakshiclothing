# Deployment Guide

## Docker-Compose (Local/Production)

1. Clone the repository
2. Fill in the `.env` variables from `.env.example`
3. Run `docker-compose up --build -d`

## Vercel (Customer and Admin Frontends)

1. Connect your Vercel account to GitHub.
2. Import the `sakshiclothing` repository.
3. Configure the Root Directory to `frontend/customer` (for the Customer app).
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. Set Environment Variable `VITE_API_URL` to your backend URL.
6. Deploy.
7. Repeat the process for the Admin app, setting the Root Directory to `frontend/admin`.

## Render/Railway (Backend)

1. Connect your Render/Railway account to GitHub.
2. Select New Web Service and point to `sakshiclothing`.
3. Set the Root Directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Provide all `.env` variables (MongoDB URI, JWT Secrets, Cloudinary Keys, Payment Keys).
7. Deploy.
