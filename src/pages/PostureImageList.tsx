import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PostureImage } from '../types/posture';
import { formatDateForGrouping, formatDateTimeForCompare } from '../utils/dateFormatter';
import { logger } from '../utils/logger';
import { COLOR_CLASSES } from '../constants/colors';
import { PosturePosition, isPosturePosition } from '../constants/posture';
import { TIME_CONSTANTS } from '../constants/time';
import { STORAGE_CONSTANTS } from '../constants/storage';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { PostureImageGrid } from '../components/posture/PostureImageGrid';
import { PostureCompareModal } from '../components/posture/PostureCompareModal';
import { PostureImageListFloatingButtons } from '../components/posture/PostureImageListFloatingButtons';
import { useErrorHandler } from '../hooks/useErrorHandler';
import axiosInstance from '../api/axiosConfig';

interface PostureGroupResponse {
  id: string;
  capturedAt: string;
  lessonId: string | null;
}

interface PostureImageResponse {
  id: string;
  storageKey: string;
  position: string;
  takenAt: string;
  postureGroupId: string;
}

/**
 * Custom hook for managing header state and logic in PostureImageList
 * Handles selection mode, selected images, compare modal, and delete confirmation
 * 
 * @returns Object containing state and handlers for image list operations
 */
export const usePostureImageListHeader = () => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareImages, setCompareImages] = useState<PostureImage[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedImageIds(new Set());
  };

  return {
    isSelectionMode,
    setIsSelectionMode,
    selectedImageIds,
    setSelectedImageIds,
    showCompareModal,
    setShowCompareModal,
    compareImages,
    setCompareImages,
    exitSelectionMode,
    showDeleteConfirm,
    setShowDeleteConfirm,
  };
};


// 内部コンポーネント（コンテンツのみ）
const PostureImageListContent: React.FC<{
  images: PostureImage[];
  isSelectionMode: boolean;
  selectedImageIds: Set<string>;
  onToggleSelection: (imageId: string) => void;
  showCompareModal: boolean;
  compareImages: PostureImage[];
  onCloseCompareModal: () => void;
  setIsSelectionMode: (value: boolean) => void;
  onDelete: () => void;
  onCompare: () => void;
  onExitSelectionMode: () => void;
}> = ({
  images,
  isSelectionMode,
  selectedImageIds,
  onToggleSelection,
  showCompareModal,
  compareImages,
  onCloseCompareModal,
  setIsSelectionMode,
  onDelete,
  onCompare,
  onExitSelectionMode,
}) => {
  return (
    <>
      <div className={COLOR_CLASSES.BACKGROUND_LIGHT}>
        {/* 画像一覧 */}
        <div className="px-6 pt-6 pb-6">
          <PostureImageGrid
            images={images}
            isSelectionMode={isSelectionMode}
            selectedImageIds={selectedImageIds}
            onToggleSelection={onToggleSelection}
          />
        </div>

        {/* 比較モーダル */}
        <PostureCompareModal
          isOpen={showCompareModal}
          compareImages={compareImages}
          onClose={onCloseCompareModal}
        />

        {/* フローティングボタン */}
        <PostureImageListFloatingButtons
          isSelectionMode={isSelectionMode}
          selectedCount={selectedImageIds.size}
          onEnterSelectionMode={() => setIsSelectionMode(true)}
          onCompare={onCompare}
          onDelete={onDelete}
          onExitSelectionMode={onExitSelectionMode}
        />
      </div>
    </>
  );
};

/**
 * Main hook for PostureImageList component
 * Fetches posture images for a customer and manages all related state
 * 
 * @returns Object containing header, content, loading state, and error state
 */
export const usePostureImageList = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [images, setImages] = useState<PostureImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();
  const {
    isSelectionMode,
    setIsSelectionMode,
    selectedImageIds,
    setSelectedImageIds,
    showCompareModal,
    setShowCompareModal,
    compareImages,
    setCompareImages,
    exitSelectionMode,
    showDeleteConfirm,
    setShowDeleteConfirm,
  } = usePostureImageListHeader();

  // 姿勢画像を取得
  useEffect(() => {
    const fetchImages = async () => {
      if (!customerId || !supabase) {
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

        // REST APIから姿勢グループを取得
        const postureGroupsResponse = await axiosInstance.get<PostureGroupResponse[]>(
          `/customers/${customerId}/posture-groups`
        );

        if (!postureGroupsResponse.data || !Array.isArray(postureGroupsResponse.data) || postureGroupsResponse.data.length === 0) {
          setImages([]);
          setLoading(false);
          return;
        }

        // 各姿勢グループの画像を取得
        const allImages: PostureImageResponse[] = [];
        for (const group of postureGroupsResponse.data) {
          try {
            const imagesResponse = await axiosInstance.get<PostureImageResponse[]>(
              `/posture-groups/${group.id}/images`
            );
            if (imagesResponse.data && Array.isArray(imagesResponse.data)) {
              allImages.push(...imagesResponse.data);
            }
          } catch (err) {
            logger.warn(`Failed to fetch images for posture group ${group.id}`, err, 'PostureImageList');
            // 個別のグループ取得エラーは警告として記録し、続行
          }
        }

        if (allImages.length === 0) {
          setImages([]);
          setLoading(false);
          return;
        }

        // 署名付きURLを生成（Supabase Storage継続使用）
        const imagesWithUrls = await Promise.all(
          allImages.map(async (img: PostureImageResponse): Promise<PostureImage | null> => {
            if (!img.storageKey) {
              return null;
            }

            // Validate position type
            if (!isPosturePosition(img.position)) {
              logger.warn('Invalid posture position', { position: img.position }, 'PostureImageList');
              return null;
            }

            const position: PosturePosition = img.position;

            const { data: signedUrlData, error: signedUrlError } = await client.storage
              .from(STORAGE_CONSTANTS.POSTURES_BUCKET)
              .createSignedUrl(img.storageKey, TIME_CONSTANTS.SEVEN_DAYS_IN_SECONDS);

            if (signedUrlError) {
              logger.error('Error creating signed URL', signedUrlError, 'PostureImageList');
              const { data: publicUrl } = client.storage
                .from(STORAGE_CONSTANTS.POSTURES_BUCKET)
                .getPublicUrl(img.storageKey);
              return {
                id: img.id,
                storage_key: img.storageKey,
                position: position,
                taken_at: img.takenAt,
                posture_group_id: img.postureGroupId,
                url: publicUrl.publicUrl,
                date: formatDateForGrouping(img.takenAt),
                formattedDateTime: formatDateTimeForCompare(img.takenAt),
              };
            }

            return {
              id: img.id,
              storage_key: img.storageKey,
              position: position,
              taken_at: img.takenAt,
              posture_group_id: img.postureGroupId,
              url: signedUrlData?.signedUrl || '',
              date: formatDateForGrouping(img.takenAt),
              formattedDateTime: formatDateTimeForCompare(img.takenAt),
            };
          })
        );

        const validImages = imagesWithUrls.filter((img): img is PostureImage => img !== null);
        setImages(validImages);
      } catch (err: unknown) {
        const errorMessage = handleError(err, 'PostureImageList');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [customerId, handleError]);

  // 画像選択のトグル
  const toggleImageSelection = (imageId: string) => {
    if (!isSelectionMode) return;

    setSelectedImageIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  // 比較モーダルを開く
  const handleCompare = () => {
    if (selectedImageIds.size !== 2) return;

    const selectedImages = images.filter((img) => selectedImageIds.has(img.id));
    if (selectedImages.length === 2) {
      setCompareImages(selectedImages);
      setShowCompareModal(true);
    }
  };

  // 選択した画像を削除
  const handleDelete = async () => {
    if (selectedImageIds.size === 0 || !supabase) return;

    const client = supabase;
    if (!client) return;

    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedImageIds.size === 0 || !supabase) return;

    const client = supabase;
    if (!client) return;

    setShowDeleteConfirm(false);

    try {
      const selectedImages = images.filter((img) => selectedImageIds.has(img.id));
      const storageKeys = selectedImages.map((img) => img.storage_key).filter(Boolean);

      // ストレージから削除
      if (storageKeys.length > 0) {
        const { error: storageError } = await client.storage
          .from(STORAGE_CONSTANTS.POSTURES_BUCKET)
          .remove(storageKeys);
        if (storageError) {
          logger.error('Error deleting from storage', storageError, 'PostureImageList');
        }
      }

      // REST APIから削除
      await Promise.all(
        Array.from(selectedImageIds).map((id) =>
          axiosInstance.delete(`/posture-images/${id}`).catch((err) => {
            logger.error(`Failed to delete posture image ${id}`, err, 'PostureImageList');
            throw err;
          })
        )
      );

      // リストを更新（削除した画像を除外）
      setImages((prev) => prev.filter((img) => !selectedImageIds.has(img.id)));
      setSelectedImageIds(new Set());
      setIsSelectionMode(false);
    } catch (err: unknown) {
      const errorMessage = handleError(err, 'PostureImageList');
      setError(errorMessage);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Note: Header is not used - UI is handled within PostureImageListContent

  const content = loading ? (
    <div className="flex items-center justify-center h-screen">
      <div className="text-lg">読み込み中...</div>
    </div>
  ) : error ? (
    <div className="flex items-center justify-center h-screen">
      <div className="text-lg text-red-600">エラー: {error}</div>
    </div>
  ) : (
    <PostureImageListContent
      images={images}
      isSelectionMode={isSelectionMode}
      selectedImageIds={selectedImageIds}
      onToggleSelection={toggleImageSelection}
      showCompareModal={showCompareModal}
      compareImages={compareImages}
      onCloseCompareModal={() => setShowCompareModal(false)}
      setIsSelectionMode={setIsSelectionMode}
      onDelete={handleDelete}
      onCompare={handleCompare}
      onExitSelectionMode={exitSelectionMode}
    />
  );

  return {
    header: null,
    content: (
      <>
        {content}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="画像の削除"
          message={`選択した${selectedImageIds.size}枚の画像を削除しますか？`}
          confirmText="削除"
          cancelText="キャンセル"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      </>
    ),
    loading,
    error,
  };
};

/**
 * Main component for displaying posture images for a customer
 * Displays images grouped by date with selection and comparison features
 */
export const PostureImageList: React.FC = () => {
  const { content } = usePostureImageList();
  return <>{content}</>;
};

