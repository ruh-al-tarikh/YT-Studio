## 2026-04-12 - Prevent sensitive data leakage in error responses
**Vulnerability:** Error responses were returning `err.message`, which could expose internal stack traces or API details.
**Learning:** Cloudflare Workers by default don't hide error details if passed directly to the Response.
**Prevention:** Always return generic error messages to the client and log the actual error internally.

## 2026-04-12 - Missing Security Headers
**Vulnerability:** The API was missing basic security headers like X-Content-Type-Options and X-Frame-Options.
**Learning:** Even internal/small APIs should include defense-in-depth headers to prevent MIME sniffing and clickjacking.
**Prevention:** Standardize a `json` helper that includes security headers by default.
