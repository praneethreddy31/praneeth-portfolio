# Praneeth Reddy — Portfolio

Personal portfolio for cybersecurity research, writing, playlists, photography, and more.

## Local development

```bash
npm install
npm run dev
```

## Production checks

```bash
npm run check
```

## Vercel deployment

This is a Remix Vite app. Vercel detects Remix and uses the correct deployment settings automatically.

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Keep the detected framework as **Remix** and deploy.
4. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel only if you want the page-view counter to persist. The portfolio works without them.
