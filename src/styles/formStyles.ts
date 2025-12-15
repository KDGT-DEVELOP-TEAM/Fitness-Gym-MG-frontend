/**
 * Form styling constants
 * Centralized form styles for consistent UI
 */

export const FORM_STYLES = {
  label: 'inline-block text-2xl font-semibold text-gray-800 whitespace-nowrap leading-tight',
  input: 'block w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300',
  inputReadOnly: 'block w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-xl bg-gray-100 text-gray-800',
  sectionHeading: 'text-lg font-medium text-gray-700',
} as const;
