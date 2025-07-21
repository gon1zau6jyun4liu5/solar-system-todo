import React from 'react';

const TodoItem = ({ todo, onToggleComplete, onEdit, onDelete }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  // 데드라인 긴급도 계산
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

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${getPriorityClass(todo.priority)} ${urgencyInfo ? urgencyInfo.urgencyClass : ''}`}>
      <div className="todo-content">
        <div className="todo-main">
          <button
            className="todo-checkbox"
            onClick={() => onToggleComplete(todo.id)}
            aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {todo.completed ? '✅' : '⭕'}
          </button>
          
          <div className="todo-info">
            <div className="todo-text">
              <span className="category-icon">{getCategoryIcon(todo.category)}</span>
              <span className={todo.completed ? 'strikethrough' : ''}>
                {todo.text}
              </span>
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
              <span className="date">Created: {formatDate(todo.createdAt)}</span>
              {todo.deadline && (
                <span className="deadline">
                  Due: {formatDate(todo.deadline)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="todo-actions">
          <button
            className="edit-btn"
            onClick={() => onEdit(todo)}
            aria-label="Edit todo"
          >
            ✏️
          </button>
          <button
            className="delete-btn"
            onClick={() => {
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
    </div>
  );
};

export default TodoItem;