import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PostureImage } from '../types/posture';
import { PosturePosition, isPosturePosition } from '../constants/posture';
import { TIME_CONSTANTS } from '../constants/time';
import { STORAGE_CONSTANTS } from '../constants/storage';
import { formatDateForGrouping, formatDateTimeForCompare } from '../utils/dateFormatter';
import { logger } from '../utils/logger';

interface PostureImageRaw {
  id: string;
  storage_key: string;
  position: string;
  taken_at: string;
  posture_group_id: string;
}

/**
 * Custom hook for fetching posture images by posture group ID
 * Handles signed URL generation and error handling
 * 
 * @param postureGroupId - Posture group ID to fetch images for
 * @param expirationSeconds - URL expiration time in seconds (default: 7 days)
 * @returns Object containing images, loading state, and error state
 */
export const usePostureImages = (
  postureGroupId: string | null,
  expirationSeconds: number = TIME_CONSTANTS.SEVEN_DAYS_IN_SECONDS
) => {
  const [images, setImages] = useState<PostureImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!postureGroupId || !supabase) {
        setImages([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const client = supabase;
        if (!client) {
          throw new Error('Supabase未設定');
        }

        // Fetch posture images
        const { data: postureImages, error: imgError } = await client
          .from('posture_images')
          .select('id, storage_key, position, taken_at, posture_group_id')
          .eq('posture_group_id', postureGroupId)
          .order('taken_at', { ascending: false });

        if (imgError) {
          throw imgError;
        }

        if (!postureImages || postureImages.length === 0) {
          setImages([]);
          setLoading(false);
          return;
        }

        // Generate signed URLs
        const imagesWithUrls = await Promise.all(
          (postureImages as PostureImageRaw[]).map(async (img): Promise<PostureImage | null> => {
            if (!img.storage_key) {
              return null;
            }

            // Validate position type
            if (!isPosturePosition(img.position)) {
              logger.warn('Invalid posture position', { position: img.position }, 'usePostureImages');
              return null;
            }

            const position: PosturePosition = img.position;

            const { data: signedUrlData, error: signedUrlError } = await client.storage
              .from(STORAGE_CONSTANTS.POSTURES_BUCKET)
              .createSignedUrl(img.storage_key, expirationSeconds);

            if (signedUrlError) {
              logger.error('Error creating signed URL', signedUrlError, 'usePostureImages');
              // Fallback to public URL
              const { data: publicUrl } = client.storage
                .from(STORAGE_CONSTANTS.POSTURES_BUCKET)
                .getPublicUrl(img.storage_key);
              return {
                id: img.id,
                storage_key: img.storage_key,
                position: position,
                taken_at: img.taken_at,
                posture_group_id: img.posture_group_id,
                url: publicUrl.publicUrl,
                date: formatDateForGrouping(img.taken_at),
                formattedDateTime: formatDateTimeForCompare(img.taken_at),
              };
            }

            return {
              id: img.id,
              storage_key: img.storage_key,
              position: position,
              taken_at: img.taken_at,
              posture_group_id: img.posture_group_id,
              url: signedUrlData?.signedUrl || '',
              date: formatDateForGrouping(img.taken_at),
              formattedDateTime: formatDateTimeForCompare(img.taken_at),
            };
          })
        );

        const validImages = imagesWithUrls.filter((img): img is PostureImage => img !== null);
        setImages(validImages);
      } catch (err: unknown) {
        logger.error('Error fetching posture images', err, 'usePostureImages');
        const errorMessage = err instanceof Error ? err.message : '画像の取得に失敗しました';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [postureGroupId, expirationSeconds]);

  return { images, loading, error };
};
