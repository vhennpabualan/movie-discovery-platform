/**
 * Logging Utilities Tests
 *
 * Tests for logging functions that track streaming events.
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4
 */

import {
  logURLGeneration,
  logDomainFailure,
  logSubtitleSelection,
} from './logging';

// Mock console.debug to capture log calls
const originalConsoleDebug = console.debug;
const originalEnv = process.env.NODE_ENV;
let debugCalls: any[] = [];

beforeAll(() => {
  process.env.NODE_ENV = 'development';
});

afterAll(() => {
  process.env.NODE_ENV = originalEnv;
});

beforeEach(() => {
  debugCalls = [];
  console.debug = jest.fn((...args) => {
    debugCalls.push(args);
  });
});

afterEach(() => {
  console.debug = originalConsoleDebug;
});

describe('Logging Utilities', () => {
  describe('logURLGeneration', () => {
    it('logs URL generation event with all required fields', () => {
      const params = {
        contentType: 'movie',
        subtitleLanguage: 'en',
        autoplay: false,
      };

      logURLGeneration(550, 'vidsrc-embed.ru', params);

      expect(debugCalls.length).toBeGreaterThan(0);
      const event = debugCalls[0][1];

      expect(event.type).toBe('vidsrc_url_generation');
      expect(event.timestamp).toBeDefined();
      expect(event.tmdbId).toBe(550);
      expect(event.domain).toBe('vidsrc-embed.ru');
      expect(event.parameters).toEqual(params);
    });

    it('includes timestamp in ISO format', () => {
      logURLGeneration(550, 'vidsrc-embed.ru', {});

      const event = debugCalls[0][1];
      const timestamp = new Date(event.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('logs with different domains', () => {
      const domains = [
        'vidsrc-embed.ru',
        'vidsrc-embed.su',
        'vidsrcme.su',
        'vsrc.su',
      ];

      domains.forEach((domain) => {
        debugCalls = [];
        logURLGeneration(550, domain, {});

        const event = debugCalls[0][1];
        expect(event.domain).toBe(domain);
      });
    });

    it('logs with various parameter combinations', () => {
      const paramSets = [
        { contentType: 'movie' },
        { contentType: 'tv', season: 1, episode: 1 },
        { contentType: 'movie', subtitleLanguage: 'es', autoplay: true },
        {
          contentType: 'tv',
          season: 2,
          episode: 5,
          subtitleLanguage: 'fr',
          customSubtitleUrl: 'https://example.com/subs.vtt',
          autonext: true,
        },
      ];

      paramSets.forEach((params) => {
        debugCalls = [];
        logURLGeneration(550, 'vidsrc-embed.ru', params);

        const event = debugCalls[0][1];
        expect(event.parameters).toEqual(params);
      });
    });

    it('logs with different TMDB IDs', () => {
      const tmdbIds = [1, 550, 1399, 2147483647];

      tmdbIds.forEach((tmdbId) => {
        debugCalls = [];
        logURLGeneration(tmdbId, 'vidsrc-embed.ru', {});

        const event = debugCalls[0][1];
        expect(event.tmdbId).toBe(tmdbId);
      });
    });
  });

  describe('logDomainFailure', () => {
    it('logs domain failure event with all required fields', () => {
      logDomainFailure('vidsrc-embed.ru', 'timeout', 0);

      expect(debugCalls.length).toBeGreaterThan(0);
      const event = debugCalls[0][1];

      expect(event.type).toBe('vidsrc_domain_failure');
      expect(event.timestamp).toBeDefined();
      expect(event.domain).toBe('vidsrc-embed.ru');
      expect(event.reason).toBe('timeout');
      expect(event.attemptNumber).toBe(0);
    });

    it('includes timestamp in ISO format', () => {
      logDomainFailure('vidsrc-embed.ru', 'timeout', 0);

      const event = debugCalls[0][1];
      const timestamp = new Date(event.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('logs with different failure reasons', () => {
      const reasons = [
        'timeout',
        'http_error_500',
        'http_error_404',
        'network_error',
        'invalid_response',
      ];

      reasons.forEach((reason) => {
        debugCalls = [];
        logDomainFailure('vidsrc-embed.ru', reason, 0);

        const event = debugCalls[0][1];
        expect(event.reason).toBe(reason);
      });
    });

    it('logs with different attempt numbers', () => {
      const attemptNumbers = [0, 1, 2, 3, 10];

      attemptNumbers.forEach((attemptNumber) => {
        debugCalls = [];
        logDomainFailure('vidsrc-embed.ru', 'timeout', attemptNumber);

        const event = debugCalls[0][1];
        expect(event.attemptNumber).toBe(attemptNumber);
      });
    });

    it('logs with different domains', () => {
      const domains = [
        'vidsrc-embed.ru',
        'vidsrc-embed.su',
        'vidsrcme.su',
        'vsrc.su',
      ];

      domains.forEach((domain) => {
        debugCalls = [];
        logDomainFailure(domain, 'timeout', 0);

        const event = debugCalls[0][1];
        expect(event.domain).toBe(domain);
      });
    });
  });

  describe('logSubtitleSelection', () => {
    it('logs subtitle selection event with all required fields', () => {
      logSubtitleSelection(550, 'es');

      expect(debugCalls.length).toBeGreaterThan(0);
      const event = debugCalls[0][1];

      expect(event.type).toBe('vidsrc_subtitle_selection');
      expect(event.timestamp).toBeDefined();
      expect(event.tmdbId).toBe(550);
      expect(event.language).toBe('es');
    });

    it('includes timestamp in ISO format', () => {
      logSubtitleSelection(550, 'en');

      const event = debugCalls[0][1];
      const timestamp = new Date(event.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('logs with all supported languages', () => {
      const languages = ['en', 'es', 'fr', 'de', 'pt', 'it', 'ru', 'ja', 'zh'];

      languages.forEach((language) => {
        debugCalls = [];
        logSubtitleSelection(550, language as any);

        const event = debugCalls[0][1];
        expect(event.language).toBe(language);
      });
    });

    it('logs with different TMDB IDs', () => {
      const tmdbIds = [1, 550, 1399, 2147483647];

      tmdbIds.forEach((tmdbId) => {
        debugCalls = [];
        logSubtitleSelection(tmdbId, 'en');

        const event = debugCalls[0][1];
        expect(event.tmdbId).toBe(tmdbId);
      });
    });
  });

  describe('Event Structure', () => {
    it('all events have consistent structure with type and timestamp', () => {
      const events = [];

      debugCalls = [];
      logURLGeneration(550, 'vidsrc-embed.ru', {});
      events.push(debugCalls[0][1]);

      debugCalls = [];
      logDomainFailure('vidsrc-embed.ru', 'timeout', 0);
      events.push(debugCalls[0][1]);

      debugCalls = [];
      logSubtitleSelection(550, 'en');
      events.push(debugCalls[0][1]);

      events.forEach((event) => {
        expect(event).toHaveProperty('type');
        expect(event).toHaveProperty('timestamp');
        expect(typeof event.type).toBe('string');
        expect(typeof event.timestamp).toBe('string');
      });
    });

    it('all events have unique types', () => {
      const types = new Set();

      debugCalls = [];
      logURLGeneration(550, 'vidsrc-embed.ru', {});
      types.add(debugCalls[0][1].type);

      debugCalls = [];
      logDomainFailure('vidsrc-embed.ru', 'timeout', 0);
      types.add(debugCalls[0][1].type);

      debugCalls = [];
      logSubtitleSelection(550, 'en');
      types.add(debugCalls[0][1].type);

      expect(types.size).toBe(3);
    });

    it('timestamps are in valid ISO 8601 format', () => {
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

      debugCalls = [];
      logURLGeneration(550, 'vidsrc-embed.ru', {});
      expect(debugCalls[0][1].timestamp).toMatch(isoRegex);

      debugCalls = [];
      logDomainFailure('vidsrc-embed.ru', 'timeout', 0);
      expect(debugCalls[0][1].timestamp).toMatch(isoRegex);

      debugCalls = [];
      logSubtitleSelection(550, 'en');
      expect(debugCalls[0][1].timestamp).toMatch(isoRegex);
    });
  });

  describe('Multiple Events', () => {
    it('logs multiple events in sequence', () => {
      logURLGeneration(550, 'vidsrc-embed.ru', { contentType: 'movie' });
      logDomainFailure('vidsrc-embed.ru', 'timeout', 0);
      logSubtitleSelection(550, 'es');

      expect(debugCalls.length).toBe(3);
      expect(debugCalls[0][1].type).toBe('vidsrc_url_generation');
      expect(debugCalls[1][1].type).toBe('vidsrc_domain_failure');
      expect(debugCalls[2][1].type).toBe('vidsrc_subtitle_selection');
    });

    it('maintains chronological order of events', () => {
      const timestamps = [];

      logURLGeneration(550, 'vidsrc-embed.ru', {});
      timestamps.push(new Date(debugCalls[0][1].timestamp).getTime());

      // Small delay to ensure different timestamps
      const start = Date.now();
      while (Date.now() - start < 1) {
        // Busy wait for at least 1ms
      }

      logDomainFailure('vidsrc-embed.ru', 'timeout', 0);
      timestamps.push(new Date(debugCalls[1][1].timestamp).getTime());

      // Verify timestamps are in order
      expect(timestamps[1]).toBeGreaterThanOrEqual(timestamps[0]);
    });
  });
});
