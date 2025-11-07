import React from "react";
import "./Loading.scss";

interface LoadingIndicatorProps {
  text?: string;
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  text = "Đang tải dữ liệu...",
  className = "",
}) => (
  <div className={`loading-indicator ${className}`}>
    <div className="loading-spinner"></div>
    <p className="loading-text">{text}</p>
  </div>
);

export default LoadingIndicator;
