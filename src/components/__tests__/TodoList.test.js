import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoList from '../TodoList';

describe('TodoList', () => {
  const mockOnToggleComplete = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  
  const sampleTodos = [
    {
      id: 1,
      text: 'First todo',
      category: 'general',
      completed: false,
      createdAt: new Date(),
      priority: 'medium'
    },
    {
      id: 2,
      text: 'Second todo',
      category: 'mars',
      completed: true,
      createdAt: new Date(),
      priority: 'high'
    }
  ];

  test('renders all todos when provided', () => {
    render(
      <TodoList
        todos={sampleTodos}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('First todo')).toBeInTheDocument();
    expect(screen.getByText('Second todo')).toBeInTheDocument();
  });

  test('displays empty message when no todos are provided', () => {
    render(
      <TodoList
        todos={[]}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('🌌 No missions found in this sector')).toBeInTheDocument();
    expect(screen.getByText('All systems operational, commander!')).toBeInTheDocument();
  });

  test('renders correct number of todo items', () => {
    const { container } = render(
      <TodoList
        todos={sampleTodos}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const todoItems = container.querySelectorAll('.todo-item');
    expect(todoItems).toHaveLength(2);
  });

  test('passes correct props to TodoItem components', () => {
    render(
      <TodoList
        todos={sampleTodos}
        onToggleComplete={mockOnToggleComplete}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    // Check if the todos are rendered with their specific content
    expect(screen.getByText('First todo')).toBeInTheDocument();
    expect(screen.getByText('Second todo')).toBeInTheDocument();
    expect(screen.getByText('general')).toBeInTheDocument();
    expect(screen.getByText('mars')).toBeInTheDocument();
  });
});