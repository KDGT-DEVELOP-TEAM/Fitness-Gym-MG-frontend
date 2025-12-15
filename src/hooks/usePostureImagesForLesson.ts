import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PosturePreview, PosturePosition } from '../types/lesson';
import { STORAGE_CONSTANTS } from '../constants/storage';
import { TIME_CONSTANTS } from '../constants/time';
import { logger } from '../utils/logger';
import { isPosturePosition } from '../constants/posture';
import axiosInstance from '../api/axiosConfig';

interface PostureImageResponse {
  storageKey: string;
  position: string;
}

/**
 * Custom hook to fetch posture images for a lesson
 * 
 * @param lessonId - Lesson ID
 * @param postureGroupId - Optional posture group ID (if null, searches by lesson_id)
 * @returns Posture previews, loading state, and error
 */
export const usePostureImagesForLesson = (
  lessonId: string | undefined,
  postureGroupId: string | null | undefined
) => {
  const [posturePreviews, setPosturePreviews] = useState<PosturePreview[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPostureImages = useCallback(async () => {
    if (!lessonId || !supabase) {
      return;
    }

    setLoading(true);
    try {
      const client = supabase;
      if (!client) {
        logger.warn('Supabase is not configured', {}, 'usePostureImagesForLesson');
        setPosturePreviews([]);
        return;
      }

      // REST APIから画像メタデータを取得
      logger.debug('Fetching posture images for lesson', { lessonId }, 'usePostureImagesForLesson');
      const response = await axiosInstance.get<PostureImageResponse[]>(`/lessons/${lessonId}/posture-images`);

      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        logger.debug('No posture images found for lesson', { lessonId }, 'usePostureImagesForLesson');
        setPosturePreviews([]);
        return;
      }

      logger.debug('Found posture images', { count: response.data.length }, 'usePostureImagesForLesson');
      
      // 各画像のsigned URLを生成（Supabase Storage継続使用）
      const previewResults = await Promise.all(
        response.data.map(async (img: PostureImageResponse): Promise<PosturePreview | null> => {
          if (!img.storageKey) {
            logger.warn('Missing storage_key for image', { image: img }, 'usePostureImagesForLesson');
            return null;
          }

          // Validate position type
          if (!isPosturePosition(img.position)) {
            logger.warn('Invalid posture position', { position: img.position }, 'usePostureImagesForLesson');
            return null;
          }

          const position: PosturePosition = img.position;
          logger.debug('Getting signed URL for storage_key', { storageKey: img.storageKey, position }, 'usePostureImagesForLesson');
          
          // For private bucket, use signed URL
          const { data: signedUrlData, error: signedUrlError } = await client.storage
            .from(STORAGE_CONSTANTS.POSTURES_BUCKET)
            .createSignedUrl(img.storageKey, TIME_CONSTANTS.ONE_HOUR_IN_SECONDS);

          if (signedUrlError) {
            logger.error(`Error creating signed URL for ${position}`, signedUrlError, 'usePostureImagesForLesson');
            // Fallback: try public URL
            const { data: publicUrl } = client.storage
              .from(STORAGE_CONSTANTS.POSTURES_BUCKET)
              .getPublicUrl(img.storageKey);
            logger.debug(`Using public URL as fallback for ${position}`, { url: publicUrl.publicUrl }, 'usePostureImagesForLesson');
            return {
              position,
              url: publicUrl.publicUrl,
              storageKey: img.storageKey,
            };
          }

          logger.debug(`Generated signed URL for ${position}`, { url: signedUrlData?.signedUrl }, 'usePostureImagesForLesson');
          return {
            position,
            url: signedUrlData?.signedUrl || '',
            storageKey: img.storageKey,
          };
        })
      );

      const validPreviews: PosturePreview[] = previewResults.filter((p): p is PosturePreview => p !== null);
      setPosturePreviews(validPreviews);
    } catch (err) {
      logger.error('Unexpected error loading posture images', err, 'usePostureImagesForLesson');
      setPosturePreviews([]);
    } finally {
      setLoading(false);
    }
  }, [lessonId, postureGroupId]);

  useEffect(() => {
    if (!lessonId || !supabase) {
      return;
    }
    loadPostureImages();
  }, [lessonId, postureGroupId, loadPostureImages]);

  return { posturePreviews, loading };
};
