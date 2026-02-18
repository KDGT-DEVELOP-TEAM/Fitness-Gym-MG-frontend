/**
 * Posture-related utility functions
 */

import { PosturePosition } from '../types/posture';
import { POSTURE_POSITIONS } from '../constants/posture';

/**
 * Get label for posture position
 */
export const getPosturePositionLabel = (position: PosturePosition): string => {
  return POSTURE_POSITIONS[position];
};

/**
 * Check if value is a valid posture position
 */
export const isPosturePosition = (value: string): value is PosturePosition => {
  return value in POSTURE_POSITIONS;
};
