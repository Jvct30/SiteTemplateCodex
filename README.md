# SiteTemplateCodex - E-commerce Template

Project built with Codex for training with GitHub organizations and AI-assisted coding.

SiteTemplateCodex is a full stack starter template for building online stores with a product catalog, cart, simulated checkout, customer profile area, and admin dashboard. The project uses generic names, copy, and placeholder assets so it can be adapted to a real brand.

## Technologies

### Backend
- **Framework:** FastAPI
- **Server:** Uvicorn
- **Database:** SQLite by default, with an easy path to PostgreSQL
- **ORM:** SQLAlchemy 2.0 async
- **Migrations:** Alembic
- **Authentication:** JWT with `pyjwt` and password hashing with `bcrypt`
- **Validation:** Pydantic V2 and `pydantic-br` for CPF validation
- **Image uploads:** Local storage in development or Cloudinary through configuration

### Frontend
- **Framework:** Next.js with App Router
- **Styling:** Tailwind CSS with a customizable base palette, gradients, and animations
- **State and cache:** TanStack Query
- **Icons and fonts:** Lucide React, Outfit, and Inter

## Architecture

The project is organized as a monorepo with separate `frontend/` and `backend/` directories.

The backend follows SOLID principles and uses a Service-Repository pattern to keep business logic isolated from database access. It also uses dependency injection and typed schemas throughout the API.

## Main Features

- **Authentication and profile:** User registration, login, CPF validation, saved addresses, and profile management.
- **Online store:** Responsive product listing, product details, cart management, checkout flow, mock payment links, and shipping calculation.
- **Custom requests:** Async chat between customers and admins for questions, support, and personalized requests.
- **Admin dashboard:** Product management, image uploads, coupons, homepage notices, social links, and order status updates.
- **Design system:** Generic visual foundation with reusable styles, placeholder assets, glass effects, and subtle CSS animations.

## Environment Setup

The project is prepared to run locally with low-cost development defaults and can be moved to production through environment variables.

`.env.example` should be used as the public guide for required variables. It must not contain real secrets. `.env` and `.env.local` are private files used on your machine or configured in the deployment platform.

### Backend

Copy `backend/.env.example` to `backend/.env`.

- `DOMAIN`: Main project domain.
- `DATABASE_URL`: Uses SQLite by default. For PostgreSQL, use a `postgresql+asyncpg://...` URL.
- `FRONTEND_URL`: Public frontend URL.
- `PUBLIC_API_URL`: Public backend URL, used to generate local file links.
- `SECRET_KEY`: Private key used to sign JWTs. Never commit the real value.
- `CORS_ORIGINS`: List of domains allowed to call the API from the browser.
- `UPLOAD_STORAGE`: Use `local` for development or `cloudinary` for Cloudinary.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Required when `UPLOAD_STORAGE=cloudinary`.
- `PAYMENT_PROVIDER`: Use `mock` until a real payment provider is integrated.

### Frontend

Copy `frontend/.env.example` to `frontend/.env.local`.

- `NEXT_PUBLIC_API_URL`: Backend URL used by the frontend.

In Next.js, variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Use that prefix only for public values, such as the API URL. Never put secrets, passwords, or private keys in frontend environment variables.

## Running Locally

Backend:

```bash
cd backend
uv run uvicorn src.main:app --reload
```

Frontend:

```bash
cd frontend
npm run dev
```

Keep each server running in a separate terminal.

## Running With Docker

To run the full project in containers:

```bash
docker compose up --build
```

Then open:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs

See `DOCKER.md` for the full Portuguese guide, including how to copy the project to another machine, change URLs for LAN access, inspect logs, and reset Docker volumes.

## Tests and Checks

Backend:

```bash
cd backend
uv run pytest
uv run ruff check .
```

Frontend:

```bash
cd frontend
npm test
npm run lint
npm run build
```

## License

Define the license according to your intended use.
