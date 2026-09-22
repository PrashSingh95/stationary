# BABA PUSTAK BHANDAR API

Phase 2A backend foundation for the stationery shop.

## Setup

1. Create a PostgreSQL database named `baba_pustak_bhandar`.
2. Copy `.env.example` to `.env` and update values.
3. Run the SQL in `migrations/001_initial.sql`.
4. Start the API:

```bash
go run ./cmd/server
```

## Implemented endpoints

- `GET /healthz`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/categories`
- `GET /api/v1/categories/{slug}`
- `GET /api/v1/categories/{slug}/products`
- `GET /api/v1/products`
- `GET /api/v1/products/{slug}`
- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PATCH /api/v1/cart/items/{id}`
- `DELETE /api/v1/cart/items/{id}`
- `DELETE /api/v1/cart`
