# next time

Stay informed without staying online: the developments in what you follow, without the feed.

Staying off social media keeps you away from the noise, but it also means missing real news about the things you work on or care about: a new AI model, a framework release, a game's release date. next time fills that gap. You pick interests, it reads their official channels and the news once a day, and it gives you a short briefing of what actually happened, on your schedule. When nothing happened, it says so, so you know you didn't miss anything.

## What it does

- **Pick interests**, a whole field or specific subjects, from starter interests in every popular category (sports, music, movies and TV, games, tech, money, cars, food, health, travel and more) or search for anything else, like a team, an artist or a show, and it's sorted into a category for you.
- **Announcements only.** Launches, releases, updates, release dates, official statements, price changes. Opinions, rumors, leaks, reactions, reviews and how-tos are left out.
- **One development per event.** Ten articles about the same launch become one card with ten sources, explained as what happened, what's new and why it matters.
- **Briefings on your schedule**: daily, every two or three days, weekly, major developments only, or when you ask, capped at the number you choose. Major developments can arrive early, and Saved and Archive keep what you want to revisit.
- **No account.** Your interests and settings stay in your browser. A link carries them to another device.

## How it works

1. Each interest has a list of sources: official RSS feeds and YouTube channels, official sites through Google News `site:` search, Google News search, and Hacker News for tech interests.
2. New posts are shortlisted (official first) and sent to Gemini in one call per topic. It keeps the real developments, merges posts about the same event, writes a plain headline with what happened, what's new and why it matters, and rates how important it is.
3. Stories are saved per topic and shared by everyone who follows it, so the AI cost grows with the number of topics, not the number of people. Searches are shared the same way and kept for a week.
4. A daily cron checks every topic someone opened in the last 30 days. A topic that hasn't been checked in 12 hours is checked when someone opens it, at most once an hour.

If the AI is unavailable, nothing is added and the posts wait for the next check. Only a local copy with no Gemini key falls back to posts from official channels.

## Run it locally

```bash
npm install
echo "GEMINI_API_KEY=your-key" > .env.local
npm run dev
```

The database is a local SQLite file (`local.db`) unless `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set. The cron route needs `CRON_SECRET`.

## Built with

Next.js 16, React 19, TypeScript, Tailwind CSS 4, libSQL / Turso, Gemini (free tier), fast-xml-parser.
