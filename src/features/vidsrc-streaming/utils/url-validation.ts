/**
 * URL Validation Utilities for Vidsrc Streaming
 *
 * This module provides functions for validating and sanitizing embed URLs
 * to ensure they meet security and format requirements before rendering
 * in iframes.
 *
 * Validates: Requirements 6.4, 13.1
 */

import type { DomainProvider } from '../types/index';

/**
 * List of whitelisted domains for Vidsrc embed URLs.
 * Only URLs from these domains will be considered valid.
 * Based on official Vidsrc API documentation.
 */
const ALLOWED_DOMAINS: DomainProvider[] = [
  'vidsrc.net',
  'embed.su',
  'multiembed.mov',
  'www.2embed.cc',
  'vidsrc-embed.ru',
  'vidsrc-embed.su',
  'vidsrcme.su',
  'vsrc.su',
  'vsembed.ru',
];

/**
 * Validates that an embed URL is safe to render in an iframe.
 *
 * Performs the following checks:
 * - URL scheme must be HTTPS (no HTTP or other schemes)
 * - Domain must be in the configured whitelist
 * - URL format must match the expected embed URL pattern
 *
 * @param url - The URL to validate
 * @returns true if the URL is valid and safe to render, false otherwise
 *
 * @example
 * ```typescript
 * isValidEmbedURL('https://vidsrc-embed.ru/embed/movie?tmdb=550');
 * // Returns: true
 *
 * isValidEmbedURL('http://vidsrc-embed.ru/embed/movie?tmdb=550');
 * // Returns: false (HTTP not allowed)
 *
 * isValidEmbedURL('https://malicious-domain.com/embed/movie?tmdb=550');
 * // Returns: false (domain not whitelisted)
 * ```
 */
export function isValidEmbedURL(url: string): boolean {
  try {
    // Parse the URL to validate format
    const parsedUrl = new URL(url);

    // Check that scheme is HTTPS
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }

    // Extract domain from hostname (remove www. if present)
    const domain = parsedUrl.hostname.toLowerCase();

    // Check if domain is in whitelist
    if (!ALLOWED_DOMAINS.includes(domain as DomainProvider)) {
      return false;
    }

    // multiembed.mov has unique format: /directstream.php?video_id=
    if (domain === 'multiembed.mov') {
      return parsedUrl.pathname.includes('/directstream.php') && 
             parsedUrl.searchParams.has('video_id');
    }

    // For path-based URLs (embed.su), validate path structure
    if (domain === 'embed.su') {
      // Path should be /embed/movie/{id} or /embed/tv/{id}/{season}/{episode}
      const pathParts = parsedUrl.pathname.split('/').filter(p => p);
      if (pathParts.length < 3) {
        return false; // Need at least: embed, type, id
      }
      return true;
    }

    // For 2embed.cc, validate path structure
    if (domain === '2embed.cc' || domain === 'www.2embed.cc') {
      // Path should be /embed/{id} or /embedtv/{id}
      const pathParts = parsedUrl.pathname.split('/').filter(p => p);
      if (pathParts.length < 2) {
        return false;
      }
      return true;
    }

    // Check that URL contains /embed/ path for query-based domains
    if (!parsedUrl.pathname.includes('/embed')) {
      return false;
    }

    // For query-based URLs (vidsrc.net + legacy mirrors), check tmdb parameter
    const tmdbParam = parsedUrl.searchParams.get('tmdb');
    if (!tmdbParam || tmdbParam.trim() === '') {
      return false;
    }

    return true;
  } catch {
    // If URL parsing fails, it's invalid
    return false;
  }
}

/**
 * Sanitizes an embed URL by removing suspicious patterns and validating format.
 *
 * Removes or rejects URLs containing:
 * - javascript: protocol
 * - data: protocol
 * - vbscript: protocol
 * - Other potentially malicious patterns
 *
 * @param url - The URL to sanitize
 * @returns The sanitized URL if valid, or throws an error if invalid
 * @throws Error if the URL contains suspicious patterns or fails validation
 *
 * @example
 * ```typescript
 * const clean = sanitizeEmbedURL('https://vidsrc-embed.ru/embed/movie?tmdb=550');
 * // Returns: 'https://vidsrc-embed.ru/embed/movie?tmdb=550'
 *
 * sanitizeEmbedURL('javascript:alert("xss")');
 * // Throws: Error
 *
 * sanitizeEmbedURL('data:text/html,<script>alert("xss")</script>');
 * // Throws: Error
 * ```
 */
export function sanitizeEmbedURL(url: string): string {
  // Check for suspicious protocols
  const suspiciousPatterns = [
    /^javascript:/i,
    /^data:/i,
    /^vbscript:/i,
    /^file:/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      throw new Error(
        `Suspicious URL pattern detected: ${url.substring(0, 50)}...`
      );
    }
  }

  // Validate the URL format
  if (!isValidEmbedURL(url)) {
    throw new Error(`Invalid embed URL: ${url}`);
  }

  // Return the validated URL
  return url;
}
