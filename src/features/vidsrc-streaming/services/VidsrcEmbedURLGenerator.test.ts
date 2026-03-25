/**
 * Unit Tests for VidsrcEmbedURLGenerator
 */

import { VidsrcEmbedURLGenerator } from './VidsrcEmbedURLGenerator';
import type { EmbedURLConfig } from '../types/index';

describe('VidsrcEmbedURLGenerator', () => {
  let generator: VidsrcEmbedURLGenerator;

  beforeEach(() => {
    generator = new VidsrcEmbedURLGenerator();
  });

  describe('generateMovieURL', () => {
    it('should generate a valid movie URL with TMDB ID', () => {
      const config: EmbedURLConfig = {
        tmdbId: 550,
        contentType: 'movie',
        domain: 'vidsrc-embed.ru',
      };

      const url = generator.generateMovieURL(config);

      expect(url).toContain('https://vidsrc-embed.ru/embed/movie');
      expect(url).toContain('tmdb=550');
    });

    it('should include subtitle language parameter when provided', () => {
      const config: EmbedURLConfig = {
        tmdbId: 550,
        contentType: 'movie',
        domain: 'vidsrc-embed.ru',
        subtitleLanguage: 'es',
      };

      const url = generator.generateMovieURL(config);

      expect(url).toContain('ds_lang=es');
    });

    it('should include autoplay parameter when enabled', () => {
      const config: EmbedURLConfig = {
        tmdbId: 550,
        contentType: 'movie',
        domain: 'vidsrc-embed.ru',
        autoplay: true,
      };

      const url = generator.generateMovieURL(config);

      expect(url).toContain('autoplay=1');
    });

    it('should not include autoplay parameter when disabled', () => {
      const config: EmbedURLConfig = {
        tmdbId: 550,
        contentType: 'movie',
        domain: 'vidsrc-embed.ru',
        autoplay: false,
      };

      const url = generator.generateMovieURL(config);

      expect(url).not.toContain('autoplay');
    });

    it('should include custom subtitle URL when provided', () => {
      const config: EmbedURLConfig = {
        tmdbId: 550,
        contentType: 'movie',
        domain: 'vidsrc-embed.ru',
        customSubtitleUrl: 'https://example.com/subs.vtt',
      };

      const url = generator.generateMovieURL(config);

      expect(url).toContain('sub_url=');
      expect(url).toContain('https%3A%2F%2Fexample.com%2Fsubs.vtt');
    });

    it('should properly encode special characters in custom subtitle URL', () => {
      const config: EmbedURLConfig = {
        tmdbId: 550,
        contentType: 'movie',
        domain: 'vidsrc-embed.ru',
        customSubtitleUrl: 'https://example.com/subs with spaces.vtt',
      };

      const url = generator.generateMovieURL(config);

      expect(url).toContain('sub_url=');
      // URL should be properly encoded
      expect(url).not.toContain(' ');
    });

    it('should throw error for invalid TMDB ID (negative)', () => {
      const config: EmbedURLConfig = {
        tmdbId: -1,
        contentType: 'movie',
        domain: 'vidsrc-embed.ru',
      };

      expect(() => generator.generateMovieURL(config)).toThrow(
        'Invalid TMDB ID'
      );
    });

    it('should throw error for invalid TMDB ID (zero)', () => {
      const config: EmbedURLConfig = {
        tmdbId: 0,
        contentType: 'movie',
        domain: 'vidsrc-embed.ru',
      };

      expect(() => generator.generateMovieURL(config)).toThrow(
        'Invalid TMDB ID'
      );
    });

    it('should throw error for invalid TMDB ID (non-integer)', () => {
      const config: EmbedURLConfig = {
        tmdbId: 550.5,
        contentType: 'movie',
        domain: 'vidsrc-embed.ru',
      };

      expect(() => generator.generateMovieURL(config)).toThrow(
        'Invalid TMDB ID'
      );
    });

    it('should throw error for invalid domain', () => {
      const config = {
        tmdbId: 550,
        contentType: 'movie',
        domain: 'invalid-domain.com',
      } as any;

      expect(() => generator.generateMovieURL(config)).toThrow();
    });

    it('should include all parameters together', () => {
      const config: EmbedURLConfig = {
        tmdbId: 550,
        contentType: 'movie',
        domain: 'vidsrc-embed.ru',
        subtitleLanguage: 'fr',
        autoplay: true,
        customSubtitleUrl: 'https://example.com/subs.vtt',
      };

      const url = generator.generateMovieURL(config);

      expect(url).toContain('tmdb=550');
      expect(url).toContain('ds_lang=fr');
      expect(url).toContain('autoplay=1');
      expect(url).toContain('sub_url=');
    });
  });

  describe('generateTVURL', () => {
    it('should generate a valid TV URL with season and episode', () => {
      const config: EmbedURLConfig = {
        tmdbId: 1399,
        contentType: 'tv',
        domain: 'vidsrc-embed.ru',
        season: 1,
        episode: 1,
      };

      const url = generator.generateTVURL(config);

      expect(url).toContain('https://vidsrc-embed.ru/embed/tv');
      expect(url).toContain('tmdb=1399');
      expect(url).toContain('season=1');
      expect(url).toContain('episode=1');
    });

    it('should throw error when season is missing', () => {
      const config: EmbedURLConfig = {
        tmdbId: 1399,
        contentType: 'tv',
        domain: 'vidsrc-embed.ru',
        episode: 1,
      };

      expect(() => generator.generateTVURL(config)).toThrow(
        'Season and episode are required'
      );
    });

    it('should throw error when episode is missing', () => {
      const config: EmbedURLConfig = {
        tmdbId: 1399,
        contentType: 'tv',
        domain: 'vidsrc-embed.ru',
        season: 1,
      };

      expect(() => generator.generateTVURL(config)).toThrow(
        'Season and episode are required'
      );
    });

    it('should include subtitle language for TV', () => {
      const config: EmbedURLConfig = {
        tmdbId: 1399,
        contentType: 'tv',
        domain: 'vidsrc-embed.ru',
        season: 1,
        episode: 1,
        subtitleLanguage: 'de',
      };

      const url = generator.generateTVURL(config);

      expect(url).toContain('ds_lang=de');
    });

    it('should include autonext parameter when enabled', () => {
      const config: EmbedURLConfig = {
        tmdbId: 1399,
        contentType: 'tv',
        domain: 'vidsrc-embed.ru',
        season: 1,
        episode: 1,
        autonext: true,
      };

      const url = generator.generateTVURL(config);

      expect(url).toContain('autonext=1');
    });

    it('should not include autonext parameter when disabled', () => {
      const config: EmbedURLConfig = {
        tmdbId: 1399,
        contentType: 'tv',
        domain: 'vidsrc-embed.ru',
        season: 1,
        episode: 1,
        autonext: false,
      };

      const url = generator.generateTVURL(config);

      expect(url).not.toContain('autonext');
    });

    it('should include all TV parameters together', () => {
      const config: EmbedURLConfig = {
        tmdbId: 1399,
        contentType: 'tv',
        domain: 'vidsrc-embed.ru',
        season: 2,
        episode: 5,
        subtitleLanguage: 'pt',
        autoplay: true,
        autonext: true,
        customSubtitleUrl: 'https://example.com/subs.vtt',
      };

      const url = generator.generateTVURL(config);

      expect(url).toContain('tmdb=1399');
      expect(url).toContain('season=2');
      expect(url).toContain('episode=5');
      expect(url).toContain('ds_lang=pt');
      expect(url).toContain('autoplay=1');
      expect(url).toContain('autonext=1');
      expect(url).toContain('sub_url=');
    });
  });

  describe('validateTmdbId', () => {
    it('should accept positive integers', () => {
      expect(generator.validateTmdbId(1)).toBe(true);
      expect(generator.validateTmdbId(550)).toBe(true);
      expect(generator.validateTmdbId(2147483647)).toBe(true);
    });

    it('should reject zero', () => {
      expect(() => generator.validateTmdbId(0)).toThrow('Invalid TMDB ID');
    });

    it('should reject negative numbers', () => {
      expect(() => generator.validateTmdbId(-1)).toThrow('Invalid TMDB ID');
      expect(() => generator.validateTmdbId(-550)).toThrow('Invalid TMDB ID');
    });

    it('should reject non-integers', () => {
      expect(() => generator.validateTmdbId(550.5)).toThrow('Invalid TMDB ID');
      expect(() => generator.validateTmdbId(1.1)).toThrow('Invalid TMDB ID');
    });

    it('should reject IDs exceeding max value', () => {
      expect(() => generator.validateTmdbId(2147483648)).toThrow(
        'Invalid TMDB ID'
      );
    });
  });

  describe('validateDomain', () => {
    it('should accept whitelisted domains', () => {
      expect(generator.validateDomain('vidsrc-embed.ru')).toBe(true);
      expect(generator.validateDomain('vidsrc-embed.su')).toBe(true);
      expect(generator.validateDomain('vidsrcme.su')).toBe(true);
      expect(generator.validateDomain('vsrc.su')).toBe(true);
    });

    it('should accept domains with different casing', () => {
      expect(generator.validateDomain('VIDSRC-EMBED.RU')).toBe(true);
      expect(generator.validateDomain('VidsrcMe.Su')).toBe(true);
    });

    it('should accept domains with whitespace', () => {
      expect(generator.validateDomain('  vidsrc-embed.ru  ')).toBe(true);
    });

    it('should throw error for non-whitelisted domains', () => {
      expect(() => generator.validateDomain('invalid-domain.com')).toThrow(
        'Invalid domain'
      );
      expect(() => generator.validateDomain('example.com')).toThrow(
        'Invalid domain'
      );
    });
  });

  describe('parseEmbedURL', () => {
    it('should parse a valid movie URL', () => {
      const url = 'https://vidsrc-embed.ru/embed/movie?tmdb=550';
      const parsed = generator.parseEmbedURL(url);

      expect(parsed.domain).toBe('vidsrc-embed.ru');
      expect(parsed.contentType).toBe('movie');
      expect(parsed.tmdbId).toBe(550);
    });

    it('should parse a valid TV URL with season and episode', () => {
      const url =
        'https://vidsrc-embed.ru/embed/tv?tmdb=1399&season=1&episode=5';
      const parsed = generator.parseEmbedURL(url);

      expect(parsed.domain).toBe('vidsrc-embed.ru');
      expect(parsed.contentType).toBe('tv');
      expect(parsed.tmdbId).toBe(1399);
      expect(parsed.season).toBe(1);
      expect(parsed.episode).toBe(5);
    });

    it('should parse optional parameters', () => {
      const url =
        'https://vidsrc-embed.ru/embed/movie?tmdb=550&ds_lang=es&autoplay=1&sub_url=https%3A%2F%2Fexample.com%2Fsubs.vtt';
      const parsed = generator.parseEmbedURL(url);

      expect(parsed.subtitleLanguage).toBe('es');
      expect(parsed.autoplay).toBe(true);
      expect(parsed.customSubtitleUrl).toBe('https://example.com/subs.vtt');
    });

    it('should parse autonext parameter for TV', () => {
      const url =
        'https://vidsrc-embed.ru/embed/tv?tmdb=1399&season=1&episode=1&autonext=1';
      const parsed = generator.parseEmbedURL(url);

      expect(parsed.autonext).toBe(true);
    });

    it('should throw error for invalid domain', () => {
      const url = 'https://invalid-domain.com/embed/movie?tmdb=550';

      expect(() => generator.parseEmbedURL(url)).toThrow('Invalid domain');
    });

    it('should throw error for missing TMDB ID', () => {
      const url = 'https://vidsrc-embed.ru/embed/movie';

      expect(() => generator.parseEmbedURL(url)).toThrow(
        'Missing required parameter: tmdb'
      );
    });

    it('should throw error for invalid TMDB ID', () => {
      const url = 'https://vidsrc-embed.ru/embed/movie?tmdb=-1';

      expect(() => generator.parseEmbedURL(url)).toThrow('Invalid TMDB ID');
    });

    it('should throw error for TV URL missing season', () => {
      const url = 'https://vidsrc-embed.ru/embed/tv?tmdb=1399&episode=1';

      expect(() => generator.parseEmbedURL(url)).toThrow(
        'Missing required parameters for TV content'
      );
    });

    it('should throw error for TV URL missing episode', () => {
      const url = 'https://vidsrc-embed.ru/embed/tv?tmdb=1399&season=1';

      expect(() => generator.parseEmbedURL(url)).toThrow(
        'Missing required parameters for TV content'
      );
    });

    it('should throw error for invalid URL path', () => {
      const url = 'https://vidsrc-embed.ru/invalid/path?tmdb=550';

      expect(() => generator.parseEmbedURL(url)).toThrow('Invalid URL path');
    });

    it('should parse all parameters correctly', () => {
      const url =
        'https://vidsrc-embed.ru/embed/tv?tmdb=1399&season=2&episode=5&ds_lang=fr&autoplay=1&autonext=1&sub_url=https%3A%2F%2Fexample.com%2Fsubs.vtt';
      const parsed = generator.parseEmbedURL(url);

      expect(parsed.domain).toBe('vidsrc-embed.ru');
      expect(parsed.contentType).toBe('tv');
      expect(parsed.tmdbId).toBe(1399);
      expect(parsed.season).toBe(2);
      expect(parsed.episode).toBe(5);
      expect(parsed.subtitleLanguage).toBe('fr');
      expect(parsed.autoplay).toBe(true);
      expect(parsed.autonext).toBe(true);
      expect(parsed.customSubtitleUrl).toBe('https://example.com/subs.vtt');
    });
  });

  describe('Round-trip URL generation and parsing', () => {
    it('should preserve all parameters in movie URL round-trip', () => {
      const config: EmbedURLConfig = {
        tmdbId: 550,
        contentType: 'movie',
        domain: 'vidsrc-embed.ru',
        subtitleLanguage: 'es',
        autoplay: true,
        customSubtitleUrl: 'https://example.com/subs.vtt',
      };

      const url = generator.generateMovieURL(config);
      const parsed = generator.parseEmbedURL(url);

      expect(parsed.tmdbId).toBe(config.tmdbId);
      expect(parsed.contentType).toBe(config.contentType);
      expect(parsed.domain).toBe(config.domain);
      expect(parsed.subtitleLanguage).toBe(config.subtitleLanguage);
      expect(parsed.autoplay).toBe(config.autoplay);
      expect(parsed.customSubtitleUrl).toBe(config.customSubtitleUrl);
    });

    it('should preserve all parameters in TV URL round-trip', () => {
      const config: EmbedURLConfig = {
        tmdbId: 1399,
        contentType: 'tv',
        domain: 'vidsrc-embed.su',
        season: 2,
        episode: 5,
        subtitleLanguage: 'de',
        autoplay: true,
        autonext: true,
        customSubtitleUrl: 'https://example.com/subs.vtt',
      };

      const url = generator.generateTVURL(config);
      const parsed = generator.parseEmbedURL(url);

      expect(parsed.tmdbId).toBe(config.tmdbId);
      expect(parsed.contentType).toBe(config.contentType);
      expect(parsed.domain).toBe(config.domain);
      expect(parsed.season).toBe(config.season);
      expect(parsed.episode).toBe(config.episode);
      expect(parsed.subtitleLanguage).toBe(config.subtitleLanguage);
      expect(parsed.autoplay).toBe(config.autoplay);
      expect(parsed.autonext).toBe(config.autonext);
      expect(parsed.customSubtitleUrl).toBe(config.customSubtitleUrl);
    });

    it('should handle round-trip with minimal parameters', () => {
      const config: EmbedURLConfig = {
        tmdbId: 550,
        contentType: 'movie',
        domain: 'vidsrcme.su',
      };

      const url = generator.generateMovieURL(config);
      const parsed = generator.parseEmbedURL(url);

      expect(parsed.tmdbId).toBe(config.tmdbId);
      expect(parsed.contentType).toBe(config.contentType);
      expect(parsed.domain).toBe(config.domain);
      expect(parsed.subtitleLanguage).toBeUndefined();
      expect(parsed.autoplay).toBeUndefined();
      expect(parsed.customSubtitleUrl).toBeUndefined();
    });

    it('should be idempotent: generate -> parse -> generate should produce equivalent URL', () => {
      const config: EmbedURLConfig = {
        tmdbId: 550,
        contentType: 'movie',
        domain: 'vidsrc-embed.ru',
        subtitleLanguage: 'fr',
        autoplay: true,
      };

      const url1 = generator.generateMovieURL(config);
      const parsed1 = generator.parseEmbedURL(url1);

      // Reconstruct config from parsed data
      const config2: EmbedURLConfig = {
        tmdbId: parsed1.tmdbId,
        contentType: parsed1.contentType,
        domain: parsed1.domain,
        subtitleLanguage: parsed1.subtitleLanguage,
        autoplay: parsed1.autoplay,
        customSubtitleUrl: parsed1.customSubtitleUrl,
      };

      const url2 = generator.generateMovieURL(config2);
      const parsed2 = generator.parseEmbedURL(url2);

      expect(parsed2.tmdbId).toBe(parsed1.tmdbId);
      expect(parsed2.contentType).toBe(parsed1.contentType);
      expect(parsed2.domain).toBe(parsed1.domain);
      expect(parsed2.subtitleLanguage).toBe(parsed1.subtitleLanguage);
      expect(parsed2.autoplay).toBe(parsed1.autoplay);
    });
  });
});
