# CareerPathway

A career guidance platform that helps students and professionals navigate their career journey. Works as both a responsive website and an installable mobile application (PWA).

## Tech Stack

- **React 19** + **TypeScript** — UI framework
- **Vite 8** — Build tool with HMR
- **Tailwind CSS 4** — Utility-first styling
- **React Router 7** — Client-side routing
- **Lucide React** — Icon library
- **PWA** — Installable on mobile devices

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/    # Reusable UI components (Navbar, Footer)
├── data/          # Career data and quiz questions
├── hooks/         # Custom React hooks
├── layouts/       # Page layout wrappers
├── pages/         # Route page components
├── index.css      # Tailwind imports and theme
├── App.tsx        # Router configuration
└── main.tsx       # Entry point
```

## Features

- **Career Explorer** — Browse careers with search, filters, salary, and growth data
- **Career Quiz** — 5-question assessment that matches you to career categories
- **Learning Pathways** — Step-by-step roadmaps for different careers
- **Mobile App** — Installable PWA with offline support
- **Responsive** — Fully responsive design from mobile to desktop
