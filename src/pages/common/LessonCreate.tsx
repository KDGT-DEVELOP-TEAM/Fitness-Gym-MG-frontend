import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { lessonApi } from '../../api/lessonApi';
import { postureApi } from '../../api/postureApi';
import { LessonFormData, TrainingInput, TrainingRequest, LessonRequest } from '../../types/lesson';
import { logger } from '../../utils/logger';
import { PosturePosition, getPosturePositionLabel, ALL_POSTURE_POSITIONS } from '../../constants/posture';
import { useOptions } from '../../hooks/useOptions';
import { IMAGE_QUALITY, CANVAS_DIMENSIONS } from '../../constants/image';
import { IMAGE_CONSTANTS, MAX_FILE_SIZE_BYTES } from '../../constants/storage';
import { FORM_STYLES } from '../../styles/formStyles';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { validateRequired, validateDateRange, validateNumericRange, validateNextLesson } from '../../utils/validators';
import { ERROR_MESSAGES } from '../../constants/errorMessages';
type PosturePreview = {
  position: PosturePosition;
  url: string;
  storageKey: string;
};

export const LessonCreate: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams<{ customerId?: string }>();
  const { stores, users, customers } = useOptions();
  const [trainings, setTrainings] = useState<TrainingInput[]>([]);
  const [posturePreviews, setPosturePreviews] = useState<PosturePreview[]>([]);
  const [postureGroupId, setPostureGroupId] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { handleError } = useErrorHandler();

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

  // URLパラメータまたはクエリパラメータから顧客IDを取得して自動選択
  useEffect(() => {
    // パスパラメータを優先、なければクエリパラメータを使用（後方互換性のため）
    const customerIdFromUrl = params.customerId || searchParams.get('customerId');
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
  }, [params.customerId, searchParams, customers]);

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

  const addTraining = () => setTrainings((prev) => [...prev, { name: '', reps: 0, orderNo: prev.length + 1 }]);
  const removeTraining = (index: number) =>
    setTrainings((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      // orderNoを再設定（1から連番）
      return filtered.map((t, idx) => ({ ...t, orderNo: idx + 1 }));
    });

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
      setError(handleError(err, 'LessonForm'));
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
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  // posture_group を作成（まだ無ければ）
  const ensurePostureGroup = async (): Promise<string | null> => {
    if (postureGroupId) return postureGroupId;
    if (!formData.customerId) {
      setError('顧客を選択してください');
      return null;
    }
    
    try {
      // バックエンドの仕様: lessonIdが必要なため、レッスン作成前は姿勢グループを作成できない
      // 一時的な姿勢グループIDを生成（実際の作成はレッスン作成後に行う）
      const tempId = `temp-${Date.now()}`;
      setPostureGroupId(tempId);
      logger.debug('Temporary posture group ID created', { id: tempId }, 'LessonForm');
      return tempId;
    } catch (error) {
      logger.error('Failed to create posture group', error, 'LessonForm');
      setError(handleError(error, 'LessonForm'));
      return null;
    }
  };

  const captureAndUpload = async (position: PosturePosition) => {
    setError('');
    const video = videoRef.current;
    if (!video) {
      setError('カメラが起動していません');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || CANVAS_DIMENSIONS.WIDTH;
    canvas.height = video.videoHeight || CANVAS_DIMENSIONS.HEIGHT;
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

        // ファイルサイズチェック
        if (blob.size > MAX_FILE_SIZE_BYTES) {
          setError(`ファイルサイズが上限（10MB）を超えています。現在のサイズ: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
          resolve();
          return;
        }

        // 常にローカルプレビューを表示
        const localUrl = URL.createObjectURL(blob);
        const updatePreview = (signedUrl: string, storageKey: string) =>
          setPosturePreviews((prev) => {
            const filtered = prev.filter((p) => p.position !== position);
            return [...filtered, { position, url: signedUrl || localUrl, storageKey }];
          });

        if (!formData.customerId) {
          setError('顧客未選択のためローカルプレビューのみ表示します');
          updatePreview('', '');
          resolve();
          return;
        }

        const groupId = await ensurePostureGroup();
        if (!groupId) {
          updatePreview('', '');
          resolve();
          return;
        }

        logger.debug('Uploading image via backend', { groupId, position, blobSize: blob.size }, 'LessonForm');
        
        try {
          // バックエンド仕様に合わせてuploadImageを呼び出し
          // consentPublicationはbooleanで送信（デフォルト: false）
          const response = await postureApi.uploadImage(blob as File, groupId, position, false);
          
          if (!response || !response.signedUrl) {
            setError('画像のアップロードに失敗しました');
            updatePreview('', '');
            resolve();
            return;
          }
          
          const { signedUrl, storageKey } = response;
          logger.debug('Upload successful', { storageKey, signedUrl }, 'LessonForm');
          
          updatePreview(signedUrl, storageKey);
          resolve();
        } catch (uploadError) {
          logger.error('Failed to upload image', uploadError, 'LessonForm');
          setError(handleError(uploadError, 'LessonForm'));
          updatePreview('', '');
          resolve();
        }
      }, IMAGE_CONSTANTS.JPEG_MIME_TYPE, IMAGE_QUALITY.JPEG)
    );
  };

  const postureSlots = useMemo(() => ALL_POSTURE_POSITIONS, []);
  const [selectedPosture, setSelectedPosture] = useState<PosturePosition>('front');
  const nextPostureSlot = useMemo<PosturePosition>(() => {
    const taken = posturePreviews.map((p) => p.position);
    const firstEmpty = postureSlots.find((p) => !taken.includes(p));
    return firstEmpty ?? postureSlots[0];
  }, [posturePreviews, postureSlots]);

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

  // レッスン作成後に posture_group を作成してレッスンIDと紐づける
  const linkPostureGroupToLesson = async (lessonId: string) => {
    if (!postureGroupId || !postureGroupId.startsWith('temp-')) return;
    try {
      // レッスンIDで姿勢グループを作成（バックエンドが自動的に紐づける）
      await postureApi.createPostureGroup(lessonId);
      logger.debug('Posture group created and linked to lesson', { lessonId }, 'LessonForm');
    } catch (error) {
      // 画面遷移は続行するが、エラーは表示
      logger.warn('Failed to create posture group for lesson', error, 'LessonForm');
      setError(handleError(error, 'LessonForm'));
    }
  };
  const displayStartDate = formData.startDate ? formData.startDate.replace('T', ' ') : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 必須フィールドのバリデーション
    if (!validateRequired(formData.storeId) || !validateRequired(formData.userId) || !validateRequired(formData.customerId)) {
      setError(ERROR_MESSAGES.REQUIRED_FIELD);
      return;
    }

    // 必須日付フィールドのバリデーション
    if (!validateRequired(formData.startDate) || !validateRequired(formData.endDate)) {
      setError('開始時間と終了時間は必須です');
      return;
    }

    // 日付範囲のバリデーション
    if (formData.startDate && formData.endDate && !validateDateRange(formData.startDate, formData.endDate)) {
      setError(ERROR_MESSAGES.DATE_RANGE_ERROR);
      return;
    }

    // 体重が指定されている場合のバリデーション
    if (formData.weight !== null && formData.weight !== undefined) {
      if (!validateNumericRange(formData.weight, 30, 300)) {
        setError('体重は30kg以上300kg以下で入力してください');
        return;
      }
    }

    // トレーニングのバリデーション
    if (trainings.length > 0) {
      for (const training of trainings) {
        if (!validateRequired(training.name)) {
          setError('トレーニング種目名は必須です');
          return;
        }
        if (!validateNumericRange(training.reps, 1, 10000)) {
          setError('回数は1回以上10000回以下で入力してください');
          return;
        }
      }
    }

    // 次回予約の相関制約チェック
    if (!validateNextLesson(formData.nextDate, formData.nextStoreId, formData.nextUserId)) {
      setError('次回予約を設定する場合、日時・店舗・トレーナーはすべて必須です');
      return;
    }

    setLoading(true);
    try {
      // バックエンドのLessonRequest仕様に合わせてリクエストを構築
      // TrainingInputをTrainingRequestに変換（orderNoを設定）
      const trainingRequests: TrainingRequest[] = trainings.map((t, idx) => ({
        orderNo: t.orderNo || idx + 1,
        name: t.name,
        reps: t.reps,
      }));

      const lessonRequest: LessonRequest = {
        storeId: formData.storeId,
        trainerId: formData.userId,
        condition: formData.condition || undefined,
        weight: formData.weight ?? null,
        meal: formData.meal || undefined,
        memo: formData.memo || undefined,
        startDate: formData.startDate!, // 必須（バリデーション済み）
        endDate: formData.endDate!, // 必須（バリデーション済み）
        nextDate: formData.nextDate || null,
        nextStoreId: formData.nextStoreId || null,
        nextTrainerId: formData.nextUserId || null,
        trainings: trainingRequests.length > 0 ? trainingRequests : undefined,
      };

      const created = await lessonApi.create(formData.customerId, lessonRequest);
      if (created?.id) {
        await linkPostureGroupToLesson(created.id);
      }
      // 姿勢画像一覧ページに遷移
      if (formData.customerId) {
        navigate(ROUTES.POSTURE_LIST.replace(':customerId', formData.customerId));
      } else {
        navigate(ROUTES.LESSON_FORM);
      }
    } catch (err) {
      setError(handleError(err, 'LessonForm'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f1] py-8">
      <div className="w-[1200px] max-w-[calc(100%-2rem)] mx-auto bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8 space-y-6">
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
          <h2 className={FORM_STYLES.sectionHeading}>顧客・体重</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-5 md:gap-x-12">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className={FORM_STYLES.label}>顧客：</label>
            <select
                className={`${FORM_STYLES.input} sm:flex-1`}
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
              <label className={FORM_STYLES.label}>体重 (kg)：</label>
              <input
                type="number"
                step="0.1"
                className={`${FORM_STYLES.input} sm:flex-1`}
                value={formData.weight ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className={FORM_STYLES.sectionHeading}>担当・店舗</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-5 md:gap-x-12">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className={FORM_STYLES.label}>担当：</label>
            <select
                className={`${FORM_STYLES.input} sm:flex-1`}
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
              <label className={FORM_STYLES.label}>店舗：</label>
            <select
                className={`${FORM_STYLES.input} sm:flex-1`}
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
          <h2 className={FORM_STYLES.sectionHeading}>体調・食事</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-5 md:gap-x-12">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className={FORM_STYLES.label}>体調：</label>
            <input
              type="text"
                className={`${FORM_STYLES.input} sm:flex-1`}
              value={formData.condition ?? ''}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                placeholder="体調メモ (condition)"
                maxLength={500}
            />
          </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className={FORM_STYLES.label}>食事：</label>
            <input
              type="text"
                className={`${FORM_STYLES.input} sm:flex-1`}
              value={formData.meal ?? ''}
              onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
                placeholder="食事内容 (meal)"
                maxLength={500}
            />
            </div>
          </div>
          </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <h2 className={FORM_STYLES.sectionHeading}>開始時間・終了時間</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 md:gap-x-12 md:gap-y-4">
              <div className="flex flex-row items-center gap-3 md:gap-4">
                <label className="text-2xl font-semibold text-gray-800 whitespace-nowrap">開始時間：</label>
            <input
              type="datetime-local"
                  className={`${FORM_STYLES.input} flex-1`}
              value={formData.startDate ?? ''}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

              <div className="flex flex-row items-center gap-3 md:gap-4">
                <label className="text-2xl font-semibold text-gray-800 whitespace-nowrap">終了時間：</label>
            <input
              type="datetime-local"
                  className={`${FORM_STYLES.input} flex-1`}
              value={formData.endDate ?? ''}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className={FORM_STYLES.sectionHeading}>次回予約</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              <span className="text-2xl font-semibold text-gray-800 whitespace-nowrap">日にち/時刻：</span>
            <input
              type="datetime-local"
                className={`${FORM_STYLES.input} md:flex-1`}
              value={formData.nextDate ?? ''}
              onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
            />
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                <label className={FORM_STYLES.label}>次回店舗：</label>
            <select
                  className={`${FORM_STYLES.input} md:flex-1`}
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
                <label className={FORM_STYLES.label}>次回トレーナー：</label>
            <select
                  className={`${FORM_STYLES.input} md:flex-1`}
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
                  className={`${FORM_STYLES.input} flex-1`}
                value={t.name}
                onChange={(e) => handleTrainingChange(idx, 'name', e.target.value)}
                required
                maxLength={100}
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
                const isSelected = selectedPosture === pos;
                return (
                  <div
                    key={pos}
                    className={`border border-gray-200 rounded-lg p-2 flex flex-col space-y-2 bg-white ${
                      isSelected ? 'ring-2 ring-green-300' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-800 flex items-center justify-between">
                      <span>{getPosturePositionLabel(pos)}</span>
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
                      {isSelected ? '選択中' : '選択'}（{getPosturePositionLabel(pos)}）
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
              撮影する（{getPosturePositionLabel(selectedPosture)}）
            </button>
          </div>
          <p className="text-xs text-gray-500">
            カメラが起動しない場合はブラウザの権限設定を確認してください。撮影は最大4枚（正面/右/背面/左）。
          </p>
        </div>

        <div className="space-y-2">
          <label className={FORM_STYLES.label}>備考欄</label>
          <textarea
            className={`${FORM_STYLES.input} min-h-[180px]`}
            value={formData.memo ?? ''}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            rows={5}
            maxLength={1000}
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

