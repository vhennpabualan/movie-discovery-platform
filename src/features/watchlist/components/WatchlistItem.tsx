'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import { removeFromWatchlist } from '@/features/watchlist/actions/remove-from-watchlist';

interface WatchlistItemProps {
  movie: Movie & { vote_average?: number };
  onRemove?: (movieId: number) => void;
}

export function WatchlistItem({ movie, onRemove }: WatchlistItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const handleRemoveClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmRemove = async () => {
    setIsRemoving(true);
    setError(null);
    setShowConfirmation(false);

    try {
      const result = await removeFromWatchlist(movie.id, movie.title);

      if (result.success) {
        setNotificationMessage(result.message || 'Movie removed from watchlist');
        setNotificationType('success');
        setShowNotification(true);

        // Hide notification after 3 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);

        // Call the onRemove callback if provided
        if (onRemove) {
          onRemove(movie.id);
        }
      } else {
        const errorMessage = result.error || 'Failed to remove movie';
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
      const errorMessage = 'Failed to remove movie from watchlist. Please try again.';
      setError(errorMessage);
      setNotificationMessage(errorMessage);
      setNotificationType('error');
      setShowNotification(true);

      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCancelRemove = () => {
    setShowConfirmation(false);
  };

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'Unknown';

  return (
    <>
      <div className="relative w-full aspect-2/3 rounded-lg overflow-hidden group transition-transform duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-netflix-red">
        {/* Poster Image */}
        <Image
          src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          priority={false}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300" />

        {/* Hover Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Top: Remove Button */}
          <div className="flex justify-end">
            <button
              onClick={handleRemoveClick}
              disabled={isRemoving || showConfirmation}
              aria-label={`Remove ${movie.title} from watchlist`}
              className="bg-netflix-red hover:bg-red-700 disabled:opacity-75 text-white rounded-full p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <span className="text-lg">✕</span>
            </button>
          </div>

          {/* Bottom: Movie Info */}
          <div>
            <h3 className="text-white font-bold text-sm line-clamp-2 mb-2">
              {movie.title}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-xs">{releaseYear}</span>
              {movie.vote_average !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="text-netflix-red text-xs font-semibold">★</span>
                  <span className="text-white text-xs">
                    {movie.vote_average.toFixed(1)}/10
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full border border-gray-700">
            <h2 className="text-white font-bold text-lg mb-2">Remove from Watchlist?</h2>
            <p className="text-gray-300 text-sm mb-6">
              Are you sure you want to remove "{movie.title}" from your watchlist?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelRemove}
                disabled={isRemoving}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-75 text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="px-4 py-2 rounded-lg bg-netflix-red hover:bg-red-700 disabled:opacity-75 text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-netflix-red flex items-center gap-2"
              >
                {isRemoving ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  'Remove'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showNotification && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white font-medium shadow-lg transition-opacity duration-300 ${
            notificationType === 'success' ? 'bg-green-600' : 'bg-red-600'
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
