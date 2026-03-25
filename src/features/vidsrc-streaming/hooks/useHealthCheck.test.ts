import { renderHook, act, waitFor } from '@testing-library/react';
import { useHealthCheck } from './useHealthCheck';
import { VidsrcConfigurationManager } from '../services/VidsrcConfigurationManager';

// Mock the configuration manager
jest.mock('../services/VidsrcConfigurationManager');

describe('useHealthCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with healthy status', () => {
    const mockManager = {
      performHealthCheck: jest.fn().mockResolvedValue(undefined),
      getDomainStatuses: jest.fn().mockReturnValue([
        { domain: 'vidsrc-embed.ru', isHealthy: true, failureCount: 0 },
      ]),
      stopHealthChecks: jest.fn(),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);

    const { result } = renderHook(() => useHealthCheck());

    expect(result.current.isHealthy).toBe(true);
  });

  it('should perform initial health check on mount', async () => {
    const mockManager = {
      performHealthCheck: jest.fn().mockResolvedValue(undefined),
      getDomainStatuses: jest.fn().mockReturnValue([
        { domain: 'vidsrc-embed.ru', isHealthy: true, failureCount: 0 },
      ]),
      stopHealthChecks: jest.fn(),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);

    renderHook(() => useHealthCheck());

    await waitFor(() => {
      expect(mockManager.performHealthCheck).toHaveBeenCalled();
    });
  });

  it('should set lastCheckTime after health check', async () => {
    const mockManager = {
      performHealthCheck: jest.fn().mockResolvedValue(undefined),
      getDomainStatuses: jest.fn().mockReturnValue([
        { domain: 'vidsrc-embed.ru', isHealthy: true, failureCount: 0 },
      ]),
      stopHealthChecks: jest.fn(),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);

    const { result } = renderHook(() => useHealthCheck());

    await waitFor(() => {
      expect(result.current.lastCheckTime).not.toBeNull();
    });

    expect(typeof result.current.lastCheckTime).toBe('number');
  });

  it('should schedule periodic health checks every 5 minutes', async () => {
    const mockManager = {
      performHealthCheck: jest.fn().mockResolvedValue(undefined),
      getDomainStatuses: jest.fn().mockReturnValue([
        { domain: 'vidsrc-embed.ru', isHealthy: true, failureCount: 0 },
      ]),
      stopHealthChecks: jest.fn(),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);

    renderHook(() => useHealthCheck());

    // Initial call
    await waitFor(() => {
      expect(mockManager.performHealthCheck).toHaveBeenCalledTimes(1);
    });
  });

  it('should update health status based on domain statuses', async () => {
    const mockManager = {
      performHealthCheck: jest.fn().mockResolvedValue(undefined),
      getDomainStatuses: jest
        .fn()
        .mockReturnValueOnce([
          { domain: 'vidsrc-embed.ru', isHealthy: true, failureCount: 0 },
        ])
        .mockReturnValueOnce([
          { domain: 'vidsrc-embed.ru', isHealthy: false, failureCount: 3 },
        ]),
      stopHealthChecks: jest.fn(),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);

    const { result } = renderHook(() => useHealthCheck());

    await waitFor(() => {
      expect(result.current.isHealthy).toBe(true);
    });
  });

  it('should mark as unhealthy if all domains are unhealthy', async () => {
    const mockManager = {
      performHealthCheck: jest.fn().mockResolvedValue(undefined),
      getDomainStatuses: jest.fn().mockReturnValue([
        { domain: 'vidsrc-embed.ru', isHealthy: false, failureCount: 3 },
        { domain: 'vidsrc-embed.su', isHealthy: false, failureCount: 3 },
        { domain: 'vidsrcme.su', isHealthy: false, failureCount: 3 },
        { domain: 'vsrc.su', isHealthy: false, failureCount: 3 },
      ]),
      stopHealthChecks: jest.fn(),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);

    const { result } = renderHook(() => useHealthCheck());

    await waitFor(() => {
      expect(result.current.isHealthy).toBe(false);
    });
  });

  it('should clear interval on unmount', async () => {
    const mockManager = {
      performHealthCheck: jest.fn().mockResolvedValue(undefined),
      getDomainStatuses: jest.fn().mockReturnValue([
        { domain: 'vidsrc-embed.ru', isHealthy: true, failureCount: 0 },
      ]),
      stopHealthChecks: jest.fn(),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);

    const { unmount } = renderHook(() => useHealthCheck());

    await waitFor(() => {
      expect(mockManager.performHealthCheck).toHaveBeenCalled();
    });

    unmount();

    expect(mockManager.stopHealthChecks).toHaveBeenCalled();
  });

  it('should handle health check errors gracefully', async () => {
    const mockManager = {
      performHealthCheck: jest.fn().mockRejectedValue(new Error('Health check failed')),
      getDomainStatuses: jest.fn().mockReturnValue([
        { domain: 'vidsrc-embed.ru', isHealthy: true, failureCount: 0 },
      ]),
      stopHealthChecks: jest.fn(),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    renderHook(() => useHealthCheck());

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('should continue scheduling health checks even after errors', async () => {
    const mockManager = {
      performHealthCheck: jest
        .fn()
        .mockRejectedValueOnce(new Error('Health check failed'))
        .mockResolvedValueOnce(undefined),
      getDomainStatuses: jest.fn().mockReturnValue([
        { domain: 'vidsrc-embed.ru', isHealthy: true, failureCount: 0 },
      ]),
      stopHealthChecks: jest.fn(),
    };

    (VidsrcConfigurationManager as jest.Mock).mockImplementation(() => mockManager);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    renderHook(() => useHealthCheck());

    await waitFor(() => {
      expect(mockManager.performHealthCheck).toHaveBeenCalledTimes(1);
    });

    consoleSpy.mockRestore();
  });
});
