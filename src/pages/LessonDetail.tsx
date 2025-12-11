import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { lessonApi } from '../api/lessonApi';
import { Lesson } from '../types/lesson';
import { supabase } from '../lib/supabase';

type Option = { id: string; name: string };
type PosturePosition = 'front' | 'right' | 'back' | 'left';
type PosturePreview = { position: PosturePosition; url: string; storageKey: string };

export const LessonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [stores, setStores] = useState<Option[]>([]);
  const [users, setUsers] = useState<Option[]>([]);
  const [customers, setCustomers] = useState<Option[]>([]);
  const [posturePreviews, setPosturePreviews] = useState<PosturePreview[]>([]);
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
        // fetch posture images if any
        const client = supabase;
        if (client && data.postureGroupId) {
          const { data: imgs, error: imgErr } = await client
            .from('posture_images')
            .select('storage_key, position')
            .eq('posture_group_id', data.postureGroupId);
          if (!imgErr && imgs) {
            const previews: PosturePreview[] = imgs.map((img: any) => {
              const { data: publicUrl } = client.storage
                .from('postures')
                .getPublicUrl(img.storage_key);
              return {
                position: img.position as PosturePosition,
                url: publicUrl.publicUrl,
                storageKey: img.storage_key as string,
              };
            });
            setPosturePreviews(previews);
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
      <div className="p-6 space-y-4">
        <p className="text-red-600">{error}</p>
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => navigate(ROUTES.LESSON_HISTORY)}
        >
          履歴に戻る
        </button>
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
              <input className={inputClass} value={lesson.startDate ?? ''} readOnly />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-2xl font-semibold text-gray-800">終了時間：</label>
              <input className={inputClass} value={lesson.endDate ?? ''} readOnly />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className={sectionHeadingClass}>次回予約</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <span className="text-2xl font-semibold text-gray-800 whitespace-nowrap">日にち/時刻：</span>
            <input className={`${inputClass} md:flex-1`} value={lesson.nextDate ?? ''} readOnly />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-3">
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
                        <img src={preview.url} alt={pos} className="max-h-24 object-contain" />
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

        <div className="pt-4 flex gap-3 justify-end">
          <button
            type="button"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300"
            onClick={() => navigate(ROUTES.LESSON_HISTORY)}
          >
            履歴に戻る
          </button>
        </div>
      </div>
    </div>
  );
};
