# Bolt Journal
## 2024-05-04 - API Performance & Security
**Learning:** Direct client-side API calls expose keys and are prone to CORS issues. Centralizing API logic in a secure proxy layer (Cloudflare Worker) improves security and allows for centralized caching.
**Action:** Migrated YouTube API logic to the Worker and implemented a robust retry system in the frontend to handle transient network failures.
