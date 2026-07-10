# Portfolio Backend

Production-ready Node.js, Express, MongoDB, JWT backend for the existing frontend.

## Folder Structure

```text
backend/
  config/              Passport OAuth config
  controllers/         Request handlers
  docs/                API documentation
  middleware/          Auth, validation, uploads, logging, sanitization
  models/              Mongoose schemas and relationships
  routes/              REST route modules
  scripts/             Operational scripts
  uploads/             Local uploaded files
  utils/               Shared helpers
  server.js            App bootstrap
```

## Database Schema

Core relationships:

- `User` owns messages, orders, blog posts, profile/admin settings.
- `Category` has many `Product`; category can have a parent category.
- `Order` belongs to a user and embeds ordered product line items.
- `BlogPost` belongs to an author user.
- `PageContent` stores homepage, about, contact, and website settings blocks.
- `Banner`, `Faq`, and `SocialLink` are standalone content collections.

Soft delete is implemented with `deletedAt` on admin-managed collections.

## Install

```bash
cd backend
npm install
copy .env.example .env
npm run seed:admin
npm run dev
```

Set `VITE_API_URL=http://localhost:5000/api` in the frontend environment if needed.

## Scripts

```bash
npm run dev
npm start
npm run seed:admin
```

## Security

- JWT auth with role-based middleware.
- Password hashing with bcrypt.
- Helmet headers, CORS allowlist, rate limiting, input sanitization, validation.
- Mongoose parameterized queries protect against SQL injection style attacks.
- Admin routes require both valid JWT and `admin` role.
- Blocked users cannot authenticate or access protected APIs.

## Deployment

1. Provision MongoDB Atlas or a managed MongoDB instance.
2. Set production environment variables from `.env.example`.
3. Set `NODE_ENV=production`, strong `JWT_SECRET`, and strong `SESSION_SECRET`.
4. Set `FRONTEND_URL` to your deployed frontend origin.
5. Use persistent storage or replace local uploads with Cloudinary/S3 before scaling horizontally.
6. Run `npm ci --omit=dev`.
7. Start with a process manager such as PM2 or your host runtime:

```bash
npm start
```

8. Put the app behind HTTPS and a reverse proxy.
9. Run `npm run seed:admin` once, then rotate the initial admin password.

API docs are available at `/api/docs` and in `docs/API.md`.
