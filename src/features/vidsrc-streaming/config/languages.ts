/**
 * Vidsrc Subtitle Language Configuration
 *
 * This module defines the supported subtitle languages and their display options
 * for the subtitle language selector component.
 */

import type { SubtitleLanguage, SubtitleLanguageOption } from '../types';

/**
 * Array of supported subtitle language codes.
 * These codes are used in the ds_lang parameter of embed URLs.
 *
 * @constant
 * @type {SubtitleLanguage[]}
 */
export const SUBTITLE_LANGUAGES: SubtitleLanguage[] = [
  'en', // English
  'es', // Spanish
  'fr', // French
  'de', // German
  'pt', // Portuguese
  'it', // Italian
  'ru', // Russian
  'ja', // Japanese
  'zh', // Chinese
];

/**
 * Display options for each supported subtitle language.
 * Includes both English labels and native language labels for better UX.
 *
 * @constant
 * @type {SubtitleLanguageOption[]}
 */
export const SUBTITLE_LANGUAGE_OPTIONS: SubtitleLanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
  },
  {
    code: 'es',
    label: 'Spanish',
    nativeLabel: 'Español',
  },
  {
    code: 'fr',
    label: 'French',
    nativeLabel: 'Français',
  },
  {
    code: 'de',
    label: 'German',
    nativeLabel: 'Deutsch',
  },
  {
    code: 'pt',
    label: 'Portuguese',
    nativeLabel: 'Português',
  },
  {
    code: 'it',
    label: 'Italian',
    nativeLabel: 'Italiano',
  },
  {
    code: 'ru',
    label: 'Russian',
    nativeLabel: 'Русский',
  },
  {
    code: 'ja',
    label: 'Japanese',
    nativeLabel: '日本語',
  },
  {
    code: 'zh',
    label: 'Chinese',
    nativeLabel: '中文',
  },
];
