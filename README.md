# TheSeoSoul

Free website SEO checker and shareable audit reports — [theseosoul.com](https://theseosoul.com) (custom domain later).

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + Radix
- cheerio + undici (live HTML fetch)
- Free tools hub (robots.txt, meta tags, density, Open Graph, etc.)

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Push to GitHub → Vercel imports the repo (Next.js defaults). No required env vars.

Optional later:

| Env | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL after custom domain, e.g. `https://theseosoul.com` |

## API

```http
GET /api/audit?url=shopify.com
```
