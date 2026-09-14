# Aureon

Premium website for an independent software engineering studio.

Built with Next.js, TypeScript and Tailwind CSS. Ready to deploy on Vercel.

## Scripts

```bash
npm run dev      # local at http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```

## What is included

- Home, Services, Work, case studies, Studio, Contact
- Animated hero, technology strip, services, process, testimonials
- Validated contact form (`POST /api/contact`)
- SEO: metadata, sitemap, robots, Open Graph image

## Before you go live

1. Open `src/lib/site.ts` and change the company name, email, phone and URL.
2. In `src/app/api/contact/route.ts`, connect an email provider (Resend is a good fit on Vercel).
3. Push the `aureon` folder to GitHub and import the repo in [Vercel](https://vercel.com). Framework preset: Next.js.

This is a frontend project. .NET is not required to host it. Add a .NET API later on Azure if you need a custom backend.
