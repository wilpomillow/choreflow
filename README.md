# choreflow

A minimal, welcoming chores checklist built with **Next.js + React + Tailwind + shadcn-style components**, with chores stored as **individual MDX files**.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this repo to GitHub
2. Import it in Vercel
3. Build command: `npm run build`
4. Output: (default Next.js)

## Content model

Chores live in:

```
content/chores/*.mdx
```

Each MDX file uses frontmatter like:

- `title`
- `frequency`
- `estimateMinutes`
- `tags`
- `automation`
- `supplies`

Completion state is saved in `localStorage` per browser.
