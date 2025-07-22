import React from 'react';

const CelestialPopup = ({ todo, onClose }) => {
  if (!todo) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      sun: '☀️',
      mercury: '🌑',
      venus: '💛',
      earth: '🌍',
      mars: '🔴',
      jupiter: '🪐',
      saturn: '🪐',
      uranus: '🔵',
      neptune: '🔷',
      general: '🚀'
    };
    return icons[category] || '🚀';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ff4444',
      medium: '#ffaa00',
      low: '#44aa44'
    };
    return colors[priority] || '#888888';
  };

  const getUrgencyInfo = () => {
    if (!todo.deadline) return null;

    const now = new Date();
    const created = new Date(todo.createdAt);
    const deadline = new Date(todo.deadline);
    
    const totalTime = deadline.getTime() - created.getTime();
    const remainingTime = deadline.getTime() - now.getTime();
    
    if (remainingTime <= 0) {
      return {
        percentage: 0,
        urgencyLevel: 'overdue',
        displayText: 'OVERDUE',
        color: '#cc0000'
      };
    }

    const percentage = Math.max(0, (remainingTime / totalTime) * 100);
    
    if (percentage <= 10) {
      return {
        percentage: Math.round(percentage),
        urgencyLevel: 'critical',
        displayText: 'CRITICAL',
        color: '#ff0000'
      };
    } else if (percentage <= 25) {
      return {
        percentage: Math.round(percentage),
        urgencyLevel: 'urgent',
        displayText: 'URGENT',
        color: '#ff6600'
      };
    } else if (percentage <= 50) {
      return {
        percentage: Math.round(percentage),
        urgencyLevel: 'warning',
        displayText: 'WARNING',
        color: '#ffaa00'
      };
    } else {
      return {
        percentage: Math.round(percentage),
        urgencyLevel: 'normal',
        displayText: `${Math.round(percentage)}% TIME LEFT`,
        color: '#44aa44'
      };
    }
  };

  const urgencyInfo = getUrgencyInfo();

  return (
    <div className="celestial-popup-overlay" onClick={onClose}>
      <div className="celestial-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <h3>
          {getCategoryIcon(todo.category)} {todo.text}
        </h3>

        <div className="popup-content">
          <div className="popup-section">
            <h4>📊 Mission Details</h4>
            <div className="popup-meta">
              <span style={{ background: `${getPriorityColor(todo.priority)}33`, border: `1px solid ${getPriorityColor(todo.priority)}` }}>
                {todo.priority.toUpperCase()} Priority
              </span>
              <span>Category: {todo.category}</span>
              <span>Status: {todo.completed ? '✅ Completed' : '⏳ In Progress'}</span>
              <span>Created: {formatDate(todo.createdAt)}</span>
            </div>
          </div>

          {todo.deadline && (
            <div className="popup-section">
              <h4>⏰ Deadline Information</h4>
              <div className="deadline-info">
                <p><strong>Due Date:</strong> {formatDate(todo.deadline)}</p>
                {urgencyInfo && !todo.completed && (
                  <div className="urgency-display">
                    <div className="urgency-bar-popup">
                      <div 
                        className="urgency-fill-popup" 
                        style={{ 
                          width: `${urgencyInfo.percentage}%`,
                          background: urgencyInfo.color
                        }}
                      />
                    </div>
                    <p style={{ color: urgencyInfo.color, fontWeight: 'bold' }}>
                      {urgencyInfo.displayText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="popup-section">
            <h4>🌌 Celestial Classification</h4>
            <div className="celestial-info">
              <p><strong>Hierarchy Type:</strong> {
                todo.hierarchyType === 'sun' ? '☀️ Sun (Major Goal)' :
                todo.hierarchyType === 'planet' ? '🪐 Planet (Project)' :
                '🛰️ Satellite (Task)'
              }</p>
              {todo.solarSystemId && (
                <p><strong>Solar System:</strong> {todo.solarSystemId}</p>
              )}
              {todo.visualProperties && (
                <div className="visual-props">
                  <p><strong>Visual Properties:</strong></p>
                  <ul>
                    <li>Size Multiplier: {todo.visualProperties.sizeMultiplier?.toFixed(2) || 'N/A'}</li>
                    <li>Rotation Speed: {todo.visualProperties.rotationSpeed?.toFixed(4) || 'N/A'}</li>
                    <li>Brightness: {todo.visualProperties.brightness?.toFixed(2) || 'N/A'}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {todo.aiSuggestions && todo.aiSuggestions.length > 0 && (
            <div className="popup-section">
              <h4>🤖 AI Suggestions</h4>
              <ul className="ai-suggestions-list">
                {todo.aiSuggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CelestialPopup;