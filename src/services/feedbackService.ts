import { supabase } from '../lib/supabase';
import { Feedback, CreateFeedbackDto, UpdateFeedbackDto } from '../types/feedback';
import { ADMIN_EMAILS } from './config';

export async function createFeedback(feedback: CreateFeedbackDto): Promise<Feedback> {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  
  const { data, error } = await supabase
    .from('feedback')
    .insert([feedback])
    .select()
    .single();

  if (error) {
    console.error('Error creating feedback:', error);
    throw new Error('Failed to submit feedback');
  }

  return data;
}

export async function getFeedback(userEmail?: string): Promise<Feedback[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  // Check if user is admin
  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);

  let query = supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  // If not admin, only show their own feedback
  if (!isAdmin) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      return [];
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching feedback:', error);
    throw new Error('Failed to fetch feedback');
  }

  return data || [];
}

export async function updateFeedbackStatus(
  feedbackId: string, 
  update: UpdateFeedbackDto,
  userEmail?: string
): Promise<Feedback> {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  // Check if user is admin
  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);
  
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }

  const { data, error } = await supabase
    .from('feedback')
    .update({
      ...update,
      updated_at: new Date().toISOString()
    })
    .eq('id', feedbackId)
    .select()
    .single();

  if (error) {
    console.error('Error updating feedback:', error);
    throw new Error('Failed to update feedback');
  }

  return data;
}

export async function getFeedbackByStatus(
  status: 'new' | 'resolved',
  userEmail?: string
): Promise<Feedback[]> {
  const allFeedback = await getFeedback(userEmail);
  return allFeedback.filter(feedback => feedback.status === status);
}