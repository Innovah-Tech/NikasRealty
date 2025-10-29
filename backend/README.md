Backend (Express + MongoDB)

Quick start
- Copy .env.template to .env and fill values
- npm install
- npm run dev

Endpoints
- Auth: POST /api/auth/login, GET /api/auth/me
- Properties: GET /api/properties, POST /api/properties, PUT /api/properties/:id, DELETE /api/properties/:id
- Team: GET /api/team, POST /api/team, PUT /api/team/:id, DELETE /api/team/:id
- Upload: POST /api/upload

Security
- JWT on admin routes (Authorization: Bearer <token>)
- Bcrypt for passwords
- CORS allowed for configured FRONTEND_URL and ADMIN_URL


