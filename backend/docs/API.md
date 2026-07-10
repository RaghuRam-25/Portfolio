# Portfolio Backend API

Base URL: `http://localhost:5000/api`

Authentication uses `Authorization: Bearer <jwt>`.

## Response Format

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 0, "pages": 1 }
}
```

Errors use the same shape with `success: false` and proper HTTP status codes.

## Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create account |
| POST | `/auth/login` | Public | Login with email/password |
| POST | `/auth/logout` | Auth | Destroy session cookie |
| GET | `/auth/me` | Auth | Current user |
| GET | `/auth/verify-email/:token` | Public | Email verification |
| GET | `/auth/google` | Public | Google OAuth |
| GET | `/auth/github` | Public | GitHub OAuth |

## Existing Frontend APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET/PUT | `/profile` | Public/Admin | Portfolio profile and site content |
| POST | `/profile/upload` | Admin | Upload a single profile/content file |
| GET/POST/PUT/DELETE | `/projects` | Public/Admin | Portfolio projects |
| GET/POST/PUT/DELETE | `/skills` | Public/Admin | Skills |
| GET/POST/PUT/DELETE | `/certificates` | Public/Admin | Certificates |
| GET/POST/PUT/DELETE | `/testimonials` | Public/Admin | Testimonials |
| GET/POST/PATCH/DELETE | `/messages` | Mixed | Contact, secure messages, payments |
| GET | `/summary` | Admin | Dashboard summary used by current admin UI |

## Admin APIs

All `/admin/*` routes require an admin JWT.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/admin/dashboard` | Counts for users, products, orders, messages, revenue |
| GET/POST | `/admin/categories` | List/create categories |
| GET/PUT/DELETE | `/admin/categories/:id` | Read/update/soft-delete category |
| GET/POST | `/admin/products` | List/create products |
| GET/PUT/DELETE | `/admin/products/:id` | Read/update/soft-delete product |
| GET/POST | `/admin/orders` | List/create orders |
| GET/PUT/DELETE | `/admin/orders/:id` | Read/update/soft-delete order |
| GET/POST | `/admin/banners` | List/create banners |
| GET/PUT/DELETE | `/admin/banners/:id` | Read/update/soft-delete banner |
| GET/POST | `/admin/faqs` | List/create FAQs |
| GET/PUT/DELETE | `/admin/faqs/:id` | Read/update/soft-delete FAQ |
| GET/POST | `/admin/blog-posts` | List/create blog posts |
| GET/PUT/DELETE | `/admin/blog-posts/:id` | Read/update/soft-delete blog post |
| GET/POST | `/admin/social-links` | List/create social links |
| GET/PUT/DELETE | `/admin/social-links/:id` | Read/update/soft-delete social link |
| GET/PUT | `/admin/pages/homepage` | Manage homepage content |
| GET/PUT | `/admin/pages/about` | Manage about page content |
| GET/PUT | `/admin/pages/contact` | Manage contact information |
| GET/PUT | `/admin/pages/website-settings` | Manage website settings |

## User Management

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET/POST | `/users` | Admin | List/create users |
| GET/PUT/DELETE | `/users/:id` | Admin | Read/update/soft-delete user |
| PATCH | `/users/:id/block` | Admin | Block user |
| PATCH | `/users/:id/unblock` | Admin | Unblock user |
| PUT | `/users/:id/role` | Admin | Change role |
| PUT | `/users/:id/set-portfolio` | Admin | Select portfolio profile |

## Public APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/categories` | Active categories |
| GET | `/products` | Published products |
| GET | `/banners` | Active banners |
| GET | `/faqs` | Published FAQs |
| GET | `/blog-posts` | Published blog posts |
| GET | `/social-links` | Active social links |
| GET | `/pages/:key` | Public page content |

List endpoints support `page`, `limit`, `search`, `sort`, and direct field filters.

## File Upload

| Method | Endpoint | Access | Form Field | Description |
| --- | --- | --- | --- | --- |
| POST | `/uploads/single` | Admin | `file` | Upload one file |
| POST | `/uploads/multiple` | Admin | `files` | Upload up to 10 files |

Uploaded files are served from `/uploads/<filename>`.
