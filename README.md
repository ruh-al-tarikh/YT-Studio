# 🎬 Ruh Al Tarikh – Islamic History OTT Platform

[![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-blue)](https://ruhdevops.github.io/YT-Studio/)
[![Cloudflare Worker](https://img.shields.io/badge/Backend-Cloudflare%20Worker-orange)](https://yt-studio-api.ruhdevopsytstudio.workers.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> Uncovering the truth (Haqq) through Islamic history, Quranic mysteries, and powerful end‑time narratives.

**Live Demo:** [ruhdevops.github.io/YT-Studio](https://ruhdevops.github.io/YT-Studio/)

---

## ✨ Features

- 🎥 **YouTube API Integration** – Automatically fetches videos from a YouTube channel.
- 🎨 **Netflix‑style UI** – Hero banner, episode grid, hover preview, and continue watching.
- 🌙 **Dark / Light Mode** – Toggle with persistent user preference.
- 🤖 **AI Recommendations** – Smart video suggestions based on watch history.
- 📱 **Mobile First** – Swipe gestures, touch‑optimised cards, responsive layout.
- 💾 **Local Storage** – Saves watch progress and last played video.
- 🔗 **Social Links** – Facebook, Instagram, Threads, YouTube, GitHub, WhatsApp.
- ⚡ **Fast & Light** – Vanilla JavaScript, Vite build, no heavy frameworks.

---

## 🛠️ Tech Stack

| Layer       | Technology                                                                 |
|-------------|----------------------------------------------------------------------------|
| Frontend    | HTML5, CSS3, Vanilla JS, Vite                                             |
| Backend API | Cloudflare Worker (YouTube Data API v3)                                   |
| Hosting     | GitHub Pages (frontend) + Cloudflare Workers (backend)                    |
| Icons       | Font Awesome 6                                                            |
| Fonts       | Google Fonts (Cinzel, Inter)                                              |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### 1. Clone the repository
`ash
git clone https://github.com/ruhdevops/YT-Studio.git
cd YT-Studio
` 

### 2. Install dependencies
`ash
npm install
` 

### 3. Run development server
`ash
npm run dev
` 
The site will open at http://localhost:3000.

### 4. Build for production
`ash
npm run build
` 
Output is in the dist/ folder.

---

## ☁️ Backend API Setup (Cloudflare Worker)

The frontend expects a Cloudflare Worker at https://yt-studio-api.ruhdevopsytstudio.workers.dev that returns:

`json
{
  "videos": [
    {
      "id": "videoId",
      "title": "Episode Title",
      "thumbnail": "https://i.ytimg.com/vi/.../maxresdefault.jpg",
      "publishedAt": "2024-01-01T00:00:00Z",
      "channel": "Ruh Al Tarikh"
    }
  ]
}
` 

To set up your own worker:
1. Copy the code from [ackend/src/index.js](./backend/src/index.js).
2. Deploy with Wrangler: 
px wrangler deploy.
3. Set the secret YOUTUBE_API_KEY with 
px wrangler secret put YOUTUBE_API_KEY.

---

## 📁 Project Structure

``nYT-Studio/
├── index.html          # Main HTML entry
├── css/
│   └── style.css       # All styling (dark mode, responsive, cards)
├── js/
│   └── app.js          # Vanilla JS: API fetch, UI rendering, dark mode, swipe gestures
├── .github/
│   └── dependabot.yml  # Dependency updates
├── package.json        # Vite + Vitest
├── vite.config.js      # Vite configuration
└── README.md           # This file
` 

---

## 🎯 Key Customisation Points

| What to change          | Where                                       |
|-------------------------|---------------------------------------------|
| YouTube channel ID      | ackend/src/index.js (CHANNEL_ID)       |
| API endpoint URL        | js/app.js (const API)                  |
| Social media links      | index.html (.social-card hrefs)         |
| Brand name & tagline    | index.html (.header h1, .header-tagline) |
| Primary colour          | :root in css/style.css (--primary)    |

---

## 🚢 Deployment

### Frontend (GitHub Pages)
- Pushing to the main branch automatically deploys via GitHub Pages.
- Configure in repo **Settings → Pages** → Source: Deploy from branch → main.

### Backend (Cloudflare Workers)
`ash
cd backend
npx wrangler deploy
` 

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or pull request for any improvements.

1. Fork the repository.
2. Create a feature branch (git checkout -b feature/amazing).
3. Commit your changes (git commit -m 'Add amazing feature').
4. Push to the branch (git push origin feature/amazing).
5. Open a Pull Request.

---

## 📄 License

MIT © [Rizwan](https://github.com/ruhdevops)

---

## 🙏 Acknowledgements

- YouTube Data API v3
- Font Awesome
- Google Fonts
- Cloudflare Workers
- Vite

---

**Built with 🎬 for seekers of historical truth.**

