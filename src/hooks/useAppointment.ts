import { useState, useEffect, useCallback } from 'react';
import { appointmentApi } from '../api/appointmentApi';
import { Appointment } from '../types/appointment';

/**
 * トレーナー別の予約一覧を取得するフック
 */
export const useAppointment = (
  instructorId: string | undefined,
  params?: { search?: string; limit?: number; offset?: number }
) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!instructorId) {
      setAppointments([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await appointmentApi.getByInstructor(instructorId, params);
      setAppointments(data);
    } catch (err) {
      setError('予約情報の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [instructorId, params]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const cancelAppointment = useCallback(async (appointmentId: string) => {
    try {
      await appointmentApi.cancel(appointmentId);
      // キャンセル後、一覧を再取得
      await fetchAppointments();
    } catch (err) {
      setError('予約のキャンセルに失敗しました');
      console.error(err);
      throw err;
    }
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
    cancelAppointment,
  };
};

