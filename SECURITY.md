# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x.x   | ✅ Active support |

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Instead, report them privately:

1. **Email:** security@devos.app  
   *(Replace with actual contact once set up)*

2. **GitHub Security Advisories:**  
   Use [GitHub's private vulnerability reporting](https://github.com/omar232208/App-DevOS/security/advisories/new).

### What to Include

- Type of vulnerability (e.g., auth bypass, XSS, data exposure)
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

### Response Timeline

| Stage | Timeline |
|-------|----------|
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix timeline communicated | Within 10 business days |
| Public disclosure | After fix is released |

## Security Best Practices for Contributors

### API Keys & Secrets
- **Never** commit `.env` files, API keys, or secrets
- Use `.env.local` (gitignored) for local development
- Use Supabase environment variables via the Replit Secrets manager

### Authentication
- All auth is handled by Supabase Auth — never roll your own crypto
- Tokens are stored securely in Expo SecureStore (not AsyncStorage) in production
- All database queries are protected by Row Level Security (RLS) policies

### Data
- User data is scoped by `user_id` and enforced at the database level via RLS
- No PII is stored in logs or analytics
- Notes content is never sent to third-party services

### Dependencies
- Dependencies are audited with `pnpm audit` in CI
- Keep Expo SDK and React Native up to date
- Pin exact versions for security-sensitive packages

## Disclosure Policy

We follow [Coordinated Vulnerability Disclosure](https://en.wikipedia.org/wiki/Coordinated_vulnerability_disclosure). After a fix is deployed, we will:
1. Publish a security advisory on GitHub
2. Credit the reporter (with permission)
3. Document the fix in the CHANGELOG
