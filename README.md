# SkillConnect — Freelance Marketplace Platform

SkillConnect is a full-stack freelance marketplace connecting clients and freelancers with project discovery, proposals, milestone contracts, real-time STOMP WebSocket chat, work delivery & revision workflows, Razorpay payments, reviews, disputes, and an admin moderation dashboard.

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.3.5, Spring Security (JWT), Spring Data JPA / Hibernate, Flyway, MySQL 8, WebSocket (STOMP/SockJS), Razorpay, Cloudinary, JavaMail
- **Frontend:** React 18, Vite, Tailwind CSS v3, Axios, React Router v6, `@stomp/stompjs`, Lucide React
- **Testing:** JUnit 5, Mockito, Spring Boot Test (H2 MySQL mode), Vitest

---

## Prerequisites

1. **JDK 17+** (`java -version`)
2. **Maven 3.9+** (`mvn -version`)
3. **Node.js 18+** & **npm** (`node -v`)
4. **MySQL 8.0+** running on port `3306`

---

## Quick Start

### 1. Database Setup
```sql
CREATE DATABASE skillconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Environment Variables
Copy `.env.example` to `.env` in the project root (or set environment variables in your shell):
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET` (minimum 32 characters)
- Optional for dev: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLOUDINARY_*`, `MAIL_*`
  - If Razorpay keys are blank, dev test orders (`mock_order_*`) are handled automatically.
  - If `MAIL_HOST` is blank, verification/reset emails are logged to the backend console.
  - If Cloudinary keys are blank, uploads are stored in `./uploads/`.

### 3. Run Backend
```bash
cd backend
mvn spring-boot:run
```
- API Base URL: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Flyway automatically runs `V1__init_schema.sql` and `V2__seed_data.sql` on startup.

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
- Frontend URL: `http://localhost:5173` (Vite proxies `/api` and `/ws` to `http://localhost:8080`).

### 5. Create an Admin User (Optional)
Register a user normally or insert a BCrypt-hashed admin user into `users` with `role_id` pointing to `ROLE_ADMIN` in `roles`.
