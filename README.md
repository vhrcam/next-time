# caught up

The announcements from the topics you follow, without the feed.

Staying off social media keeps you away from the noise, but it also means missing real news about the things you work on or care about: a new AI model, a framework release, a game's release date. caught up fills that gap. You pick topics, it reads their official channels and the news once a day, and it gives you a short report of what was actually announced. When nothing happened, it says so, so you know you didn't miss anything.

## What it does

- **Pick topics** from a catalog (AI, tech companies, developer tools, games, space) or add your own with a name, search words and an optional official site or YouTube channel.
- **Announcements only.** Launches, releases, updates, release dates, official statements, price changes. Opinions, rumors, leaks, reactions, reviews and how-tos are left out.
- **One story per event.** Ten articles about the same launch become one line with ten sources.
- **New since your last visit**, or the past week or month, with a "big news only" filter.
- **No account.** Your topics stay in your browser. A link carries them to another device.

## How it works

1. Each topic has a list of sources: official RSS feeds and YouTube channels, official sites through Google News `site:` search, Google News search, and Hacker News.
2. New posts are shortlisted (official first) and sent to Gemini in one call per topic. It keeps the real announcements, merges posts about the same event, writes a plain headline and one-sentence summary, and marks the few big ones.
3. Stories are saved per topic and shared by everyone who follows it, so the AI cost grows with the number of topics, not the number of people.
4. A daily cron checks every topic someone opened in the last 30 days. A topic that hasn't been checked in 12 hours is checked when someone opens it, at most once an hour.

If the AI is unavailable, only posts from official channels are used, and the rest wait for the next check.

## Run it locally

```bash
npm install
echo "GEMINI_API_KEY=your-key" > .env.local
npm run dev
```

The database is a local SQLite file (`local.db`) unless `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set. The cron route needs `CRON_SECRET`.

## Built with

Next.js 16, React 19, TypeScript, Tailwind CSS 4, libSQL / Turso, Gemini (free tier), fast-xml-parser.
