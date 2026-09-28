# RateMyAPI

RateMyAPI is a community API discovery and reliability platform. Developers can submit public API endpoints, review APIs they have used, and compare recorded response latency and availability.

## Current capabilities

- API directory with ratings and latest latency
- Individual API performance history and reviews
- Scheduled endpoint health checks through Vercel Cron
- Server-side endpoint validation and SSRF protection
- PostgreSQL persistence through Prisma

## Security model

Submitted endpoints are restricted to HTTP and HTTPS. Localhost, private, link-local, loopback, multicast, and other non-public addresses are rejected. DNS results are checked during submission and again when a monitoring connection is opened. Redirects are independently validated, and probes enforce timeout, response-size, and redirect limits.

These controls are an important defense layer, but public deployments should also place the monitor in an isolated network and add distributed rate limiting to submission and review routes.

## Local development

Requirements: Node.js 20+, npm, and PostgreSQL.

1. Copy `.env.example` to `.env` and provide the database URL and secrets.
2. Install dependencies with `npm ci`.
3. Generate the database client with `npx prisma generate`.
4. Apply the schema with `npx prisma db push`.
5. Start the app with `npm run dev`.

## Quality checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

## Stack

Next.js, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Recharts, and Vercel Cron.
