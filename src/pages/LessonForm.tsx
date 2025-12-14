import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { lessonApi } from '../api/lessonApi';
import { LessonFormData, TrainingInput } from '../types/lesson';
import { supabase } from '../lib/supabase';

type Option = { id: string; name: string };
type PosturePosition = 'front' | 'right' | 'back' | 'left';
type PosturePreview = {
  position: PosturePosition;
  url: string;
  storageKey: string;
};

export const LessonForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [stores, setStores] = useState<Option[]>([]);
  const [users, setUsers] = useState<Option[]>([]);
  const [customers, setCustomers] = useState<Option[]>([]);
  const [trainings, setTrainings] = useState<TrainingInput[]>([]);
  const [posturePreviews, setPosturePreviews] = useState<PosturePreview[]>([]);
  const [postureGroupId, setPostureGroupId] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<LessonFormData>({
    storeId: '',
    userId: '',
    customerId: '',
    condition: '',
    weight: null,
    meal: '',
    memo: '',
    startDate: '',
    endDate: '',
    nextDate: '',
    nextStoreId: '',
    nextUserId: '',
    trainings: [],
  });

  useEffect(() => {
    const fetchOptions = async () => {
      // Stores
      try {
        if (supabase) {
          const { data, error } = await supabase.from('stores').select('id,name');
          if (error) throw error;
          setStores((data as any[])?.map((d) => ({ id: d.id, name: d.name })) ?? []);
        } else {
          setStores([]);
        }
      } catch {
        setStores([]);
      }

      // Users (担当)
      try {
        if (supabase) {
          const { data, error } = await supabase.from('users').select('id,name');
          if (error) throw error;
          setUsers((data as any[])?.map((d) => ({ id: d.id, name: d.name })) ?? []);
        } else {
          setUsers([]);
        }
      } catch {
        setUsers([]);
      }

      // Customers
      try {
        if (supabase) {
          const { data, error } = await supabase.from('customers').select('id,name');
          if (error) throw error;
          setCustomers((data as any[])?.map((d) => ({ id: d.id, name: d.name })) ?? []);
        } else {
          setCustomers([]);
        }
      } catch {
        setCustomers([]);
      }
    };

    fetchOptions();
  }, []);

  // URLクエリパラメータから顧客IDを取得して自動選択
  useEffect(() => {
    const customerIdFromUrl = searchParams.get('customerId');
    if (customerIdFromUrl && customers.length > 0) {
      // 顧客リストに該当する顧客が存在するか確認
      const customerExists = customers.some((c) => c.id === customerIdFromUrl);
      if (customerExists) {
        setFormData((prev) => ({
          ...prev,
          customerId: customerIdFromUrl,
        }));
      }
    }
  }, [searchParams, customers]);

  const handleTrainingChange = (index: number, key: keyof TrainingInput, value: string) => {
    setTrainings((prev) => {
      const copy = [...prev];
      const target = copy[index] ?? { name: '', reps: 0 };
      const updated =
        key === 'reps' ? { ...target, reps: Number(value) || 0 } : { ...target, [key]: value };
      copy[index] = updated;
      return copy;
    });
  };

  const addTraining = () => setTrainings((prev) => [...prev, { name: '', reps: 0 }]);
  const removeTraining = (index: number) =>
    setTrainings((prev) => prev.filter((_, i) => i !== index));

  const mergedTrainings = useMemo(() => trainings, [trainings]);

  // カメラ開始
  const startCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
        await videoRef.current.play();
      }
      setError('');
    } catch (err) {
      console.error('Camera start error', err);
      setError('カメラを起動できませんでした。権限やHTTPS環境を確認してください。');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  // posture_group を作成（まだ無ければ）
  const ensurePostureGroup = async (): Promise<string | null> => {
    const client = supabase;
    if (!client) {
      setError('Supabase未設定のため姿勢画像を保存できません');
      return null;
    }
    if (postureGroupId) return postureGroupId;
    if (!formData.customerId) {
      setError('顧客を選択してください');
      return null;
    }
    const now = new Date().toISOString();
    const { data, error: pgError } = await client
      .from('posture_groups')
      .insert([
        {
          customer_id: formData.customerId,
          lesson_id: null,
          captured_at: now,
          created_at: now,
        },
      ])
      .select()
      .single();
    if (pgError) {
      console.error(pgError);
      setError('姿勢グループの作成に失敗しました');
      return null;
    }
    const newId = (data as any).id as string;
    setPostureGroupId(newId);
    return newId;
  };

  const captureAndUpload = async (position: PosturePosition) => {
    setError('');
    const client = supabase;
    const video = videoRef.current;
    if (!video) {
      setError('カメラが起動していません');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('キャンバス生成に失敗しました');
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    await new Promise<void>((resolve) =>
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError('画像の生成に失敗しました');
          resolve();
          return;
        }

        // Always show local preview to avoid blocking when Supabase未設定や顧客未選択
        const localUrl = URL.createObjectURL(blob);
        const updatePreview = (storageKey: string) =>
          setPosturePreviews((prev) => {
            const filtered = prev.filter((p) => p.position !== position);
            return [...filtered, { position, url: localUrl, storageKey }];
          });

        const canUpload = !!client && !!formData.customerId;
        if (!canUpload) {
          if (!client) setError('Supabase未設定のためローカルプレビューのみ表示します');
          else if (!formData.customerId) setError('顧客未選択のためローカルプレビューのみ表示します');
          updatePreview('');
          resolve();
          return;
        }

        const groupId = await ensurePostureGroup();
        if (!groupId) {
          updatePreview('');
          resolve();
          return;
        }

        const fileName = `${position}.jpg`;
        const path = `postures/${formData.customerId}/${groupId}/${fileName}`;
        console.log('Uploading image to path:', path, 'groupId:', groupId, 'position:', position, 'blob size:', blob.size);
        const { data: uploadData, error: uploadError } = await client.storage
          .from('postures')
          .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
        if (uploadError) {
          console.error('Upload error:', uploadError);
          console.error('Upload error details:', JSON.stringify(uploadError, null, 2));
          setError(`画像のアップロードに失敗しました: ${uploadError.message || '不明なエラー'}`);
          updatePreview('');
          resolve();
          return;
        }
        console.log('Upload successful:', uploadData);
        console.log('Uploaded file path:', uploadData?.path);
        // 同じポジションの既存レコードを削除
        const { error: deleteError } = await client
          .from('posture_images')
          .delete()
          .eq('posture_group_id', groupId)
          .eq('position', position);
        if (deleteError) {
          console.error(deleteError);
          // 削除エラーは警告として記録するが、続行する
        }
        // 新しいレコードを挿入
        console.log('Inserting posture_image record with storage_key:', path);
        const { data: insertData, error: insertError } = await client.from('posture_images').insert({
          posture_group_id: groupId,
          storage_key: path,
          position,
          consent_publication: false,
          taken_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }).select();
        if (insertError) {
          console.error('Insert error:', insertError);
          setError('画像情報の保存に失敗しました');
          updatePreview('');
          resolve();
          return;
        }
        console.log('Insert successful:', insertData);

        updatePreview(path);
        resolve();
      }, 'image/jpeg', 0.92)
    );
  };

  const postureSlots: PosturePosition[] = ['front', 'right', 'back', 'left'];
  const [selectedPosture, setSelectedPosture] = useState<PosturePosition>('front');
  const nextPostureSlot = useMemo<PosturePosition>(() => {
    const taken = posturePreviews.map((p) => p.position);
    const firstEmpty = postureSlots.find((p) => !taken.includes(p));
    return firstEmpty ?? postureSlots[0];
  }, [posturePreviews]);

  useEffect(() => {
    // デフォルトの選択を未撮影枠に合わせる
    setSelectedPosture(nextPostureSlot);
  }, [nextPostureSlot]);

  const captureSelectedPosture = async () => {
    await captureAndUpload(selectedPosture);
  };

  const removePosturePreview = (position: PosturePosition) => {
    setPosturePreviews((prev) => prev.filter((p) => p.position !== position));
  };

  // レッスン作成後に posture_group をレッスンIDと紐づける
  const linkPostureGroupToLesson = async (lessonId: string) => {
    if (!supabase || !postureGroupId) return;
    const { error } = await supabase
      .from('posture_groups')
      .update({ lesson_id: lessonId })
      .eq('id', postureGroupId);
    if (error) {
      console.error('Failed to link posture_group to lesson', error);
      // 画面遷移は続行するが、エラーは表示
      setError('姿勢データの紐付けに失敗しました');
    }
  };
  const labelClass =
    'inline-block text-2xl font-semibold text-gray-800 whitespace-nowrap leading-tight';
  const inputClass =
    'block w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300';
  const sectionHeadingClass = 'text-lg font-medium text-gray-700';
  const displayStartDate = formData.startDate ? formData.startDate.replace('T', ' ') : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.storeId || !formData.userId || !formData.customerId) {
      setError('店舗・担当・顧客は必須です');
      return;
    }
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      setError('終了日時は開始日時より後にしてください');
      return;
    }

    setLoading(true);
    try {
      const created = await lessonApi.create({ 
        ...formData, 
        postureGroupId: postureGroupId ?? undefined,
        trainings: mergedTrainings 
      });
      if (created?.id) {
        await linkPostureGroupToLesson(created.id);
      }
      // 姿勢画像一覧ページに遷移
      if (formData.customerId) {
        navigate(ROUTES.POSTURE_IMAGE_LIST.replace(':customerId', formData.customerId));
      } else {
        navigate(ROUTES.CUSTOMER_SELECT);
      }
    } catch (err) {
      console.error('Error creating lesson:', err);
      setError('レッスン作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f1] py-8">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8 space-y-6">
        <div className="-mx-6 md:-mx-8 -mt-6 md:-mt-8 px-6 md:px-8 border-2 border-green-400 rounded-lg p-5 md:p-6 bg-white shadow-sm">
          <h1 className="text-4xl font-normal text-gray-800 mb-2">トレーニング内容を記録</h1>
          <p className="text-lg text-gray-500">
            {(() => {
              const current = customers.find((c) => c.id === formData.customerId);
              if (!current) return '顧客を選択してください';
              return displayStartDate ? `${current.name} さん - ${displayStartDate}` : `${current.name} さん`;
            })()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="space-y-4">
          <h2 className={sectionHeadingClass}>顧客・体重</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-5 md:gap-x-12">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className={labelClass}>顧客：</label>
            <select
                className={`${inputClass} sm:flex-1`}
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
            >
              <option value="">選択してください</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                </option>
              ))}
            </select>
          </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className={labelClass}>体重 (kg)：</label>
              <input
                type="number"
                step="0.1"
                className={`${inputClass} sm:flex-1`}
                value={formData.weight ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className={sectionHeadingClass}>担当・店舗</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-5 md:gap-x-12">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className={labelClass}>担当：</label>
            <select
                className={`${inputClass} sm:flex-1`}
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              required
            >
              <option value="">選択してください</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className={labelClass}>店舗：</label>
            <select
                className={`${inputClass} sm:flex-1`}
                value={formData.storeId}
                onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
              required
            >
              <option value="">選択してください</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                </option>
              ))}
            </select>
            </div>
          </div>
          </div>

        <div className="space-y-4">
          <h2 className={sectionHeadingClass}>体調・食事</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-5 md:gap-x-12">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className={labelClass}>体調：</label>
            <input
              type="text"
                className={`${inputClass} sm:flex-1`}
              value={formData.condition ?? ''}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                placeholder="体調メモ (condition)"
            />
          </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className={labelClass}>食事：</label>
            <input
              type="text"
                className={`${inputClass} sm:flex-1`}
              value={formData.meal ?? ''}
              onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
                placeholder="食事内容 (meal)"
            />
            </div>
          </div>
          </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <h2 className={sectionHeadingClass}>開始時間・終了時間</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 md:gap-x-12 md:gap-y-4">
              <div className="flex flex-row items-center gap-3 md:gap-4">
                <label className="text-2xl font-semibold text-gray-800 whitespace-nowrap">開始時間：</label>
            <input
              type="datetime-local"
                  className={`${inputClass} flex-1`}
              value={formData.startDate ?? ''}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

              <div className="flex flex-row items-center gap-3 md:gap-4">
                <label className="text-2xl font-semibold text-gray-800 whitespace-nowrap">終了時間：</label>
            <input
              type="datetime-local"
                  className={`${inputClass} flex-1`}
              value={formData.endDate ?? ''}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className={sectionHeadingClass}>次回予約</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              <span className="text-2xl font-semibold text-gray-800 whitespace-nowrap">日にち/時刻：</span>
            <input
              type="datetime-local"
                className={`${inputClass} md:flex-1`}
              value={formData.nextDate ?? ''}
              onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
            />
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                <label className={labelClass}>次回店舗：</label>
            <select
                  className={`${inputClass} md:flex-1`}
              value={formData.nextStoreId ?? ''}
              onChange={(e) => setFormData({ ...formData, nextStoreId: e.target.value })}
            >
              <option value="">未定</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                <label className={labelClass}>次回トレーナー：</label>
            <select
                  className={`${inputClass} md:flex-1`}
              value={formData.nextUserId ?? ''}
              onChange={(e) => setFormData({ ...formData, nextUserId: e.target.value })}
            >
              <option value="">未定</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
          </div>
        </div>

        <div className="border-2 border-gray-300 rounded-lg p-4 space-y-3 bg-white">
          <div className="text-lg font-medium text-gray-800">トレーニング内容</div>

          {trainings.length === 0 && (
            <p className="text-sm text-gray-500">未追加です。「追加する」を押して項目を追加してください。</p>
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
                  placeholder="例：スクワット、腹筋"
                  className={`${inputClass} flex-1`}
                value={t.name}
                onChange={(e) => handleTrainingChange(idx, 'name', e.target.value)}
                required
              />
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-lg font-semibold text-gray-800">回数：</span>
                <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg px-2 py-1 bg-white">
                  <button
                    type="button"
                    className="px-2 py-1 text-lg font-semibold text-gray-700 hover:text-gray-900"
                    onClick={() =>
                      handleTrainingChange(idx, 'reps', String(Math.max(0, (t.reps || 0) - 1)))
                    }
                  >
                    −
                  </button>
              <input
                type="number"
                    className="w-16 text-center border-none focus:outline-none text-lg"
                value={t.reps}
                onChange={(e) => handleTrainingChange(idx, 'reps', e.target.value)}
                required
              />
              <button
                type="button"
                    className="px-2 py-1 text-lg font-semibold text-gray-700 hover:text-gray-900"
                    onClick={() => handleTrainingChange(idx, 'reps', String((t.reps || 0) + 1))}
                  >
                    ＋
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="text-sm text-red-600 hover:text-red-700 self-start md:self-center"
                onClick={() => removeTraining(idx)}
              >
                削除
              </button>
            </div>
          ))}

          <button
            type="button"
            className="w-full px-4 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600"
            onClick={addTraining}
          >
            追加する ＋
          </button>
        </div>

        {/* 姿勢撮影セクション */}
        <div className="border-2 border-gray-300 rounded-xl p-4 space-y-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">姿勢（正面/右/背面/左）</h2>
            <div className="space-x-2">
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                カメラ開始
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                停止
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} className="w-full h-64 object-cover" muted autoPlay playsInline />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {postureSlots.map((pos) => {
                const preview = posturePreviews.find((p) => p.position === pos);
                const labelMap: Record<PosturePosition, string> = {
                  front: '正面',
                  right: '右',
                  back: '背面',
                  left: '左',
                };
                const isSelected = selectedPosture === pos;
                return (
                  <div
                    key={pos}
                    className={`border border-gray-200 rounded-lg p-2 flex flex-col space-y-2 bg-white ${
                      isSelected ? 'ring-2 ring-green-300' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-800 flex items-center justify-between">
                      <span>{labelMap[pos]}</span>
                      {preview && (
                        <button
                          type="button"
                          className="text-xs text-red-600 hover:text-red-700"
                          onClick={() => removePosturePreview(pos)}
                        >
                          削除
                        </button>
                      )}
                    </div>
                    <div className="h-24 bg-white flex items-center justify-center border border-dashed border-gray-200 rounded">
                      {preview ? (
                        <img src={preview.url} alt={pos} className="max-h-24 object-contain" />
                      ) : (
                        <span className="text-xs text-gray-500">未撮影</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`px-3 py-2 rounded-lg border ${
                        isSelected
                          ? 'border-green-500 text-green-700 bg-green-50'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedPosture(pos)}
                    >
                      {isSelected ? '選択中' : '選択'}（{labelMap[pos]}）
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              disabled={!stream}
              className="w-full md:w-auto px-16 py-4 bg-green-500 text-white rounded-full text-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={captureSelectedPosture}
            >
              撮影する（{(() => {
                const labelMap: Record<PosturePosition, string> = {
                  front: '正面',
                  right: '右',
                  back: '背面',
                  left: '左',
                };
                return labelMap[selectedPosture];
              })()}）
            </button>
          </div>
          <p className="text-xs text-gray-500">
            カメラが起動しない場合はブラウザの権限設定を確認してください。撮影は最大4枚（正面/右/背面/左）。
          </p>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>備考欄</label>
          <textarea
            className={`${inputClass} min-h-[180px]`}
            value={formData.memo ?? ''}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            rows={5}
          />
        </div>

        <div className="pt-4 flex gap-3 justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? '登録中...' : '登録'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

