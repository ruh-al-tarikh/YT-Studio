import { describe, it, expect } from 'vitest';

const highlight = (e, t) => t ? (t = new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"), e.replace(t, "<mark>$1</mark>")) : e;

describe('highlight robustness', () => {
  it('highlights literal parentheses without crashing', () => {
    const text = "Searching for (parentheses)";
    const term = "(";
    expect(highlight(text, term)).toBe("Searching for <mark>(</mark>parentheses)");
  });

  it('highlights dots correctly', () => {
    const text = "file.txt";
    const term = ".";
    expect(highlight(text, term)).toBe("file<mark>.</mark>txt");
  });

  it('highlights plus signs correctly', () => {
    const text = "1+1=2";
    const term = "+";
    expect(highlight(text, term)).toBe("1<mark>+</mark>1=2");
  });

  it('returns original text if term is empty', () => {
    const text = "Hello world";
    expect(highlight(text, "")).toBe("Hello world");
  });
});
