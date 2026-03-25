# Quick Reference Guide

Fast lookup for common tasks and commands.

## Getting Started (5 minutes)

```bash
# 1. Clone and install
git clone <repo>
cd movie-discovery-platform
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local and add NEXT_PUBLIC_TMDB_API_KEY

# 3. Start development
npm run dev

# 4. Open browser
# http://localhost:3000
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode

# Code Quality
npx tsc --noEmit        # Check TypeScript
npm audit               # Security audit
```

## Project Structure

```
src/
├── app/                 # Pages (Next.js App Router)
├── features/            # Feature modules
│   ├── movies/         # Movie discovery
│   ├── search/         # Search functionality
│   ├── watchlist/      # Watchlist management
│   └── ui/             # Shared UI components
├── lib/                # Shared utilities
│   ├── api/            # TMDb API client
│   ├── validation/     # Zod schemas
│   └── monitoring/     # Performance tracking
└── types/              # TypeScript types
```

## API Client Usage

```typescript
import { getMoviesByTrending, searchMovies, getMovieDetails } from '@/lib/api/tmdb-client';

// Trending movies
const trending = await getMoviesByTrending('day', 1);

// Search
const results = await searchMovies('Inception', 1);

// Details
const details = await getMovieDetails(550);
```

## Component Usage

```typescript
// MovieCard
<MovieCard
  movie={movie}
  onClick={(id) => router.push(`/movies/${id}`)}
  isInWatchlist={true}
/>

// MovieCarousel
<MovieCarousel
  movies={movies}
  onMovieClick={(id) => router.push(`/movies/${id}`)}
  watchlistIds={[1, 2, 3]}
/>

// SearchBar
<SearchBar />

// LoadingSkeleton
<LoadingSkeleton count={4} width="w-full" height="h-64" />

// ErrorBoundary
<ErrorBoundary>
  <TrendingMovies />
</ErrorBoundary>
```

## Environment Variables

```env
# Required
NEXT_PUBLIC_TMDB_API_KEY=your_key

# Optional
NEXT_PUBLIC_SENTRY_DSN=your_dsn
SENTRY_AUTH_TOKEN=your_token
NEXT_PUBLIC_GA_ID=your_ga_id
```

## File Locations

| File | Purpose |
|------|---------|
| `src/lib/api/tmdb-client.ts` | API client |
| `src/features/movies/components/MovieCard.tsx` | Movie card component |
| `src/features/search/components/SearchBar.tsx` | Search component |
| `src/app/page.tsx` | Homepage |
| `src/app/movies/[id]/page.tsx` | Movie details page |
| `src/app/search/page.tsx` | Search results page |
| `src/app/watchlist/page.tsx` | Watchlist page |

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test MovieCard.test.tsx

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

## Debugging

```typescript
// Console logging
console.log('Debug:', value);

// Error handling
try {
  const data = await getMoviesByTrending();
} catch (error) {
  console.error('Error:', error);
}

// TypeScript checking
npx tsc --noEmit
```

## Deployment

```bash
# Build for production
npm run build

# Test production build
npm start

# Deploy to Vercel
git push origin main
# (Automatic via GitHub Actions)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API key error | Check `.env.local` has `NEXT_PUBLIC_TMDB_API_KEY` |
| Port 3000 in use | `npm run dev -- -p 3001` |
| Build fails | `rm -rf .next && npm run build` |
| Tests fail | `npm test -- --clearCache` |
| TypeScript errors | `npx tsc --noEmit` to see all errors |

## Documentation Links

- **Setup:** [SETUP.md](./SETUP.md)
- **Development:** [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Components:** [COMPONENTS.md](./COMPONENTS.md)
- **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Checklist:** [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate to next element |
| `Shift+Tab` | Navigate to previous element |
| `Enter` | Activate button/link |
| `Escape` | Close dropdown/modal |
| `ArrowDown` | Next search result |
| `ArrowUp` | Previous search result |

## Performance Targets

- **Lighthouse:** > 80
- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **Bundle Size:** < 500KB

## Color Palette

```typescript
// Tailwind colors
'netflix-dark': '#0f0f0f'           // Primary background
'netflix-dark-secondary': '#1a1a1a' // Secondary background
'netflix-red': '#e50914'            // Primary accent
'netflix-gray': '#808080'           // Secondary text
```

## Responsive Breakpoints

```typescript
// Tailwind breakpoints
mobile: < 640px
tablet: 640px - 1024px
desktop: > 1024px
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "Add my feature"

# Push and create PR
git push origin feature/my-feature

# After approval, merge to main
git checkout main
git pull origin main
git merge feature/my-feature
git push origin main
```

## Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TMDb API](https://developer.themoviedb.org/docs)
- [Jest Docs](https://jestjs.io/docs/getting-started)

## Team Contacts

- **On-Call Engineer:** [Add name]
- **Team Lead:** [Add name]
- **DevOps:** [Add name]
- **Product Manager:** [Add name]

## Emergency Procedures

### Application Down

1. Check error tracking (Sentry)
2. Check server logs
3. Verify API key is valid
4. Check network connectivity
5. Rollback if needed

### High Error Rate

1. Check error tracking dashboard
2. Identify error pattern
3. Check recent deployments
4. Rollback if necessary
5. Investigate root cause

### Performance Degradation

1. Check Core Web Vitals
2. Check API response times
3. Check server resources
4. Optimize slow queries
5. Scale if needed

---

**Last Updated:** 2024

**For detailed information, see full documentation files.**
