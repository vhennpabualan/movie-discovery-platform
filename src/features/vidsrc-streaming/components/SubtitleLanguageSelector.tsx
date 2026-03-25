'use client';

import type { SubtitleLanguage } from '../types/index';
import { SUBTITLE_LANGUAGE_OPTIONS } from '../config/languages';

interface SubtitleLanguageSelectorProps {
  /** Currently selected subtitle language */
  selectedLanguage: SubtitleLanguage;
  /** Callback fired when language selection changes */
  onLanguageChange: (language: SubtitleLanguage) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * SubtitleLanguageSelector Component
 *
 * Provides a dropdown selector for choosing subtitle languages.
 * Displays both English and native language labels for better UX.
 *
 * Features:
 * - All supported subtitle languages
 * - Native language labels
 * - Keyboard navigation support
 * - Accessibility features (ARIA labels)
 * - Disabled state support
 *
 * @example
 * // Basic usage
 * <SubtitleLanguageSelector
 *   selectedLanguage="en"
 *   onLanguageChange={(lang) => console.log('Selected:', lang)}
 * />
 *
 * @example
 * // Disabled state
 * <SubtitleLanguageSelector
 *   selectedLanguage="es"
 *   onLanguageChange={setLanguage}
 *   disabled={isLoading}
 * />
 */
export function SubtitleLanguageSelector({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
}: SubtitleLanguageSelectorProps) {
  return (
    <select
      id="subtitle-selector"
      value={selectedLanguage}
      onChange={(e) => onLanguageChange(e.target.value as SubtitleLanguage)}
      disabled={disabled}
      aria-label="Select subtitle language"
      className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {SUBTITLE_LANGUAGE_OPTIONS.map((option) => (
        <option key={option.code} value={option.code}>
          {option.label} ({option.nativeLabel})
        </option>
      ))}
    </select>
  );
}
