# GuideProBuilds 🖥️ (Frontend)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.18-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)

> Your personal PC building assistant frontend that takes the guesswork out of building the perfect computer.

This is the frontend-only repository for **PC Guide Pro**. The backend has been separated into `GuideProBackend`.

---

## 🌟 Features

- **Smart PC Builder** - Get personalized hardware recommendations based on your needs.
- **Multiple Use Cases** - Optimized builds for gaming, content creation, office work, and streaming.
- **Budget-Friendly** - Find the best components that fit your budget.
- **Performance Tuning** - Choose between different performance levels.
- **Component Comparison** - Compare different hardware components side by side.
- **Educational Guides** - Learn about PC components and building techniques.
- **Manual PC Request checkout** - Submit your requests to an expert builder.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/guidepro-builds.git
   cd guidepro-builds
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` or use default environment:
   ```env
   # Prepend api server url in production (e.g. http://localhost:3000 in dev)
   VITE_API_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   This command uses `concurrently` to start **both** the React/Vite dev server (at `http://localhost:5000`) and the sibling backend Express server (at `http://127.0.0.1:3000`) simultaneously.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Bundler**: Vite 7
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS v4
- **State Management**: React Query (TanStack Query)
- **Routing**: wouter

---

## 📂 Project Structure

```
GuideProBuilds/
├── attached_assets/           # Image assets used in the site
├── public/                    # Static public assets
├── src/
│   ├── components/            # Reusable UI components & shadcn UI
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # queryClient & helper utilities
│   ├── pages/                 # Application pages (builder, compare, guides, parts, support, checkout)
│   ├── App.tsx                # Main router & provider wrapper
│   ├── index.css              # Tailwind CSS imports & theme
│   └── main.tsx               # App entry point
├── package.json
└── README.md
```
