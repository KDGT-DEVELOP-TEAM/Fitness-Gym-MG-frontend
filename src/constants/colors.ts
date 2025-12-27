/**
 * Application color constants
 * Centralized color definitions for consistent styling
 */

export const COLORS = {
  // Primary colors
  PRIMARY_GREEN: '#68BE6B',
  PRIMARY_GREEN_HOVER: '#5AA85A',
  PRIMARY_PINK: '#F2AFAF',
  PRIMARY_PINK_HOVER: '#E89A9A',

  // Background colors
  BACKGROUND_LIGHT: '#FAF8F3',
  BACKGROUND_GRAY: '#F5F5F5',

  // Position label colors
  POSITION_LABEL: '#F4CCCC',

  // UI colors
  BORDER_GRAY: '#DFDFDF',
  TEXT_GRAY: '#6B7280',
  TEXT_BLACK: '#000000',
  TEXT_WHITE: '#FFFFFF',

  // Status colors
  ERROR_RED: '#EF4444',
  SUCCESS_GREEN: '#10B981',
  WARNING_YELLOW: '#F59E0B',
  INFO_BLUE: '#3B82F6',

  // Gray scale
  GRAY_100: '#F3F4F6',
  GRAY_200: '#E5E7EB',
  GRAY_300: '#D1D5DB',
  GRAY_400: '#9CA3AF',
  GRAY_500: '#6B7280',
  GRAY_600: '#4B5563',
  GRAY_700: '#374151',
  GRAY_800: '#1F2937',
  GRAY_900: '#111827',
} as const;

/**
 * Tailwind CSS class names for colors
 */
export const COLOR_CLASSES = {
  PRIMARY_GREEN: 'bg-[#68BE6B]',
  PRIMARY_GREEN_HOVER: 'hover:bg-[#5AA85A]',
  PRIMARY_PINK: 'bg-[#F2AFAF]',
  PRIMARY_PINK_HOVER: 'hover:bg-[#E89A9A]',
  POSITION_LABEL: 'bg-[#F4CCCC]',
  BACKGROUND_LIGHT: 'bg-[#FAF8F3]',
  BACKGROUND_GRAY: 'bg-[#F5F5F5]',
} as const;
