import type { Source } from "./sources";

export type Topic = {
  id: string;
  name: string;
  group: string;
  about: string;
  sources: Source[];
  broad?: boolean;
  custom?: boolean;
};

export const groups = [
  "Sports",
  "Music",
  "Movies & TV",
  "Games",
  "Tech",
  "AI",
  "Science",
  "Money & business",
  "Cars",
  "Food",
  "Health",
  "Books",
  "Fashion & beauty",
  "Travel",
  "Developers",
];

export const presets: Topic[] = [
  {
    id: "ai",
    name: "Artificial intelligence",
    group: "AI",
    broad: true,
    about: "the biggest developments across the AI industry: new models, products, rules and deals",
    sources: [
      { type: "feed", url: "https://techcrunch.com/category/artificial-intelligence/feed/", site: "TechCrunch", kind: "news" },
      { type: "news", q: '"AI model" launch OR released OR announces' },
      { type: "hn", q: "AI", min: 300 },
    ],
  },
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
    id: "gadgets",
    name: "Emerging technology",
    group: "Tech",
    broad: true,
    about: "notable new technology being announced or released: devices, chips, robotics, energy and other emerging tech",
    sources: [
      { type: "feed", url: "https://www.theverge.com/rss/index.xml", site: "The Verge", kind: "news" },
      { type: "feed", url: "https://techcrunch.com/feed/", site: "TechCrunch", kind: "news" },
      { type: "news", q: "unveils new device OR gadget launch OR release date" },
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
    id: "software",
    name: "Software development",
    group: "Developers",
    broad: true,
    about: "the biggest developments across software development: programming languages, major frameworks, open source and how developers work",
    sources: [
      { type: "feed", url: "https://feed.infoq.com/", site: "InfoQ", kind: "news" },
      { type: "news", q: '"programming language" release OR "open source" release OR "software developers"' },
      { type: "hn", q: "programming OR open source OR software engineering", min: 250 },
    ],
  },
  {
    id: "python",
    name: "Python",
    group: "Developers",
    about: "the Python language and ecosystem: releases, PEPs, packaging, major libraries and the Python Software Foundation",
    sources: [
      { type: "feed", url: "https://pythoninsider.blogspot.com/feeds/posts/default", site: "Python Insider" },
      { type: "feed", url: "https://pyfound.blogspot.com/feeds/posts/default", site: "Python Software Foundation" },
      { type: "news", q: '"Python 3" OR "Python release" OR "Python Software Foundation"' },
      { type: "hn", q: "Python", min: 150 },
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
    name: "Developer tools",
    group: "Developers",
    about: "big releases and changes in developer tools: GitHub, editors, terminals and AI coding tools",
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
    name: "Gaming industry",
    group: "Games",
    broad: true,
    about: "the biggest video game developments: new games revealed, release dates, delays, official trailers, console and studio news",
    sources: [
      { type: "feed", url: "https://blog.playstation.com/feed/", site: "PlayStation Blog" },
      { type: "feed", url: "https://news.xbox.com/en-us/feed/", site: "Xbox Wire" },
      { type: "youtube", user: "Nintendo", site: "Nintendo on YouTube" },
      { type: "news", q: "game announced OR release date OR revealed trailer OR delayed" },
    ],
  },
  {
    id: "gta6",
    name: "Grand Theft Auto VI",
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
    id: "science",
    name: "Science",
    group: "Science",
    broad: true,
    about: "major scientific discoveries and research from leading journals, universities and agencies",
    sources: [
      { type: "feed", url: "https://www.sciencedaily.com/rss/top/science.xml", site: "ScienceDaily", kind: "news" },
      { type: "news", q: '"scientists discover" OR "scientists find" OR breakthrough' },
    ],
  },
  {
    id: "space",
    name: "Space & rockets",
    group: "Science",
    broad: true,
    about: "space missions, rocket launches and NASA and SpaceX announcements",
    sources: [
      { type: "feed", url: "https://www.nasa.gov/news-release/feed/", site: "NASA" },
      { type: "news", q: "SpaceX OR NASA announces OR Starship OR launch mission" },
    ],
  },
  {
    id: "sports",
    name: "Sports",
    group: "Sports",
    broad: true,
    about: "the biggest sports news: championships, blockbuster trades, record contracts and league decisions",
    sources: [
      { type: "feed", url: "https://www.cbssports.com/rss/headlines/", site: "CBS Sports", kind: "news" },
      { type: "feed", url: "https://feeds.bbci.co.uk/sport/rss.xml", site: "BBC Sport", kind: "news" },
      { type: "news", q: 'championship OR "blockbuster trade" OR "record contract" OR "head coach"' },
    ],
  },
  {
    id: "nfl",
    name: "NFL",
    group: "Sports",
    about: "the NFL: trades, signings, injuries, coaching changes, the draft, the schedule and playoff results",
    sources: [
      { type: "site", domain: "nfl.com" },
      { type: "feed", url: "https://www.cbssports.com/rss/headlines/nfl/", site: "CBS Sports", kind: "news" },
      { type: "feed", url: "https://www.nbcsports.com/profootballtalk.rss", site: "Pro Football Talk", kind: "news" },
      { type: "news", q: "NFL" },
    ],
  },
  {
    id: "nba",
    name: "NBA",
    group: "Sports",
    about: "the NBA: trades, signings, injuries, coaching changes, the draft and playoff results",
    sources: [
      { type: "site", domain: "nba.com" },
      { type: "feed", url: "https://www.cbssports.com/rss/headlines/nba/", site: "CBS Sports", kind: "news" },
      { type: "news", q: "NBA" },
    ],
  },
  {
    id: "mlb",
    name: "MLB",
    group: "Sports",
    about: "Major League Baseball: trades, free-agent signings, injuries, managers and postseason results",
    sources: [
      { type: "feed", url: "https://www.mlb.com/feeds/news/rss.xml", site: "MLB.com" },
      { type: "feed", url: "https://www.cbssports.com/rss/headlines/mlb/", site: "CBS Sports", kind: "news" },
      { type: "news", q: 'MLB OR "Major League Baseball"' },
    ],
  },
  {
    id: "nhl",
    name: "NHL",
    group: "Sports",
    about: "the NHL: trades, signings, injuries, coaching changes and playoff results",
    sources: [
      { type: "site", domain: "nhl.com" },
      { type: "feed", url: "https://www.cbssports.com/rss/headlines/nhl/", site: "CBS Sports", kind: "news" },
      { type: "news", q: "NHL" },
    ],
  },
  {
    id: "cfb",
    name: "College football",
    group: "Sports",
    about: "college football: the playoff, coaching changes, conference moves, transfers and bowl results",
    sources: [
      { type: "feed", url: "https://www.cbssports.com/rss/headlines/college-football/", site: "CBS Sports", kind: "news" },
      { type: "news", q: '"college football"' },
    ],
  },
  {
    id: "premier-league",
    name: "Premier League",
    group: "Sports",
    about: "the Premier League: transfers, manager changes, injuries, fixtures and the results that decide titles",
    sources: [
      { type: "site", domain: "premierleague.com" },
      {
        type: "feed",
        url: "https://feeds.bbci.co.uk/sport/football/rss.xml",
        site: "BBC Sport",
        kind: "news",
        match: "Premier League|Arsenal|Chelsea|Liverpool|Man City|Man Utd|Manchester|Tottenham|Newcastle|Aston Villa",
      },
      { type: "news", q: '"Premier League"' },
    ],
  },
  {
    id: "f1",
    name: "Formula 1",
    group: "Sports",
    about: "Formula 1: race results, driver and team moves, rule changes and the calendar",
    sources: [
      { type: "site", domain: "formula1.com" },
      { type: "news", q: '"Formula 1" OR F1' },
    ],
  },
  {
    id: "ufc",
    name: "UFC",
    group: "Sports",
    about: "the UFC: fight cards, title fights and results, signings and big events",
    sources: [
      { type: "feed", url: "https://www.ufc.com/rss/news", site: "UFC" },
      { type: "news", q: "UFC" },
    ],
  },
  {
    id: "music",
    name: "Music",
    group: "Music",
    broad: true,
    about: "new albums and singles from major artists, big tours, festival lineups and music awards",
    sources: [
      { type: "feed", url: "https://www.billboard.com/feed/", site: "Billboard", kind: "news" },
      { type: "feed", url: "https://pitchfork.com/feed/feed-news/rss", site: "Pitchfork", kind: "news" },
      { type: "news", q: '"new album" OR "announces tour" OR "world tour"' },
    ],
  },
  {
    id: "hiphop",
    name: "Hip-hop",
    group: "Music",
    about: "new hip-hop albums and singles, tours and big news from rap's biggest artists",
    sources: [
      { type: "feed", url: "https://www.xxlmag.com/feed/", site: "XXL", kind: "news" },
      { type: "news", q: 'rapper OR "hip-hop" album OR single OR tour' },
    ],
  },
  {
    id: "country",
    name: "Country music",
    group: "Music",
    about: "new country albums and singles, tours, award shows and news from country's biggest stars",
    sources: [
      { type: "feed", url: "https://tasteofcountry.com/feed/", site: "Taste of Country", kind: "news" },
      { type: "news", q: '"country music" OR "country singer" album OR tour' },
    ],
  },
  {
    id: "kpop",
    name: "K-pop",
    group: "Music",
    about: "K-pop comebacks, new albums, tours and group news from BTS, BLACKPINK, Stray Kids and others",
    sources: [
      { type: "feed", url: "https://www.soompi.com/feed", site: "Soompi", kind: "news" },
      { type: "news", q: "K-pop OR BTS OR BLACKPINK comeback OR album OR tour" },
    ],
  },
  {
    id: "taylor-swift",
    name: "Taylor Swift",
    group: "Music",
    about: "Taylor Swift's new music, tours, releases and official announcements",
    sources: [
      { type: "feed", url: "https://www.billboard.com/feed/", site: "Billboard", kind: "news", match: "Taylor Swift" },
      { type: "news", q: '"Taylor Swift"' },
    ],
  },
  {
    id: "beyonce",
    name: "Beyoncé",
    group: "Music",
    about: "Beyoncé's new music, tours, releases and official announcements",
    sources: [
      { type: "feed", url: "https://www.billboard.com/feed/", site: "Billboard", kind: "news", match: "Beyonc" },
      { type: "news", q: "Beyoncé OR Beyonce" },
    ],
  },
  {
    id: "bad-bunny",
    name: "Bad Bunny",
    group: "Music",
    about: "Bad Bunny's new music, tours, releases and official announcements",
    sources: [
      { type: "feed", url: "https://www.billboard.com/feed/", site: "Billboard", kind: "news", match: "Bad Bunny" },
      { type: "news", q: '"Bad Bunny"' },
    ],
  },
  {
    id: "drake",
    name: "Drake",
    group: "Music",
    about: "Drake's new music, tours, releases and official announcements",
    sources: [
      { type: "feed", url: "https://www.billboard.com/feed/", site: "Billboard", kind: "news", match: "Drake" },
      { type: "news", q: "Drake rapper OR album OR tour" },
    ],
  },
  {
    id: "movies",
    name: "Movies",
    group: "Movies & TV",
    broad: true,
    about: "release dates, trailers, casting, box office records and award winners for major films",
    sources: [
      { type: "feed", url: "https://variety.com/feed/", site: "Variety", kind: "news" },
      { type: "feed", url: "https://deadline.com/feed/", site: "Deadline", kind: "news" },
      { type: "news", q: '"release date" OR "first trailer" OR "box office" movie' },
    ],
  },
  {
    id: "tv",
    name: "TV & streaming",
    group: "Movies & TV",
    broad: true,
    about: "new seasons, renewals and cancellations, premiere dates and price changes on Netflix, Disney+, HBO Max and other services",
    sources: [
      { type: "feed", url: "https://www.hollywoodreporter.com/feed/", site: "The Hollywood Reporter", kind: "news" },
      { type: "news", q: '"renewed for" OR canceled OR "premiere date" OR "price increase" Netflix OR "Disney+" OR "HBO Max" OR Hulu' },
    ],
  },
  {
    id: "marvel",
    name: "Marvel",
    group: "Movies & TV",
    about: "Marvel Studios movies and series: release dates, trailers, casting and official announcements",
    sources: [
      { type: "site", domain: "marvel.com" },
      { type: "news", q: '"Marvel Studios" OR MCU' },
    ],
  },
  {
    id: "star-wars",
    name: "Star Wars",
    group: "Movies & TV",
    about: "Star Wars movies and series: release dates, trailers, casting and official announcements",
    sources: [
      { type: "site", domain: "starwars.com" },
      { type: "news", q: '"Star Wars"' },
    ],
  },
  {
    id: "netflix",
    name: "Netflix",
    group: "Movies & TV",
    about: "Netflix prices and plans, new features, big releases and company news",
    sources: [
      { type: "site", domain: "about.netflix.com" },
      { type: "news", q: "Netflix" },
    ],
  },
  {
    id: "anime",
    name: "Anime",
    group: "Movies & TV",
    about: "new anime series and seasons, release dates, trailers and streaming news",
    sources: [
      { type: "feed", url: "https://www.animenewsnetwork.com/news/rss.xml?ann-edition=us", site: "Anime News Network", kind: "news" },
      { type: "news", q: 'anime announced OR "release date" OR trailer' },
    ],
  },
  {
    id: "pokemon",
    name: "Pokémon",
    group: "Games",
    about: "Pokémon games, the trading card game, the anime and official announcements and events",
    sources: [
      { type: "site", domain: "pokemon.com" },
      { type: "news", q: "Pokémon OR Pokemon" },
    ],
  },
  {
    id: "minecraft",
    name: "Minecraft",
    group: "Games",
    about: "Minecraft updates, new features, editions and official announcements",
    sources: [
      { type: "site", domain: "minecraft.net" },
      { type: "news", q: "Minecraft" },
    ],
  },
  {
    id: "fortnite",
    name: "Fortnite",
    group: "Games",
    about: "Fortnite seasons, updates, collaborations and Epic Games announcements",
    sources: [
      { type: "site", domain: "fortnite.com" },
      { type: "news", q: "Fortnite" },
    ],
  },
  {
    id: "climate",
    name: "Climate & weather",
    group: "Science",
    about: "major climate reports and agreements, temperature records, hurricane seasons and NOAA announcements",
    sources: [
      { type: "site", domain: "noaa.gov" },
      { type: "news", q: 'NOAA OR "climate report" OR "hurricane season" OR "warmest year"' },
    ],
  },
  {
    id: "business",
    name: "Business",
    group: "Money & business",
    broad: true,
    about: "major company news: mergers and acquisitions, layoffs, bankruptcies, leadership changes and big launches",
    sources: [
      { type: "feed", url: "https://www.cnbc.com/id/10001147/device/rss/rss.html", site: "CNBC", kind: "news" },
      { type: "news", q: 'acquires OR merger OR layoffs OR bankruptcy OR "steps down" company' },
    ],
  },
  {
    id: "fed",
    name: "Interest rates & the Fed",
    group: "Money & business",
    about: "Federal Reserve rate decisions and statements and what they mean for loans, mortgages and savings",
    sources: [
      { type: "feed", url: "https://www.federalreserve.gov/feeds/press_monetary.xml", site: "Federal Reserve" },
      { type: "news", q: '"Federal Reserve" rates' },
    ],
  },
  {
    id: "taxes",
    name: "Taxes & the IRS",
    group: "Money & business",
    about: "IRS deadlines, tax rule and bracket changes, refunds and new ways to file",
    sources: [
      { type: "site", domain: "irs.gov" },
      { type: "news", q: 'IRS announces OR "tax deadline" OR "tax brackets" OR "tax refund"' },
    ],
  },
  {
    id: "social-security",
    name: "Social Security",
    group: "Money & business",
    about: "Social Security benefit changes, cost-of-living increases, payment dates and rule changes",
    sources: [
      { type: "site", domain: "ssa.gov" },
      { type: "news", q: '"Social Security" COLA OR benefits OR SSA' },
    ],
  },
  {
    id: "crypto",
    name: "Bitcoin & crypto",
    group: "Money & business",
    about: "major crypto news: regulation, ETF decisions, exchange news and big launches",
    sources: [
      { type: "feed", url: "https://www.coindesk.com/arc/outboundfeeds/rss", site: "CoinDesk", kind: "news" },
      { type: "news", q: "Bitcoin OR crypto SEC OR ETF OR exchange OR regulation" },
    ],
  },
  {
    id: "amazon",
    name: "Amazon",
    group: "Money & business",
    about: "Amazon prices and Prime changes, Prime Day dates, new devices and services and company news",
    sources: [
      { type: "site", domain: "aboutamazon.com" },
      { type: "news", q: 'Amazon announces OR "Amazon Prime"' },
    ],
  },
  {
    id: "cars",
    name: "Cars",
    group: "Cars",
    broad: true,
    about: "new models and reveals, prices, recalls and big auto industry news",
    sources: [
      { type: "feed", url: "https://www.caranddriver.com/rss/all.xml/", site: "Car and Driver", kind: "news" },
      { type: "feed", url: "https://www.motor1.com/rss/news/all/", site: "Motor1", kind: "news" },
      { type: "news", q: 'unveils OR "new model" OR recall car OR automaker' },
    ],
  },
  {
    id: "evs",
    name: "Electric vehicles",
    group: "Cars",
    about: "new EV models, prices, charging networks, tax credits and battery news",
    sources: [
      { type: "feed", url: "https://electrek.co/feed/", site: "Electrek", kind: "news" },
      { type: "news", q: '"electric vehicle" OR EV launch OR charging OR "tax credit"' },
    ],
  },
  {
    id: "tesla",
    name: "Tesla",
    group: "Cars",
    about: "Tesla cars, prices, software updates, recalls, robotaxis and company news",
    sources: [
      { type: "feed", url: "https://electrek.co/feed/", site: "Electrek", kind: "news", match: "Tesla" },
      { type: "news", q: "Tesla" },
    ],
  },
  {
    id: "ford",
    name: "Ford",
    group: "Cars",
    about: "new Ford models, prices, recalls and company news",
    sources: [
      { type: "site", domain: "media.ford.com" },
      { type: "news", q: '"Ford Motor" OR "Ford F-150" OR "Ford Mustang" OR "Ford Bronco"' },
    ],
  },
  {
    id: "toyota",
    name: "Toyota",
    group: "Cars",
    about: "new Toyota and Lexus models, prices, recalls and company news",
    sources: [
      { type: "site", domain: "pressroom.toyota.com" },
      { type: "news", q: "Toyota OR Lexus" },
    ],
  },
  {
    id: "car-recalls",
    name: "Car recalls",
    group: "Cars",
    about: "vehicle recalls and safety investigations from NHTSA and automakers",
    sources: [
      { type: "site", domain: "nhtsa.gov" },
      { type: "news", q: "recall NHTSA OR vehicles" },
    ],
  },
];

export const presetById = new Map(presets.map((t) => [t.id, t]));
