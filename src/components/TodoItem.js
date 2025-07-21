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
      earth: '🌍',
      mars: '🔴',
      jupiter: '🪐',
      saturn: '🪐',
      venus: '💛',
      mercury: '🌑',
      uranus: '🔵',
      neptune: '🔷',
      general: '🚀'
    };
    return icons[category] || '🚀';
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${getPriorityClass(todo.priority)}`}>
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
            <div className="todo-meta">
              <span className="category">{todo.category}</span>
              <span className="priority">{todo.priority} priority</span>
              <span className="date">Created: {formatDate(todo.createdAt)}</span>
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