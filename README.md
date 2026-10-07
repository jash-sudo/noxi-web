# Noxi Web

Noxi Web is a browser-based desktop and gaming hub designed for `web.noxi.lol`.
It is independent from `noxi.lol` and does not use its source code, data, or deployment.

## Included demo functionality

- Login screen with a browser-local demo session
- Desktop, dock, menu bar, draggable/resizable app windows, minimize/maximize/close
- Games library with search, categories, favorites, recent-play persistence, and a responsive game launcher
- Settings with local theme and wallpaper preferences
- Chat UI, virtual Files app, Browser launcher, Downloads, Store, Community, Profile, Cloud Gaming, and licenses views
- Node HTTP/WebSocket service starter at `apps/server`
- PostgreSQL schema for the production data model

Demo mode is deliberately local-only. Configure the server and PostgreSQL before treating accounts, chat, uploads, or moderation as production services.

## Architecture

```
src/                    React + TypeScript + Vite desktop client
apps/server/            Node + TypeScript HTTP/WebSocket service starter
games/registry.ts       Central game metadata registry
licenses/               Third-party notices and attribution
database/schema.sql     PostgreSQL starter schema
docs/                   Deployment notes
```

## Development

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the URL printed by Vite. For the local WebSocket service as well:

```bash
npm run dev:all
```

## Production build

```bash
npm run build
npm run server
```

`npm run build` writes the static client bundle to `dist/`.

## Database

Create a PostgreSQL database, copy `.env.example` to `.env`, set a real
`DATABASE_URL`, then apply `database/schema.sql` through your chosen migration
tool. Add a proper migration runner before a production launch rather than
applying the starter file repeatedly.

## Environment variables

See `.env.example`.

- `VITE_API_URL`: public URL of the API service
- `PORT`: API/WebSocket service port
- `APP_ORIGIN`: allowed browser origin
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: long random secret for secure sessions
- `UPLOAD_MAX_BYTES`: server-side upload limit

## Game licensing and attribution

The game registry is centralized in `games/registry.ts`. Noxi Web source and
third-party game content must remain separate. The requested upstream project,
[`selenite-cc/selenite-old`](https://github.com/selenite-cc/selenite-old), is
GPL-3.0 according to its repository metadata. Its notice is in
`licenses/SELENITE-OLD.md`.

This starter does not bundle upstream game files. Before adding any game,
preserve copyright notices, include required source and license materials, and
record its specific source and license in the registry and `licenses/`.

## Deployment and domain

See [docs/deployment.md](docs/deployment.md). Configure your hosting provider
to serve the static client at `https://web.noxi.lol`, route the API/WebSocket
service securely, and enable TLS. Do not redirect this site to `noxi.lol`.

## Security

Production work must add server-enforced authentication, Argon2id or bcrypt
password hashing, secure httpOnly session cookies, CSRF protection, rate limits,
parameterized SQL, authorization checks for every role, content moderation,
and server-side upload MIME/size/dimension validation. Never rely on client
state for account roles or permission decisions.

## Contributing

Keep app behavior accessible, avoid committing secrets, document game sources,
and include validation for user-facing changes. Contributions that add external
content must include attribution and license review.
