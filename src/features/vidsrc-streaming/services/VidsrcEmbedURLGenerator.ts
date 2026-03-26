/**
 * VidsrcEmbedURLGenerator Service
 *
 * Responsible for generating and parsing Vidsrc embed URLs with proper
 * parameter encoding, validation, and round-trip preservation.
 */

import type {
  EmbedURLConfig,
  ParsedEmbedURL,
  DomainProvider,
  SubtitleLanguage,
} from '../types/index';

const ALLOWED_DOMAINS: DomainProvider[] = [
  'vidsrc-embed.ru',
  'vidsrc-embed.su',
  'vidsrcme.su',
  'vsrc.su',
];
const TMDB_ID_MIN = 1;
const TMDB_ID_MAX = 2147483647;

/**
 * VidsrcEmbedURLGenerator
 *
 * Service for generating and parsing Vidsrc embed URLs with proper
 * parameter encoding and validation.
 */
export class VidsrcEmbedURLGenerator {
  /**
   * Generates a movie embed URL
   *
   * @param config - Configuration for URL generation
   * @returns Generated embed URL
   * @throws Error if TMDB ID or domain is invalid
   */
  generateMovieURL(config: EmbedURLConfig): string {
    this.validateTmdbId(config.tmdbId);
    this.validateDomain(config.domain);

    const url = new URL(`https://${config.domain}/embed/movie`);
    url.searchParams.set('tmdb', config.tmdbId.toString());

    if (config.subtitleLanguage) {
      url.searchParams.set('ds_lang', config.subtitleLanguage);
    }

    if (config.autoplay) {
      url.searchParams.set('autoplay', '1');
    }

    if (config.customSubtitleUrl) {
      url.searchParams.set('sub_url', config.customSubtitleUrl);
    }

    return url.toString();
  }

  /**
   * Generates a TV show embed URL
   *
   * @param config - Configuration for URL generation
   * @returns Generated embed URL
   * @throws Error if TMDB ID, domain, season, or episode is invalid
   */
  generateTVURL(config: EmbedURLConfig): string {
    this.validateTmdbId(config.tmdbId);
    this.validateDomain(config.domain);

    if (config.season === undefined || config.episode === undefined) {
      throw new Error('Season and episode are required for TV content');
    }

    const url = new URL(`https://${config.domain}/embed/tv`);
    url.searchParams.set('tmdb', config.tmdbId.toString());
    url.searchParams.set('season', config.season.toString());
    url.searchParams.set('episode', config.episode.toString());

    if (config.subtitleLanguage) {
      url.searchParams.set('ds_lang', config.subtitleLanguage);
    }

    if (config.autoplay) {
      url.searchParams.set('autoplay', '1');
    }

    if (config.customSubtitleUrl) {
      url.searchParams.set('sub_url', config.customSubtitleUrl);
    }

    if (config.autonext) {
      url.searchParams.set('autonext', '1');
    }

    return url.toString();
  }

  /**
   * Validates a TMDB ID
   *
   * @param id - TMDB ID to validate
   * @returns true if valid
   * @throws Error if invalid
   */
  validateTmdbId(id: number): boolean {
    if (!Number.isInteger(id)) {
      throw new Error(`Invalid TMDB ID: must be an integer, got ${id}`);
    }

    if (id < TMDB_ID_MIN || id > TMDB_ID_MAX) {
      throw new Error(
        `Invalid TMDB ID: must be between ${TMDB_ID_MIN} and ${TMDB_ID_MAX}, got ${id}`
      );
    }

    return true;
  }

  /**
   * Validates a domain against the whitelist
   *
   * @param domain - Domain to validate
   * @returns true if domain is whitelisted
   * @throws Error if domain is not whitelisted
   */
  validateDomain(domain: string): boolean {
    const normalizedDomain = domain.toLowerCase().trim();
    if (!ALLOWED_DOMAINS.includes(normalizedDomain as DomainProvider)) {
      throw new Error(`Invalid domain: ${domain} is not whitelisted`);
    }
    return true;
  }

  /**
   * Parses an embed URL and extracts all parameters
   *
   * @param url - Embed URL to parse
   * @returns Parsed embed URL object
   * @throws Error if URL is invalid
   */
  parseEmbedURL(url: string): ParsedEmbedURL {
    try {
      const urlObj = new URL(url);

      // Extract and validate domain
      const domain = urlObj.hostname;
      if (!domain) {
        throw new Error('Invalid URL: no hostname found');
      }

      const normalizedDomain = domain.toLowerCase().trim();
      if (!ALLOWED_DOMAINS.includes(normalizedDomain as DomainProvider)) {
        throw new Error(`Invalid domain: ${domain}`);
      }

      // Extract content type from pathname
      const pathname = urlObj.pathname;
      const pathParts = pathname.split('/').filter(p => p);

      if (pathParts.length < 2 || pathParts[0] !== 'embed') {
        throw new Error(`Invalid URL path: ${pathname}`);
      }

      const contentType = pathParts[1] as 'movie' | 'tv';
      if (contentType !== 'movie' && contentType !== 'tv') {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      // Extract TMDB ID from query parameters
      const tmdbParam = urlObj.searchParams.get('tmdb');
      if (!tmdbParam) {
        throw new Error('Missing required parameter: tmdb');
      }

      const tmdbId = parseInt(tmdbParam, 10);
      this.validateTmdbId(tmdbId);

      // Extract season and episode for TV content
      let season: number | undefined;
      let episode: number | undefined;

      if (contentType === 'tv') {
        const seasonParam = urlObj.searchParams.get('season');
        const episodeParam = urlObj.searchParams.get('episode');

        if (!seasonParam || !episodeParam) {
          throw new Error(
            'Missing required parameters for TV content: season, episode'
          );
        }

        season = parseInt(seasonParam, 10);
        episode = parseInt(episodeParam, 10);

        if (!Number.isInteger(season) || !Number.isInteger(episode)) {
          throw new Error('Season and episode must be integers');
        }
      }

      // Extract optional parameters from query string
      const subtitleLanguage = urlObj.searchParams.get('ds_lang') as
        | SubtitleLanguage
        | null;
      const autoplayStr = urlObj.searchParams.get('autoplay');
      const autoplay = autoplayStr === '1';
      const customSubtitleUrl = urlObj.searchParams.get('sub_url');
      const autonextStr = urlObj.searchParams.get('autonext');
      const autonext = autonextStr === '1';

      return {
        domain: normalizedDomain as DomainProvider,
        contentType,
        tmdbId,
        season,
        episode,
        subtitleLanguage: subtitleLanguage || undefined,
        autoplay: autoplay || undefined,
        customSubtitleUrl: customSubtitleUrl || undefined,
        autonext: autonext || undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse embed URL: ${error.message}`);
      }
      throw new Error('Failed to parse embed URL: unknown error');
    }
  }
}
