import React from 'react';
import './EmptyState.scss';

interface EmptyStateProps {
  text?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  text = 'Không tìm thấy sản phẩm nào.',
  icon,
  children,
}) => (
  <div className="empty-state">
    {icon || (
      <span className="empty-icon" role="img" aria-label="empty">
        🗂️
      </span>
    )}
    <div className="empty-text">{text}</div>
    {children}
  </div>
);

export default EmptyState;
