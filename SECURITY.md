# Reporting a Security Vulnerability

Thank you for helping keep Delima Realtors and our customers safe.

Please **do not** open a public GitHub issue for security reports.

Instead, email **security@delimarealtors.com** with:

1. A description of the vulnerability and its impact.
2. Steps to reproduce (proof of concept).
3. Any affected versions / commits.

We will acknowledge within 48 hours and aim to ship a fix within 30 days,
coordinating disclosure with you.

## Known incident — 2026-03 (resolved)

A file named `test` was committed to the repository containing live Supabase
credentials and the database password. All exposed credentials have been
**rotated**:

- Supabase database password
- Supabase anon + service-role keys
- Supabase publishable key
- Admin dashboard password

If you cloned this repository before the rotation, **do not** use any
credential found in git history — they are revoked. Pull the latest `main`
and use `.env.example` to configure your own Supabase project.

## Hardening checklist (applied)

- `.env.example` ships placeholders only; real values never enter git.
- Admin authentication is enforced server-side via Supabase Auth + route
  hooks (see `src/hooks.server.ts`).
- Security headers + CSP are applied via `vercel.json` / hooks.
- Push protection / secret scanning should be enabled in repo settings.
