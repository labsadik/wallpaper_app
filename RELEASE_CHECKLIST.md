# Production release checklist

This branch is the final automated verification candidate.

- TypeScript typecheck
- Core utility/security tests
- Sharp image processing tests
- ESLint
- Production build
- Production-server smoke tests
- Security-header smoke checks
- 100-request / 10-concurrency baseline load test

DB-backed publisher verification remains an environment-dependent integration check and is run with the project credentials using `npm run test-publisher`.
