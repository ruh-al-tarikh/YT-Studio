# Token Configuration & Deployment Guide

## GitHub Actions Secrets Status

### ✅ Configured Secrets
- `GOOGLE_API_KEY` — AI automation (Gemini API key)
- `DOCKER_PAT` — Docker/GHCR push authentication
- `CLOUDFLARE_API_TOKEN` — Workers deployment (placeholder)
- `CLOUDFLARE_ACCOUNT_ID` — Workers account ID (placeholder)
- `FIREBASE_TOKEN` — Firebase deployment
- `FIREBASE_SERVICE_ACCOUNT` — Firebase credentials
- `YOUTUBE_API_KEY` — YouTube API access

### 🔧 Setup Instructions

#### 1. Update Cloudflare Credentials
```bash
# Get your API token from: https://dash.cloudflare.com/profile/api-tokens
gh secret set CLOUDFLARE_API_TOKEN --body "your_actual_token"

# Get Account ID from: https://dash.cloudflare.com/
gh secret set CLOUDFLARE_ACCOUNT_ID --body "your_account_id"
```

#### 2. Docker Registry Login
```bash
# Login to GHCR
docker login ghcr.io -u YOUR_USERNAME --password $(gh auth token)

# Verify config
cat ~/.docker/config.json
```

#### 3. Deploy.yml Workflow
The deployment now runs:
1. **build-worker** — TypeScript validation, Worker generation
2. **build-docker** — Multi-arch build (amd64, arm64), push to GHCR
3. **deploy-worker** — Cloudflare Workers deployment
4. **deploy-pages** — Cloudflare Pages frontend deployment

#### 4. Token Scopes Required
- **GitHub Token** (via DOCKER_PAT):
  - `read:packages` — Pull images
  - `write:packages` — Push images
  - `repo` — Repository access

- **Cloudflare Token**:
  - `Account.Workers Scripts:Edit` — Deploy workers
  - `Account.Pages:Edit` — Deploy pages

### 📝 Environment Variables

Update `.env` with production values:
```bash
GOOGLE_API_KEY=your_google_key
CLOUDFLARE_API_TOKEN=your_cf_token
CLOUDFLARE_ACCOUNT_ID=your_cf_account_id
NODE_ENV=production
```

### 🚀 Deployment Flow

```
Push to main
    ↓
build-worker (TypeScript + Worker file generation)
build-docker (Multi-arch image build)
    ↓
deploy-worker (requires build-worker success)
deploy-pages (requires both builds success)
    ↓
✅ Deployment complete with summary
```

### 🔑 Token Management

| Token | Scope | Usage | Stored |
|-------|-------|-------|--------|
| GOOGLE_API_KEY | Generative AI | Auto-enhance script | GitHub Secrets |
| DOCKER_PAT | Package Registry | Push to GHCR | GitHub Secrets |
| CLOUDFLARE_API_TOKEN | Workers + Pages | Deploy to CF | GitHub Secrets |
| CLOUDFLARE_ACCOUNT_ID | Account | CF configuration | GitHub Secrets |

### ✅ Verification

```bash
# List all secrets
gh secret list

# Verify Docker login
docker ps

# Test deployment locally
docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/ruhdevops/yt-studio-automation:latest .

# Check GitHub Actions
gh run list --workflow=deploy.yml
```

### ❌ Troubleshooting

**"permission_denied" on Docker push:**
- Token scopes insufficient
- Regenerate with `write:packages` scope
- Re-authenticate: `docker logout ghcr.io && docker login ghcr.io`

**"Invalid API token" on Cloudflare:**
- Verify token at https://dash.cloudflare.com/profile/api-tokens
- Check token hasn't expired
- Regenerate if needed

**"No build script found":**
- deploy.yml handles gracefully with `continue-on-error: true`
- Pages deployment optional

---

**Next Steps:**
1. Update Cloudflare credentials
2. Verify Docker login
3. Push to `main` branch to trigger workflow
4. Monitor GitHub Actions → Deploy to Cloudflare Workers & Docker Registry
