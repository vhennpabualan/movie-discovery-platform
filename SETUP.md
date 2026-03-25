# Setup Instructions

Complete guide for setting up the Movie Discovery Platform for local development and production deployment.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Environment Variables](#environment-variables)
3. [Running the Application](#running-the-application)
4. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

Before starting, ensure you have:

- **Node.js 18+** - Download from https://nodejs.org
- **npm 9+** - Comes with Node.js
- **Git** - For version control
- **Code Editor** - VS Code recommended (https://code.visualstudio.com)
- **TMDb API Key** - Free account at https://www.themoviedb.org

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/movie-discovery-platform.git

# Navigate to project directory
cd movie-discovery-platform
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list
```

**Expected Output:**
```
movie-discovery-platform@0.1.0
├── next@16.2.1
├── react@19.2.4
├── react-dom@19.2.4
├── zod@4.3.6
├── tailwindcss@4
└── ... (other dependencies)
```

### Step 3: Configure Environment Variables

Create `.env.local` file in the project root:

```bash
# Create .env.local file
touch .env.local
```

Add the following content:

```env
# Required: TMDb API Key
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here

# Optional: Sentry Error Tracking
# NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
# SENTRY_AUTH_TOKEN=your_sentry_token

# Optional: Google Analytics
# NEXT_PUBLIC_GA_ID=your_ga_id
```

**Getting Your TMDb API Key:**

1. Go to https://www.themoviedb.org/settings/api
2. Sign up for a free account if you don't have one
3. Click "Create" to generate an API key
4. Copy the API key and paste it in `.env.local`

### Step 4: Verify Setup

```bash
# Run TypeScript compiler to check for errors
npx tsc --noEmit

# Expected output: No errors
```

### Step 5: Start Development Server

```bash
# Start the development server
npm run dev

# Output:
# ▲ Next.js 16.2.1
# - Local:        http://localhost:3000
# - Environments: .env.local
```

Open http://localhost:3000 in your browser. You should see the homepage with trending movies.

---

## Environment Variables

### Variable Reference

#### Required Variables

**`NEXT_PUBLIC_TMDB_API_KEY`**
- **Type:** String
- **Required:** Yes
- **Description:** API key for The Movie Database (TMDb)
- **Scope:** Public (exposed to browser)
- **How to Get:**
  1. Create account at https://www.themoviedb.org
  2. Go to Settings → API
  3. Copy your API key
- **Example:** `NEXT_PUBLIC_TMDB_API_KEY=abc123def456ghi789`

#### Optional Variables

**`NEXT_PUBLIC_SENTRY_DSN`**
- **Type:** String
- **Required:** No
- **Description:** Sentry DSN for error tracking
- **Scope:** Public
- **How to Get:**
  1. Create account at https://sentry.io
  2. Create new project for Next.js
  3. Copy DSN from project settings
- **Example:** `NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/123456`

**`SENTRY_AUTH_TOKEN`**
- **Type:** String
- **Required:** No (only if using Sentry)
- **Description:** Sentry authentication token for source maps
- **Scope:** Private (server-only)
- **How to Get:**
  1. In Sentry, go to Settings → Auth Tokens
  2. Create new token with project:write scope
  3. Copy token
- **Example:** `SENTRY_AUTH_TOKEN=sntrys_abc123...`

**`NEXT_PUBLIC_GA_ID`**
- **Type:** String
- **Required:** No
- **Description:** Google Analytics measurement ID
- **Scope:** Public
- **How to Get:**
  1. Create property in Google Analytics 4
  2. Copy measurement ID from Admin → Data Streams
- **Example:** `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`

### Environment Variable Files

#### `.env.local` (Development)

Used for local development. Never commit to version control.

```env
NEXT_PUBLIC_TMDB_API_KEY=your_dev_key
```

Add to `.gitignore`:
```
.env.local
.env.*.local
```

#### `.env.production` (Production)

Used when deploying to production. Set in hosting platform instead.

#### `.env.test` (Testing)

Used when running tests. Create if needed:

```env
NEXT_PUBLIC_TMDB_API_KEY=test_key
```

### Validating Environment Variables

The application validates required variables on startup:

```bash
# Build will fail if NEXT_PUBLIC_TMDB_API_KEY is missing
npm run build

# Error output:
# Error: NEXT_PUBLIC_TMDB_API_KEY is not configured
```

---

## Running the Application

### Development Server

```bash
# Start development server with hot reload
npm run dev

# Server runs at http://localhost:3000
# Changes automatically reload in browser
```

**Features:**
- Hot module replacement (HMR)
- Fast refresh for React components
- TypeScript compilation on save
- Error overlay in browser

### Production Build

```bash
# Create optimized production build
npm run build

# Output: .next/ directory with optimized code
```

**Build Process:**
1. Compiles TypeScript
2. Optimizes JavaScript bundles
3. Pre-renders static pages
4. Optimizes images
5. Generates source maps

### Production Server

```bash
# Start production server
npm start

# Server runs at http://localhost:3000
# Uses optimized build from .next/
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test MovieCard.test.tsx

# Run with coverage
npm test -- --coverage
```

---

## Troubleshooting

### Installation Issues

**Error:** "npm ERR! code ERESOLVE"

**Solution:**
```bash
# Use legacy peer deps flag
npm install --legacy-peer-deps

# Or upgrade npm
npm install -g npm@latest
```

**Error:** "Module not found: Can't resolve '@/...'"

**Solution:**
1. Verify `tsconfig.json` has path aliases configured
2. Check import path spelling
3. Restart development server

### Environment Variable Issues

**Error:** "NEXT_PUBLIC_TMDB_API_KEY is not configured"

**Solution:**
1. Create `.env.local` file in project root
2. Add `NEXT_PUBLIC_TMDB_API_KEY=your_key`
3. Restart development server
4. Verify key is valid at https://www.themoviedb.org/settings/api

**Error:** "401 Unauthorized" when fetching movies

**Solution:**
1. Verify API key is correct
2. Check key hasn't expired
3. Regenerate key if needed
4. Ensure key is in `.env.local` (not `.env`)

### Build Issues

**Error:** "TypeScript compilation failed"

**Solution:**
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Fix errors shown in output
# Common issues:
# - Missing type annotations
# - Incorrect import paths
# - Unused variables
```

**Error:** "Build failed: .next directory not found"

**Solution:**
1. Check build output for errors
2. Verify all dependencies installed
3. Clear cache and rebuild:
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

### Runtime Issues

**Error:** "Cannot find module 'next'"

**Solution:**
```bash
# Reinstall dependencies
npm install

# Or clear cache and reinstall
npm cache clean --force
npm install
```

**Error:** "Port 3000 already in use"

**Solution:**
```bash
# Use different port
npm run dev -- -p 3001

# Or kill process using port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -i :3000
kill -9 <PID>
```

### Performance Issues

**Slow development server:**
1. Check system resources (CPU, RAM)
2. Close other applications
3. Clear `.next` cache: `rm -rf .next`
4. Restart development server

**Slow build time:**
1. Check for large dependencies
2. Analyze bundle size: `ANALYZE=true npm run build`
3. Optimize images in `public/` directory

### Testing Issues

**Error:** "Cannot find module in test"

**Solution:**
1. Verify `jest.config.js` has correct module paths
2. Check `jest.setup.js` is configured
3. Restart test runner

**Error:** "Test timeout"

**Solution:**
1. Increase timeout in test:
   ```typescript
   jest.setTimeout(10000);
   ```
2. Check for unresolved promises
3. Mock slow API calls

---

## Development Workflow

### Creating a Feature Branch

```bash
# Create and checkout new branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add my feature"

# Push to remote
git push origin feature/my-feature
```

### Running Tests Before Commit

```bash
# Run all tests
npm test

# Run specific test
npm test MyComponent.test.tsx

# Run with coverage
npm test -- --coverage
```

### Building Before Deployment

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Verify at http://localhost:3000
```

### Debugging

**VS Code Debugging:**

1. Create `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Next.js",
         "type": "node",
         "request": "launch",
         "program": "${workspaceFolder}/node_modules/.bin/next",
         "args": ["dev"],
         "console": "integratedTerminal"
       }
     ]
   }
   ```

2. Press F5 to start debugging

**Browser DevTools:**

1. Open http://localhost:3000
2. Press F12 to open DevTools
3. Use Console, Network, and Performance tabs

---

## Next Steps

After setup is complete:

1. **Read the Developer Guide:** `DEVELOPER_GUIDE.md`
2. **Review Component Documentation:** `COMPONENTS.md`
3. **Explore the Codebase:** Start with `src/app/page.tsx`
4. **Run Tests:** `npm test`
5. **Start Developing:** Create a feature branch and start coding

---

## Getting Help

- **Documentation:** See `DEVELOPER_GUIDE.md` and `COMPONENTS.md`
- **Issues:** Check GitHub Issues for known problems
- **Stack Overflow:** Tag questions with `next.js` and `react`
- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev

