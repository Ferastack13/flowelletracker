# Flowelle

**Your cycle. Your care. Your rhythm.**

Flowelle is a premium women’s menstrual health and self-care web application. This repository currently ships a production-minded UI preview: landing page, application shell, dashboard, and placeholder routes. Authentication, persistence, predictions, and personalised notes are not implemented yet.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives (customised to brand)
- Lucide React
- Supabase planned for auth and PostgreSQL

## Brand

| Token       | Hex     |
| ----------- | ------- |
| Deep plum   | `#4A263B` |
| Dusty rose  | `#D69AA8` |
| Warm ivory  | `#F8F3ED` |
| Soft sage   | `#A5A995` |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script              | Description                                      |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Start development server (webpack on Windows)    |
| `npm run build`     | Production build (webpack)                       |
| `npm run start`     | Start production server                          |
| `npm run lint`      | Run ESLint                                       |
| `npm run typecheck` | Run TypeScript checks                            |

Fonts load via Google Fonts stylesheets (Cormorant Garamond + Source Sans 3). `next/font` was avoided here because Google Font fetching failed during local builds.

## Notes

- Sample dashboard content lives in `src/lib/mock-data.ts` and is labelled as preview-only.
- The dashboard empty cycle state is intentional: no real user records exist yet.
