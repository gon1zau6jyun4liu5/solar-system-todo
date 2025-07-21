import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoForm from '../TodoForm';

describe('TodoForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders create form when no todo is provided', () => {
    render(
      <TodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByText('🚀 Create New Mission')).toBeInTheDocument();
    expect(screen.getByText('Launch Mission')).toBeInTheDocument();
  });

  test('renders edit form when todo is provided', () => {
    const todo = {
      text: 'Test todo',
      category: 'mars',
      priority: 'high'
    };
    
    render(
      <TodoForm 
        todo={todo}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByText('🛠️ Update Mission')).toBeInTheDocument();
    expect(screen.getByText('Update Mission')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test todo')).toBeInTheDocument();
  });

  test('submits form with correct data', () => {
    render(
      <TodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    const textInput = screen.getByPlaceholderText('Enter your space mission...');
    const categorySelect = screen.getByLabelText('Mission Category');
    const prioritySelect = screen.getByLabelText('Priority Level');
    const submitButton = screen.getByText('Launch Mission');
    
    fireEvent.change(textInput, { target: { value: 'New test mission' } });
    fireEvent.change(categorySelect, { target: { value: 'mars' } });
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      text: 'New test mission',
      category: 'mars',
      priority: 'high'
    });
  });

  test('does not submit with empty text', () => {
    render(
      <TodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    const submitButton = screen.getByText('Launch Mission');
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(
      <TodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('includes all category options', () => {
    render(
      <TodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByText('🚀 General Mission')).toBeInTheDocument();
    expect(screen.getByText('☀️ Solar Research')).toBeInTheDocument();
    expect(screen.getByText('🌍 Earth Studies')).toBeInTheDocument();
    expect(screen.getByText('🔴 Mars Exploration')).toBeInTheDocument();
  });

  test('includes all priority options', () => {
    render(
      <TodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByText('Low Priority')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority')).toBeInTheDocument();
    expect(screen.getByText('High Priority')).toBeInTheDocument();
  });
});