import React from 'react';
import { useParams } from 'react-router-dom';
import { formatDateTime } from '../../utils/dateFormatter';
import { getPosturePositionLabel, ALL_POSTURE_POSITIONS } from '../../constants/posture';
import { useOptions, Option } from '../../hooks/useOptions';
import { useLessonData } from '../../hooks/useLessonData';
import { usePostureImagesForLesson } from '../../hooks/usePostureImagesForLesson';
import { useTrainingsForLesson } from '../../hooks/useTrainingsForLesson';
import { FORM_STYLES } from '../../styles/formStyles';
import { logger } from '../../utils/logger';

export const LessonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { stores, users, customers } = useOptions();

  // Use custom hooks for data fetching
  const { lesson, loading: lessonLoading } = useLessonData(id);
  const { posturePreviews, loading: imagesLoading } = usePostureImagesForLesson(id, null);
  const { trainings, loading: trainingsLoading } = useTrainingsForLesson(id);

  const loading = lessonLoading || imagesLoading || trainingsLoading;

  // LessonResponseにはstoreName, trainerName, customerNameが含まれているため、
  // findNameは使用しない（後方互換性のため残す）
  const findName = (list: Option[], targetId?: string | null) =>
    list.find((o) => o.id === targetId)?.name ?? '';

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
                  className={`${FORM_STYLES.inputReadOnly} flex-1`}
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
          <label className={FORM_STYLES.label}>備考欄</label>
          <textarea
            className={`${FORM_STYLES.inputReadOnly} min-h-[180px]`}
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
            {ALL_POSTURE_POSITIONS.map((pos) => {
              const preview = posturePreviews.find((p) => p.position === pos);
              return (
                <div
                  key={pos}
                  className="border border-gray-200 rounded-lg p-2 flex flex-col space-y-2 bg-white"
                >
                  <div className="text-sm font-medium text-gray-800">{getPosturePositionLabel(pos)}</div>
                  <div className="h-24 bg-white flex items-center justify-center border border-dashed border-gray-200 rounded">
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
