# Production Deployment Checklist

Use this comprehensive checklist before deploying to production. Each section must be completed and verified.

---

## Pre-Deployment Phase (1-2 days before)

### Code Quality

- [ ] All tests passing
  ```bash
  npm test
  ```
  Expected: All tests pass with no failures

- [ ] No TypeScript errors
  ```bash
  npx tsc --noEmit
  ```
  Expected: No compilation errors

- [ ] No console warnings or errors
  - [ ] Check browser console for warnings
  - [ ] Check server logs for errors
  - [ ] Run in production mode locally

- [ ] Code review completed
  - [ ] All PRs reviewed and approved
  - [ ] No pending code review comments
  - [ ] Changes documented

- [ ] No breaking changes
  - [ ] API compatibility maintained
  - [ ] Database schema compatible
  - [ ] No deprecated features used

### Dependencies

- [ ] All dependencies up to date
  ```bash
  npm outdated
  ```
  Expected: No critical security updates

- [ ] Security audit passed
  ```bash
  npm audit
  ```
  Expected: No high/critical vulnerabilities

- [ ] No unused dependencies
  ```bash
  npm prune
  ```

- [ ] Lock file committed
  - [ ] `package-lock.json` in version control
  - [ ] No manual edits to lock file

### Configuration

- [ ] Environment variables documented
  - [ ] All required variables listed
  - [ ] All optional variables documented
  - [ ] Examples provided

- [ ] Environment variables configured
  - [ ] `NEXT_PUBLIC_TMDB_API_KEY` set
  - [ ] `NEXT_PUBLIC_SENTRY_DSN` set (if using)
  - [ ] `SENTRY_AUTH_TOKEN` set (if using)
  - [ ] All variables validated

- [ ] API keys valid and not expired
  - [ ] TMDb API key tested
  - [ ] Sentry token tested
  - [ ] Google Analytics ID verified

- [ ] Database migrations completed (if applicable)
  - [ ] All migrations run
  - [ ] Rollback plan prepared
  - [ ] Data backup created

---

## Build Phase (1 day before)

### Production Build

- [ ] Production build succeeds
  ```bash
  npm run build
  ```
  Expected: Build completes with no errors

- [ ] Build output verified
  - [ ] `.next/` directory exists
  - [ ] `.next/static/` contains bundles
  - [ ] `.next/server/` contains server code
  - [ ] No build warnings

- [ ] Build size acceptable
  - [ ] Main bundle < 200KB
  - [ ] Page bundles < 100KB each
  - [ ] Total size < 500KB
  - [ ] No unexpected large files

- [ ] Source maps generated
  - [ ] `.map` files present in `.next/static/`
  - [ ] Maps configured for error tracking
  - [ ] Maps not exposed in production

### Local Testing

- [ ] Production build runs locally
  ```bash
  npm run build
  npm start
  ```
  Expected: Server starts without errors

- [ ] Application loads at http://localhost:3000
  - [ ] No 404 errors
  - [ ] No console errors
  - [ ] No network errors

- [ ] All pages load correctly
  - [ ] Homepage loads with trending movies
  - [ ] Search page loads
  - [ ] Movie details page loads
  - [ ] Watchlist page loads

- [ ] All features work
  - [ ] Search functionality works
  - [ ] Movie details display correctly
  - [ ] Watchlist add/remove works
  - [ ] Navigation between pages works

- [ ] Mobile responsive layout works
  - [ ] Test on mobile device or emulator
  - [ ] Layout adapts to screen size
  - [ ] Touch interactions work
  - [ ] No horizontal scrolling

- [ ] Keyboard navigation works
  - [ ] Tab key navigates through elements
  - [ ] Enter key activates buttons
  - [ ] Escape key closes modals
  - [ ] Arrow keys work in carousels

- [ ] Error handling works
  - [ ] Error boundaries catch errors
  - [ ] Error messages display correctly
  - [ ] Retry buttons work
  - [ ] Errors logged to console

### Performance Testing

- [ ] Lighthouse score acceptable
  - [ ] Performance > 80
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 90

- [ ] Core Web Vitals acceptable
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

- [ ] API response times acceptable
  - [ ] Trending movies < 2s
  - [ ] Search results < 2s
  - [ ] Movie details < 2s

- [ ] Images load quickly
  - [ ] No layout shifts
  - [ ] Proper image optimization
  - [ ] Responsive image sizes

- [ ] No memory leaks
  - [ ] Memory usage stable
  - [ ] No growing memory over time
  - [ ] Garbage collection working

### Security Testing

- [ ] API key not exposed
  - [ ] API key not in client code
  - [ ] API key not in logs
  - [ ] API key not in error messages
  - [ ] API key not in source maps

- [ ] No sensitive data exposed
  - [ ] No passwords in code
  - [ ] No tokens in logs
  - [ ] No user data in errors
  - [ ] No database credentials visible

- [ ] HTTPS enabled
  - [ ] All requests use HTTPS
  - [ ] No mixed content warnings
  - [ ] SSL certificate valid

- [ ] Security headers configured
  - [ ] Content-Security-Policy set
  - [ ] X-Frame-Options set
  - [ ] X-Content-Type-Options set
  - [ ] Strict-Transport-Security set

- [ ] CORS properly configured
  - [ ] Only allowed origins
  - [ ] Credentials handled correctly
  - [ ] Preflight requests working

- [ ] Input validation working
  - [ ] Search input validated
  - [ ] Movie IDs validated
  - [ ] No XSS vulnerabilities
  - [ ] No SQL injection vulnerabilities

---

## Deployment Phase (Day of deployment)

### Pre-Deployment

- [ ] Backup created
  - [ ] Database backed up
  - [ ] Configuration backed up
  - [ ] Backup verified and tested

- [ ] Deployment window scheduled
  - [ ] Low-traffic time selected
  - [ ] Team notified
  - [ ] Stakeholders informed

- [ ] Rollback plan prepared
  - [ ] Previous version identified
  - [ ] Rollback procedure documented
  - [ ] Rollback tested

- [ ] Monitoring configured
  - [ ] Error tracking enabled
  - [ ] Performance monitoring enabled
  - [ ] Alerts configured
  - [ ] Dashboard accessible

- [ ] Team communication
  - [ ] Deployment team assembled
  - [ ] Communication channel open
  - [ ] Escalation contacts identified

### Deployment

- [ ] Code deployed to production
  - [ ] Latest code pushed to main branch
  - [ ] CI/CD pipeline triggered
  - [ ] Deployment completed successfully

- [ ] Environment variables set
  - [ ] All required variables configured
  - [ ] Variables verified in production
  - [ ] No missing variables

- [ ] Application started
  - [ ] Server started without errors
  - [ ] No startup errors in logs
  - [ ] Application responding to requests

- [ ] Database migrations applied (if applicable)
  - [ ] Migrations completed successfully
  - [ ] Data integrity verified
  - [ ] Rollback tested

---

## Post-Deployment Phase (Immediately after)

### Immediate Verification

- [ ] Application loads without errors
  - [ ] Homepage loads
  - [ ] No 500 errors
  - [ ] No 404 errors
  - [ ] No console errors

- [ ] All features working
  - [ ] Search works
  - [ ] Movie details load
  - [ ] Watchlist works
  - [ ] Navigation works

- [ ] No error spikes
  - [ ] Error rate normal
  - [ ] No new error types
  - [ ] Error tracking working

- [ ] Performance acceptable
  - [ ] Page load times normal
  - [ ] API response times normal
  - [ ] No performance degradation

- [ ] Monitoring active
  - [ ] Error tracking receiving data
  - [ ] Performance metrics being collected
  - [ ] Alerts configured and working

### Smoke Testing (30 minutes after)

- [ ] Homepage loads with trending movies
  - [ ] Movies display correctly
  - [ ] Images load
  - [ ] No layout shifts

- [ ] Search functionality works
  - [ ] Search returns results
  - [ ] Results display correctly
  - [ ] Navigation to details works

- [ ] Movie details page works
  - [ ] Details load correctly
  - [ ] Related movies display
  - [ ] Watchlist button works

- [ ] Watchlist feature works
  - [ ] Add to watchlist works
  - [ ] Remove from watchlist works
  - [ ] Watchlist page displays correctly

- [ ] Mobile experience works
  - [ ] Mobile layout responsive
  - [ ] Touch interactions work
  - [ ] No mobile-specific errors

### Extended Monitoring (1-2 hours after)

- [ ] Error rate stable
  - [ ] No error spikes
  - [ ] Error types expected
  - [ ] No new error patterns

- [ ] Performance metrics stable
  - [ ] Page load times consistent
  - [ ] API response times consistent
  - [ ] Core Web Vitals acceptable

- [ ] User feedback positive
  - [ ] No user complaints
  - [ ] No support tickets
  - [ ] Social media monitoring clear

- [ ] Logs clean
  - [ ] No unexpected errors
  - [ ] No warnings
  - [ ] No suspicious activity

---

## Post-Deployment Phase (24 hours after)

### Full Verification

- [ ] All features working correctly
  - [ ] Trending movies display
  - [ ] Search works accurately
  - [ ] Movie details complete
  - [ ] Watchlist persists

- [ ] Performance metrics acceptable
  - [ ] Lighthouse score maintained
  - [ ] Core Web Vitals within targets
  - [ ] API response times acceptable
  - [ ] No performance degradation

- [ ] Error tracking working
  - [ ] Errors being captured
  - [ ] Error details complete
  - [ ] Source maps working
  - [ ] Alerts functioning

- [ ] Monitoring dashboards updated
  - [ ] Baseline metrics established
  - [ ] Alerts configured
  - [ ] Thresholds set appropriately

- [ ] Documentation updated
  - [ ] Deployment documented
  - [ ] Known issues documented
  - [ ] Rollback procedure documented
  - [ ] Lessons learned captured

### Cleanup

- [ ] Temporary files removed
  - [ ] Build artifacts cleaned
  - [ ] Logs rotated
  - [ ] Cache cleared

- [ ] Deployment artifacts archived
  - [ ] Build logs saved
  - [ ] Deployment notes saved
  - [ ] Performance baseline saved

- [ ] Team debriefing completed
  - [ ] Deployment reviewed
  - [ ] Issues discussed
  - [ ] Improvements identified

---

## Rollback Procedure (If needed)

If critical issues occur, follow this rollback procedure:

### Decision to Rollback

- [ ] Issue severity assessed
  - [ ] Critical functionality broken
  - [ ] Data integrity compromised
  - [ ] Security vulnerability discovered
  - [ ] Performance severely degraded

- [ ] Rollback decision made
  - [ ] Team consensus reached
  - [ ] Stakeholders notified
  - [ ] Rollback plan reviewed

### Executing Rollback

- [ ] Previous version identified
  - [ ] Last known good version confirmed
  - [ ] Rollback target verified

- [ ] Rollback executed
  - [ ] Previous code deployed
  - [ ] Database rolled back (if applicable)
  - [ ] Configuration reverted

- [ ] Application verified
  - [ ] Application loads
  - [ ] Features working
  - [ ] No errors in logs

- [ ] Monitoring verified
  - [ ] Error rate normal
  - [ ] Performance acceptable
  - [ ] Alerts cleared

### Post-Rollback

- [ ] Root cause analysis
  - [ ] Issue identified
  - [ ] Root cause determined
  - [ ] Fix planned

- [ ] Communication
  - [ ] Users notified
  - [ ] Team debriefed
  - [ ] Stakeholders updated

- [ ] Documentation
  - [ ] Incident documented
  - [ ] Lessons learned captured
  - [ ] Prevention measures identified

---

## Sign-Off

**Deployment Date:** _______________

**Deployed By:** _______________

**Verified By:** _______________

**Approved By:** _______________

**Notes:**
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

## Quick Reference

### Critical Checks

Must pass before deployment:
1. ✅ All tests passing
2. ✅ No TypeScript errors
3. ✅ Production build succeeds
4. ✅ Environment variables configured
5. ✅ API keys valid
6. ✅ Security audit passed
7. ✅ Performance acceptable
8. ✅ Monitoring configured

### Emergency Contacts

- **On-Call Engineer:** _______________
- **Team Lead:** _______________
- **DevOps:** _______________
- **Product Manager:** _______________

### Useful Commands

```bash
# Check build
npm run build

# Run tests
npm test

# Check TypeScript
npx tsc --noEmit

# Security audit
npm audit

# Performance analysis
ANALYZE=true npm run build

# Start production server
npm start
```

