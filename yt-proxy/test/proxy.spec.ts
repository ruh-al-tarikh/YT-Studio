/**
 * Unit tests for yt-proxy/src/index.ts (YouTube channel proxy worker).
 *
 * These tests exercise the worker's fetch handler directly by constructing
 * Request objects and providing a mock env, so no Cloudflare Workers runtime
 * is required.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import worker from "../src/index";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEnv(overrides: Record<string, unknown> = {}): any {
  return { YOUTUBE_API_KEY: "test-api-key", ...overrides };
}

function makeRequest(url: string, method = "GET"): Request {
  return new Request(url, { method });
}

// ---------------------------------------------------------------------------
// Missing API key
// ---------------------------------------------------------------------------

describe("Missing YOUTUBE_API_KEY", () => {
  it("returns 500 with error message when API key is absent", async () => {
    const req = makeRequest("https://worker.example.com/");
    const res = await worker.fetch(req, makeEnv({ YOUTUBE_API_KEY: undefined }));
    expect(res.status).toBe(500);
    const body = await res.text();
    expect(body).toContain("Missing API key");
  });
});

// ---------------------------------------------------------------------------
// Successful video fetch
// ---------------------------------------------------------------------------

describe("Successful YouTube fetch", () => {
  const channelResponse = {
    items: [
      {
        contentDetails: {
          relatedPlaylists: { uploads: "UU_TEST_PLAYLIST" },
        },
      },
    ],
  };

  const playlistResponse = {
    items: [
      {
        snippet: {
          title: "Test Video Title",
          resourceId: { videoId: "abc123" },
          thumbnails: { medium: { url: "https://img.youtube.com/thumb.jpg" } },
        },
      },
    ],
  };

  beforeEach(() => {
    let callCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string) => {
        callCount++;
        if (callCount === 1) {
          // First call → channels endpoint
          return new Response(JSON.stringify(channelResponse), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        // Second call → playlistItems endpoint
        return new Response(JSON.stringify(playlistResponse), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 200 with JSON containing videos array", async () => {
    const req = makeRequest("https://worker.example.com/");
    const res = await worker.fetch(req, makeEnv());
    expect(res.status).toBe(200);
    const json = await res.json() as { videos: Array<{ title: string; videoId: string; thumbnail: string }> };
    expect(Array.isArray(json.videos)).toBe(true);
    expect(json.videos).toHaveLength(1);
  });

  it("maps video fields correctly", async () => {
    const req = makeRequest("https://worker.example.com/");
    const res = await worker.fetch(req, makeEnv());
    const json = await res.json() as { videos: Array<{ title: string; videoId: string; thumbnail: string }> };
    const [video] = json.videos;
    expect(video.title).toBe("Test Video Title");
    expect(video.videoId).toBe("abc123");
    expect(video.thumbnail).toBe("https://img.youtube.com/thumb.jpg");
  });

  it("sets CORS header on successful response", async () => {
    const req = makeRequest("https://worker.example.com/");
    const res = await worker.fetch(req, makeEnv());
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("sets content-type to application/json on success", async () => {
    const req = makeRequest("https://worker.example.com/");
    const res = await worker.fetch(req, makeEnv());
    expect(res.headers.get("content-type")).toContain("application/json");
  });
});

// ---------------------------------------------------------------------------
// Channel fetch returns invalid JSON
// ---------------------------------------------------------------------------

describe("Invalid JSON from YouTube channels endpoint", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response("not-json", { status: 200 })
      )
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("returns 500 with parse error message", async () => {
    const req = makeRequest("https://worker.example.com/");
    const res = await worker.fetch(req, makeEnv());
    expect(res.status).toBe(500);
    const body = await res.text();
    expect(body).toContain("Invalid JSON from YouTube (channels)");
  });
});

// ---------------------------------------------------------------------------
// Channel fetch returns empty items array
// ---------------------------------------------------------------------------

describe("Channel response with no items", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ items: [] }), { status: 200 })
      )
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("returns 500 with channel fetch failed message", async () => {
    const req = makeRequest("https://worker.example.com/");
    const res = await worker.fetch(req, makeEnv());
    expect(res.status).toBe(500);
    const body = await res.text();
    expect(body).toContain("Channel fetch failed");
  });
});

// ---------------------------------------------------------------------------
// Playlist fetch returns invalid JSON
// ---------------------------------------------------------------------------

describe("Invalid JSON from YouTube playlistItems endpoint", () => {
  beforeEach(() => {
    let callCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        callCount++;
        if (callCount === 1) {
          return new Response(
            JSON.stringify({
              items: [
                {
                  contentDetails: {
                    relatedPlaylists: { uploads: "PLAYLIST_ID" },
                  },
                },
              ],
            }),
            { status: 200 }
          );
        }
        // Second call returns bad JSON
        return new Response("bad-json", { status: 200 });
      })
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("returns 500 with parse error for videos", async () => {
    const req = makeRequest("https://worker.example.com/");
    const res = await worker.fetch(req, makeEnv());
    expect(res.status).toBe(500);
    const body = await res.text();
    expect(body).toContain("Invalid JSON from YouTube (videos)");
  });
});

// ---------------------------------------------------------------------------
// Playlist fetch returns response with no items key
// ---------------------------------------------------------------------------

describe("Playlist response missing items key", () => {
  beforeEach(() => {
    let callCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        callCount++;
        if (callCount === 1) {
          return new Response(
            JSON.stringify({
              items: [
                {
                  contentDetails: {
                    relatedPlaylists: { uploads: "PLAYLIST_ID" },
                  },
                },
              ],
            }),
            { status: 200 }
          );
        }
        // Playlist response has no "items" key
        return new Response(JSON.stringify({ error: "quota exceeded" }), { status: 200 });
      })
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("returns 500 with Video fetch failed message", async () => {
    const req = makeRequest("https://worker.example.com/");
    const res = await worker.fetch(req, makeEnv());
    expect(res.status).toBe(500);
    const body = await res.text();
    expect(body).toContain("Video fetch failed");
  });
});

// ---------------------------------------------------------------------------
// Network error (fetch throws)
// ---------------------------------------------------------------------------

describe("Network failure", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("Network timeout");
      })
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("returns 500 with Worker Crash message on network error", async () => {
    const req = makeRequest("https://worker.example.com/");
    const res = await worker.fetch(req, makeEnv());
    expect(res.status).toBe(500);
    const body = await res.text();
    expect(body).toContain("Worker Crash");
    expect(body).toContain("Network timeout");
  });
});

// ---------------------------------------------------------------------------
// Empty videos list (items array is empty)
// ---------------------------------------------------------------------------

describe("Empty playlist", () => {
  beforeEach(() => {
    let callCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        callCount++;
        if (callCount === 1) {
          return new Response(
            JSON.stringify({
              items: [
                {
                  contentDetails: {
                    relatedPlaylists: { uploads: "EMPTY_PLAYLIST" },
                  },
                },
              ],
            }),
            { status: 200 }
          );
        }
        return new Response(JSON.stringify({ items: [] }), { status: 200 });
      })
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("returns 200 with an empty videos array", async () => {
    const req = makeRequest("https://worker.example.com/");
    const res = await worker.fetch(req, makeEnv());
    expect(res.status).toBe(200);
    const json = await res.json() as { videos: unknown[] };
    expect(json.videos).toHaveLength(0);
  });
});
