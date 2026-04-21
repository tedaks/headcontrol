# HeadControl

[![CI](https://github.com/headcontrol/headcontrol/actions/workflows/ci.yml/badge.svg)](https://github.com/headcontrol/headcontrol/actions/workflows/ci.yml)

Web UI for Headscale - manage users, nodes, API keys, pre-auth keys, and ACL policies.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Icons:** Phosphor Icons
- **Linting:** ESLint 9
- **CI:** GitHub Actions

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to login - configure your Headscale server URL and API key in `.env.local`. Copy from the example:

```bash
cp .env.example .env.local
```

```
HEADSCALE_URL=http://localhost:8080
HEADSCALE_API_KEY=your-api-key
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `HEADSCALE_URL` | Headscale server URL (e.g., `https://headscale.example.com`) |
| `HEADSCALE_API_KEY` | Headscale API key for authentication |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm audit` | Check for security vulnerabilities |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (headscale proxy, login, logout)
│   ├── login/             # Login page
│   ├── users/             # Users management
│   ├── nodes/             # Nodes management
│   ├── preauthkeys/       # Pre-auth keys management
│   ├── apikeys/           # API keys management
│   └── policy/            # ACL policy editor
├── components/            # React components
│   ├── layout/            # Layout components (sidebar, header)
│   ├── nodes/             # Node-specific components
│   ├── users/             # User-specific components
│   └── ui/                # shadcn/ui primitives
├── lib/                   # Utilities and API client
│   ├── auth.ts            # Auth helpers
│   ├── headscale-client.ts # Headscale API client
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Shared utilities
└── proxy.ts               # Next.js proxy (auth middleware)
```

## Features

- **Dashboard** - Overview with node/user counts and DB health
- **Users** - Create and delete users
- **Nodes** - View, rename, tag, and manage routes
- **Pre-Auth Keys** - Create keys for node registration
- **API Keys** - Manage API keys
- **Policy** - Edit ACL JSON policy

## Adding shadcn/ui Components

```bash
npx shadcn@latest add [component]
```

## CI Pipeline

GitHub Actions runs on every push to `main` and on pull requests:

1. Install dependencies (`npm ci`)
2. Security audit (`npm audit --audit-level=high`)
3. Lint (`npm run lint`)
4. Type check (`tsc --noEmit`)
5. Build (`npm run build`)

## License

[MIT](./LICENSE)