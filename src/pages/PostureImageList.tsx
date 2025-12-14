import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PostureImage } from '../types/posture';
import { formatDateForGrouping, formatDateTimeForCompare, groupByDate } from '../utils/dateFormatter';
import { customerApi } from '../api/customerApi';

type PosturePosition = 'front' | 'right' | 'back' | 'left';

const positionLabels: Record<PosturePosition, string> = {
  front: 'Front',
  right: 'Right',
  back: 'Back',
  left: 'Left',
};

const positionColors: Record<PosturePosition, string> = {
  front: 'bg-[#F2AFAF] text-black',
  right: 'bg-[#F2AFAF] text-black',
  back: 'bg-[#F2AFAF] text-black',
  left: 'bg-[#F2AFAF] text-black',
};

// ヘッダー用の状態とロジックを管理するカスタムフック
export const usePostureImageListHeader = () => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareImages, setCompareImages] = useState<PostureImage[]>([]);

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
  };
};

// ヘッダーコンポーネント
interface PostureImageListHeaderProps {
  isSelectionMode: boolean;
  setIsSelectionMode: (value: boolean) => void;
  selectedImageIds: Set<string>;
  onDelete: () => void;
  onCompare: () => void;
  onExitSelectionMode: () => void;
}

export const PostureImageListHeader: React.FC<PostureImageListHeaderProps> = ({
  isSelectionMode,
  setIsSelectionMode,
  selectedImageIds,
  onDelete,
  onCompare,
  onExitSelectionMode,
}) => {
  return (
    <div className="pt-6 px-6 pb-4">
      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          {!isSelectionMode ? (
            <button
              onClick={() => setIsSelectionMode(true)}
              className="px-4 py-2 bg-[#F2AFAF] text-black rounded hover:bg-[#E89A9A]"
            >
              選択
            </button>
          ) : (
            <div className="flex gap-2 items-center">
              <button
                onClick={onDelete}
                disabled={selectedImageIds.size === 0}
                className={`px-4 py-2 rounded ${
                  selectedImageIds.size > 0
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                削除
              </button>
              <button
                onClick={onCompare}
                disabled={selectedImageIds.size !== 2}
                className={`px-4 py-2 rounded ${
                  selectedImageIds.size === 2
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                比較
              </button>
              <button
                onClick={onExitSelectionMode}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
}> = ({
  images,
  isSelectionMode,
  selectedImageIds,
  onToggleSelection,
  showCompareModal,
  compareImages,
  onCloseCompareModal,
}) => {
  const groupedImages = useMemo(() => {
    return groupByDate(images);
  }, [images]);

  return (
    <>
      <div className="bg-[#FAF8F3]">
        {/* 画像一覧 */}
        <div className="px-6 pt-6 pb-6">
          {groupedImages.size === 0 ? (
            <div className="text-center py-12 text-gray-500">
              画像がありません
            </div>
          ) : (
            <div className="space-y-6 w-full">
              {Array.from(groupedImages.entries()).map(([dateKey, dateImages]) => (
                <div key={dateKey} className="w-full">
                  {/* 日付ヘッダー */}
                  <div 
                    data-date-key={dateKey}
                    className="mb-3 flex items-center w-full"
                  >
                    <span className="bg-[#68BE6B] text-white px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0">{dateKey}</span>
                    <div data-line-element className="flex-1 h-[2px] bg-[#68BE6B] ml-2 shadow-[0_0_4px_rgba(104,190,107,0.5)]"></div>
                  </div>
                  {/* 画像グリッド */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {dateImages.map((image) => {
                      const isSelected = selectedImageIds.has(image.id);
                      return (
                        <div
                          key={image.id}
                          onClick={() => onToggleSelection(image.id)}
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all shadow-md ${
                            isSelected
                              ? 'ring-4 ring-[#F2AFAF]'
                              : ''
                          } ${!isSelectionMode ? 'cursor-default' : ''}`}
                        >
                          {image.url ? (
                            <img
                              src={image.url}
                              alt={positionLabels[image.position]}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                              画像なし
                            </div>
                          )}
                          {/* 下部オーバーレイ */}
                          <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-60 rounded-b-lg px-4 py-4 flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-800">
                              {image.taken_at
                                ? `${new Date(image.taken_at).getFullYear()}.${new Date(image.taken_at).getMonth() + 1}.${new Date(image.taken_at).getDate()}`
                                : ''}
                            </div>
                            <div
                              className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${positionColors[image.position]}`}
                            >
                              {positionLabels[image.position]}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 比較モーダル */}
        {showCompareModal && compareImages.length === 2 && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onCloseCompareModal}
          >
            <div
              className="bg-white rounded-lg p-8 max-w-7xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">画像比較</h2>
                <button
                  onClick={onCloseCompareModal}
                  className="text-gray-500 hover:text-gray-700 text-3xl"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center gap-6">
                {/* 左側画像 */}
                <div className="flex-1">
                  <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2">
                    {compareImages[0].url ? (
                      <img
                        src={compareImages[0].url}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        画像なし
                      </div>
                    )}
                  </div>
                  <div className="bg-white px-4 py-3 rounded text-base text-gray-700">
                    {compareImages[0].formattedDateTime || ''}
                  </div>
                </div>
                {/* 中央矢印 */}
                <div className="text-6xl text-gray-400">→</div>
                {/* 右側画像 */}
                <div className="flex-1">
                  <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2">
                    {compareImages[1].url ? (
                      <img
                        src={compareImages[1].url}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        画像なし
                      </div>
                    )}
                  </div>
                  <div className="bg-white px-4 py-3 rounded text-base text-gray-700">
                    {compareImages[1].formattedDateTime || ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ヘッダーとコンテンツを返すカスタムフック
export const usePostureImageList = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [images, setImages] = useState<PostureImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
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
  } = usePostureImageListHeader();

  // 顧客情報を取得
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) return;
      try {
        const customer = await customerApi.getById(customerId);
        setCustomerName(customer.name);
      } catch (err) {
        console.error('Error fetching customer:', err);
      }
    };
    fetchCustomer();
  }, [customerId]);

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

        // posture_groups から customer_id で検索
        const { data: postureGroups, error: pgError } = await client
          .from('posture_groups')
          .select('id, captured_at, lesson_id')
          .eq('customer_id', customerId)
          .order('captured_at', { ascending: false });

        if (pgError) {
          throw pgError;
        }

        if (!postureGroups || postureGroups.length === 0) {
          setImages([]);
          setLoading(false);
          return;
        }

        const postureGroupIds = postureGroups.map((pg) => pg.id);

        // 各 posture_group の画像を取得
        const { data: postureImages, error: imgError } = await client
          .from('posture_images')
          .select('id, storage_key, position, taken_at, posture_group_id')
          .in('posture_group_id', postureGroupIds)
          .order('taken_at', { ascending: false });

        if (imgError) {
          throw imgError;
        }

        if (!postureImages || postureImages.length === 0) {
          setImages([]);
          setLoading(false);
          return;
        }

        // 署名付きURLを生成
        const imagesWithUrls = await Promise.all(
          postureImages.map(async (img: any): Promise<PostureImage | null> => {
            if (!img.storage_key) {
              return null;
            }

            const { data: signedUrlData, error: signedUrlError } = await client.storage
              .from('postures')
              .createSignedUrl(img.storage_key, 604800); // 7日間有効

            if (signedUrlError) {
              console.error('Error creating signed URL:', signedUrlError);
              const { data: publicUrl } = client.storage
                .from('postures')
                .getPublicUrl(img.storage_key);
              return {
                id: img.id,
                storage_key: img.storage_key,
                position: img.position,
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
              position: img.position,
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
      } catch (err: any) {
        console.error('Error fetching images:', err);
        setError(err.message || '画像の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [customerId]);

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

    // 確認ダイアログ
    if (!window.confirm(`選択した${selectedImageIds.size}枚の画像を削除しますか？`)) {
      return;
    }

    try {
      const selectedImages = images.filter((img) => selectedImageIds.has(img.id));
      const storageKeys = selectedImages.map((img) => img.storage_key).filter(Boolean);

      // ストレージから削除
      if (storageKeys.length > 0) {
        const { error: storageError } = await client.storage
          .from('postures')
          .remove(storageKeys);
        if (storageError) {
          console.error('Error deleting from storage:', storageError);
        }
      }

      // データベースから削除
      const { error: dbError } = await client
        .from('posture_images')
        .delete()
        .in('id', Array.from(selectedImageIds));

      if (dbError) {
        throw dbError;
      }

      // リストを更新（削除した画像を除外）
      setImages((prev) => prev.filter((img) => !selectedImageIds.has(img.id)));
      setSelectedImageIds(new Set());
      setIsSelectionMode(false);
    } catch (err: any) {
      console.error('Error deleting images:', err);
      setError(err.message || '画像の削除に失敗しました');
    }
  };

  const header = (
    <PostureImageListHeader
      isSelectionMode={isSelectionMode}
      setIsSelectionMode={setIsSelectionMode}
      selectedImageIds={selectedImageIds}
      onDelete={handleDelete}
      onCompare={handleCompare}
      onExitSelectionMode={exitSelectionMode}
    />
  );

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
    />
  );

  return { header, content, loading, error };
};

// メインコンポーネント（コンテンツのみを返す）
export const PostureImageList: React.FC = () => {
  const { content } = usePostureImageList();
  return <>{content}</>;
};

