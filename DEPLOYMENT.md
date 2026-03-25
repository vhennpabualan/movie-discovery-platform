# Deployment Guide

Complete guide for preparing and deploying the Movie Discovery Platform to production.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Production Build](#production-build)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Error Tracking & Monitoring](#error-tracking--monitoring)
5. [Deployment Checklist](#deployment-checklist)
6. [Troubleshooting](#troubleshooting)

---

## Environment Variables

### Required Environment Variables

All environment variables must be configured before deployment.

#### API Configuration

**`NEXT_PUBLIC_TMDB_API_KEY`** (Required)
- **Type:** String
- **Description:** TMDb API key for movie data access
- **How to Get:** 
  1. Create account at https://www.themoviedb.org
  2. Go to Settings → API
  3. Copy your API key
- **Example:** `NEXT_PUBLIC_TMDB_API_KEY=abc123def456`
- **Scope:** Public (exposed to browser)

#### Monitoring & Error Tracking

**`NEXT_PUBLIC_SENTRY_DSN`** (Optional)
- **Type:** String
- **Description:** Sentry DSN for error tracking
- **How to Get:**
  1. Create account at https://sentry.io
  2. Create new project for Next.js
  3. Copy DSN from project settings
- **Example:** `NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/project`
- **Scope:** Public (needed for client-side error tracking)

**`SENTRY_AUTH_TOKEN`** (Optional)
- **Type:** String
- **Description:** Sentry authentication token for source maps
- **How to Get:**
  1. In Sentry, go to Settings → Auth Tokens
  2. Create new token with project:write scope
  3. Copy token
- **Example:** `SENTRY_AUTH_TOKEN=sntrys_abc123...`
- **Scope:** Private (server-only)

#### Analytics (Optional)

**`NEXT_PUBLIC_GA_ID`** (Optional)
- **Type:** String
- **Description:** Google Analytics measurement ID
- **How to Get:**
  1. Create property in Google Analytics 4
  2. Copy measurement ID from Admin → Data Streams
- **Example:** `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`
- **Scope:** Public

### Environment Variable Setup

#### Local Development

Create `.env.local` in project root:

```env
# Required
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

# Optional
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_token
NEXT_PUBLIC_GA_ID=your_ga_id
```

**Note:** Never commit `.env.local` to version control. Add to `.gitignore`.

#### Production Deployment

Set environment variables in your hosting platform:

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add each variable with appropriate environment (Production, Preview, Development)
3. Redeploy to apply changes

**Other Platforms:**
- AWS: Use Systems Manager Parameter Store or Secrets Manager
- Heroku: Use Config Vars in Settings
- Docker: Use environment file or secrets
- GitHub Actions: Use repository secrets

### Validating Environment Variables

The application validates required environment variables on startup:

```bash
# Build will fail if NEXT_PUBLIC_TMDB_API_KEY is missing
npm run build
```

---

## Production Build

### Building for Production

```bash
# Create optimized production build
npm run build

# Output: .next/ directory with optimized code
```

### Build Output

The build process creates:
- **Optimized JavaScript:** Minified and tree-shaken
- **Static Pages:** Pre-rendered HTML for fast delivery
- **Image Optimization:** Converted to modern formats
- **Source Maps:** For error tracking (optional)

### Build Verification

Verify the build completed successfully:

```bash
# Check build output
ls -la .next/

# Expected directories:
# - .next/static/     (JavaScript bundles)
# - .next/server/     (Server code)
# - .next/cache/      (Build cache)
```

### Testing Production Build Locally

```bash
# Build for production
npm run build

# Start production server
npm start

# Open http://localhost:3000
```

**Verify:**
- [ ] Homepage loads with trending movies
- [ ] Search functionality works
- [ ] Movie details page loads
- [ ] Watchlist feature works
- [ ] No console errors
- [ ] Images load correctly
- [ ] Performance is acceptable

### Build Size Analysis

Check bundle size:

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Analyze bundle
ANALYZE=true npm run build
```

**Target Sizes:**
- Main bundle: < 200KB
- Page bundles: < 100KB each
- Total: < 500KB

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint --if-present

      - name: Run tests
        run: npm test -- --coverage

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_TMDB_API_KEY: ${{ secrets.TMDB_API_KEY }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Workflow Steps

1. **Checkout Code:** Clone repository
2. **Setup Node:** Install Node.js and dependencies
3. **Lint:** Check code quality
4. **Test:** Run test suite
5. **Build:** Create production build
6. **Deploy:** Deploy to hosting platform

### Required Secrets

Set these in GitHub Settings → Secrets:

- `TMDB_API_KEY` - TMDb API key
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

### Deployment Triggers

- **Main branch push:** Automatic production deployment
- **Pull requests:** Automatic preview deployment
- **Manual trigger:** Available in Actions tab

---

## Error Tracking & Monitoring

### Sentry Integration

Sentry provides real-time error tracking and performance monitoring.

#### Setup

1. **Create Sentry Account**
   - Go to https://sentry.io
   - Sign up for free account
   - Create new project for Next.js

2. **Install Sentry SDK**
   ```bash
   npm install @sentry/nextjs
   ```

3. **Configure Sentry**
   
   Create `sentry.client.config.ts`:
   ```typescript
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
     debug: false,
   });
   ```

4. **Set Environment Variables**
   ```env
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
   SENTRY_AUTH_TOKEN=your_sentry_token
   ```

#### Monitoring Features

- **Error Tracking:** Automatic error capture and reporting
- **Performance Monitoring:** Track page load times and API calls
- **Release Tracking:** Monitor errors by release version
- **Alerts:** Get notified of critical errors
- **Source Maps:** View original source code in error traces

#### Viewing Errors

1. Go to Sentry dashboard
2. Click on Issues
3. View error details, stack traces, and affected users
4. Set up alerts for critical errors

### Application Performance Monitoring

The application includes built-in performance monitoring:

```typescript
// src/lib/monitoring/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function trackWebVitals(metric: (data: any) => void) {
  getCLS(metric);
  getFID(metric);
  getFCP(metric);
  getLCP(metric);
  getTTFB(metric);
}
```

**Tracked Metrics:**
- **LCP** (Largest Contentful Paint): Time to render largest content
- **FID** (First Input Delay): Time to respond to user input
- **CLS** (Cumulative Layout Shift): Visual stability
- **FCP** (First Contentful Paint): Time to first content
- **TTFB** (Time to First Byte): Server response time

### API Performance Logging

API requests are logged with timing information:

```typescript
// src/lib/monitoring/api-logger.ts
export function logApiRequest(
  method: string,
  url: string,
  duration: number,
  statusCode: number
) {
  if (duration > 2000) {
    console.warn(`Slow API request: ${method} ${url} (${duration}ms)`);
  }
}
```

**Alerts:**
- Requests taking > 2 seconds
- Failed requests (5xx errors)
- Rate limit errors (429)

### Custom Monitoring

Add custom monitoring for business metrics:

```typescript
// Track user actions
Sentry.captureMessage('User added movie to watchlist', 'info');

// Track performance
const startTime = performance.now();
// ... operation ...
const duration = performance.now() - startTime;
Sentry.captureMessage(`Operation took ${duration}ms`, 'info');
```

---

## Deployment Checklist

Use this checklist before deploying to production:

### Pre-Deployment

- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] No console warnings or errors
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] API keys valid and not expired
- [ ] Database migrations completed (if applicable)

### Build Verification

- [ ] Production build succeeds (`npm run build`)
- [ ] Build size acceptable (< 500KB total)
- [ ] No missing dependencies
- [ ] Source maps generated for error tracking
- [ ] Static assets optimized

### Functionality Testing

- [ ] Homepage loads with trending movies
- [ ] Search works and returns results
- [ ] Movie details page displays correctly
- [ ] Watchlist add/remove works
- [ ] Navigation between pages works
- [ ] Mobile responsive layout works
- [ ] Keyboard navigation works
- [ ] Error boundaries catch errors

### Performance Testing

- [ ] Lighthouse score > 80
- [ ] Core Web Vitals acceptable:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
- [ ] API response times < 2s
- [ ] Images load quickly
- [ ] No layout shifts

### Security Testing

- [ ] API key not exposed in client code
- [ ] No sensitive data in logs
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Input validation working

### Monitoring Setup

- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring enabled
- [ ] Analytics configured (Google Analytics)
- [ ] Alerts configured for critical errors
- [ ] Logging configured

### Deployment

- [ ] Backup created (if applicable)
- [ ] Deployment scheduled for low-traffic time
- [ ] Team notified of deployment
- [ ] Rollback plan prepared
- [ ] Post-deployment monitoring active

### Post-Deployment

- [ ] Application loads without errors
- [ ] All features working as expected
- [ ] Performance metrics acceptable
- [ ] No error spikes in monitoring
- [ ] User feedback monitored
- [ ] Deployment documented

---

## Deployment Platforms

### Vercel (Recommended)

Vercel is the official Next.js hosting platform with built-in optimizations.

**Setup:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

**Benefits:**
- Automatic deployments on push
- Preview deployments for PRs
- Built-in performance monitoring
- Automatic HTTPS
- Global CDN

**Pricing:** Free tier available, paid plans start at $20/month

### AWS Amplify

AWS Amplify provides serverless hosting with CI/CD integration.

**Setup:**
1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy

**Benefits:**
- Serverless architecture
- Auto-scaling
- AWS integration
- Custom domain support

### Heroku

Heroku provides simple deployment with automatic scaling.

**Setup:**
1. Create Heroku app
2. Connect GitHub repository
3. Set config variables
4. Deploy

**Benefits:**
- Simple deployment
- Automatic scaling
- Built-in monitoring
- Add-ons for databases

### Docker

Deploy using Docker containers for maximum control.

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY .next ./.next
COPY public ./public

EXPOSE 3000

CMD ["npm", "start"]
```

**Build and Run:**
```bash
docker build -t movie-discovery .
docker run -p 3000:3000 -e NEXT_PUBLIC_TMDB_API_KEY=key movie-discovery
```

---

## Troubleshooting

### Build Failures

**Error:** "NEXT_PUBLIC_TMDB_API_KEY is not defined"

**Solution:**
1. Verify environment variable is set
2. Check variable name spelling
3. Redeploy after setting variable

**Error:** "Module not found"

**Solution:**
1. Run `npm install` locally
2. Check import paths use `@/` alias
3. Verify all dependencies in package.json

### Runtime Errors

**Error:** "API key invalid"

**Solution:**
1. Verify API key in TMDb settings
2. Check key hasn't expired
3. Regenerate key if needed

**Error:** "CORS error when fetching from TMDb"

**Solution:**
1. Verify API key is correct
2. Check TMDb API status
3. Ensure requests use correct endpoint

### Performance Issues

**Slow page loads:**
1. Check Lighthouse score
2. Analyze bundle size
3. Check API response times
4. Optimize images

**High memory usage:**
1. Check for memory leaks
2. Monitor server logs
3. Increase server resources

### Deployment Issues

**Deployment stuck:**
1. Check build logs
2. Verify environment variables
3. Check disk space
4. Restart deployment

**Application crashes after deployment:**
1. Check error logs
2. Verify environment variables
3. Check database connections
4. Rollback to previous version

---

## Monitoring & Maintenance

### Daily Monitoring

- Check error tracking dashboard
- Monitor API response times
- Check server logs
- Monitor user feedback

### Weekly Monitoring

- Review performance metrics
- Check security alerts
- Review error trends
- Update dependencies

### Monthly Maintenance

- Update dependencies
- Review and optimize slow queries
- Analyze user behavior
- Plan improvements

### Quarterly Review

- Performance audit
- Security audit
- Cost optimization
- Capacity planning

