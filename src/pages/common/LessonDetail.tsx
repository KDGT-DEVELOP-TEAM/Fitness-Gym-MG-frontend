import React from 'react';
import { useParams } from 'react-router-dom';
import { formatDateTime } from '../../utils/dateFormatter';
import { getPosturePositionLabel, ALL_POSTURE_POSITIONS } from '../../constants/posture';
import { useLessonData } from '../../hooks/useLessonData';
import { usePostureImagesForLesson } from '../../hooks/usePostureImagesForLesson';
import { FORM_STYLES } from '../../styles/formStyles';
import { logger } from '../../utils/logger';

export const LessonDetail: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();

  // カスタムフックを使用してデータを取得（1回のAPI呼び出しで全てのデータを取得）
  const { lesson, loading: lessonLoading } = useLessonData(lessonId);
  
  // lessonからtrainingsとpostureImagesを抽出
  // orderNoでソート（バックエンドから順序が保証されているが、念のため）
  const trainings = React.useMemo(() => {
    if (!lesson?.trainings || !Array.isArray(lesson.trainings)) {
      return [];
    }
    return [...lesson.trainings].sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0));
  }, [lesson?.trainings]);

  const postureImages = lesson?.postureImages;
  
  // 署名付きURLの取得のみを行う（レッスン詳細の取得は不要）
  const { posturePreviews, loading: imagesLoading } = usePostureImagesForLesson(postureImages);

  const loading = lessonLoading || imagesLoading;

  if (!lessonId) {
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


  if (!lesson) {
    return (
      <div className="p-6">
        <p className="text-red-600">レッスンが見つかりません。</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 p-6 md:p-8 space-y-6">
        <div className="border-2 border-sidebar rounded-[2rem] p-5 md:p-6 bg-white shadow-sm">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">レッスン詳細</h1>
          <p className="text-sm text-gray-500">登録済みのレッスン情報を表示します</p>
        </div>

        <div className="space-y-4">
          <h2 className={FORM_STYLES.sectionHeading}>顧客・体重</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-5 md:gap-x-12">
            <div className="flex flex-col gap-1">
              <label className={FORM_STYLES.label}>顧客：</label>
              <input className={FORM_STYLES.inputReadOnly} value={lesson.customerName || ''} readOnly />
            </div>
            <div className="flex flex-col gap-1">
              <label className={FORM_STYLES.label}>体重 (kg)：</label>
              <input
                className={FORM_STYLES.inputReadOnly}
                value={lesson.weight ?? ''}
                readOnly
                placeholder="—"
              />
            </div>
            {lesson.bmi !== null && lesson.bmi !== undefined && (
              <div className="flex flex-col gap-1">
                <label className={FORM_STYLES.label}>BMI：</label>
                <input
                  className={FORM_STYLES.inputReadOnly}
                  value={lesson.bmi.toFixed(1)}
                  readOnly
                  placeholder="—"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className={FORM_STYLES.sectionHeading}>担当・店舗</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-5 md:gap-x-12">
            <div className="flex flex-col gap-1">
              <label className={FORM_STYLES.label}>担当：</label>
              <input className={FORM_STYLES.inputReadOnly} value={lesson.trainerName || ''} readOnly />
            </div>
            <div className="flex flex-col gap-1">
              <label className={FORM_STYLES.label}>店舗：</label>
              <input className={FORM_STYLES.inputReadOnly} value={lesson.storeName || ''} readOnly />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className={FORM_STYLES.sectionHeading}>体調・食事</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-5 md:gap-x-12">
            <div className="flex flex-col gap-1">
              <label className={FORM_STYLES.label}>体調：</label>
              <input className={FORM_STYLES.inputReadOnly} value={lesson.condition ?? ''} readOnly />
            </div>
            <div className="flex flex-col gap-1">
              <label className={FORM_STYLES.label}>食事：</label>
              <input className={FORM_STYLES.inputReadOnly} value={lesson.meal ?? ''} readOnly />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className={FORM_STYLES.sectionHeading}>開始時間・終了時間</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 md:gap-x-12 md:gap-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-2xl font-semibold text-gray-800">開始時間：</label>
              <input className={FORM_STYLES.inputReadOnly} value={lesson.startDate ? formatDateTime(lesson.startDate) : ''} readOnly />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-2xl font-semibold text-gray-800">終了時間：</label>
              <input className={FORM_STYLES.inputReadOnly} value={lesson.endDate ? formatDateTime(lesson.endDate) : ''} readOnly />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className={FORM_STYLES.sectionHeading}>次回予約</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <span className="text-2xl font-semibold text-gray-800 whitespace-nowrap">日にち/時刻：</span>
            <input className={`${FORM_STYLES.inputReadOnly} md:flex-1`} value={lesson.nextDate ? formatDateTime(lesson.nextDate) : ''} readOnly />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              <label className={FORM_STYLES.label}>次回店舗：</label>
              <input className={`${FORM_STYLES.inputReadOnly} md:flex-1`} value={lesson.nextStoreName || ''} readOnly />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              <label className={FORM_STYLES.label}>次回トレーナー：</label>
              <input className={`${FORM_STYLES.inputReadOnly} md:flex-1`} value={lesson.nextTrainerName || ''} readOnly />
            </div>
          </div>
        </div>

        <div className="border-2 border-gray-50 rounded-[2rem] p-4 space-y-3 bg-white shadow-sm">
          <div className="text-lg font-medium text-gray-800">トレーニング内容</div>

          {trainings.length === 0 && (
            <p className="text-sm text-gray-500">トレーニング内容は登録されていません。</p>
          )}

          {trainings.map((t, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 border-2 border-gray-50 rounded-2xl p-3 bg-gray-50/50"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 flex-1">
                <div className="flex items-center gap-2 md:min-w-[100px]">
                  <span className="text-lg font-semibold text-gray-800">名称：</span>
                </div>
                <input
                  type="text"
                  className={`${FORM_STYLES.inputReadOnly} flex-1`}
                  value={t.name}
                  readOnly
                />
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-lg font-semibold text-gray-800">回数：</span>
                <div className="flex items-center gap-2 border-2 border-gray-50 rounded-2xl px-2 py-1 bg-white shadow-sm">
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
          <label className={FORM_STYLES.label}>備考欄</label>
          <textarea
            className={`${FORM_STYLES.inputReadOnly} min-h-[180px]`}
            value={lesson.memo ?? ''}
            readOnly
            rows={5}
          />
        </div>

        <div className="border-2 border-gray-50 rounded-[2rem] p-4 space-y-3 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">姿勢（正面/右/背面/左）</h2>
            <span className="text-sm text-gray-500">閲覧専用</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {ALL_POSTURE_POSITIONS.map((pos) => {
              const preview = posturePreviews.find((p) => p.position === pos);
              return (
                <div
                  key={pos}
                  className="border-2 border-gray-50 rounded-2xl p-2 flex flex-col space-y-2 bg-white shadow-sm"
                >
                  <div className="text-sm font-medium text-gray-800">{getPosturePositionLabel(pos)}</div>
                  <div className="h-24 bg-white flex items-center justify-center border-2 border-dashed border-gray-50 rounded-2xl">
                    {preview ? (
                      <img 
                        src={preview.url} 
                        alt={pos} 
                        className="max-h-24 object-contain" 
                        onError={(e) => {
                          logger.error(`Image load error for ${pos}`, { url: preview.url, storageKey: preview.storageKey }, 'LessonDetail');
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                          logger.debug(`Image loaded successfully for ${pos}`, { url: preview.url }, 'LessonDetail');
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
