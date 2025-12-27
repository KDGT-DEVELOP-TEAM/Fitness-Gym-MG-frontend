import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PostureImage } from '../../types/posture';
import { formatDateForGrouping, formatDateTimeForCompare } from '../../utils/dateFormatter';
import { logger } from '../../utils/logger';
import { COLOR_CLASSES } from '../../constants/colors';
import { PosturePosition, isPosturePosition } from '../../constants/posture';
import { TIME_CONSTANTS } from '../../constants/time';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { PostureImageGrid } from '../../components/posture/PostureImageGrid';
import { PostureCompareModal } from '../../components/posture/PostureCompareModal';
import { PostureImageListFloatingButtons } from '../../components/posture/PostureImageListFloatingButtons';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { postureApi } from '../../api/postureApi';
import { customerApi } from '../../api/customerApi';

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
      if (!customerId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // REST APIから姿勢グループを取得
        const postureGroupsResponse = await customerApi.getProfile(customerId) as any;
        const postureGroups = postureGroupsResponse.postureGroups || [];

        if (!postureGroupsResponse.data || !Array.isArray(postureGroupsResponse.data) || postureGroupsResponse.data.length === 0) {
          setImages([]);
          setLoading(false);
          return;
        }

        // 各姿勢グループの画像を取得
        const allImages: PostureImageResponse[] = [];
        for (const group of postureGroups) {
          try {
            const imagesResponse = await postureApi.getPostureGroups(customerId) as any;
            const groupImages = imagesResponse.images || [];
            if (Array.isArray(groupImages)) {
              allImages.push(...groupImages);
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

        // 署名付きURLをバックエンド経由でバッチ取得
        let signedUrlMap: Map<string, string> = new Map();
        
        try {
          const imageIds = allImages.map(img => img.id).filter(Boolean);
          if (imageIds.length > 0) {
            const signedUrlResponse = await postureApi.getBatchSignedUrls(
              imageIds,
              TIME_CONSTANTS.SEVEN_DAYS_IN_SECONDS
            );
            
            if (signedUrlResponse && Array.isArray(signedUrlResponse.urls)) {
              signedUrlMap = new Map(
                signedUrlResponse.urls.map((u: any) => [u.imageId, u.signedUrl])
              );
            }
          }
        } catch (urlError) {
          logger.error('Failed to generate batch signed URLs', urlError, 'PostureImageList');
          // 署名付きURLの生成に失敗しても続行（URLなしで表示）
        }

        const imagesWithUrls = allImages.map((img: PostureImageResponse): PostureImage | null => {
          if (!img.storageKey) {
            return null;
          }

          // Validate position type
          if (!isPosturePosition(img.position)) {
            logger.warn('Invalid posture position', { position: img.position }, 'PostureImageList');
            return null;
          }

          const position: PosturePosition = img.position;
          const signedUrl = signedUrlMap.get(img.id) || '';

          return {
            id: img.id,
            storage_key: img.storageKey,
            position: position,
            taken_at: img.takenAt,
            posture_group_id: img.postureGroupId,
            url: signedUrl,
            date: formatDateForGrouping(img.takenAt),
            formattedDateTime: formatDateTimeForCompare(img.takenAt),
          };
        });

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
    if (selectedImageIds.size === 0) return;

    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedImageIds.size === 0) return;

    setShowDeleteConfirm(false);

    try {
      // バックエンド経由で削除（Storage + メタデータの両方を削除）
      logger.info('Deleting images via backend', { count: selectedImageIds.size }, 'PostureImageList');
      
      await Promise.all(
        Array.from(selectedImageIds).map((id) =>
          postureApi.deleteImage(id).catch((err) => {
            logger.error(`Failed to delete posture image ${id}`, err, 'PostureImageList');
            throw err;
          })
        )
      );

      // リストを更新（削除した画像を除外）
      setImages((prev) => prev.filter((img) => !selectedImageIds.has(img.id)));
      setSelectedImageIds(new Set());
      setIsSelectionMode(false);
      
      logger.info('Successfully deleted images', { count: selectedImageIds.size }, 'PostureImageList');
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

