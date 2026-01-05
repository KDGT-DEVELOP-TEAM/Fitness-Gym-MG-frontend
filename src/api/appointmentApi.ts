import axiosInstance from './axiosConfig';
import { Appointment } from '../types/appointment';

export const appointmentApi = {
  /**
   * トレーナー別 予約一覧
   */
  getByInstructor: async (
    instructorId: string,
    params?: { search?: string; limit?: number; offset?: number }
  ): Promise<Appointment[]> => {
    const response = await axiosInstance.get<Appointment[]>(
      `/api/appointments/instructor/${instructorId}`,
      { params }
    );
    return response.data;
  },

  /**
   * 予約キャンセル
   */
  cancel: async (appointmentId: string): Promise<void> => {
    await axiosInstance.post(`/api/appointments/${appointmentId}/cancel`);
  },
};

