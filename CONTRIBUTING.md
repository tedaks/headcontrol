# Contributing to HeadControl

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/headcontrol.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feat/your-feature-name`

## Development

```bash
npm run dev        # Start development server
npm run lint       # Lint code
npm run build      # Build for production
```

## Before Committing

Run the full CI locally:

```bash
npm run lint && npx tsc --noEmit && npm run build && npm audit --audit-level=high
```

## Code Style

- 300 line limit on source files
- Use shadcn primitives (`<Button>` not `<button>`)
- Tailwind CSS v4 for styling - no custom CSS

## Pull Request Process

1. Update documentation if needed
2. Ensure all CI checks pass
3. Request review from maintainers

## Reporting Issues

Use GitHub Issues to report bugs or request features. Please include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior