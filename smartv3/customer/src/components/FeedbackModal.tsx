import React, { useState } from 'react';
import { 
  FiStar, FiX, FiHeart, FiThumbsUp, FiMessageSquare, 
  FiTrendingUp, FiClock, FiCheck, FiSend 
} from 'react-icons/fi';
import type { FeedbackFormData } from '../types/feedback';
import './FeedbackModal.css';

interface Order {
  id: number;
  order_number: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  total_amount: number;
  created_at: string;
  status: string;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSubmit: (feedback: FeedbackFormData) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  order,
  onSubmit
}) => {
  const [formData, setFormData] = useState<FeedbackFormData>({
    overall_rating: 0,
    food_quality: 0,
    service_quality: 0,
    value_for_money: 0,
    ambiance: 0,
    delivery_time: 0,
    comment: '',
    would_recommend: false,
    favorite_items: [],
    improvement_suggestions: '',
    visit_again: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (category: keyof FeedbackFormData, rating: number) => {
    setFormData(prev => ({ ...prev, [category]: rating }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (
    category: 'overall_rating' | 'food_quality' | 'service_quality' | 'value_for_money' | 'ambiance' | 'delivery_time', 
    label: string, 
    icon: React.ElementType
  ) => (
    <div className="rating-group">
      <div className="rating-header">
        {React.createElement(icon, { className: "rating-icon" })}
        <span className="rating-label">{label}</span>
      </div>
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(category, star)}
            className={`star ${(formData[category] as number) >= star ? 'active' : ''}`}
          >
            <FiStar />
          </button>
        ))}
      </div>
    </div>
  );

  if (!isOpen || !order) return null;

  return (
    <div className="feedback-overlay">
      <div className="feedback-modal">
        <div className="feedback-header">
          <div className="header-content">
            <h2>Share Your Experience</h2>
            <p>Order #{order.order_number}</p>
          </div>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        <div className="feedback-content">
          {currentStep === 1 && (
            <div className="step-content">
              <h3>Rate Your Experience</h3>
              <div className="ratings-grid">
                {renderStarRating('overall_rating', 'Overall Experience', FiStar)}
                {renderStarRating('food_quality', 'Food Quality', FiHeart)}
                {renderStarRating('service_quality', 'Service Quality', FiThumbsUp)}
                {renderStarRating('value_for_money', 'Value for Money', FiTrendingUp)}
                {renderStarRating('ambiance', 'Ambiance', FiMessageSquare)}
                {renderStarRating('delivery_time', 'Delivery Time', FiClock)}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <h3>Tell Us More</h3>
              <div className="form-group">
                <label>What did you enjoy most?</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your thoughts about the food, service, or overall experience..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Favorite Items from This Order</label>
                <div className="items-selection">
                  {order.items.map((item) => (
                    <label key={item.id} className="item-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.favorite_items.includes(item.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              favorite_items: [...prev.favorite_items, item.name]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              favorite_items: prev.favorite_items.filter(name => name !== item.name)
                            }));
                          }
                        }}
                      />
                      <span>{item.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>How can we improve?</label>
                <textarea
                  value={formData.improvement_suggestions}
                  onChange={(e) => setFormData(prev => ({ ...prev, improvement_suggestions: e.target.value }))}
                  placeholder="Any suggestions for improvement..."
                  rows={3}
                />
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.would_recommend}
                    onChange={(e) => setFormData(prev => ({ ...prev, would_recommend: e.target.checked }))}
                  />
                  <span>I would recommend this restaurant to friends</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.visit_again}
                    onChange={(e) => setFormData(prev => ({ ...prev, visit_again: e.target.checked }))}
                  />
                  <span>I plan to visit again</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="feedback-actions">
          {currentStep === 1 && (
            <button
              onClick={() => setCurrentStep(2)}
              className="btn-primary"
              disabled={formData.overall_rating === 0}
            >
              Continue
            </button>
          )}

          {currentStep === 2 && (
            <div className="step-actions">
              <button
                onClick={() => setCurrentStep(1)}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
                disabled={isSubmitting || formData.comment.trim().length < 10}
              >
                {isSubmitting ? (
                  <>
                    <FiCheck className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiSend />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
