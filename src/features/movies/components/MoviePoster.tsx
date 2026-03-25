'use client';

import Image from 'next/image';

interface MoviePosterProps {
  posterPath: string | null;
  title: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * MoviePoster component for optimized image rendering using Next.js Image
 * 
 * Supports two sizing modes:
 * 1. Explicit sizing: width and height props (prevents layout shift)
 * 2. Container-based sizing: fill prop with parent container having position: relative
 * 
 * Use priority={true} for above-the-fold images (e.g., carousel hero images)
 * Use priority={false} for below-the-fold images (default)
 */
export function MoviePoster({
  posterPath,
  title,
  width,
  height,
  fill = false,
  priority = false,
  sizes,
  className = '',
}: MoviePosterProps) {
  // Handle missing poster_path gracefully
  if (!posterPath) {
    return (
      <div
        className={`bg-gray-800 flex items-center justify-center ${className}`}
        style={!fill ? { width, height } : undefined}
      >
        <span className="text-gray-500 text-sm">No image available</span>
      </div>
    );
  }

  const imageUrl = `https://image.tmdb.org/t/p/w342${posterPath}`;

  // Default sizes for responsive image loading if not provided
  const defaultSizes =
    '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw';

  return (
    <Image
      src={imageUrl}
      alt={title}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      priority={priority}
      sizes={sizes || defaultSizes}
      className={`object-cover ${className}`}
    />
  );
}
