import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { lessonApi } from '../api/lessonApi';
import { Lesson } from '../types/lesson';
import { supabase } from '../lib/supabase';
import { formatDateTime } from '../utils/dateFormatter';

type Option = { id: string; name: string };
type PosturePosition = 'front' | 'right' | 'back' | 'left';
type PosturePreview = { position: PosturePosition; url: string; storageKey: string };
type Training = { name: string; reps: number };

export const LessonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [stores, setStores] = useState<Option[]>([]);
  const [users, setUsers] = useState<Option[]>([]);
  const [customers, setCustomers] = useState<Option[]>([]);
  const [posturePreviews, setPosturePreviews] = useState<PosturePreview[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const labelClass =
    'inline-block text-2xl font-semibold text-gray-800 whitespace-nowrap leading-tight';
  const inputClass =
    'block w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-xl bg-gray-100 text-gray-800';
  const sectionHeadingClass = 'text-lg font-medium text-gray-700';

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase.from('stores').select('id,name');
          if (error) throw error;
          setStores((data as any[])?.map((d) => ({ id: d.id, name: d.name })) ?? []);
        }
      } catch {
        setStores([]);
      }

      try {
        if (supabase) {
          const { data, error } = await supabase.from('users').select('id,name');
          if (error) throw error;
          setUsers((data as any[])?.map((d) => ({ id: d.id, name: d.name })) ?? []);
        }
      } catch {
        setUsers([]);
      }

      try {
        if (supabase) {
          const { data, error } = await supabase.from('customers').select('id,name');
          if (error) throw error;
          setCustomers((data as any[])?.map((d) => ({ id: d.id, name: d.name })) ?? []);
        }
      } catch {
        setCustomers([]);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      if (!supabase) {
        setError('Supabase未設定です');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const data = await lessonApi.getById(id);
        setLesson(data);
        const client = supabase;
        
        // fetch posture images if any
        if (client) {
          let postureGroupIdToUse = data.postureGroupId;
          
          // postureGroupIdがnullの場合、lesson_idからposture_groupsを検索
          if (!postureGroupIdToUse) {
            console.log('postureGroupId is null, searching by lesson_id:', id);
            const { data: pgData, error: pgError } = await client
              .from('posture_groups')
              .select('id')
              .eq('lesson_id', id)
              .single();
            
            if (!pgError && pgData) {
              postureGroupIdToUse = pgData.id;
              console.log('Found posture_group by lesson_id:', postureGroupIdToUse);
            } else {
              console.log('No posture_group found for lesson_id:', id, pgError);
            }
          }
          
          if (postureGroupIdToUse) {
            console.log('Fetching posture images for postureGroupId:', postureGroupIdToUse);
            const { data: imgs, error: imgErr } = await client
              .from('posture_images')
              .select('storage_key, position')
              .eq('posture_group_id', postureGroupIdToUse);
            
            if (imgErr) {
              console.error('Error fetching posture images:', imgErr);
            } else if (imgs && imgs.length > 0) {
              console.log('Found posture images:', imgs);
              const previewResults = await Promise.all(
                imgs.map(async (img: any): Promise<PosturePreview | null> => {
                  if (!img.storage_key) {
                    console.warn('Missing storage_key for image:', img);
                    return null;
                  }
                  console.log('Getting signed URL for storage_key:', img.storage_key, 'position:', img.position);
                  // プライベートバケットの場合は署名付きURLを使用
                  const { data: signedUrlData, error: signedUrlError } = await client.storage
                    .from('postures')
                    .createSignedUrl(img.storage_key, 3600); // 1時間有効
                  
                  if (signedUrlError) {
                    console.error('Error creating signed URL for', img.position, ':', signedUrlError);
                    // フォールバック: パブリックURLを試す
                    const { data: publicUrl } = client.storage
                      .from('postures')
                      .getPublicUrl(img.storage_key);
                    console.log('Using public URL as fallback for', img.position, ':', publicUrl.publicUrl);
                    return {
                      position: img.position as PosturePosition,
                      url: publicUrl.publicUrl,
                      storageKey: img.storage_key as string,
                    };
                  }
                  
                  console.log('Generated signed URL for', img.position, ':', signedUrlData?.signedUrl);
                  return {
                    position: img.position as PosturePosition,
                    url: signedUrlData?.signedUrl || '',
                    storageKey: img.storage_key as string,
                  };
                })
              );
              const validPreviews: PosturePreview[] = previewResults.filter((p): p is PosturePreview => p !== null);
              setPosturePreviews(validPreviews);
            } else {
              console.log('No posture images found for postureGroupId:', postureGroupIdToUse);
            }
          } else {
            console.log('No postureGroupId available for lesson:', id);
          }
        }

        // fetch trainings
        if (client) {
          const { data: trainingsData, error: trainingsErr } = await client
            .from('trainings')
            .select('name, reps')
            .eq('lesson_id', id)
            .order('order_no');
          if (!trainingsErr && trainingsData) {
            setTrainings(trainingsData.map((t: any) => ({ name: t.name, reps: t.reps })));
          }
        }
      } catch (err) {
        console.error(err);
        setError('レッスン情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const findName = (list: Option[], targetId?: string | null) =>
    list.find((o) => o.id === targetId)?.name ?? '';

  const labelMap: Record<PosturePosition, string> = {
    front: '正面',
    right: '右',
    back: '背面',
    left: '左',
  };

  if (!id) {
    return (
      <div className="p-6">
        <p className="text-red-600">レッスンIDが指定されていません。</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-6">
        <p className="text-red-600">レッスンが見つかりません。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f1] py-8">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8 space-y-6">
        <div className="-mx-6 md:-mx-8 -mt-6 md:-mt-8 px-6 md:px-8 border-2 border-green-400 rounded-lg p-5 md:p-6 bg-white shadow-sm">
          <h1 className="text-4xl font-normal text-gray-800 mb-2">レッスン詳細</h1>
          <p className="text-lg text-gray-500">登録済みのレッスン情報を表示します</p>
        </div>

        <div className="space-y-4">
          <h2 className={sectionHeadingClass}>顧客・体重</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-5 md:gap-x-12">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>顧客：</label>
              <input className={inputClass} value={findName(customers, lesson.customerId)} readOnly />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>体重 (kg)：</label>
              <input
                className={inputClass}
                value={lesson.weight ?? ''}
                readOnly
                placeholder="—"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className={sectionHeadingClass}>担当・店舗</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-5 md:gap-x-12">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>担当：</label>
              <input className={inputClass} value={findName(users, lesson.userId)} readOnly />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>店舗：</label>
              <input className={inputClass} value={findName(stores, lesson.storeId)} readOnly />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className={sectionHeadingClass}>体調・食事</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-5 md:gap-x-12">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>体調：</label>
              <input className={inputClass} value={lesson.condition ?? ''} readOnly />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>食事：</label>
              <input className={inputClass} value={lesson.meal ?? ''} readOnly />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className={sectionHeadingClass}>開始時間・終了時間</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 md:gap-x-12 md:gap-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-2xl font-semibold text-gray-800">開始時間：</label>
              <input className={inputClass} value={lesson.startDate ? formatDateTime(lesson.startDate) : ''} readOnly />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-2xl font-semibold text-gray-800">終了時間：</label>
              <input className={inputClass} value={lesson.endDate ? formatDateTime(lesson.endDate) : ''} readOnly />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className={sectionHeadingClass}>次回予約</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <span className="text-2xl font-semibold text-gray-800 whitespace-nowrap">日にち/時刻：</span>
            <input className={`${inputClass} md:flex-1`} value={lesson.nextDate ? formatDateTime(lesson.nextDate) : ''} readOnly />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              <label className={labelClass}>次回店舗：</label>
              <input className={`${inputClass} md:flex-1`} value={findName(stores, lesson.nextStoreId)} readOnly />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              <label className={labelClass}>次回トレーナー：</label>
              <input className={`${inputClass} md:flex-1`} value={findName(users, lesson.nextUserId)} readOnly />
            </div>
          </div>
        </div>

        <div className="border-2 border-gray-300 rounded-lg p-4 space-y-3 bg-white">
          <div className="text-lg font-medium text-gray-800">トレーニング内容</div>

          {trainings.length === 0 && (
            <p className="text-sm text-gray-500">トレーニング内容は登録されていません。</p>
          )}

          {trainings.map((t, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 border border-gray-200 rounded-lg p-3 bg-gray-50"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 flex-1">
                <div className="flex items-center gap-2 md:min-w-[100px]">
                  <span className="text-lg font-semibold text-gray-800">名称：</span>
                </div>
                <input
                  type="text"
                  className={`${inputClass} flex-1`}
                  value={t.name}
                  readOnly
                />
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-lg font-semibold text-gray-800">回数：</span>
                <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg px-2 py-1 bg-white">
                  <input
                    type="number"
                    className="w-16 text-center border-none focus:outline-none text-lg bg-white"
                    value={t.reps}
                    readOnly
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className={labelClass}>備考欄</label>
          <textarea
            className={`${inputClass} min-h-[180px]`}
            value={lesson.memo ?? ''}
            readOnly
            rows={5}
          />
        </div>

        <div className="border-2 border-gray-300 rounded-xl p-4 space-y-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">姿勢（正面/右/背面/左）</h2>
            <span className="text-sm text-gray-500">閲覧専用</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(['front', 'right', 'back', 'left'] as PosturePosition[]).map((pos) => {
              const preview = posturePreviews.find((p) => p.position === pos);
              return (
                <div
                  key={pos}
                  className="border border-gray-200 rounded-lg p-2 flex flex-col space-y-2 bg-white"
                >
                  <div className="text-sm font-medium text-gray-800">{labelMap[pos]}</div>
                  <div className="h-24 bg-white flex items-center justify-center border border-dashed border-gray-200 rounded">
                    {preview ? (
                      <img 
                        src={preview.url} 
                        alt={pos} 
                        className="max-h-24 object-contain" 
                        onError={(e) => {
                          console.error('Image load error for', pos, ':', preview.url);
                          console.error('Storage key:', preview.storageKey);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully for', pos, ':', preview.url);
                        }}
                      />
                    ) : (
                      <span className="text-xs text-gray-500">なし</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
