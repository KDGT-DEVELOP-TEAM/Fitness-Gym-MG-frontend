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

