# Superteam Academy Frontend

![Superteam Academy](https://framerusercontent.com/images/kC0Wz0tV7S1tTqJ5e6Xq7D30.png)

The ultimate Solana Learning Management System (LMS) for Latin America. Built for the Superteam Brazil Bounty.

## 🔗 [Live Demo](https://academy.superteam.fun) | [GitHub](https://github.com/superteam-brazil/academy-frontend)

## 🚀 Features

- **Real Code Execution**: In-browser TypeScript playground with WebAssembly runtime.
- **Gamified Learning**: Earn XP, maintain streaks (GitHub-style), and unlock achievements.
- **AI-Powered**: AI Code Review, Hints, and Lesson Summaries (Groq/Llama 3.3).
- **Solana Native**: Wallet authentication, Soulbound XP tokens, and cNFT Credentials.
- **Premium Design**: "Cyfrin Updraft" quality dark-mode UI with glassmorphism and animations.
- **Multi-language**: Native support for PT-BR, ES, and EN.

## 📸 Screenshots

### Dashboard

![Dashboard](./docs/screenshots/dashboard.png)

### Lesson View with Code Editor

![Lesson](./docs/screenshots/lesson.png)

### Leaderboard

![Leaderboard](./docs/screenshots/leaderboard.png)

### Mobile View

![Mobile](./docs/screenshots/mobile.png)

## ⚡ Performance

| Page    | Performance | Accessibility | Best Practices | SEO |
| ------- | ----------- | ------------- | -------------- | --- |
| Landing | 93          | 96            | 96             | 100 |
| Courses | 87          | 88            | 92             | 100 |
| Lesson  | 81          | 86            | 92             | 100 |

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Shadcn/UI, Framer Motion
- **Editor**: Monaco Editor
- **Web3**: Solana Wallet Adapter, Helius DAS API
- **AI**: Groq (Llama 3.3) via API Routes
- **Content**: Sanity CMS (Mocked for dev)
- **Analytics**: GA4, PostHog, Sentry

## 🏁 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/superteam-brazil/academy-frontend.git
   cd academy-frontend/app
   ```

2. **Install Dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env.local` and add your keys:

   ```env
   NEXT_PUBLIC_HELIUS_RPC=https://mainnet.helius-rpc.com/?api-key=your-key
   GROQ_API_KEY=gsk_...
   ```

4. **Run Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to start learning!

## 📂 Project Structure

- `src/app`: Routes (Internationalized with `[locale]`)
- `src/components`: React Components (UI, Gamification, Editor)
- `src/lib`: Logic for Content, Execution, and Web3
- `messages`: i18n Translation files

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to add new courses or translations.

## 📄 License

MIT © Superteam Brazil
