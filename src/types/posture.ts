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

export interface PostureGroup {
  id: string;
  lessonId: string;
  customerId: string;
  }
  
  export interface PostureImage {
  id: string;
  postureGroupId: string;
  storageKey: string;
  position: string;
  takenAt: string;
  createdAt: string;
  consentPublication: boolean;
  }
  
  export interface SignedUrl {
  imageId: string;
  signedUrl: string;
  expiresAt: string;
  }