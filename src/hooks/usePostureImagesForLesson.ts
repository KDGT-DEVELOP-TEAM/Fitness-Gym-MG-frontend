import { useState, useEffect, useCallback } from 'react';
import { PosturePreview, PosturePosition, PostureImage } from '../types/posture';
import { logger } from '../utils/logger';
import { isPosturePosition } from '../utils/posture';

/**
 * Custom hook to generate signed URLs for posture images
 * 
 * @param postureImages - Posture images array (already fetched from lesson response)
 * @returns Posture previews with signed URLs, loading state
 */
export const usePostureImagesForLesson = (
  postureImages: PostureImage[] | undefined
) => {
  const [posturePreviews, setPosturePreviews] = useState<PosturePreview[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPostureImages = useCallback(async () => {
    if (!postureImages || postureImages.length === 0) {
      setPosturePreviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // バックエンドのレスポンス構造: LessonResponse.postureImages (PostureImageResponse[])
      // PostureImageResponseはcamelCase (storageKey, takenAt, position, consentPublication, signedUrl)
      const images: PostureImage[] = postureImages;

      if (!images || !Array.isArray(images) || images.length === 0) {
        setPosturePreviews([]);
        return;
      }

      logger.debug('Found posture images', { count: images.length }, 'usePostureImagesForLesson');
      
      // バックエンドから取得したsignedUrlを使用（追加のAPI呼び出しをスキップ）
      // バックエンドのレスポンス（camelCase）をPosturePreviewに変換
      const previewResults = images.map((img: PostureImage): PosturePreview | null => {
        if (!img.storageKey) {
          logger.warn('Missing storageKey for image', { image: img }, 'usePostureImagesForLesson');
          return null;
        }

        // ポジションタイプのバリデーション
        if (!isPosturePosition(img.position)) {
          logger.warn('Invalid posture position', { position: img.position }, 'usePostureImagesForLesson');
          return null;
        }

        const position: PosturePosition = img.position;
        // バックエンドから取得したsignedUrlを使用（存在しない場合は空文字列）
        const signedUrl = img.signedUrl || '';
        
        logger.debug(`Using signed URL for ${position}`, { imageId: img.id, hasUrl: !!signedUrl }, 'usePostureImagesForLesson');
        
        return {
          position,
          url: signedUrl,
          storageKey: img.storageKey, // camelCase
        };
      });

      const validPreviews: PosturePreview[] = previewResults.filter((p): p is PosturePreview => 
        p !== null && typeof p.url === 'string' && p.url !== ''
      );
      setPosturePreviews(validPreviews);
    } catch (err) {
      logger.error('Unexpected error processing posture images', err, 'usePostureImagesForLesson');
      setPosturePreviews([]);
    } finally {
      setLoading(false);
    }
  }, [postureImages]);

  useEffect(() => {
    if (!postureImages || postureImages.length === 0) {
      setPosturePreviews([]);
      setLoading(false);
      return;
    }
    loadPostureImages();
  }, [postureImages, loadPostureImages]);

  return { posturePreviews, loading };
};
