import React from 'react';
import TodoItem from './TodoItem';

const TodoList = ({ todos, onToggleComplete, onEdit, onDelete }) => {
  if (todos.length === 0) {
    return (
      <div className="empty-todos">
        <div className="empty-message">
          🌌 No missions found in this sector
          <p>All systems operational, commander!</p>
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
        />
      ))}
    </div>
  );
};

export default TodoList;