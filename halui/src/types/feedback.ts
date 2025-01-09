// src/types/feedback.ts
export type FeedbackStatus = 'pending' | 'processed';

export interface Feedback {
  _id: string;
  content: string;
  status: FeedbackStatus;
  userId: {
    username: string;
    email: string;
  };
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackListResponse {
  feedbacks: Feedback[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
