import Breadcrumbs from '@/components/common/Breadcrumbs/Breadcrumbs';
import { MessageSquare, Send, Star } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './FeedbackPage.scss';

const FeedbackPage: React.FC = () => {
  const { reservationCode } = useParams<{ reservationCode: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Vui lòng chọn đánh giá!');
      return;
    }

    if (!comments.trim()) {
      alert('Vui lòng nhập nhận xét!');
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Feedback data:', { reservationCode, rating, comments });

      alert('Gửi phản hồi thành công!');
      navigate('/history');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Gửi phản hồi thất bại, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumbs
        title="Đánh giá dịch vụ"
        items={[{ label: 'Trang chủ', to: '/' }, { label: 'Đánh giá' }]}
      />

      <div className="feedback-page">
        <div className="container">
          <div className="feedback-page__content">
            <div className="feedback-card">
              <div className="feedback-header">
                <MessageSquare className="feedback-icon" />
                <h2>Đánh giá dịch vụ</h2>
                <p>
                  Mã đơn hàng: <strong>{reservationCode}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="feedback-form">
                <div className="form-group">
                  <label className="form-label">Đánh giá của bạn *</label>
                  <div className="rating-container">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <Star size={32} />
                      </button>
                    ))}
                  </div>
                  <div className="rating-text">
                    {rating > 0 && (
                      <span>
                        {rating === 1 && 'Rất không hài lòng'}
                        {rating === 2 && 'Không hài lòng'}
                        {rating === 3 && 'Bình thường'}
                        {rating === 4 && 'Hài lòng'}
                        {rating === 5 && 'Rất hài lòng'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nhận xét của bạn *</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ..."
                    rows={6}
                    className="form-textarea"
                  />
                </div>

                <button type="submit" className="primaryBtn submit-btn" disabled={loading}>
                  <Send size={16} />
                  {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackPage;
