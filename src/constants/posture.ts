/**
 * Posture position constants
 * Centralized definitions for posture positions and their labels
 */

export const POSTURE_POSITIONS = {
  front: '正面',
  right: '右',
  back: '背面',
  left: '左',
} as const;

export type PosturePosition = keyof typeof POSTURE_POSITIONS;

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

/**
 * すべての姿勢ポジションの配列（順序付き）
 */
export const ALL_POSTURE_POSITIONS: readonly PosturePosition[] = ['front', 'right', 'back', 'left'] as const;
