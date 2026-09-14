# Aureon API (NestJS)

Google OAuth login API for the Aureon website.

## Nest vs Express (short)

- **Express** — thin HTTP library. You wire routes yourself.
- **NestJS** — structured framework on top of Express (or Fastify), with modules/guards — better for auth and growing APIs.

This API uses **NestJS**.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/auth/google` | Start Google login |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/me` | Current user (JWT cookie / Bearer) |
| POST | `/api/auth/logout` | Clear session cookie |

## Local setup

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:4000`
   - Authorized redirect URIs: `http://localhost:4000/api/auth/google/callback`
2. Copy `.env.example` → `.env` and fill:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `JWT_SECRET` (long random string)
3. Run:

```bash
npm install
npm run start:dev
```

Health: http://localhost:4000/api/health  
Login: http://localhost:4000/api/auth/google

## Production callback

After deploy, add your API URL to Google redirect URIs, e.g.:

`https://YOUR_API_URL/api/auth/google/callback`
