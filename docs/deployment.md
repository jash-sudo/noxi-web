# Deployment

1. Set `APP_ORIGIN=https://web.noxi.lol` and a strong `SESSION_SECRET` in your host.
2. Provision PostgreSQL and apply `database/schema.sql` through a migration process.
3. Build the frontend with `npm run build` and deploy `dist/` as static files.
4. Deploy `apps/server/src/index.ts` as a Node service with WebSocket support.
5. Route `/api` and `/ws` from `web.noxi.lol` to the server, or use `VITE_API_URL` for a separate API origin.
6. Add a DNS record for `web.noxi.lol` to your hosting provider and configure TLS there.

Never commit `.env`, database passwords, session secrets, or cloud-storage credentials.
