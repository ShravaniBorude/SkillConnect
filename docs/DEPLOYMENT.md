# Deployment Guide — SkillConnect

## Backend (Render / Railway / Fly.io)
1. Provision a managed **MySQL 8** database.
2. Set the following environment variables on your backend service:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `DB_URL=jdbc:mysql://<host>:3306/skillconnect?useSSL=true&serverTimezone=UTC`
   - `DB_USERNAME=<db_user>`
   - `DB_PASSWORD=<db_password>`
   - `JWT_SECRET=<at-least-64-char-random-secret>`
   - `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app`
   - `APP_FRONTEND_URL=https://your-frontend.vercel.app`
   - `RAZORPAY_KEY_ID=<rzp_test_or_live_key>`
   - `RAZORPAY_KEY_SECRET=<rzp_secret>`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`
3. Build command: `mvn clean package -DskipTests`
4. Start command: `java -jar target/skillconnect-backend-1.0.0.jar`
5. Flyway migrations run automatically on startup.

## Frontend (Vercel / Netlify)
1. Set environment variables:
   - `VITE_API_BASE_URL=https://your-backend-domain.com/api`
   - `VITE_WS_URL=https://your-backend-domain.com/ws`
2. Build command: `npm run build`
3. Output directory: `dist`
4. For SPA routing on Vercel, add `frontend/vercel.json`:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
