# HeadControl

Web UI for Headscale

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (base-lyra style, mist base color)
- **Icons:** Phosphor Icons
- **Linting:** ESLint 9

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
headcontrol/
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js App Router (layouts, pages)
│   ├── components/ui/  # shadcn/ui components
│   ├── lib/            # Utility functions
│   └── hooks/          # Custom React hooks
├── components.json     # shadcn/ui configuration
├── eslint.config.mjs   # ESLint configuration
├── next.config.ts      # Next.js configuration
├── postcss.config.mjs  # PostCSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Adding shadcn/ui Components

```bash
npx shadcn@latest add [component]
```

## License

[MIT](./LICENSE)
