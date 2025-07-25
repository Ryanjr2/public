import React, { useState, useEffect } from 'react';
import { 
  FiStar, FiMessageSquare, FiClock, FiCheck, 
  FiEye, FiFilter, FiSearch 
} from 'react-icons/fi';
import * as FeedbackTypes from '../types/feedback';
import './FeedbackHistoryPage.css';

const FeedbackHistoryPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackTypes.FeedbackItem[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<FeedbackTypes.FeedbackItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'responded'>('all');

  useEffect(() => {
    // Load feedback history from localStorage or API
    const savedFeedbacks = localStorage.getItem('customer_feedbacks');
    if (savedFeedbacks) {
      const parsed = JSON.parse(savedFeedbacks);
      setFeedbacks(parsed);
      setFilteredFeedbacks(parsed);
    }
  }, []);

  useEffect(() => {
    let filtered = feedbacks;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(feedback => feedback.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(feedback => 
        feedback.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.order_id.toString().includes(searchTerm)
      );
    }

    setFilteredFeedbacks(filtered);
  }, [feedbacks, statusFilter, searchTerm]);

  const renderStars = (rating: number) => (
    <div className="stars-display">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`star ${rating >= star ? 'filled' : ''}`}
        />
      ))}
    </div>
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: '#ffa500', bg: '#fff3cd', text: 'Pending' },
      submitted: { color: '#007bff', bg: '#cce5ff', text: 'Submitted' },
      responded: { color: '#28a745', bg: '#d4edda', text: 'Responded' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span 
        className="status-badge"
        style={{ color: config.color, backgroundColor: config.bg }}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div className="feedback-history-page">
      <div className="page-header">
        <h1>My Feedback History</h1>
        <p>Track your feedback and restaurant responses</p>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <FiFilter className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="responded">Responded</option>
          </select>
        </div>
      </div>

      <div className="feedback-list">
        {filteredFeedbacks.length === 0 ? (
          <div className="empty-state">
            <FiMessageSquare className="empty-icon" />
            <h3>No feedback found</h3>
            <p>You haven't submitted any feedback yet.</p>
          </div>
        ) : (
          filteredFeedbacks.map((feedback) => (
            <div key={feedback.id} className="feedback-card">
              <div className="feedback-header">
                <div className="order-info">
                  <h3>Order #{feedback.order_id}</h3>
                  <span className="feedback-date">
                    <FiClock />
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </span>
                </div>
                {getStatusBadge(feedback.status)}
              </div>

              <div className="feedback-ratings">
                <div className="rating-item">
                  <span>Overall</span>
                  {renderStars(feedback.overall_rating)}
                </div>
                <div className="rating-item">
                  <span>Food</span>
                  {renderStars(feedback.food_quality)}
                </div>
                <div className="rating-item">
                  <span>Service</span>
                  {renderStars(feedback.service_quality)}
                </div>
              </div>

              <div className="feedback-comment">
                <p>{feedback.comment}</p>
              </div>

              {feedback.favorite_items.length > 0 && (
                <div className="favorite-items">
                  <strong>Favorite Items:</strong>
                  <div className="items-tags">
                    {feedback.favorite_items.map((item, index) => (
                      <span key={index} className="item-tag">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {feedback.response && (
                <div className="restaurant-response">
                  <h4>Restaurant Response</h4>
                  <p>{feedback.response.message}</p>
                  <div className="response-meta">
                    <span>By {feedback.response.responded_by}</span>
                    <span>{new Date(feedback.response.responded_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedbackHistoryPage;
