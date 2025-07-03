import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getFeedback, updateFeedbackStatus } from '../../services/feedbackService';
import { Feedback } from '../../types/feedback';
import { ADMIN_EMAILS } from '../../services/config';
import { MessageSquare, Clock, CheckCircle, User, Link, Filter } from 'lucide-react';
import { Navigation } from '../../components/Navigation';

const FeedbackPage: React.FC = () => {
  const { session } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'resolved'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const userEmail = session?.user?.email;
  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);

  useEffect(() => {
    if (isAdmin) {
      loadFeedback();
    }
  }, [isAdmin, userEmail]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await getFeedback(userEmail!);
      setFeedback(data);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (feedbackId: string, newStatus: 'new' | 'resolved') => {
    try {
      setUpdating(feedbackId);
      await updateFeedbackStatus(feedbackId, { status: newStatus }, userEmail!);
      await loadFeedback();
    } catch (error) {
      console.error('Error updating feedback status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const filteredFeedback = feedback.filter(item => 
    statusFilter === 'all' || item.status === statusFilter
  );

  const getStatusIcon = (status: string) => {
    return status === 'new' ? (
      <Clock className="w-4 h-4 text-yellow-600" />
    ) : (
      <CheckCircle className="w-4 h-4 text-green-600" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="w-6 h-6 text-green-600 mr-3" />
                  <h1 className="text-2xl font-semibold text-gray-900">Feedback Management</h1>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Feedback</option>
                    <option value="new">New</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : filteredFeedback.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No feedback to display</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredFeedback.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {getStatusIcon(item.status)}
                          <span className={`ml-2 text-sm font-medium ${
                            item.status === 'new' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                          <span className="ml-4 text-sm text-gray-500">
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-gray-900 mb-3">{item.message}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <a 
                              href={`mailto:${item.user_email}`}
                              className="hover:text-green-600 transition-colors"
                            >
                              {item.user_email}
                            </a>
                          </div>
                          <div className="flex items-center">
                            <Link className="w-4 h-4 mr-1" />
                            <a 
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-green-600 transition-colors truncate max-w-xs"
                            >
                              {item.url}
                            </a>
                          </div>
                        </div>
                        
                        {item.follow_up && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Follow-up requested
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <button
                          onClick={() => handleStatusUpdate(
                            item.id, 
                            item.status === 'new' ? 'resolved' : 'new'
                          )}
                          disabled={updating === item.id}
                          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                            item.status === 'new' 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updating === item.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                          ) : (
                            item.status === 'new' ? 'Mark Resolved' : 'Reopen'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackPage;