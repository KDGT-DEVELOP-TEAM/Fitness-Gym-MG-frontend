import React from 'react';
import { useParams } from 'react-router-dom';
import { formatDateTime } from '../../utils/dateFormatter';
import { ALL_POSTURE_POSITIONS } from '../../constants/posture';
import { getPosturePositionLabel } from '../../utils/posture';
import { useLesson } from '../../hooks/useLesson';
import { usePostureImagesForLesson } from '../../hooks/usePostureImagesForLesson';
import { FORM_STYLES } from '../../styles/formStyles';
import { logger } from '../../utils/logger';
import { LoadingSpinner } from '../../components/common/TableStatusRows';

export const LessonDetail: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();

  // カスタムフックを使用してデータを取得（1回のAPI呼び出しで全てのデータを取得）
  const { lesson, loading: lessonLoading, error } = useLesson(lessonId);
  
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
        <LoadingSpinner minHeight="min-h-[300px]" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 p-8 max-w-md">
          <div className="mb-4 flex justify-center text-gray-300">
            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">レッスンが見つかりませんでした</h2>
          <p className="text-gray-500 text-sm">
            {error || '指定されたレッスンは存在しないか、アクセス権限がありません。'}
          </p>
        </div>
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

        {/* 基本情報セクション */}
        <section className="space-y-4">
          <h3 className={FORM_STYLES.sectionHeading}>基本情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={FORM_STYLES.label}>顧客</label>
              <div className="flex items-center gap-2">
                <input className={FORM_STYLES.inputReadOnly} value={lesson.customerName || ''} readOnly />
                {lesson.customerDeleted && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600 whitespace-nowrap">
                    退会済み
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className={FORM_STYLES.label}>体重 (kg)</label>
              <input
                className={FORM_STYLES.inputReadOnly}
                value={lesson.weight ?? ''}
                readOnly
                placeholder="—"
              />
            </div>
            <div>
              <label className={FORM_STYLES.label}>担当トレーナー</label>
              <input className={FORM_STYLES.inputReadOnly} value={lesson.trainerName || ''} readOnly />
            </div>
            <div>
              <label className={FORM_STYLES.label}>実施店舗</label>
              <input className={FORM_STYLES.inputReadOnly} value={lesson.storeName || ''} readOnly />
            </div>
            {lesson.bmi !== null && lesson.bmi !== undefined && (
              <div>
                <label className={FORM_STYLES.label}>BMI</label>
                <input
                  className={FORM_STYLES.inputReadOnly}
                  value={lesson.bmi.toFixed(1)}
                  readOnly
                  placeholder="—"
                />
              </div>
            )}
          </div>
        </section>

        {/* 体調・食事セクション */}
        <section className="space-y-4">
          <h3 className={FORM_STYLES.sectionHeading}>体調・食事</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={FORM_STYLES.label}>体調</label>
              <input className={FORM_STYLES.inputReadOnly} value={lesson.condition ?? ''} readOnly />
            </div>
            <div>
              <label className={FORM_STYLES.label}>食事</label>
              <input className={FORM_STYLES.inputReadOnly} value={lesson.meal ?? ''} readOnly />
            </div>
          </div>
        </section>

        {/* レッスン日時セクション */}
        <section className="space-y-4">
          <h3 className={FORM_STYLES.sectionHeading}>レッスン日時</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={FORM_STYLES.label}>開始時間</label>
              <input className={FORM_STYLES.inputReadOnly} value={lesson.startDate ? formatDateTime(lesson.startDate) : ''} readOnly />
            </div>
            <div>
              <label className={FORM_STYLES.label}>終了時間</label>
              <input className={FORM_STYLES.inputReadOnly} value={lesson.endDate ? formatDateTime(lesson.endDate) : ''} readOnly />
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <h4 className="text-base font-medium text-gray-700 mb-3">次回予約</h4>
            <div>
              <label className={FORM_STYLES.label}>日にち/時刻</label>
              <input className={FORM_STYLES.inputReadOnly} value={lesson.nextDate ? formatDateTime(lesson.nextDate) : ''} readOnly />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={FORM_STYLES.label}>次回トレーナー</label>
                <input className={FORM_STYLES.inputReadOnly} value={lesson.nextTrainerName || ''} readOnly />
              </div>
              <div>
                <label className={FORM_STYLES.label}>次回店舗</label>
                <input className={FORM_STYLES.inputReadOnly} value={lesson.nextStoreName || ''} readOnly />
              </div>
            </div>
          </div>
        </section>

        <div className="border-2 border-gray-50 rounded-[2rem] p-4 space-y-3 bg-white shadow-sm">
          <div className="text-lg font-medium text-gray-800">トレーニング内容</div>

          {trainings.length === 0 && (
            <p className="text-sm text-gray-500">トレーニング内容は登録されていません。</p>
          )}

          {trainings.map((t, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4 border-2 border-gray-50 rounded-2xl p-3 bg-gray-50/50"
            >
              <div className="flex-1">
                <label className={FORM_STYLES.label}>名称</label>
                <input
                  type="text"
                  className={FORM_STYLES.inputReadOnly}
                  value={t.name}
                  readOnly
                />
              </div>

              <div className="flex-1 md:flex-initial">
                <label className={FORM_STYLES.label}>回数</label>
                <div className="flex items-center gap-2 border-2 border-gray-50 rounded-2xl px-2 py-1 bg-white shadow-sm h-14">
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

        {/* 備考欄セクション */}
        <section className="space-y-2">
          <label className={FORM_STYLES.label}>備考欄</label>
          <textarea
            className={`${FORM_STYLES.inputReadOnly} min-h-[180px]`}
            value={lesson.memo ?? ''}
            readOnly
            rows={5}
          />
        </section>
      </div>
    </div>
  );
};
