# Movie Discovery Platform

A modern, type-safe movie discovery application built with Next.js 16, TypeScript, and Tailwind CSS. Discover trending movies, search for films, and manage your personal watchlist using the TMDb API.

## Features

- 🎬 **Trending Movies** - Browse the latest trending movies with beautiful carousel layout
- 🔍 **Smart Search** - Debounced search with dropdown results and keyboard navigation
- 🎥 **Movie Details** - Comprehensive movie information with related movies
- 📋 **Watchlist** - Save and manage your personal movie watchlist
- 🎨 **Netflix-Style UI** - Dark mode with red accents and smooth animations
- ♿ **Accessible** - Full keyboard navigation and screen reader support
- ⚡ **Performance** - Optimized images, ISR, and Core Web Vitals tracking
- 🔒 **Type-Safe** - Strict TypeScript with zero `any` types
- 📱 **Responsive** - Works perfectly on mobile, tablet, and desktop

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- TMDb API key (free at https://www.themoviedb.org/settings/api)

### Setup

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd movie-discovery-platform
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your TMDb API key
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   - Navigate to http://localhost:3000

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup and installation guide
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Development workflow and best practices
- **[COMPONENTS.md](./COMPONENTS.md)** - Component API reference with examples
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification checklist

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── features/               # Feature-based modules
│   ├── movies/            # Movie discovery feature
│   ├── search/            # Search functionality
│   ├── watchlist/         # Watchlist management
│   └── ui/                # Shared UI components
├── lib/                    # Shared utilities
│   ├── api/               # TMDb API client
│   ├── validation/        # Zod schemas
│   ├── monitoring/        # Performance tracking
│   └── parsers/           # Data parsing
└── types/                 # Global TypeScript types
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode

# Code Quality
npx tsc --noEmit        # Check TypeScript
npm audit               # Security audit
```

## Environment Variables

### Required

- `NEXT_PUBLIC_TMDB_API_KEY` - TMDb API key for movie data

### Optional

- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking
- `SENTRY_AUTH_TOKEN` - Sentry source maps
- `NEXT_PUBLIC_GA_ID` - Google Analytics

See [.env.example](./.env.example) for details.

## Technology Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript with strict mode
- **Styling:** Tailwind CSS with dark mode
- **Validation:** Zod for runtime type checking
- **Testing:** Jest and React Testing Library
- **API:** TMDb API for movie data
- **Deployment:** Vercel (recommended)

## Key Features

### Server Components
- TrendingMovies - Fetches trending movies server-side
- RelatedMovies - Displays related movies for each film
- WatchlistContent - Server-rendered watchlist

### Client Components
- MovieCard - Interactive movie poster with hover effects
- MovieCarousel - Responsive horizontal scrolling carousel
- SearchBar - Debounced search with dropdown results
- ErrorBoundary - Error catching and recovery
- LoadingSkeleton - Animated loading placeholders

### Performance
- Image optimization with Next.js Image
- Incremental Static Regeneration (ISR)
- Code splitting and lazy loading
- Core Web Vitals tracking
- API performance monitoring

### Accessibility
- Full keyboard navigation
- ARIA labels and semantic HTML
- Screen reader support
- Focus management
- Keyboard shortcuts

## Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes and test**
   ```bash
   npm test
   npm run dev
   ```

3. **Build and verify**
   ```bash
   npm run build
   npm start
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "Add my feature"
   git push origin feature/my-feature
   ```

5. **Create pull request**
   - Push to GitHub and create PR
   - CI/CD pipeline runs automatically
   - Merge after approval

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically on push

### Other Platforms

See [DEPLOYMENT.md](./DEPLOYMENT.md) for AWS, Heroku, Docker, and other options.

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test MovieCard.test.tsx

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## Performance

- **Lighthouse Score:** 90+
- **Core Web Vitals:**
  - LCP: < 2.5s
  - FID: < 100ms
  - CLS: < 0.1
- **Bundle Size:** < 500KB total

## Monitoring

- **Error Tracking:** Sentry integration
- **Performance:** Core Web Vitals tracking
- **Analytics:** Google Analytics support
- **Logging:** API request logging

## Troubleshooting

### API Key Issues
- Verify key at https://www.themoviedb.org/settings/api
- Check `.env.local` has correct key
- Restart development server

### Build Errors
- Run `npx tsc --noEmit` to check TypeScript
- Clear cache: `rm -rf .next node_modules`
- Reinstall: `npm install`

### Port Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

See [SETUP.md](./SETUP.md) for more troubleshooting.

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes and test
4. Submit pull request

## License

MIT License - see LICENSE file for details

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TMDb API](https://developer.themoviedb.org/docs)
- [Jest Testing](https://jestjs.io/docs/getting-started)

## Support

For issues and questions:
- Check [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- Review [COMPONENTS.md](./COMPONENTS.md)
- See [SETUP.md](./SETUP.md) troubleshooting section
- Open GitHub issue

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
