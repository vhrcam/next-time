import type { Source } from "./sources";

export type Topic = {
  id: string;
  name: string;
  group: string;
  about: string;
  sources: Source[];
  custom?: boolean;
};

export const groups = ["AI", "Tech", "Developers", "Games", "Science"];

export const presets: Topic[] = [
  {
    id: "claude",
    name: "Claude & Anthropic",
    group: "AI",
    about: "Anthropic the company and its Claude models, apps, Claude Code and API",
    sources: [
      { type: "site", domain: "anthropic.com" },
      { type: "feed", url: "https://github.com/anthropics/claude-code/releases.atom", site: "Claude Code releases" },
      { type: "news", q: 'Anthropic OR "Claude AI" OR "Claude Code"' },
      { type: "hn", q: "anthropic", min: 60 },
    ],
  },
  {
    id: "openai",
    name: "OpenAI & ChatGPT",
    group: "AI",
    about: "OpenAI the company, ChatGPT, its models, apps and API",
    sources: [
      { type: "feed", url: "https://openai.com/news/rss.xml", site: "OpenAI" },
      { type: "news", q: "OpenAI OR ChatGPT" },
      { type: "hn", q: "openai", min: 60 },
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini & DeepMind",
    group: "AI",
    about: "Google's Gemini models and apps and Google DeepMind research releases",
    sources: [
      { type: "feed", url: "https://blog.google/technology/ai/rss/", site: "Google AI blog" },
      { type: "feed", url: "https://deepmind.google/blog/rss.xml", site: "Google DeepMind" },
      { type: "news", q: '"Google Gemini" OR DeepMind' },
      { type: "hn", q: "gemini", min: 60 },
    ],
  },
  {
    id: "ai",
    name: "AI in general",
    group: "AI",
    about: "the biggest releases and changes across the AI industry: new models, products, rules and deals",
    sources: [
      { type: "feed", url: "https://techcrunch.com/category/artificial-intelligence/feed/", site: "TechCrunch", kind: "news" },
      { type: "news", q: '"AI model" launch OR released OR announces' },
      { type: "hn", q: "AI", min: 300 },
    ],
  },
  {
    id: "apple",
    name: "Apple",
    group: "Tech",
    about: "Apple products, software updates, services and events",
    sources: [
      { type: "feed", url: "https://www.apple.com/newsroom/rss-feed.rss", site: "Apple Newsroom" },
      { type: "youtube", user: "Apple", site: "Apple on YouTube" },
      { type: "news", q: 'Apple announces OR "iOS update" OR "Apple event"' },
      { type: "hn", q: "apple", min: 200 },
    ],
  },
  {
    id: "google",
    name: "Google",
    group: "Tech",
    about: "Google products, Android, Pixel, Chrome and services",
    sources: [
      { type: "feed", url: "https://blog.google/rss/", site: "Google blog" },
      { type: "news", q: 'Google announces OR Pixel OR "Android update"' },
    ],
  },
  {
    id: "microsoft",
    name: "Microsoft & Windows",
    group: "Tech",
    about: "Microsoft products, Windows, Office and Copilot",
    sources: [
      { type: "feed", url: "https://blogs.microsoft.com/feed/", site: "Microsoft" },
      { type: "news", q: 'Microsoft announces OR "Windows update" OR "Windows 12"' },
    ],
  },
  {
    id: "samsung",
    name: "Samsung & Galaxy",
    group: "Tech",
    about: "Samsung Galaxy phones, devices and software updates",
    sources: [
      { type: "feed", url: "https://news.samsung.com/global/feed", site: "Samsung Newsroom" },
      { type: "news", q: '"Samsung Galaxy" OR "One UI"' },
    ],
  },
  {
    id: "gadgets",
    name: "New tech & gadgets",
    group: "Tech",
    about: "notable new consumer tech and gadgets being announced or released",
    sources: [
      { type: "feed", url: "https://www.theverge.com/rss/index.xml", site: "The Verge", kind: "news" },
      { type: "feed", url: "https://techcrunch.com/feed/", site: "TechCrunch", kind: "news" },
      { type: "news", q: "unveils new device OR gadget launch OR release date" },
    ],
  },
  {
    id: "webdev",
    name: "Web development",
    group: "Developers",
    about: "releases and big changes in web frameworks and tools: Next.js, React, TypeScript, Node, Vercel, browsers",
    sources: [
      { type: "feed", url: "https://nextjs.org/feed.xml", site: "Next.js blog" },
      { type: "feed", url: "https://react.dev/rss.xml", site: "React blog" },
      { type: "feed", url: "https://vercel.com/atom", site: "Vercel" },
      { type: "hn", q: "React OR Next.js OR TypeScript OR Node.js", min: 120 },
    ],
  },
  {
    id: "github",
    name: "GitHub & dev tools",
    group: "Developers",
    about: "GitHub features and changes, and big releases of developer tools and editors",
    sources: [
      { type: "feed", url: "https://github.blog/feed/", site: "GitHub blog" },
      { type: "news", q: "GitHub announces OR VS Code release" },
      { type: "hn", q: "GitHub", min: 150 },
    ],
  },
  {
    id: "iosdev",
    name: "iOS & Swift development",
    group: "Developers",
    about: "news for Apple platform developers: Xcode, Swift, SDKs, App Store rules",
    sources: [
      { type: "feed", url: "https://developer.apple.com/news/rss/news.rss", site: "Apple Developer" },
      { type: "news", q: 'Xcode OR "Swift language" OR "App Store" developers' },
      { type: "hn", q: "Swift OR Xcode", min: 80 },
    ],
  },
  {
    id: "androiddev",
    name: "Android development",
    group: "Developers",
    about: "news for Android developers: Android Studio, Kotlin, Jetpack, Play Store rules",
    sources: [
      { type: "feed", url: "https://android-developers.googleblog.com/feeds/posts/default", site: "Android Developers" },
      { type: "news", q: '"Android Studio" OR Kotlin OR "Google Play" developers' },
    ],
  },
  {
    id: "games",
    name: "Video games",
    group: "Games",
    about: "the biggest video game announcements: new games revealed, release dates, delays, trailers and console news",
    sources: [
      { type: "feed", url: "https://blog.playstation.com/feed/", site: "PlayStation Blog" },
      { type: "feed", url: "https://news.xbox.com/en-us/feed/", site: "Xbox Wire" },
      { type: "youtube", user: "Nintendo", site: "Nintendo on YouTube" },
      { type: "news", q: "game announced OR release date OR revealed trailer OR delayed" },
    ],
  },
  {
    id: "gta6",
    name: "GTA 6",
    group: "Games",
    about: "official news about Grand Theft Auto VI from Rockstar Games: release date, trailers, editions, platforms",
    sources: [
      { type: "site", domain: "rockstargames.com" },
      { type: "youtube", user: "RockstarGames", site: "Rockstar on YouTube" },
      { type: "news", q: '"GTA 6" OR "Grand Theft Auto VI"' },
    ],
  },
  {
    id: "nintendo",
    name: "Nintendo",
    group: "Games",
    about: "Nintendo hardware, games, Directs and release dates",
    sources: [
      { type: "youtube", user: "Nintendo", site: "Nintendo on YouTube" },
      { type: "site", domain: "nintendo.com" },
      { type: "news", q: 'Nintendo announces OR "Nintendo Direct"' },
    ],
  },
  {
    id: "playstation",
    name: "PlayStation",
    group: "Games",
    about: "PlayStation hardware, games, State of Play and PlayStation Plus",
    sources: [
      { type: "feed", url: "https://blog.playstation.com/feed/", site: "PlayStation Blog" },
      { type: "youtube", user: "PlayStation", site: "PlayStation on YouTube" },
      { type: "news", q: 'PlayStation announces OR "State of Play"' },
    ],
  },
  {
    id: "xbox",
    name: "Xbox",
    group: "Games",
    about: "Xbox hardware, games, showcases and Game Pass",
    sources: [
      { type: "feed", url: "https://news.xbox.com/en-us/feed/", site: "Xbox Wire" },
      { type: "youtube", user: "Xbox", site: "Xbox on YouTube" },
      { type: "news", q: 'Xbox announces OR "Game Pass"' },
    ],
  },
  {
    id: "pcgaming",
    name: "PC gaming & Steam",
    group: "Games",
    about: "Steam and Valve news, PC hardware for gaming and big PC game releases",
    sources: [
      { type: "feed", url: "https://store.steampowered.com/feeds/news/", site: "Steam" },
      { type: "news", q: "Valve announces OR Steam OR GPU launch" },
    ],
  },
  {
    id: "space",
    name: "Space & rockets",
    group: "Science",
    about: "space missions, rocket launches and NASA and SpaceX announcements",
    sources: [
      { type: "feed", url: "https://www.nasa.gov/news-release/feed/", site: "NASA" },
      { type: "news", q: "SpaceX OR NASA announces OR Starship OR launch mission" },
    ],
  },
];

export const presetById = new Map(presets.map((t) => [t.id, t]));
