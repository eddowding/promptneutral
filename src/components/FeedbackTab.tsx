import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { useAuth } from '../contexts/AuthContext';

const FeedbackTab: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { session } = useAuth();

  // Only show for authenticated users
  if (!session) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-green-600 text-white px-3 py-8 rounded-l-lg shadow-lg hover:bg-green-700 transition-colors duration-200 z-40 group"
        aria-label="Give feedback"
      >
        <div className="flex flex-col items-center space-y-2">
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs font-medium tracking-wider vertical-text">
            FEEDBACK
          </span>
        </div>
      </button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <style>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </>
  );
};

export default FeedbackTab;