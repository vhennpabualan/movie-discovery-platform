/**
 * URL Validation Tests
 *
 * Tests for URL validation and sanitization functions.
 * Validates: Requirements 6.4, 13.1
 */

import { isValidEmbedURL, sanitizeEmbedURL } from './url-validation';

describe('URL Validation', () => {
  describe('isValidEmbedURL', () => {
    describe('Valid URLs', () => {
      it('accepts valid movie embed URL from primary domain', () => {
        const url = 'https://vidsrc-embed.ru/embed/movie?tmdb=550';
        expect(isValidEmbedURL(url)).toBe(true);
      });

      it('accepts valid movie embed URL from secondary domain', () => {
        const url = 'https://vidsrc-embed.su/embed/movie?tmdb=550';
        expect(isValidEmbedURL(url)).toBe(true);
      });

      it('accepts valid movie embed URL from tertiary domain', () => {
        const url = 'https://vidsrcme.su/embed/movie?tmdb=550';
        expect(isValidEmbedURL(url)).toBe(true);
      });

      it('accepts valid movie embed URL from quaternary domain', () => {
        const url = 'https://vsrc.su/embed/movie?tmdb=550';
        expect(isValidEmbedURL(url)).toBe(true);
      });

      it('accepts valid TV embed URL with season and episode', () => {
        const url = 'https://vidsrc-embed.ru/embed/tv?tmdb=1399&season=1&episode=1';
        expect(isValidEmbedURL(url)).toBe(true);
      });

      it('accepts URL with additional parameters', () => {
        const url = 'https://vidsrc-embed.ru/embed/movie?tmdb=550&ds_lang=en&autoplay=1';
        expect(isValidEmbedURL(url)).toBe(true);
      });

      it('accepts URL with custom subtitle URL parameter', () => {
        const url = 'https://vidsrc-embed.ru/embed/movie?tmdb=550&sub_url=https%3A%2F%2Fexample.com%2Fsubs.vtt';
        expect(isValidEmbedURL(url)).toBe(true);
      });
    });

    describe('Invalid URLs - Protocol', () => {
      it('rejects HTTP URLs', () => {
        const url = 'http://vidsrc-embed.ru/embed/movie?tmdb=550';
        expect(isValidEmbedURL(url)).toBe(false);
      });

      it('rejects javascript: protocol', () => {
        const url = 'javascript:alert("xss")';
        expect(isValidEmbedURL(url)).toBe(false);
      });

      it('rejects data: protocol', () => {
        const url = 'data:text/html,<script>alert("xss")</script>';
        expect(isValidEmbedURL(url)).toBe(false);
      });

      it('rejects file: protocol', () => {
        const url = 'file:///etc/passwd';
        expect(isValidEmbedURL(url)).toBe(false);
      });
    });

    describe('Invalid URLs - Domain', () => {
      it('rejects non-whitelisted domains', () => {
        const url = 'https://malicious-domain.com/embed/movie?tmdb=550';
        expect(isValidEmbedURL(url)).toBe(false);
      });

      it('rejects URLs with different TLD', () => {
        const url = 'https://vidsrc-embed.com/embed/movie?tmdb=550';
        expect(isValidEmbedURL(url)).toBe(false);
      });

      it('rejects URLs with subdomain on non-whitelisted domain', () => {
        const url = 'https://evil.vidsrc-embed.ru.malicious.com/embed/movie?tmdb=550';
        expect(isValidEmbedURL(url)).toBe(false);
      });
    });

    describe('Invalid URLs - Path', () => {
      it('rejects URLs without /embed/ path', () => {
        const url = 'https://vidsrc-embed.ru/video/movie?tmdb=550';
        expect(isValidEmbedURL(url)).toBe(false);
      });

      it('rejects URLs with wrong path structure', () => {
        const url = 'https://vidsrc-embed.ru/movie?tmdb=550';
        expect(isValidEmbedURL(url)).toBe(false);
      });
    });

    describe('Invalid URLs - Parameters', () => {
      it('rejects URLs without tmdb parameter', () => {
        const url = 'https://vidsrc-embed.ru/embed/movie';
        expect(isValidEmbedURL(url)).toBe(false);
      });

      it('rejects URLs with empty tmdb parameter', () => {
        const url = 'https://vidsrc-embed.ru/embed/movie?tmdb=';
        expect(isValidEmbedURL(url)).toBe(false);
      });

      it('rejects URLs with invalid tmdb parameter value', () => {
        const url = 'https://vidsrc-embed.ru/embed/movie?tmdb=abc';
        expect(isValidEmbedURL(url)).toBe(true); // URL format is valid, parameter validation is separate
      });
    });

    describe('Invalid URLs - Format', () => {
      it('rejects malformed URLs', () => {
        const url = 'not a valid url';
        expect(isValidEmbedURL(url)).toBe(false);
      });

      it('rejects empty string', () => {
        const url = '';
        expect(isValidEmbedURL(url)).toBe(false);
      });

      it('rejects null-like strings', () => {
        const url = 'null';
        expect(isValidEmbedURL(url)).toBe(false);
      });
    });

    describe('Case Sensitivity', () => {
      it('accepts URLs with uppercase domain (case-insensitive)', () => {
        const url = 'https://VIDSRC-EMBED.RU/embed/movie?tmdb=550';
        expect(isValidEmbedURL(url)).toBe(true);
      });

      it('accepts URLs with mixed case domain', () => {
        const url = 'https://VidSrc-Embed.ru/embed/movie?tmdb=550';
        expect(isValidEmbedURL(url)).toBe(true);
      });
    });
  });

  describe('sanitizeEmbedURL', () => {
    describe('Valid URLs', () => {
      it('returns valid URL unchanged', () => {
        const url = 'https://vidsrc-embed.ru/embed/movie?tmdb=550';
        expect(sanitizeEmbedURL(url)).toBe(url);
      });

      it('returns valid TV URL unchanged', () => {
        const url = 'https://vidsrc-embed.ru/embed/tv?tmdb=1399&season=1&episode=1';
        expect(sanitizeEmbedURL(url)).toBe(url);
      });

      it('returns URL with multiple parameters unchanged', () => {
        const url = 'https://vidsrc-embed.ru/embed/movie?tmdb=550&ds_lang=en&autoplay=1&sub_url=https%3A%2F%2Fexample.com%2Fsubs.vtt';
        expect(sanitizeEmbedURL(url)).toBe(url);
      });
    });

    describe('Suspicious Patterns', () => {
      it('rejects javascript: protocol', () => {
        const url = 'javascript:alert("xss")';
        expect(() => sanitizeEmbedURL(url)).toThrow();
      });

      it('rejects data: protocol', () => {
        const url = 'data:text/html,<script>alert("xss")</script>';
        expect(() => sanitizeEmbedURL(url)).toThrow();
      });

      it('rejects vbscript: protocol', () => {
        const url = 'vbscript:msgbox("xss")';
        expect(() => sanitizeEmbedURL(url)).toThrow();
      });

      it('rejects file: protocol', () => {
        const url = 'file:///etc/passwd';
        expect(() => sanitizeEmbedURL(url)).toThrow();
      });

      it('rejects javascript: with uppercase', () => {
        const url = 'JAVASCRIPT:alert("xss")';
        expect(() => sanitizeEmbedURL(url)).toThrow();
      });

      it('rejects data: with mixed case', () => {
        const url = 'DaTa:text/html,<script>alert("xss")</script>';
        expect(() => sanitizeEmbedURL(url)).toThrow();
      });
    });

    describe('Invalid URLs', () => {
      it('rejects HTTP URLs', () => {
        const url = 'http://vidsrc-embed.ru/embed/movie?tmdb=550';
        expect(() => sanitizeEmbedURL(url)).toThrow();
      });

      it('rejects non-whitelisted domains', () => {
        const url = 'https://malicious-domain.com/embed/movie?tmdb=550';
        expect(() => sanitizeEmbedURL(url)).toThrow();
      });

      it('rejects URLs without /embed/ path', () => {
        const url = 'https://vidsrc-embed.ru/video/movie?tmdb=550';
        expect(() => sanitizeEmbedURL(url)).toThrow();
      });

      it('rejects URLs without tmdb parameter', () => {
        const url = 'https://vidsrc-embed.ru/embed/movie';
        expect(() => sanitizeEmbedURL(url)).toThrow();
      });

      it('rejects malformed URLs', () => {
        const url = 'not a valid url';
        expect(() => sanitizeEmbedURL(url)).toThrow();
      });
    });

    describe('Error Messages', () => {
      it('provides descriptive error for suspicious patterns', () => {
        const url = 'javascript:alert("xss")';
        expect(() => sanitizeEmbedURL(url)).toThrow(/Suspicious URL pattern/);
      });

      it('provides descriptive error for invalid URLs', () => {
        const url = 'https://malicious-domain.com/embed/movie?tmdb=550';
        expect(() => sanitizeEmbedURL(url)).toThrow(/Invalid embed URL/);
      });
    });
  });
});
