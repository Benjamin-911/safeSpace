# SafeSpace Security & Privacy Documentation

## Overview
SafeSpace Salone is an anonymous mental health support platform designed with privacy and security as core principles. This document outlines our security measures, privacy guarantees, and best practices.

## Anonymity Guarantees

### What We Do NOT Store
- IP addresses associated with therapy sessions
- Device identifiers or fingerprints
- Personally identifiable information (PII) without explicit consent
- Geolocation data
- Browsing history or session metadata

### How Anonymity is Maintained
1. **No User Registration Required**: Users can access support anonymously without creating accounts
2. **Session-Based Access**: Each anonymous session uses a randomly generated ID with no linking to devices or IPs
3. **End-to-End Privacy**: All messages between users and therapists are encrypted in transit and at rest
4. **No Analytics on Therapy Content**: Vercel Analytics tracks only UI interactions, never therapy session content
5. **Automatic Session Expiration**: Anonymous sessions expire after 30 days of inactivity

## Security Architecture

### Frontend Security
- **Content Security Policy (CSP)**: Strict CSP prevents XSS attacks and unauthorized script execution
- **X-Frame-Options: DENY**: Prevents clickjacking attacks
- **X-Content-Type-Options: nosniff**: Prevents MIME type sniffing
- **Referrer Policy**: Limited referrer information prevents accidental data leaks
- **No Pinch-to-Zoom**: Viewport scaling disabled on mobile to prevent accidental data exposure

### Backend Security (Convex)
- **Authentication**: All mutations require valid session tokens
- **Authorization**: Users can only access their own session data
- **Rate Limiting**: Implemented on all sensitive operations (login, message sending)
- **Input Validation**: All user inputs validated with Zod schemas
- **HTTPS Only**: All data transmitted over TLS 1.2+

### Data Protection
- Sensitive data encrypted at rest in Convex database
- Automatic backups with 30-day retention
- No data shared with third parties except for:
  - Vercel Analytics (UI interactions only, no therapy content)
  - Convex infrastructure (encrypted storage)

## Input Validation

All user inputs are validated using Zod schemas:
- **Forms**: All form submissions validated before sending to backend
- **API Requests**: All Convex mutations validate input parameters
- **Messages**: Message content limited to 5000 characters, sanitized for XSS

See `lib/validation.ts` for complete validation schema definitions.

## Session Security

### Anonymous Sessions
- Generated with cryptographically secure randomness
- No correlation with device/browser data
- Cannot be hijacked via cookie theft (no cookies used for anonymous sessions)
- Expire after 30 days of inactivity

### Authenticated Sessions (if applicable)
- Secure HTTP-only cookies
- CSRF tokens on state-modifying operations
- Session rotation after sensitive operations
- Failed login attempts rate-limited

## Data Retention & Deletion

### User Data Retention
- **Active Sessions**: Retained during therapy relationship
- **Inactive Sessions**: Automatically purged after 30 days of inactivity
- **Explicit Deletion**: Users can request complete deletion of their data
- **Deletion Verification**: Audit logs confirm data deletion within 24 hours

### Deletion Process
1. User requests deletion via settings
2. Data marked for deletion (24-hour grace period for reversal)
3. All backups purged
4. Deletion confirmation sent to user
5. Audit log entry created

## Compliance

### Standards
- GDPR-compliant data handling (for EU users)
- HIPAA considerations (as applicable to mental health content)
- SOC 2 Type II compliance through Convex infrastructure

### Incident Response
- Security incidents reported to affected users within 24 hours
- Public disclosure after assessment (if necessary)
- Continuous monitoring for unauthorized access attempts

## Reporting Security Issues

**DO NOT** open public GitHub issues for security vulnerabilities.

Instead, please email: **security@safespace-salone.com** with:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Your contact information

We commit to:
- Acknowledging reports within 24 hours
- Providing updates every 48 hours
- Fixing critical issues within 7 days
- Public credit upon disclosure (if desired)

## Regular Security Audits

- **Automated**: Daily automated security scans via GitHub Actions
- **Manual**: Quarterly security audits by third-party auditors
- **Penetration Testing**: Annual penetration testing
- **Dependency Scanning**: Continuous dependency vulnerability monitoring

## Best Practices for Users

1. **Use Strong Passwords**: Minimum 8 characters with uppercase, numbers, and symbols
2. **Enable 2FA**: If/when account creation is available
3. **Keep Session Private**: Don't share session links with untrusted parties
4. **Clear Browser Cache**: After each session if using shared devices
5. **Use HTTPS Only**: Always access SafeSpace over HTTPS

## Technical Stack

- **Frontend**: Next.js 16 with TypeScript
- **Backend**: Convex (real-time backend-as-a-service)
- **Database**: Encrypted Convex storage
- **Hosting**: Vercel (edge network)
- **Security**: 
  - TLS 1.2+ encryption
  - CSP headers
  - CORS protection
  - Input validation with Zod

## Security Headers

All responses include the following security headers:
- `Content-Security-Policy`: Restricts resource loading
- `X-Content-Type-Options: nosniff`: Prevents MIME sniffing
- `X-Frame-Options: DENY`: Prevents clickjacking
- `X-XSS-Protection`: Enables browser XSS filters
- `Referrer-Policy`: Limits referrer information
- `Permissions-Policy`: Restricts sensitive APIs (camera, microphone, geolocation)

## Monitoring & Logging

### What We Log
- Failed authentication attempts
- Unauthorized access attempts
- API errors and exceptions
- Rate limit violations
- Data deletion requests

### What We Don't Log
- Therapy session content
- User location data
- Device identifiers
- Complete message text (only metadata for audit purposes)

## Last Updated
July 11, 2026

## Questions?
Contact our privacy team: **privacy@safespace-salone.com**
