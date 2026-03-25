/**
 * VidsrcStreamingPlayer Security Tests
 *
 * Tests for security features including iframe sandbox configuration,
 * referrer policy enforcement, and URL validation.
 *
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4
 */

import { render, screen } from '@testing-library/react';
import { VidsrcStreamingPlayer } from './VidsrcStreamingPlayer';
import * as useVidsrcPlayerModule from '../hooks/useVidsrcPlayer';
import * as useSubtitlePreferenceModule from '../hooks/useSubtitlePreference';

// Mock the hooks
jest.mock('../hooks/useVidsrcPlayer');
jest.mock('../hooks/useSubtitlePreference');

const mockUseVidsrcPlayer = useVidsrcPlayerModule.useVidsrcPlayer as jest.Mock;
const mockUseSubtitlePreference =
  useSubtitlePreferenceModule.useSubtitlePreference as jest.Mock;

describe('VidsrcStreamingPlayer - Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Iframe Sandbox Attributes', () => {
    it('has exactly the required sandbox attributes', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      const sandboxAttr = iframe.getAttribute('sandbox');

      // Verify exact sandbox attributes
      expect(sandboxAttr).toBe(
        'allow-scripts allow-same-origin allow-popups allow-presentation'
      );
    });

    it('does NOT include allow-top-navigation', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      const sandboxAttr = iframe.getAttribute('sandbox');

      expect(sandboxAttr).not.toContain('allow-top-navigation');
    });

    it('does NOT include allow-same-origin-by-default', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      const sandboxAttr = iframe.getAttribute('sandbox');

      // Verify that only the required attributes are present
      const attributes = sandboxAttr?.split(' ') || [];
      expect(attributes).toContain('allow-scripts');
      expect(attributes).toContain('allow-same-origin');
      expect(attributes).toContain('allow-popups');
      expect(attributes).toContain('allow-presentation');
      expect(attributes.length).toBe(4);
    });

    it('includes allow-scripts for video player functionality', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      const sandboxAttr = iframe.getAttribute('sandbox');

      expect(sandboxAttr).toContain('allow-scripts');
    });

    it('includes allow-same-origin for player resources', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      const sandboxAttr = iframe.getAttribute('sandbox');

      expect(sandboxAttr).toContain('allow-same-origin');
    });

    it('includes allow-popups for external links', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      const sandboxAttr = iframe.getAttribute('sandbox');

      expect(sandboxAttr).toContain('allow-popups');
    });

    it('includes allow-presentation for fullscreen mode', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      const sandboxAttr = iframe.getAttribute('sandbox');

      expect(sandboxAttr).toContain('allow-presentation');
    });
  });

  describe('Referrer Policy', () => {
    it('sets referrerPolicy to no-referrer', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      expect(iframe).toHaveAttribute('referrerPolicy', 'no-referrer');
    });

    it('prevents referrer leakage to external domains', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      const referrerPolicy = iframe.getAttribute('referrerPolicy');

      // Verify it's set to no-referrer (most restrictive)
      expect(referrerPolicy).toBe('no-referrer');
      expect(referrerPolicy).not.toBe('no-referrer-when-downgrade');
      expect(referrerPolicy).not.toBe('same-origin');
      expect(referrerPolicy).not.toBe('origin');
    });
  });

  describe('URL Security', () => {
    it('renders iframe with HTTPS URL only', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      const src = iframe.getAttribute('src');

      expect(src).toMatch(/^https:\/\//);
      expect(src).not.toMatch(/^http:\/\//);
    });

    it('renders iframe with whitelisted domain', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      const src = iframe.getAttribute('src');

      const allowedDomains = [
        'vidsrc-embed.ru',
        'vidsrc-embed.su',
        'vidsrcme.su',
        'vsrc.su',
      ];

      const isWhitelisted = allowedDomains.some((domain) =>
        src?.includes(domain)
      );

      expect(isWhitelisted).toBe(true);
    });

    it('renders iframe with /embed/ path', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      const src = iframe.getAttribute('src');

      expect(src).toContain('/embed/');
    });

    it('renders iframe with tmdb parameter', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      const src = iframe.getAttribute('src');

      expect(src).toContain('tmdb=');
    });
  });

  describe('Iframe Isolation', () => {
    it('renders iframe with border-0 to prevent frame manipulation', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      expect(iframe).toHaveClass('border-0');
    });

    it('renders iframe with rounded-lg for visual consistency', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      expect(iframe).toHaveClass('rounded-lg');
    });

    it('renders iframe with allowFullScreen attribute', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      expect(iframe).toHaveAttribute('allowFullScreen');
    });
  });
});
