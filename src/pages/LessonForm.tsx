import React, { useState } from 'react';
import { lessonApi } from '../api/lessonApi';
import { LessonFormData } from '../types/lesson';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export const LessonForm: React.FC = () => {
  // const [formData, setFormData] = useState<LessonFormData>({
  //   customerName: '',
  //   trainerName: '',
  //   startDate: '',
  //   endDate: '',
    
  // });
  // const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     await lessonApi.create(formData);
  //     navigate(ROUTES.LESSON_HISTORY);
  //   } catch (error) {
  //     console.error('Error creating lesson:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div></div>
    // <div>
    //   <h1 className="text-2xl font-bold mb-4">レッスン登録</h1>
    //   <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
    //     <div>
    //       <label className="block text-sm font-medium">顧客ID</label>
    //       <input
    //         type="text"
    //         value={formData.customerId}
    //         onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
    //         required
    //         className="mt-1 block w-full px-3 py-2 border rounded-md"
    //       />
    //     </div>
    //     <div>
    //       <label className="block text-sm font-medium">インストラクターID</label>
    //       <input
    //         type="text"
    //         value={formData.trainerId}
    //         onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
    //         required
    //         className="mt-1 block w-full px-3 py-2 border rounded-md"
    //       />
    //     </div>
    //     <div>
    //       <label className="block text-sm font-medium">日付</label>
    //       <input
    //         type="date"
    //         value={formData.date}
    //         onChange={(e) => setFormData({ ...formData, date: e.target.value })}
    //         required
    //         className="mt-1 block w-full px-3 py-2 border rounded-md"
    //       />
    //     </div>
    //     <div>
    //       <label className="block text-sm font-medium">開始時間</label>
    //       <input
    //         type="time"
    //         value={formData.startTime}
    //         onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
    //         required
    //         className="mt-1 block w-full px-3 py-2 border rounded-md"
    //       />
    //     </div>
    //     <div>
    //       <label className="block text-sm font-medium">終了時間</label>
    //       <input
    //         type="time"
    //         value={formData.endTime}
    //         onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
    //         required
    //         className="mt-1 block w-full px-3 py-2 border rounded-md"
    //       />
    //     </div>
    //     <div>
    //       <label className="block text-sm font-medium">備考</label>
    //       <textarea
    //         value={formData.notes}
    //         onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
    //         className="mt-1 block w-full px-3 py-2 border rounded-md"
    //       />
    //     </div>
    //     <button
    //       type="submit"
    //       disabled={loading}
    //       className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    //     >
    //       {loading ? '登録中...' : '登録'}
    //     </button>
    //   </form>
    // </div>
  );
};

