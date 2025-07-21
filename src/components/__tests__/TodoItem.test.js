import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoItem from '../TodoItem';

// Mock window.confirm
global.confirm = jest.fn(() => true);

describe('TodoItem', () => {
  const mockOnToggleComplete = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  
  const sampleTodo = {
    id: 1,
    text: 'Test todo item',
    category: 'mars',
    completed: false,
    createdAt: new Date('2025-07-21'),
    priority: 'high',
    deadline: new Date('2025-07-25')
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders todo item correctly', () => {
    render(
      <TodoItem
        todo={sampleTodo}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Test todo item')).toBeInTheDocument();
    expect(screen.getByText('mars')).toBeInTheDocument();
    expect(screen.getByText('high priority')).toBeInTheDocument();
  });

  test('shows correct icon for Mars category', () => {
    render(
      <TodoItem
        todo={sampleTodo}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('🔴')).toBeInTheDocument();
  });

  test('displays deadline information', () => {
    render(
      <TodoItem
        todo={sampleTodo}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText(/Due: Jul 25, 2025/)).toBeInTheDocument();
  });

  test('displays urgency indicator for incomplete todos with deadlines', () => {
    render(
      <TodoItem
        todo={sampleTodo}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText(/TIME LEFT|CRITICAL|URGENT|WARNING/)).toBeInTheDocument();
  });

  test('does not display urgency indicator for completed todos', () => {
    const completedTodo = { ...sampleTodo, completed: true };
    
    render(
      <TodoItem
        todo={completedTodo}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.queryByText(/TIME LEFT|CRITICAL|URGENT|WARNING/)).not.toBeInTheDocument();
  });

  test('displays overdue status for past deadline', () => {
    const overdueTodo = {
      ...sampleTodo,
      deadline: new Date('2025-07-20'), // Past date
      createdAt: new Date('2025-07-18')
    };
    
    render(
      <TodoItem
        todo={overdueTodo}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('OVERDUE')).toBeInTheDocument();
  });

  test('does not display urgency for todos without deadline', () => {
    const todoWithoutDeadline = { ...sampleTodo, deadline: null };
    
    render(
      <TodoItem
        todo={todoWithoutDeadline}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.queryByText(/TIME LEFT|CRITICAL|URGENT|WARNING|OVERDUE/)).not.toBeInTheDocument();
  });

  test('calls onToggleComplete when checkbox is clicked', () => {
    render(
      <TodoItem
        todo={sampleTodo}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const checkbox = screen.getByLabelText('Mark as complete');
    fireEvent.click(checkbox);
    
    expect(mockOnToggleComplete).toHaveBeenCalledWith(1);
  });

  test('calls onEdit when edit button is clicked', () => {
    render(
      <TodoItem
        todo={sampleTodo}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const editButton = screen.getByLabelText('Edit todo');
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(sampleTodo);
  });

  test('includes all planet categories in icon mapping', () => {
    const planetCategories = [
      { category: 'sun', icon: '☀️' },
      { category: 'mercury', icon: '🌑' },
      { category: 'venus', icon: '💛' },
      { category: 'earth', icon: '🌍' },
      { category: 'mars', icon: '🔴' },
      { category: 'jupiter', icon: '🪐' },
      { category: 'saturn', icon: '🪐' },
      { category: 'uranus', icon: '🔵' },
      { category: 'neptune', icon: '🔷' }
    ];

    planetCategories.forEach(({ category, icon }) => {
      const todo = { ...sampleTodo, category };
      const { unmount } = render(
        <TodoItem
          todo={todo}
          onToggleComplete={mockOnToggleComplete}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );
      
      expect(screen.getByText(icon)).toBeInTheDocument();
      unmount();
    });
  });
});