/**
 * Form styling constants
 * Centralized form styles for consistent UI
 */

export const FORM_STYLES = {
  label: 'inline-block text-2xl font-semibold text-gray-800 whitespace-nowrap leading-tight',
  input: 'block w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl text-xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all',
  inputReadOnly: 'block w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl text-xl bg-gray-50 text-gray-800 shadow-sm',
  sectionHeading: 'text-lg font-medium text-gray-700',
} as const;
