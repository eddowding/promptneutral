export interface Feedback {
  id: string;
  message: string;
  status: 'new' | 'resolved';
  url: string;
  follow_up: boolean;
  user_id: string;
  user_email: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackDto {
  message: string;
  url: string;
  follow_up: boolean;
  user_id: string;
  user_email: string;
}

export interface UpdateFeedbackDto {
  status?: 'new' | 'resolved';
  updated_at?: string;
}