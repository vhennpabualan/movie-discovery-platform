'use client';

import { useState } from 'react';
import { addToWatchlist } from '@/features/watchlist/actions/add-to-watchlist';
import { removeFromWatchlist } from '@/features/watchlist/actions/remove-from-watchlist';

interface AddToWatchlistButtonProps {
  movieId: number;
  movieTitle: string;
  isInWatchlist?: boolean;
}

export function AddToWatchlistButton({
  movieId,
  movieTitle,
  isInWatchlist = false,
}: AddToWatchlistButtonProps) {
  const [isAdded, setIsAdded] = useState(isInWatchlist);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const handleToggleWatchlist = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (isAdded) {
        // Remove from watchlist
        result = await removeFromWatchlist(movieId, movieTitle);
      } else {
        // Add to watchlist
        result = await addToWatchlist(movieId, movieTitle);
      }

      if (result.success) {
        setIsAdded(!isAdded);
        setNotificationMessage(result.message || '');
        setNotificationType('success');
        setShowNotification(true);

        // Hide notification after 3 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      } else {
        // Handle error
        const errorMessage = result.error || 'An error occurred';
        setError(errorMessage);
        setNotificationMessage(errorMessage);
        setNotificationType('error');
        setShowNotification(true);

        // Hide notification after 3 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }
    } catch (err) {
      const errorMessage = 'Failed to update watchlist. Please try again.';
      setError(errorMessage);
      setNotificationMessage(errorMessage);
      setNotificationType('error');
      setShowNotification(true);

      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleToggleWatchlist}
        disabled={isLoading}
        aria-pressed={isAdded}
        aria-label={
          isAdded
            ? `Remove ${movieTitle} from watchlist`
            : `Add ${movieTitle} to watchlist`
        }
        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
          isAdded
            ? 'bg-netflix-red text-white hover:bg-red-700'
            : 'bg-gray-700 text-white hover:bg-gray-600'
        } ${isLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'} focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-black`}
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{isAdded ? 'Removing...' : 'Adding...'}</span>
          </>
        ) : (
          <>
            <span className="text-lg">{isAdded ? '✓' : '+'}</span>
            <span>{isAdded ? 'Added to Watchlist' : 'Add to Watchlist'}</span>
          </>
        )}
      </button>

      {/* Toast Notification */}
      {showNotification && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white font-medium shadow-lg transition-opacity duration-300 ${
            notificationType === 'success'
              ? 'bg-green-600'
              : 'bg-red-600'
          }`}
          role="status"
          aria-live="polite"
        >
          {notificationMessage}
        </div>
      )}
    </>
  );
}
