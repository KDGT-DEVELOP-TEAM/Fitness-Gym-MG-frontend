import { useState, useEffect, useCallback } from 'react';
import { PosturePreview, PosturePosition } from '../constants/posture';
import { TIME_CONSTANTS } from '../constants/time';
import { logger } from '../utils/logger';
import { isPosturePosition } from '../constants/posture';
import { postureApi } from '../api/postureApi';
import { PostureImage } from '../types/posture';

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
      // PostureImageResponseはcamelCase (storageKey, takenAt, position, consentPublication)
      const images: PostureImage[] = postureImages;

      if (!images || !Array.isArray(images) || images.length === 0) {
        logger.debug('No posture images found for lesson', { lessonId }, 'usePostureImagesForLesson');
        setPosturePreviews([]);
        return;
      }

      logger.debug('Found posture images', { count: images.length }, 'usePostureImagesForLesson');
      
      // 署名付きURLをバックエンド経由でバッチ取得
      let signedUrlMap: Map<string, string> = new Map();
      
      try {
        const imageIds = images.map((img) => img.id).filter(Boolean);
        if (imageIds.length > 0) {
          logger.debug('Fetching batch signed URLs', { count: imageIds.length }, 'usePostureImagesForLesson');
          
          const signedUrlResponse = await postureApi.getBatchSignedUrls(
            imageIds,
            TIME_CONSTANTS.ONE_HOUR_IN_SECONDS
          );
          
          if (signedUrlResponse && Array.isArray(signedUrlResponse.urls)) {
            signedUrlMap = new Map(
              signedUrlResponse.urls.map((u) => [u.imageId, u.signedUrl])
            );
            logger.debug('Successfully fetched signed URLs', { count: signedUrlMap.size }, 'usePostureImagesForLesson');
          }
        }
      } catch (urlError) {
        logger.error('Failed to generate batch signed URLs', urlError, 'usePostureImagesForLesson');
        // 署名付きURLの生成に失敗しても続行（URLなしで表示）
      }

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
        const signedUrl = signedUrlMap.get(img.id) || '';
        
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
      logger.error('Unexpected error loading posture images', err, 'usePostureImagesForLesson');
      setPosturePreviews([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postureImages]);

  useEffect(() => {
    if (!postureImages || postureImages.length === 0) {
      setPosturePreviews([]);
      setLoading(false);
      return;
    }
    loadPostureImages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postureImages, loadPostureImages]);

  return { posturePreviews, loading };
};
