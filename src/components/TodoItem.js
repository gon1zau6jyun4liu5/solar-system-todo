import React from 'react';

const TodoItem = ({ 
  todo, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  onTaskClick,
  isSelected = false,
  aiMode = false 
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    if (aiMode) {
      // AI mode category icons
      const aiIcons = {
        work: '💼',
        personal: '🏠',
        education: '📚',
        finance: '💰',
        home: '🏡',
        health: '⚕️'
      };
      return aiIcons[category] || '🔧';
    }
    
    // Legacy planet-based icons
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

  const getHierarchyIcon = (hierarchyType) => {
    const hierarchyIcons = {
      sun: '☀️',
      planet: '🪐',
      satellite: '🛰️'
    };
    return hierarchyIcons[hierarchyType] || '🔧';
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  // 데드라인 긴급도 계산
  const getUrgencyInfo = () => {
    if (!todo.deadline && !todo.estimatedDeadline) return null;

    const now = new Date();
    const created = new Date(todo.createdAt);
    const deadline = new Date(todo.deadline || todo.estimatedDeadline);
    
    const totalTime = deadline.getTime() - created.getTime();
    const remainingTime = deadline.getTime() - now.getTime();
    
    if (remainingTime <= 0) {
      return {
        percentage: 0,
        urgencyLevel: 'overdue',
        urgencyClass: 'urgency-overdue',
        displayText: 'OVERDUE'
      };
    }

    const percentage = Math.max(0, (remainingTime / totalTime) * 100);
    
    let urgencyLevel, urgencyClass, displayText;
    
    if (percentage <= 10) {
      urgencyLevel = 'critical';
      urgencyClass = 'urgency-critical';
      displayText = 'CRITICAL';
    } else if (percentage <= 25) {
      urgencyLevel = 'urgent';
      urgencyClass = 'urgency-urgent';
      displayText = 'URGENT';
    } else if (percentage <= 50) {
      urgencyLevel = 'warning';
      urgencyClass = 'urgency-warning';
      displayText = 'WARNING';
    } else {
      urgencyLevel = 'normal';
      urgencyClass = 'urgency-normal';
      displayText = `${Math.round(percentage)}% TIME LEFT`;
    }

    return {
      percentage: Math.round(percentage),
      urgencyLevel,
      urgencyClass,
      displayText,
      deadlineDate: deadline
    };
  };

  const urgencyInfo = getUrgencyInfo();

  // Handle task click for 3D focusing
  const handleTaskClick = (e) => {
    // Don't trigger if clicking on interactive elements
    if (e.target.closest('button')) return;
    
    onTaskClick?.(todo);
  };

  return (
    <div 
      className={`todo-item ${todo.completed ? 'completed' : ''} ${getPriorityClass(todo.priority)} ${urgencyInfo ? urgencyInfo.urgencyClass : ''} ${isSelected ? 'selected' : ''} ${aiMode ? 'ai-enhanced' : ''}`}
      onClick={handleTaskClick}
      style={{ cursor: onTaskClick ? 'pointer' : 'default' }}
    >
      <div className="todo-content">
        <div className="todo-main">
          <button
            className="todo-checkbox"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(todo.id);
            }}
            aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {todo.completed ? '✅' : '⭕'}
          </button>
          
          <div className="todo-info">
            <div className="todo-text">
              <span className="category-icon">{getCategoryIcon(todo.category)}</span>
              {aiMode && (
                <span className="hierarchy-icon" title={`${todo.hierarchyType} in solar system`}>
                  {getHierarchyIcon(todo.hierarchyType)}
                </span>
              )}
              <span className={todo.completed ? 'strikethrough' : ''}>
                {todo.text}
              </span>
              {onTaskClick && (
                <span className="focus-hint" title="Click to focus camera on this celestial body">
                  🎯
                </span>
              )}
            </div>
            
            {/* 긴급도 표시 */}
            {urgencyInfo && !todo.completed && (
              <div className={`urgency-indicator ${urgencyInfo.urgencyClass}`}>
                <div className="urgency-bar">
                  <div 
                    className="urgency-fill" 
                    style={{ width: `${urgencyInfo.percentage}%` }}
                  ></div>
                </div>
                <span className="urgency-text">{urgencyInfo.displayText}</span>
              </div>
            )}
            
            <div className="todo-meta">
              <span className="category">{todo.category}</span>
              <span className="priority">{todo.priority} priority</span>
              {aiMode && (
                <span className="hierarchy">{todo.hierarchyType}</span>
              )}
              <span className="date">Created: {formatDate(todo.createdAt)}</span>
              {(todo.deadline || todo.estimatedDeadline) && (
                <span className="deadline">
                  Due: {formatDate(todo.deadline || todo.estimatedDeadline)}
                  {todo.estimatedDeadline && !todo.deadline && ' (AI estimated)'}
                </span>
              )}
            </div>

            {/* AI 정보 표시 */}
            {aiMode && todo.visualProperties && (
              <div className="ai-classification-info">
                <span className="classification-tag">
                  🤖 AI: {Math.round(todo.confidence || 0)}% confidence
                </span>
                {todo.solarSystemId && (
                  <span className="classification-tag">
                    🌌 System: {todo.solarSystemId.split('-')[0]}
                  </span>
                )}
                <span className={`urgency-indicator ${todo.visualProperties.daysUntilDeadline <= 3 ? 'high' : todo.visualProperties.daysUntilDeadline <= 7 ? 'medium' : 'low'}`}></span>
              </div>
            )}
          </div>
        </div>
        
        <div className="todo-actions">
          <button
            className="edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(todo);
            }}
            aria-label="Edit todo"
          >
            ✏️
          </button>
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this mission?')) {
                onDelete(todo.id);
              }
            }}
            aria-label="Delete todo"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="selection-indicator">
          <div className="selection-pulse"></div>
          <span className="selection-text">🎯 Focused in 3D</span>
        </div>
      )}
    </div>
  );
};

export default TodoItem;