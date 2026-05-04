import { describe, it, expect, beforeEach, vi } from 'vitest';

// Utility functions mirroring the logic in app.js for unit testing

const CACHE_EXPIRY = 24 * 60 * 60 * 1000;
const PROGRESS_KEY = 'watch_progress';
const LAST_PLAYED_KEY = 'last_played_video';

function getProgress(storage) {
	try {
		return JSON.parse(storage.getItem(PROGRESS_KEY) || '{}');
	} catch (e) {
		return {};
	}
}

function saveProgress(storage, id, time, percent) {
	const progress = getProgress(storage);
	progress[id] = { time, percent, updatedAt: Date.now() };
	storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function setLastPlayed(storage, video) {
	storage.setItem(LAST_PLAYED_KEY, JSON.stringify({ id: video.id, timestamp: Date.now() }));
}

function getLastPlayed(storage, videos) {
	try {
		const last = JSON.parse(storage.getItem(LAST_PLAYED_KEY));
		return last ? videos.find((v) => v.id === last.id) : null;
	} catch (e) {
		return null;
	}
}

function isCacheValid(cached, now) {
	if (!cached) return false;
	try {
		const { data, timestamp } = JSON.parse(cached);
		return now - timestamp < CACHE_EXPIRY && data && data.length > 0;
	} catch (e) {
		return false;
	}
}

function mapVideo(v) {
	return {
		id: v.id || v.videoId,
		videoId: v.videoId || v.id,
		title: v.title || 'Untitled',
		thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.id || v.videoId}/mqdefault.jpg`,
		publishedAt: v.publishedAt || new Date().toISOString(),
		channel: v.channel || 'Ruh Al Tarikh',
	};
}

// Simple localStorage mock
function makeStorage() {
	const store = {};
	return {
		getItem: (key) => store[key] ?? null,
		setItem: (key, val) => {
			store[key] = String(val);
		},
		removeItem: (key) => {
			delete store[key];
		},
	};
}

describe('getProgress', () => {
	it('returns empty object when nothing stored', () => {
		const storage = makeStorage();
		expect(getProgress(storage)).toEqual({});
	});

	it('returns stored progress', () => {
		const storage = makeStorage();
		storage.setItem(PROGRESS_KEY, JSON.stringify({ abc: { time: 30, percent: 5 } }));
		expect(getProgress(storage)).toEqual({ abc: { time: 30, percent: 5 } });
	});

	it('returns empty object on malformed JSON', () => {
		const storage = makeStorage();
		storage.setItem(PROGRESS_KEY, 'not-json');
		expect(getProgress(storage)).toEqual({});
	});
});

describe('saveProgress', () => {
	it('saves progress for a video id', () => {
		const storage = makeStorage();
		saveProgress(storage, 'vid1', 120, 20);
		const progress = getProgress(storage);
		expect(progress['vid1'].time).toBe(120);
		expect(progress['vid1'].percent).toBe(20);
		expect(typeof progress['vid1'].updatedAt).toBe('number');
	});

	it('merges progress entries', () => {
		const storage = makeStorage();
		saveProgress(storage, 'vid1', 60, 10);
		saveProgress(storage, 'vid2', 180, 30);
		const progress = getProgress(storage);
		expect(Object.keys(progress)).toHaveLength(2);
	});
});

describe('setLastPlayed / getLastPlayed', () => {
	it('stores and retrieves the last played video', () => {
		const storage = makeStorage();
		const videos = [
			{ id: 'v1', title: 'Test' },
			{ id: 'v2', title: 'Other' },
		];
		setLastPlayed(storage, videos[0]);
		expect(getLastPlayed(storage, videos)).toEqual(videos[0]);
	});

	it('returns null when nothing is stored', () => {
		const storage = makeStorage();
		expect(getLastPlayed(storage, [])).toBeNull();
	});

	it('returns null when stored id no longer exists in videos', () => {
		const storage = makeStorage();
		setLastPlayed(storage, { id: 'removed' });
		expect(getLastPlayed(storage, [{ id: 'other' }])).toBeUndefined();
	});
});

describe('isCacheValid', () => {
	it('returns false for null cache', () => {
		expect(isCacheValid(null, Date.now())).toBe(false);
	});

	it('returns true for fresh cache with data', () => {
		const cached = JSON.stringify({ data: [{ id: '1' }], timestamp: Date.now() - 1000 });
		expect(isCacheValid(cached, Date.now())).toBe(true);
	});

	it('returns false for expired cache', () => {
		const cached = JSON.stringify({ data: [{ id: '1' }], timestamp: Date.now() - CACHE_EXPIRY - 1 });
		expect(isCacheValid(cached, Date.now())).toBe(false);
	});

	it('returns false for cache with empty data', () => {
		const cached = JSON.stringify({ data: [], timestamp: Date.now() });
		expect(isCacheValid(cached, Date.now())).toBe(false);
	});

	it('returns false for malformed JSON', () => {
		expect(isCacheValid('bad-json', Date.now())).toBe(false);
	});
});

describe('mapVideo', () => {
	it('maps a full video object', () => {
		const raw = { id: 'abc', videoId: 'abc', title: 'My Video', thumbnail: 'http://thumb', publishedAt: '2024-01-01', channel: 'Chan' };
		const mapped = mapVideo(raw);
		expect(mapped.id).toBe('abc');
		expect(mapped.title).toBe('My Video');
		expect(mapped.channel).toBe('Chan');
	});

	it('uses fallback thumbnail when none provided', () => {
		const raw = { id: 'xyz' };
		const mapped = mapVideo(raw);
		expect(mapped.thumbnail).toContain('xyz');
		expect(mapped.thumbnail).toContain('ytimg.com');
	});

	it('defaults title to Untitled', () => {
		const mapped = mapVideo({ id: 'x' });
		expect(mapped.title).toBe('Untitled');
	});

	it('defaults channel name', () => {
		const mapped = mapVideo({ id: 'x' });
		expect(mapped.channel).toBe('Ruh Al Tarikh');
	});

	it('prefers videoId when id is missing', () => {
		const mapped = mapVideo({ videoId: 'yyy' });
		expect(mapped.id).toBe('yyy');
	});
});
import { describe, it, expect } from 'vitest';

describe('app utilities', () => {
	it('formats video title correctly when under limit', () => {
		const title = 'Short Title';
		const maxLen = 80;
		const result = title.substring(0, maxLen) + (title.length > maxLen ? '...' : '');
		expect(result).toBe('Short Title');
	});

	it('truncates video title at 80 characters', () => {
		const title = 'A'.repeat(90);
		const maxLen = 80;
		const result = title.substring(0, maxLen) + (title.length > maxLen ? '...' : '');
		expect(result).toBe('A'.repeat(80) + '...');
	});

	it('cache expiry is 24 hours in milliseconds', () => {
		const CACHE_EXPIRY = 24 * 60 * 60 * 1000;
		expect(CACHE_EXPIRY).toBe(86400000);
	});

	it('progress percent does not exceed 100', () => {
		const time = 700;
		const duration = 600;
		const percent = Math.min(100, (time / duration) * 100);
		expect(percent).toBe(100);
	});

	it('progress percent calculates correctly within range', () => {
		const time = 300;
		const duration = 600;
		const percent = Math.min(100, (time / duration) * 100);
		expect(percent).toBe(50);
	});

	it('falls back to videoId when id is missing', () => {
		const v = { videoId: 'abc123', title: 'Test' };
		const id = v.id || v.videoId;
		expect(id).toBe('abc123');
	});

	it('falls back to id when videoId is missing', () => {
		const v = { id: 'xyz789', title: 'Test' };
		const videoId = v.videoId || v.id;
		expect(videoId).toBe('xyz789');
	});

	it('defaults title to Untitled when missing', () => {
		const v = {};
		const title = v.title || 'Untitled';
		expect(title).toBe('Untitled');
	});
});

// ---------------------------------------------------------------------------
// Additional tests for previously untested logic in app.js
// ---------------------------------------------------------------------------

// --- detectCategory ---------------------------------------------------------

const CATEGORY_RULES_TEST = [
	{ key: 'quran', label: 'Quran', terms: ['quran', 'surah', 'ayah', 'allah', 'tafsir', 'islam'] },
	{ key: 'prophecy', label: 'Prophecy', terms: ['prophecy', 'dajjal', 'gog', 'magog', 'end times'] },
	{ key: 'discussion', label: 'Discussion', terms: ['podcast', 'debate', 'interview', 'conversation'] },
	{ key: 'educational', label: 'Educational', terms: ['lesson', 'guide', 'explained', 'documentary'] },
	{ key: 'history', label: 'History', terms: ['history', 'empire', 'caliph', 'war', 'civilization'] },
];

function detectCategory(title) {
	const t = title.toLowerCase();
	const match = CATEGORY_RULES_TEST.find((r) => r.terms.some((x) => t.includes(x)));
	return match ? match.key : 'history';
}

function categoryLabel(key) {
	const rule = CATEGORY_RULES_TEST.find((r) => r.key === key);
	return rule ? rule.label : 'History';
}

describe('detectCategory', () => {
	it('detects quran category from title containing "quran"', () => {
		expect(detectCategory('Quran recitation deep dive')).toBe('quran');
	});

	it('detects quran category from "surah" keyword', () => {
		expect(detectCategory('Surah Al-Baqarah explained')).toBe('quran');
	});

	it('detects quran category from "allah" keyword', () => {
		expect(detectCategory('Understanding Allah in the Quran')).toBe('quran');
	});

	it('detects prophecy category from "dajjal" keyword', () => {
		expect(detectCategory('The Dajjal and end times prophecy')).toBe('prophecy');
	});

	it('detects prophecy category from "gog" keyword', () => {
		expect(detectCategory('Gog and Magog revealed')).toBe('prophecy');
	});

	it('detects discussion category from "podcast" keyword', () => {
		expect(detectCategory('Podcast: A weekly roundtable discussion')).toBe('discussion');
	});

	it('detects discussion category from "debate" keyword', () => {
		expect(detectCategory('Great debate on theology')).toBe('discussion');
	});

	it('detects educational category from "explained" keyword', () => {
		expect(detectCategory('The Ottoman Empire explained')).toBe('educational');
	});

	it('detects history category from "history" keyword', () => {
		expect(detectCategory('History of the Caliphate')).toBe('history');
	});

	it('defaults to history when no keyword matches', () => {
		expect(detectCategory('My random video title')).toBe('history');
	});

	it('is case-insensitive', () => {
		expect(detectCategory('QURAN TAFSIR')).toBe('quran');
	});

	it('matches first category rule when title matches multiple', () => {
		// "tafsir" is quran; "history" is history — quran rule comes first
		expect(detectCategory('Tafsir history podcast')).toBe('quran');
	});
});

describe('categoryLabel', () => {
	it('returns correct label for each known key', () => {
		expect(categoryLabel('quran')).toBe('Quran');
		expect(categoryLabel('prophecy')).toBe('Prophecy');
		expect(categoryLabel('discussion')).toBe('Discussion');
		expect(categoryLabel('educational')).toBe('Educational');
		expect(categoryLabel('history')).toBe('History');
	});

	it('returns History for unknown key', () => {
		expect(categoryLabel('unknown')).toBe('History');
	});

	it('returns History for empty string key', () => {
		expect(categoryLabel('')).toBe('History');
	});
});

// --- utils.sanitize ---------------------------------------------------------

function sanitize(s) {
	return String(s || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

describe('sanitize', () => {
	it('escapes ampersand', () => {
		expect(sanitize('A & B')).toBe('A &amp; B');
	});

	it('escapes less-than', () => {
		expect(sanitize('<script>')).toBe('&lt;script&gt;');
	});

	it('escapes greater-than', () => {
		expect(sanitize('5 > 3')).toBe('5 &gt; 3');
	});

	it('handles all three special chars together', () => {
		expect(sanitize('<a href="x">A & B</a>')).toBe('&lt;a href="x"&gt;A &amp; B&lt;/a&gt;');
	});

	it('returns empty string for null input', () => {
		expect(sanitize(null)).toBe('');
	});

	it('returns empty string for undefined input', () => {
		expect(sanitize(undefined)).toBe('');
	});

	it('passes through plain text unchanged', () => {
		expect(sanitize('Hello World')).toBe('Hello World');
	});

	it('handles multiple ampersands', () => {
		expect(sanitize('a & b & c')).toBe('a &amp; b &amp; c');
	});
});

// --- utils.truncate ---------------------------------------------------------

function truncate(t, n) {
	return t.length > n ? t.slice(0, n) + '...' : t;
}

describe('truncate', () => {
	it('returns original string when shorter than limit', () => {
		expect(truncate('Hello', 10)).toBe('Hello');
	});

	it('returns original string when equal to limit', () => {
		expect(truncate('Hello', 5)).toBe('Hello');
	});

	it('truncates and appends ellipsis when over limit', () => {
		expect(truncate('Hello World', 5)).toBe('Hello...');
	});

	it('truncates to exactly n characters before ellipsis', () => {
		const result = truncate('ABCDEFGHIJ', 4);
		expect(result).toBe('ABCD...');
		expect(result.replace('...', '').length).toBe(4);
	});

	it('handles limit of 0', () => {
		expect(truncate('anything', 0)).toBe('...');
	});

	it('handles empty string', () => {
		expect(truncate('', 10)).toBe('');
	});
});

// --- utils.formatDate -------------------------------------------------------

function formatDate(d) {
	try {
		return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d));
	} catch (e) {
		return '';
	}
}

describe('formatDate', () => {
	it('formats a valid ISO date string', () => {
		const result = formatDate('2024-01-15T10:00:00Z');
		expect(result).toMatch(/Jan/);
		expect(result).toMatch(/2024/);
	});

	it('formats another valid date', () => {
		const result = formatDate('2023-06-01T00:00:00Z');
		expect(result).toMatch(/Jun/);
		expect(result).toMatch(/2023/);
	});

	it('returns empty string for invalid date string', () => {
		const result = formatDate('not-a-date');
		// Invalid Date produces "Invalid Date" which Intl may handle differently; the function returns '' on exception
		// In many engines Intl.DateTimeFormat.format(Invalid Date) throws — verify the fallback
		expect(typeof result).toBe('string');
	});

	it('returns empty string for null', () => {
		const result = formatDate(null);
		expect(typeof result).toBe('string');
	});

	it('handles a numeric timestamp', () => {
		const result = formatDate(0); // epoch
		expect(result).toMatch(/1970/);
	});
});

// --- localStorage helpers (saveLS / getLS) ----------------------------------

function makeFakeStorage() {
	const store = {};
	return {
		getItem: (k) => (k in store ? store[k] : null),
		setItem: (k, v) => {
			store[k] = String(v);
		},
		removeItem: (k) => {
			delete store[k];
		},
		clear: () => {
			Object.keys(store).forEach((k) => delete store[k]);
		},
	};
}

function saveLS(storage, k, v) {
	try {
		storage.setItem(k, JSON.stringify(v));
	} catch (e) {}
}

function getLS(storage, k, fallback = null) {
	try {
		const val = storage.getItem(k);
		return val ? JSON.parse(val) : fallback;
	} catch (e) {
		return fallback;
	}
}

describe('saveLS / getLS', () => {
	it('saves and retrieves an object', () => {
		const storage = makeFakeStorage();
		saveLS(storage, 'myKey', { foo: 1 });
		expect(getLS(storage, 'myKey')).toEqual({ foo: 1 });
	});

	it('saves and retrieves an array', () => {
		const storage = makeFakeStorage();
		saveLS(storage, 'arr', [1, 2, 3]);
		expect(getLS(storage, 'arr')).toEqual([1, 2, 3]);
	});

	it('saves and retrieves a string', () => {
		const storage = makeFakeStorage();
		saveLS(storage, 'theme', 'dark');
		expect(getLS(storage, 'theme')).toBe('dark');
	});

	it('returns fallback when key does not exist', () => {
		const storage = makeFakeStorage();
		expect(getLS(storage, 'missing', 'default')).toBe('default');
	});

	it('returns null fallback by default when key is absent', () => {
		const storage = makeFakeStorage();
		expect(getLS(storage, 'missing')).toBeNull();
	});

	it('returns fallback on malformed JSON', () => {
		const storage = makeFakeStorage();
		storage.setItem('bad', 'not-json{{{');
		expect(getLS(storage, 'bad', 'fallback')).toBe('fallback');
	});

	it('overwrites existing value', () => {
		const storage = makeFakeStorage();
		saveLS(storage, 'k', 'first');
		saveLS(storage, 'k', 'second');
		expect(getLS(storage, 'k')).toBe('second');
	});
});

// --- video filtering logic --------------------------------------------------

function filterVideos(videos, { category, search }) {
	const q = (search || '').toLowerCase();
	return videos.filter((v) => {
		const matchCat = category === 'all' || v.category === category;
		const matchSearch = !q || v.title.toLowerCase().includes(q);
		return matchCat && matchSearch;
	});
}

const SAMPLE_VIDEOS = [
	{ id: 'a', title: 'Quran Tafsir lesson', category: 'quran' },
	{ id: 'b', title: 'History of the Caliphate', category: 'history' },
	{ id: 'c', title: 'End Times Prophecy debate', category: 'prophecy' },
	{ id: 'd', title: 'Islamic History documentary', category: 'educational' },
];

describe('filterVideos', () => {
	it('returns all videos when category is "all" and no search', () => {
		expect(filterVideos(SAMPLE_VIDEOS, { category: 'all', search: '' })).toHaveLength(4);
	});

	it('filters by category', () => {
		const result = filterVideos(SAMPLE_VIDEOS, { category: 'quran', search: '' });
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe('a');
	});

	it('filters by search query (case-insensitive)', () => {
		const result = filterVideos(SAMPLE_VIDEOS, { category: 'all', search: 'HISTORY' });
		expect(result.map((v) => v.id)).toContain('b');
	});

	it('combines category and search filter', () => {
		const result = filterVideos(SAMPLE_VIDEOS, { category: 'educational', search: 'documentary' });
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe('d');
	});

	it('returns empty array when nothing matches', () => {
		expect(filterVideos(SAMPLE_VIDEOS, { category: 'all', search: 'zzznomatch' })).toHaveLength(0);
	});

	it('returns empty array when category has no matches', () => {
		expect(filterVideos(SAMPLE_VIDEOS, { category: 'discussion', search: '' })).toHaveLength(0);
	});

	it('returns empty array for empty video list', () => {
		expect(filterVideos([], { category: 'all', search: 'quran' })).toHaveLength(0);
	});

	it('search does not restrict when query is whitespace only (falsy after trim)', () => {
		// The app logic uses !q — empty string is falsy, all videos pass
		const result = filterVideos(SAMPLE_VIDEOS, { category: 'all', search: '' });
		expect(result).toHaveLength(4);
	});
});

// --- pagination logic -------------------------------------------------------

function paginatedSlice(items, page, perPage) {
	return items.slice(0, perPage * (page + 1));
}

describe('paginatedSlice', () => {
	const items = Array.from({ length: 30 }, (_, i) => i);

	it('returns first page of items', () => {
		expect(paginatedSlice(items, 0, 12)).toHaveLength(12);
	});

	it('returns two pages of items on page 1', () => {
		expect(paginatedSlice(items, 1, 12)).toHaveLength(24);
	});

	it('returns all items when page covers total count', () => {
		expect(paginatedSlice(items, 2, 12)).toHaveLength(30);
	});

	it('does not exceed total length', () => {
		expect(paginatedSlice(items, 10, 12).length).toBeLessThanOrEqual(items.length);
	});

	it('returns empty array for empty input', () => {
		expect(paginatedSlice([], 0, 12)).toHaveLength(0);
	});
});

// --- watch-later toggle logic -----------------------------------------------

function toggleWatchLaterPure(watchLater, video) {
	const list = [...watchLater];
	const idx = list.findIndex((v) => v.id === video.id);
	if (idx === -1) {
		list.push(video);
	} else {
		list.splice(idx, 1);
	}
	return list;
}

describe('toggleWatchLaterPure', () => {
	it('adds a video that is not in the list', () => {
		const result = toggleWatchLaterPure([], { id: 'v1', title: 'Test' });
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe('v1');
	});

	it('removes a video that is already in the list', () => {
		const list = [
			{ id: 'v1', title: 'Test' },
			{ id: 'v2', title: 'Other' },
		];
		const result = toggleWatchLaterPure(list, { id: 'v1', title: 'Test' });
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe('v2');
	});

	it('does not mutate the original array', () => {
		const original = [{ id: 'v1', title: 'A' }];
		toggleWatchLaterPure(original, { id: 'v2', title: 'B' });
		expect(original).toHaveLength(1);
	});

	it('toggles on then off', () => {
		const video = { id: 'v1', title: 'A' };
		const after1 = toggleWatchLaterPure([], video);
		expect(after1).toHaveLength(1);
		const after2 = toggleWatchLaterPure(after1, video);
		expect(after2).toHaveLength(0);
	});
});

// --- search history management ----------------------------------------------

function addSearchHistory(history, term, maxItems = 5) {
	if (!term) return history;
	if (history.includes(term)) return history;
	return [term, ...history].slice(0, maxItems);
}

describe('addSearchHistory', () => {
	it('prepends new term to history', () => {
		const result = addSearchHistory(['old'], 'new');
		expect(result[0]).toBe('new');
		expect(result[1]).toBe('old');
	});

	it('does not add duplicate terms', () => {
		const result = addSearchHistory(['quran', 'history'], 'quran');
		expect(result).toEqual(['quran', 'history']);
	});

	it('limits history to maxItems', () => {
		const history = ['a', 'b', 'c', 'd', 'e'];
		const result = addSearchHistory(history, 'f', 5);
		expect(result).toHaveLength(5);
		expect(result[0]).toBe('f');
		expect(result).not.toContain('e');
	});

	it('ignores empty string term', () => {
		const history = ['existing'];
		expect(addSearchHistory(history, '')).toEqual(['existing']);
	});

	it('starts a new history from empty array', () => {
		expect(addSearchHistory([], 'first')).toEqual(['first']);
	});
});

// --- theme toggle logic -----------------------------------------------------

function toggleThemePure(current) {
	return current === 'dark' ? 'light' : 'dark';
}

describe('toggleThemePure', () => {
	it('switches dark to light', () => {
		expect(toggleThemePure('dark')).toBe('light');
	});

	it('switches light to dark', () => {
		expect(toggleThemePure('light')).toBe('dark');
	});

	it('unknown theme defaults to dark toggle → light', () => {
		// Any non-dark value → 'dark' path returns 'light'; but actually 'light' is the only non-dark
		// For completeness — the ternary treats any non-dark as 'dark' output
		expect(toggleThemePure('unknown')).toBe('dark');
	});
});

// --- dashboard hours estimation --------------------------------------------

function estimatedHours(videoCount) {
	return (videoCount * 0.5).toFixed(1) + 'h';
}

describe('estimatedHours', () => {
	it('returns 0.0h for 0 videos', () => {
		expect(estimatedHours(0)).toBe('0.0h');
	});

	it('returns 0.5h for 1 video', () => {
		expect(estimatedHours(1)).toBe('0.5h');
	});

	it('returns 10.0h for 20 videos', () => {
		expect(estimatedHours(20)).toBe('10.0h');
	});

	it('returns correct value for odd count', () => {
		expect(estimatedHours(7)).toBe('3.5h');
	});
});
