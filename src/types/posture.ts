export interface Posture {
  id: string;
  customerId: string;
  lessonId?: string;
  imageUrl: string;
  analysis?: PostureAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface PostureAnalysis {
  angles?: Record<string, number>;
  alignment?: Record<string, number>;
  recommendations?: string[];
}

export interface PostureComparison {
  before: Posture;
  after: Posture;
  improvements?: string[];
}

