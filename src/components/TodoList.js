import React from 'react';
import TodoItem from './TodoItem';

const TodoList = ({ 
  todos, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  onTaskClick,
  selectedTodoId,
  aiMode = false 
}) => {
  if (todos.length === 0) {
    return (
      <div className="empty-todos">
        <div className="empty-message">
          🌌 No missions found in this sector
          <p>All systems operational, commander!</p>
          {aiMode && (
            <p className="ai-empty-hint">
              🤖 Use AI Smart Mission to create your first celestial body
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onTaskClick={onTaskClick}
          isSelected={selectedTodoId === todo.id}
          aiMode={aiMode}
        />
      ))}
    </div>
  );
};

export default TodoList;