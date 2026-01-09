import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PostureImage } from '../../types/posture';
import { formatDateForGrouping, formatDateTimeForCompare } from '../../utils/dateFormatter';
import { logger } from '../../utils/logger';
import { COLOR_CLASSES } from '../../constants/colors';
import { PosturePosition, isPosturePosition } from '../../constants/posture';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { PostureImageGrid } from '../../components/posture/PostureImageGrid';
import { PostureCompareModal } from '../../components/posture/PostureCompareModal';
import { PostureImageListFloatingButtons } from '../../components/posture/PostureImageListFloatingButtons';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { postureApi } from '../../api/postureApi';

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
          isModalOpen={showCompareModal}
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
        // バックエンドAPIから姿勢グループ一覧を取得
        // GET /api/customers/{customer_id}/posture_groups
        // レスポンス: PostureGroupResponse[] (各グループにimagesフィールドが含まれる)
        const postureGroups = await postureApi.getPostureGroups(customerId);

        if (!postureGroups || postureGroups.length === 0) {
          setImages([]);
          setLoading(false);
          return;
        }

        // すべてのグループの画像をフラット化
        const allImages: PostureImage[] = [];
        for (const group of postureGroups) {
          if (group.images && Array.isArray(group.images)) {
            allImages.push(...group.images);
          }
        }

        if (allImages.length === 0) {
          setImages([]);
          setLoading(false);
          return;
        }

        // デバッグログ: バックエンドから取得した画像情報を確認
        logger.debug('Fetched posture groups', { 
          groupCount: postureGroups.length,
          totalImageCount: allImages.length,
          imagesWithSignedUrl: allImages.filter(img => img.signedUrl && img.signedUrl.length > 0).length,
          imagesWithoutSignedUrl: allImages.filter(img => !img.signedUrl || img.signedUrl.length === 0).length
        }, 'PostureImageList');

        // バックエンドのレスポンス（camelCase）をフロントエンド用のPostureImage型に変換
        // バックエンドから取得したsignedUrlをそのまま使用（追加のAPI呼び出しは不要）
        const imagesWithUrls = allImages.map((img): PostureImage | null => {
          if (!img.storageKey) {
            return null;
          }

          // ポジションタイプのバリデーション
          if (!isPosturePosition(img.position)) {
            logger.warn('Invalid posture position', { position: img.position }, 'PostureImageList');
            return null;
          }

          // takenAtのバリデーション
          if (!img.takenAt) {
            logger.warn('Missing takenAt for image', { imageId: img.id }, 'PostureImageList');
            return null; // takenAtがない画像は除外
          }

          const position: PosturePosition = img.position;
          // バックエンドから取得したsignedUrlを使用（存在しない場合は空文字列）
          const signedUrl = img.signedUrl || '';

          // 検証ログ: signedUrlの詳細を記録（パスの検証用）
          // 相対パスの場合は警告を出力（バックエンドで変換されるべき）
          if (signedUrl) {
            const isAbsolute = signedUrl.startsWith('http://') || signedUrl.startsWith('https://');
            const isRelative = signedUrl.startsWith('/');
            
            if (isRelative) {
              // 相対パスが返されている場合は警告（バックエンドで変換されるべき）
              logger.warn('Received relative signedUrl from backend (should be converted to absolute)', { 
                imageId: img.id, 
                storageKey: img.storageKey,
                position: img.position,
                signedUrl: signedUrl.substring(0, Math.min(100, signedUrl.length))
              }, 'PostureImageList');
            } else if (isAbsolute) {
              // 絶対URLの場合はデバッグログのみ
              logger.debug('Image with absolute signedUrl', { 
                imageId: img.id, 
                position: img.position,
                signedUrlLength: signedUrl.length
              }, 'PostureImageList');
            } else {
              // その他の形式の場合は警告
              logger.warn('Image with invalid signedUrl format', { 
                imageId: img.id, 
                storageKey: img.storageKey,
                position: img.position,
                signedUrl: signedUrl.substring(0, Math.min(100, signedUrl.length))
              }, 'PostureImageList');
            }
          } else {
            logger.warn('Image without signedUrl', { 
              imageId: img.id, 
              storageKey: img.storageKey,
              position: img.position,
              hasStorageKey: !!img.storageKey,
              storageKeyLength: img.storageKey?.length || 0
            }, 'PostureImageList');
          }

          return {
            id: img.id,
            storageKey: img.storageKey, // camelCase
            position: position,
            takenAt: img.takenAt, // camelCase
            consentPublication: img.consentPublication,
            postureGroupId: img.postureGroupId,
            url: signedUrl,
            date: formatDateForGrouping(img.takenAt),
            formattedDateTime: formatDateTimeForCompare(img.takenAt),
          };
        });

        const validImages = imagesWithUrls.filter((img): img is PostureImage => img !== null);
        
        // デバッグログ: 最終的な画像数とsignedUrlの有無を確認
        const imagesWithAbsoluteUrl = validImages.filter(img => img.url && (img.url.startsWith('http://') || img.url.startsWith('https://')));
        const imagesWithRelativeUrl = validImages.filter(img => img.url && img.url.startsWith('/'));
        const imagesWithoutUrl = validImages.filter(img => !img.url || img.url.length === 0);
        
        logger.info('Processed images summary', { 
          total: validImages.length,
          withAbsoluteUrl: imagesWithAbsoluteUrl.length,
          withRelativeUrl: imagesWithRelativeUrl.length,
          withoutUrl: imagesWithoutUrl.length,
          // 相対URLがある場合は警告
          relativeUrls: imagesWithRelativeUrl.length > 0 ? imagesWithRelativeUrl
            .filter(img => img.url) // nullチェック
            .map(img => ({
              imageId: img.id,
              url: img.url!.substring(0, Math.min(100, img.url!.length))
            })) : []
        }, 'PostureImageList');
        
        // 相対URLがある場合は警告
        if (imagesWithRelativeUrl.length > 0) {
          logger.warn('Some images have relative URLs (backend should convert to absolute)', {
            count: imagesWithRelativeUrl.length,
            sampleUrls: imagesWithRelativeUrl
              .filter(img => img.url) // nullチェック
              .slice(0, 3)
              .map(img => img.url!.substring(0, Math.min(100, img.url!.length)))
          }, 'PostureImageList');
        }
        
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

  // 注意: ヘッダーは使用されていません - UIはPostureImageListContent内で処理されます

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

