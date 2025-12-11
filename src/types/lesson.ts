export interface Lesson {
  id: string;
  customerId: string;
  instructorId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonFormData {
  customerId: string;
  instructorId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

// 予約一覧表示用の拡張型
export interface AppointmentWithDetails extends Lesson {
  customer: {
    id: string;
    name: string;
    phone?: string;
  };
  shop: {
    id: string;
    name: string;
  };
  lessonType?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

