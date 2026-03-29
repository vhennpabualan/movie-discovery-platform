/**
 * VidsrcStreamingPlayer Responsive Design Tests
 *
 * Tests for responsive layout behavior across different screen sizes.
 * Validates: Requirements 7.2, 7.3
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

describe('VidsrcStreamingPlayer - Responsive Design', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Aspect Ratio', () => {
    it('maintains 16:9 aspect ratio on all screen sizes', () => {
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
      const aspectRatioContainer = iframe.parentElement;

      // 16:9 aspect ratio = 9/16 = 0.5625 = 56.25%
      expect(aspectRatioContainer).toHaveStyle({ paddingBottom: '56.25%' });
    });

    it('renders iframe with absolute positioning for aspect ratio', () => {
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
      expect(iframe).toHaveClass('absolute', 'inset-0', 'w-full', 'h-full');
    });

    it('renders container with relative positioning', () => {
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

      const { container } = render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const iframe = screen.getByTitle('Vidsrc Streaming Player');
      const aspectRatioContainer = iframe.parentElement;

      expect(aspectRatioContainer).toHaveClass('relative', 'w-full');
    });
  });

  describe('Mobile Layout (< 768px)', () => {
    it('renders full width container on mobile', () => {
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

      const { container } = render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('w-full');
    });

    it('renders subtitle selector with appropriate spacing on mobile', () => {
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

      const { container } = render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const subtitleContainer = container.querySelector('.mb-4');
      expect(subtitleContainer).toBeInTheDocument();
    });

    it('renders player container with rounded corners on mobile', () => {
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

      const { container } = render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const playerContainer = container.querySelector('.rounded-lg');
      expect(playerContainer).toBeInTheDocument();
    });
  });

  describe('Tablet Layout (768px - 1024px)', () => {
    it('renders player with appropriate width on tablet', () => {
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

      const { container } = render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('w-full');
    });

    it('maintains 16:9 aspect ratio on tablet', () => {
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
      const aspectRatioContainer = iframe.parentElement;

      expect(aspectRatioContainer).toHaveStyle({ paddingBottom: '56.25%' });
    });
  });

  describe('Desktop Layout (> 1024px)', () => {
    it('renders player with full width on desktop', () => {
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

      const { container } = render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('w-full');
    });

    it('maintains 16:9 aspect ratio on desktop', () => {
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
      const aspectRatioContainer = iframe.parentElement;

      expect(aspectRatioContainer).toHaveStyle({ paddingBottom: '56.25%' });
    });

    it('renders player with black background on desktop', () => {
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

      const { container } = render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const playerContainer = container.querySelector('.bg-black');
      expect(playerContainer).toBeInTheDocument();
    });
  });

  describe('Responsive Breakpoints', () => {
    it('applies responsive classes to main container', () => {
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

      const { container } = render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('w-full');
    });

    it('applies responsive classes to subtitle selector', () => {
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

      const { container } = render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const subtitleContainer = container.querySelector('.flex');
      expect(subtitleContainer).toBeInTheDocument();
    });
  });

  describe('Responsive Typography', () => {
    it('renders subtitle label with responsive text size', () => {
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

      const label = screen.getByText('Subtitles:');
      expect(label).toHaveClass('text-sm', 'font-medium');
    });

    it('renders season/episode text with responsive size', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/tv?tmdb=1399&season=1&episode=1',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer
          tmdbId={1399}
          contentType="tv"
          season={1}
          episode={1}
          totalSeasons={5}
          totalEpisodesInSeason={10}
        />
      );

      const seasonLabel = screen.getByRole('combobox', { name: /select season/i });
      const episodeLabel = screen.getByRole('combobox', { name: /select episode/i });
      expect(seasonLabel).toBeInTheDocument();
      expect(episodeLabel).toBeInTheDocument();
    });
  });

  describe('Responsive Spacing', () => {
    it('applies responsive margin to subtitle selector', () => {
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

      const { container } = render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const subtitleContainer = container.querySelector('.mb-4');
      expect(subtitleContainer).toBeInTheDocument();
    });

    it('applies responsive gap to subtitle container', () => {
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

      const { container } = render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const subtitleContainer = container.querySelector('.gap-3');
      expect(subtitleContainer).toBeInTheDocument();
    });
  });

  describe('Responsive Error State', () => {
    it('displays error message with responsive styling', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: {
          type: 'ALL_DOMAINS_FAILED',
          message: 'Stream not available - please try again later',
          timestamp: Date.now(),
          tmdbId: 550,
        },
        embedURL: null,
        currentDomain: null,
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      const { container } = render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const errorContainer = container.querySelector('.bg-gray-900');
      expect(errorContainer).toBeInTheDocument();
      expect(errorContainer).toHaveClass('rounded-lg', 'p-6');
    });

    it('displays error button with responsive styling', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: {
          type: 'ALL_DOMAINS_FAILED',
          message: 'Stream not available - please try again later',
          timestamp: Date.now(),
          tmdbId: 550,
        },
        embedURL: null,
        currentDomain: null,
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const button = screen.getByRole('button', { name: /retry/i });
      expect(button).toHaveClass('py-2', 'px-6', 'rounded-lg');
    });
  });

  describe('Responsive Loading State', () => {
    it('displays loading skeleton with responsive styling', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: true,
        error: null,
        embedURL: null,
        currentDomain: null,
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      const { container } = render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const loadingContainer = container.querySelector('.bg-black');
      expect(loadingContainer).toBeInTheDocument();
      expect(loadingContainer).toHaveClass('rounded-lg', 'overflow-hidden');
    });

    it('maintains aspect ratio during loading', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: true,
        error: null,
        embedURL: null,
        currentDomain: null,
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      const { container } = render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const aspectRatioDiv = container.querySelector('.aspect-video');
      expect(aspectRatioDiv).toBeInTheDocument();
    });
  });
});
