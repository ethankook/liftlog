To seed: `cd backend && pnpm prisma db seed`

To build your development configuration: `cd frontend && pnpm ng build --configuration development`

Deployment notes:

- Serve the Angular app and Nest API behind the same HTTPS origin in production. The frontend production env uses `apiUrl: ''`, so browser requests go to the current origin.
- Set `FRONTEND_ORIGIN` only when the frontend is hosted on a different origin from the API. If both are behind one domain, leave it unset.
- Postgres is bound to `127.0.0.1` by default in `docker-compose.yml` so it is not exposed publicly on a server.
- Keep `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `DATABASE_URL` only in server-side env files or your hosting provider's secret manager.
