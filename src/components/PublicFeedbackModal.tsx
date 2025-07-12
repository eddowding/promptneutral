import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PublicFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PublicFeedbackModal: React.FC<PublicFeedbackModalProps> = ({ isOpen, onClose }) => {
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const currentUrl = window.location.href;

  // Load saved data from localStorage or use authenticated user's email
  useEffect(() => {
    if (session?.user?.email) {
      setFormData(prev => ({ ...prev, email: session.user.email || '' }));
    } else {
      const savedEmail = localStorage.getItem('feedbackEmail');
      const savedName = localStorage.getItem('feedbackName');
      if (savedEmail || savedName) {
        setFormData(prev => ({ 
          ...prev, 
          email: savedEmail || '',
          name: savedName || ''
        }));
      }
    }
  }, [session]);

  // Save email to localStorage when it changes
  const handleEmailChange = (email: string) => {
    setFormData({ ...formData, email });
    if (email.trim()) {
      localStorage.setItem('feedbackEmail', email.trim());
    }
  };

  // Save name to localStorage when it changes
  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    if (name.trim()) {
      localStorage.setItem('feedbackName', name.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Feedback form submitted');
    
    if (!formData.message.trim()) {
      setErrorMessage('Please enter your feedback');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      console.log('Checking supabase client:', !!supabase);
      
      if (!supabase) {
        console.error('Supabase client is null');
        throw new Error('Unable to connect to database');
      }

      const payload = {
        name: formData.name.trim() || 'Anonymous',
        email: formData.email.trim() || 'feedback@notzero.app',
        subject: 'Website Feedback',
        company: `Feedback from: ${currentUrl}`,
        message: formData.message.trim()
      };
      
      console.log('Submitting feedback with payload:', payload);

      const { data, error } = await supabase
        .from('contact_submissions')
        .insert([payload])
        .select();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Feedback submission error:', error);
        throw new Error(error.message || 'Failed to submit feedback');
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Caught error in feedback submission:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
      console.log('Feedback submission complete, isSubmitting:', false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Send Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Page
            </label>
            <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded break-all">
              {currentUrl}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="feedback-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name (optional)
              </label>
              <input
                type="text"
                id="feedback-name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Your name"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="feedback-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                id="feedback-email"
                value={formData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 mb-1">
              Your Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              id="feedback-message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="Share your thoughts, ideas, or report issues..."
              required
              disabled={isSubmitting}
            />
          </div>

          {submitStatus === 'success' && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Thank you for your feedback!
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.message.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicFeedbackModal;