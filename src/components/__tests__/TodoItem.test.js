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
    priority: 'high'
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

  test('displays incomplete status correctly', () => {
    render(
      <TodoItem
        todo={sampleTodo}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('⭕')).toBeInTheDocument();
    expect(screen.queryByText('✅')).not.toBeInTheDocument();
  });

  test('displays completed status correctly', () => {
    const completedTodo = { ...sampleTodo, completed: true };
    
    render(
      <TodoItem
        todo={completedTodo}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('✅')).toBeInTheDocument();
    expect(screen.queryByText('⭕')).not.toBeInTheDocument();
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

  test('calls onDelete when delete button is clicked and confirmed', () => {
    render(
      <TodoItem
        todo={sampleTodo}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = screen.getByLabelText('Delete todo');
    fireEvent.click(deleteButton);
    
    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this mission?');
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  test('does not call onDelete when deletion is not confirmed', () => {
    global.confirm.mockReturnValueOnce(false);
    
    render(
      <TodoItem
        todo={sampleTodo}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = screen.getByLabelText('Delete todo');
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  test('applies correct priority class', () => {
    const { container } = render(
      <TodoItem
        todo={sampleTodo}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(container.querySelector('.priority-high')).toBeInTheDocument();
  });

  test('applies completed class when todo is completed', () => {
    const completedTodo = { ...sampleTodo, completed: true };
    const { container } = render(
      <TodoItem
        todo={completedTodo}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(container.querySelector('.completed')).toBeInTheDocument();
  });

  test('formats date correctly', () => {
    render(
      <TodoItem
        todo={sampleTodo}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText(/Created: Jul 21, 2025/)).toBeInTheDocument();
  });
});