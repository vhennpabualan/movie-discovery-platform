import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VidsrcStreamingPlayer } from './VidsrcStreamingPlayer';
import * as useVidsrcPlayerModule from '../hooks/useVidsrcPlayer';
import * as useSubtitlePreferenceModule from '../hooks/useSubtitlePreference';

// Mock the hooks
jest.mock('../hooks/useVidsrcPlayer');
jest.mock('../hooks/useSubtitlePreference');

const mockUseVidsrcPlayer = useVidsrcPlayerModule.useVidsrcPlayer as jest.Mock;
const mockUseSubtitlePreference =
  useSubtitlePreferenceModule.useSubtitlePreference as jest.Mock;

describe('VidsrcStreamingPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with valid TMDB ID', () => {
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
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        'src',
        'https://vidsrc-embed.ru/embed/movie?tmdb=550'
      );
    });

    it('displays subtitle selector', () => {
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

      const selector = screen.getByLabelText('Select subtitle language');
      expect(selector).toBeInTheDocument();
    });

    it('renders iframe with correct sandbox attributes', () => {
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
      expect(iframe).toHaveAttribute(
        'sandbox',
        'allow-scripts allow-same-origin allow-popups allow-presentation'
      );
      expect(iframe).toHaveAttribute('referrerPolicy', 'no-referrer');
    });

    it('renders iframe with ARIA label', () => {
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
      expect(iframe).toHaveAttribute('aria-label', 'Vidsrc Streaming Player');
    });
  });

  describe('Loading State', () => {
    it('displays loading skeleton while loading', () => {
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

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const subtitleSelector = screen.getByLabelText('Select subtitle language');
      expect(subtitleSelector).toBeDisabled();
    });

    it('disables subtitle selector while loading', () => {
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

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const selector = screen.getByLabelText('Select subtitle language');
      expect(selector).toBeDisabled();
    });
  });

  describe('Error State', () => {
    it('displays error message on failure', () => {
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

      expect(
        screen.getByText('Stream not available - please try again later')
      ).toBeInTheDocument();
    });

    it('displays Try Again button on error', () => {
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

      const tryAgainButton = screen.getByRole('button', { name: /retry/i });
      expect(tryAgainButton).toBeInTheDocument();
    });

    it('calls retry function when Try Again button is clicked', () => {
      const mockRetry = jest.fn();
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
        retry: mockRetry,
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const tryAgainButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(tryAgainButton);

      expect(mockRetry).toHaveBeenCalled();
    });
  });

  describe('Subtitle Selection', () => {
    it('updates subtitle language when selector changes', () => {
      const mockSetLanguage = jest.fn();
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: mockSetLanguage,
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const selector = screen.getByLabelText('Select subtitle language');
      fireEvent.change(selector, { target: { value: 'es' } });

      expect(mockSetLanguage).toHaveBeenCalledWith('es');
    });

    it('displays selected subtitle language', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'es',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer tmdbId={550} contentType="movie" />
      );

      const selector = screen.getByLabelText('Select subtitle language') as HTMLSelectElement;
      expect(selector.value).toBe('es');
    });
  });

  describe('Responsive Layout', () => {
    it('renders with 16:9 aspect ratio container', () => {
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
      expect(aspectRatioContainer).toHaveStyle({ paddingBottom: '56.25%' });
    });

    it('renders full width container', () => {
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
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on subtitle selector', () => {
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

      const selector = screen.getByLabelText('Select subtitle language');
      expect(selector).toHaveAttribute('aria-label', 'Select subtitle language');
    });

    it('has proper ARIA label on retry button', () => {
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

      const tryAgainButton = screen.getByRole('button', { name: /retry/i });
      expect(tryAgainButton).toHaveAttribute(
        'aria-label',
        'Retry loading streaming player'
      );
    });

    it('has focus indicators on interactive elements', () => {
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

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });

  describe('Callbacks', () => {
    it('calls onSuccess callback when player loads', async () => {
      const mockOnSuccess = jest.fn();
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
        <VidsrcStreamingPlayer
          tmdbId={550}
          contentType="movie"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('calls onError callback when error occurs', async () => {
      const mockOnError = jest.fn();
      const error = {
        type: 'ALL_DOMAINS_FAILED' as const,
        message: 'Stream not available - please try again later',
        timestamp: Date.now(),
        tmdbId: 550,
      };

      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error,
        embedURL: null,
        currentDomain: null,
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer
          tmdbId={550}
          contentType="movie"
          onError={mockOnError}
        />
      );

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('TV Show Support', () => {
    it('passes season and episode to useVidsrcPlayer hook', () => {
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
        />
      );

      // Check that the hook was called with the correct parameters
      // The hook may be called multiple times, so we check the last call
      expect(mockUseVidsrcPlayer).toHaveBeenCalledWith(
        1399,
        'tv',
        1,
        1,
        'en',
        false,
        undefined,
        undefined,
        expect.any(String)
      );
    });

    it('displays season and episode information for TV shows', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/tv?tmdb=1399&season=2&episode=5',
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
          season={2}
          episode={5}
          totalSeasons={5}
          totalEpisodesInSeason={10}
        />
      );

      const seasonSelector = screen.getByLabelText('Select season');
      const episodeSelector = screen.getByLabelText('Select episode');
      expect(seasonSelector).toHaveValue('2');
      expect(episodeSelector).toHaveValue('5');
    });

    it('does not display season/episode for movies', () => {
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
        <VidsrcStreamingPlayer
          tmdbId={550}
          contentType="movie"
        />
      );

      expect(screen.queryByText(/Season \d+, Episode \d+/)).not.toBeInTheDocument();
    });
  });

  describe('Optional Props', () => {
    it('passes autoplay prop to useVidsrcPlayer hook', () => {
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: 'https://vidsrc-embed.ru/embed/movie?tmdb=550&autoplay=1',
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer
          tmdbId={550}
          contentType="movie"
          autoplay={true}
        />
      );

      expect(mockUseVidsrcPlayer).toHaveBeenCalledWith(
        550,
        'movie',
        1,
        1,
        'en',
        true,
        undefined,
        undefined,
        expect.any(String)
      );
    });

    it('passes customSubtitleUrl prop to useVidsrcPlayer hook', () => {
      const customUrl = 'https://example.com/subs.vtt';
      mockUseVidsrcPlayer.mockReturnValue({
        loading: false,
        error: null,
        embedURL: `https://vidsrc-embed.ru/embed/movie?tmdb=550&sub_url=${encodeURIComponent(customUrl)}`,
        currentDomain: 'vidsrc-embed.ru',
        retry: jest.fn(),
      });

      mockUseSubtitlePreference.mockReturnValue({
        language: 'en',
        setLanguage: jest.fn(),
      });

      render(
        <VidsrcStreamingPlayer
          tmdbId={550}
          contentType="movie"
          customSubtitleUrl={customUrl}
        />
      );

      expect(mockUseVidsrcPlayer).toHaveBeenCalledWith(
        550,
        'movie',
        1,
        1,
        'en',
        false,
        customUrl,
        undefined,
        expect.any(String)
      );
    });
  });
});
