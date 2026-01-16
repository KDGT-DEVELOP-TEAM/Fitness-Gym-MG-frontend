/**
 * Posture position constants
 * Centralized definitions for posture positions and their labels
 */

import { PosturePosition } from '../types/posture';

export const POSTURE_POSITIONS: Record<PosturePosition, string> = {
  front: '正面',
  right: '右',
  back: '背面',
  left: '左',
} as const;

/**
 * すべての姿勢ポジションの配列（順序付き）
 */
export const ALL_POSTURE_POSITIONS: readonly PosturePosition[] = ['front', 'right', 'back', 'left'] as const;
