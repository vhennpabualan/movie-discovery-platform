import { renderHook, act, waitFor } from '@testing-library/react';
import { useVidsrcPlayer } from './useVidsrcPlayer';
import { VidsrcConfigurationManager } from '../services/VidsrcConfigurationManager';
import { VidsrcEmbedURLGenerator } from '../services/VidsrcEmbedURLGenerator';

// Mock the services
jest.mock('../services/VidsrcConfigurationManager');
jest.mock('../services/VidsrcEmbedURLGenerator');

describe('useVidsrcPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate movie URL on mount', async () => {
    const mockManager = {
      getNextDomain: jest.fn().mockReturnValue('vidsrc-embed.ru'),
      resetDomains: jest.fn(),
    };
    const mockGenerator = {
      validateTmdbId: jest.fn(),
      generateMovieURL: jest.fn().mockReturnValue('https://vidsrc-embed.ru/embed/movie?tmdb=550'),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);
    (VidsrcEmbedURLGenerator as jest.Mock).mockImplementation(() => mockGenerator);

    const { result } = renderHook(() => useVidsrcPlayer(550, 'movie'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.embedURL).toBe('https://vidsrc-embed.ru/embed/movie?tmdb=550');
    expect(result.current.currentDomain).toBe('vidsrc-embed.ru');
    expect(result.current.error).toBeNull();
  });

  it('should generate TV URL with season and episode', async () => {
    const mockManager = {
      getNextDomain: jest.fn().mockReturnValue('vidsrc-embed.su'),
      resetDomains: jest.fn(),
    };
    const mockGenerator = {
      validateTmdbId: jest.fn(),
      generateTVURL: jest
        .fn()
        .mockReturnValue('https://vidsrc-embed.su/embed/tv?tmdb=1399&season=1&episode=1'),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);
    (VidsrcEmbedURLGenerator as jest.Mock).mockImplementation(() => mockGenerator);

    const { result } = renderHook(() => useVidsrcPlayer(1399, 'tv', 1, 1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.embedURL).toBe('https://vidsrc-embed.su/embed/tv?tmdb=1399&season=1&episode=1');
    expect(result.current.currentDomain).toBe('vidsrc-embed.su');
  });

  it('should handle invalid TMDB ID error', async () => {
    const mockManager = {
      getNextDomain: jest.fn().mockReturnValue('vidsrc-embed.ru'),
      resetDomains: jest.fn(),
    };
    const mockGenerator = {
      validateTmdbId: jest.fn().mockImplementation(() => {
        throw new Error('Invalid TMDB ID: must be a positive integer');
      }),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);
    (VidsrcEmbedURLGenerator as jest.Mock).mockImplementation(() => mockGenerator);

    const { result } = renderHook(() => useVidsrcPlayer(-1, 'movie'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.type).toBe('INVALID_TMDB_ID');
    expect(result.current.error?.message).toBe('Invalid movie ID - streaming unavailable');
    expect(result.current.embedURL).toBeNull();
  });

  it('should handle all domains failed error', async () => {
    const mockManager = {
      getNextDomain: jest.fn().mockReturnValue(null),
      resetDomains: jest.fn(),
    };
    const mockGenerator = {
      validateTmdbId: jest.fn(),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);
    (VidsrcEmbedURLGenerator as jest.Mock).mockImplementation(() => mockGenerator);

    const { result } = renderHook(() => useVidsrcPlayer(550, 'movie'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.type).toBe('ALL_DOMAINS_FAILED');
    expect(result.current.error?.message).toBe('Stream not available - please try again later');
    expect(result.current.embedURL).toBeNull();
  });

  it('should retry and reset domains', async () => {
    const mockManager = {
      getNextDomain: jest
        .fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce('vidsrc-embed.ru'),
      resetDomains: jest.fn(),
    };
    const mockGenerator = {
      validateTmdbId: jest.fn(),
      generateMovieURL: jest.fn().mockReturnValue('https://vidsrc-embed.ru/embed/movie?tmdb=550'),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);
    (VidsrcEmbedURLGenerator as jest.Mock).mockImplementation(() => mockGenerator);

    const { result } = renderHook(() => useVidsrcPlayer(550, 'movie'));

    // Wait for initial error state
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    // Call retry
    act(() => {
      result.current.retry();
    });

    // Wait for retry to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockManager.resetDomains).toHaveBeenCalled();
    expect(result.current.embedURL).toBe('https://vidsrc-embed.ru/embed/movie?tmdb=550');
    expect(result.current.error).toBeNull();
  });

  it('should include subtitle language in URL', async () => {
    const mockManager = {
      getNextDomain: jest.fn().mockReturnValue('vidsrc-embed.ru'),
      resetDomains: jest.fn(),
    };
    const mockGenerator = {
      validateTmdbId: jest.fn(),
      generateMovieURL: jest
        .fn()
        .mockReturnValue('https://vidsrc-embed.ru/embed/movie?tmdb=550&ds_lang=es'),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);
    (VidsrcEmbedURLGenerator as jest.Mock).mockImplementation(() => mockGenerator);

    const { result } = renderHook(() => useVidsrcPlayer(550, 'movie', undefined, undefined, 'es'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.embedURL).toContain('ds_lang=es');
  });

  it('should include autoplay parameter in URL', async () => {
    const mockManager = {
      getNextDomain: jest.fn().mockReturnValue('vidsrc-embed.ru'),
      resetDomains: jest.fn(),
    };
    const mockGenerator = {
      validateTmdbId: jest.fn(),
      generateMovieURL: jest
        .fn()
        .mockReturnValue('https://vidsrc-embed.ru/embed/movie?tmdb=550&autoplay=1'),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);
    (VidsrcEmbedURLGenerator as jest.Mock).mockImplementation(() => mockGenerator);

    const { result } = renderHook(() => useVidsrcPlayer(550, 'movie', undefined, undefined, undefined, true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.embedURL).toContain('autoplay=1');
  });
});
