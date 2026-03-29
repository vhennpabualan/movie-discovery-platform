'use client';

export type VideoQuality = 'HD' | 'CAM' | 'TS' | 'TC' | 'DVDRIP' | 'WEBRIP' | 'BLURAY' | '4K';

export interface VideoQualityBadgeProps {
  /** The quality level to display */
  quality?: VideoQuality;
  /** Additional CSS classes */
  className?: string;
}

/**
 * VideoQualityBadge Component
 * 
 * Displays a badge indicating the video quality level.
 * Different quality levels have different colors for quick visual identification.
 */
export function VideoQualityBadge({ quality, className = '' }: VideoQualityBadgeProps) {
  if (!quality) return null;

  const getQualityStyles = (quality: VideoQuality): string => {
    switch (quality) {
      case '4K':
      case 'BLURAY':
        return 'bg-purple-600/20 text-purple-400 border-purple-500/50';
      case 'HD':
      case 'WEBRIP':
        return 'bg-green-600/20 text-green-400 border-green-500/50';
      case 'DVDRIP':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/50';
      case 'TS':
      case 'TC':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/50';
      case 'CAM':
        return 'bg-red-600/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-500/50';
    }
  };

  const getQualityLabel = (quality: VideoQuality): string => {
    switch (quality) {
      case '4K':
        return '4K Ultra HD';
      case 'BLURAY':
        return 'Blu-ray';
      case 'HD':
        return 'HD';
      case 'WEBRIP':
        return 'WEB-Rip';
      case 'DVDRIP':
        return 'DVD-Rip';
      case 'TS':
        return 'Telesync';
      case 'TC':
        return 'Telecine';
      case 'CAM':
        return 'CAM';
      default:
        return quality;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded border ${getQualityStyles(
        quality
      )} ${className}`}
      aria-label={`Video quality: ${getQualityLabel(quality)}`}
      title={getQualityLabel(quality)}
    >
      {quality}
    </span>
  );
}

/**
 * VideoQualitySelector Component
 * 
 * Allows users to select preferred video quality (if multiple sources are available).
 * Note: This is a UI component - actual quality switching depends on the streaming provider.
 */
export interface VideoQualitySelectorProps {
  /** Available quality options */
  availableQualities: VideoQuality[];
  /** Currently selected quality */
  selectedQuality: VideoQuality;
  /** Callback when quality changes */
  onQualityChange: (quality: VideoQuality) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

export function VideoQualitySelector({
  availableQualities,
  selectedQuality,
  onQualityChange,
  disabled = false,
}: VideoQualitySelectorProps) {
  if (availableQualities.length <= 1) return null;

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="quality-selector"
        className="text-sm font-medium text-gray-300 whitespace-nowrap"
      >
        Quality:
      </label>
      <select
        id="quality-selector"
        value={selectedQuality}
        onChange={(e) => onQualityChange(e.target.value as VideoQuality)}
        disabled={disabled}
        className="px-3 py-1.5 bg-gray-800 text-gray-100 text-sm rounded border border-gray-700 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-netflix-red disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Select video quality"
      >
        {availableQualities.map((quality) => (
          <option key={quality} value={quality}>
            {quality}
          </option>
        ))}
      </select>
    </div>
  );
}
