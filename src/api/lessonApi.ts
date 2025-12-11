import { supabase } from '../lib/supabase';
import { Lesson, LessonFormData, TrainingInput } from '../types/lesson';
import { PaginatedResponse, PaginationParams } from '../types/common';

const mapLesson = (row: any): Lesson => ({
  id: row.id,
  storeId: row.store_id,
  userId: row.user_id,
  customerId: row.customer_id,
  postureGroupId: row.posture_group_id,
  condition: row.condition,
  weight: row.weight,
  meal: row.meal,
  memo: row.memo,
  startDate: row.start_date,
  endDate: row.end_date,
  nextDate: row.next_date,
  nextStoreId: row.next_store_id,
  nextUserId: row.next_user_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const lessonApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Lesson>> => {
    if (!supabase) throw new Error('Supabase未設定');
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 100;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await supabase
      .from('lessons')
      .select('*', { count: 'exact' })
      .range(from, to);
    if (error) throw error;
    const mapped = (data as any[])?.map(mapLesson) ?? [];
    return {
      data: mapped,
      total: count ?? data?.length ?? 0,
      page,
      limit,
    };
  },

  getById: async (id: string): Promise<Lesson> => {
    if (!supabase) throw new Error('Supabase未設定');
    const { data, error } = await supabase.from('lessons').select('*').eq('id', id).single();
    if (error) throw error;
    return mapLesson(data);
  },

  getByCustomerId: async (customerId: string): Promise<Lesson[]> => {
    if (!supabase) throw new Error('Supabase未設定');
    const { data, error } = await supabase.from('lessons').select('*').eq('customer_id', customerId);
    if (error) throw error;
    return ((data as any[]) ?? []).map(mapLesson);
  },

  create: async (data: LessonFormData): Promise<Lesson> => {
    if (!supabase) throw new Error('Supabase未設定');
    const now = new Date().toISOString();
    const toNull = (v: string | null | undefined) => (v && v.trim() !== '' ? v : null);
    const insertData = {
      store_id: toNull(data.storeId), // requiredだが念のため空文字をnull化
      user_id: toNull(data.userId),
      customer_id: toNull(data.customerId),
      posture_group_id: toNull(data.postureGroupId ?? null),
      condition: data.condition ?? null,
      weight: data.weight ?? null,
      meal: data.meal ?? null,
      memo: data.memo ?? null,
      start_date: data.startDate && data.startDate !== '' ? data.startDate : null,
      end_date: data.endDate && data.endDate !== '' ? data.endDate : null,
      next_date: data.nextDate && data.nextDate !== '' ? data.nextDate : null,
      next_store_id: toNull(data.nextStoreId ?? null),
      next_user_id: toNull(data.nextUserId ?? null),
      created_at: now,
    };
    const { data: inserted, error } = await supabase.from('lessons').insert([insertData]).select().single();
    if (error) throw error;

    // trainings があれば一括登録
    if (data.trainings && data.trainings.length > 0 && inserted?.id) {
      const trainingsToInsert = data.trainings.map((t: TrainingInput, idx) => ({
        lesson_id: inserted.id,
        order_no: t.orderNo ?? idx + 1,
        name: t.name,
        reps: t.reps,
      }));
      const { error: trainingError } = await supabase.from('trainings').insert(trainingsToInsert);
      if (trainingError) throw trainingError;
    }

    return mapLesson(inserted);
  },

  update: async (id: string, data: Partial<LessonFormData>): Promise<Lesson> => {
    if (!supabase) throw new Error('Supabase未設定');
    const toNull = (v: string | null | undefined) => (v && v.trim() !== '' ? v : null);
    const { data: updated, error } = await supabase
      .from('lessons')
      .update({
        store_id: toNull(data.storeId),
        user_id: toNull(data.userId),
        customer_id: toNull(data.customerId),
        posture_group_id: toNull(data.postureGroupId ?? null),
        condition: data.condition ?? null,
        weight: data.weight ?? null,
        meal: data.meal ?? null,
        memo: data.memo ?? null,
        start_date: data.startDate && data.startDate !== '' ? data.startDate : null,
        end_date: data.endDate && data.endDate !== '' ? data.endDate : null,
        next_date: data.nextDate && data.nextDate !== '' ? data.nextDate : null,
        next_store_id: toNull(data.nextStoreId ?? null),
        next_user_id: toNull(data.nextUserId ?? null),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapLesson(updated);
  },

  delete: async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase未設定');
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) throw error;
  },
};

