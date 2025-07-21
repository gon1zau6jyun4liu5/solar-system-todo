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
      priority: 'high',
      deadline: new Date('2025-07-25')
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
    expect(screen.getByDisplayValue('2025-07-25')).toBeInTheDocument();
  });

  test('submits form with correct data including deadline', () => {
    render(
      <TodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    const textInput = screen.getByPlaceholderText('Enter your space mission...');
    const categorySelect = screen.getByLabelText('Mission Category');
    const prioritySelect = screen.getByLabelText('Priority Level');
    const deadlineInput = screen.getByLabelText('Mission Deadline');
    const submitButton = screen.getByText('Launch Mission');
    
    fireEvent.change(textInput, { target: { value: 'New test mission' } });
    fireEvent.change(categorySelect, { target: { value: 'mars' } });
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    fireEvent.change(deadlineInput, { target: { value: '2025-07-30' } });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      text: 'New test mission',
      category: 'mars',
      priority: 'high',
      deadline: new Date('2025-07-30')
    });
  });

  test('submits form with null deadline when not provided', () => {
    render(
      <TodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    const textInput = screen.getByPlaceholderText('Enter your space mission...');
    const submitButton = screen.getByText('Launch Mission');
    
    fireEvent.change(textInput, { target: { value: 'Mission without deadline' } });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      text: 'Mission without deadline',
      category: 'general',
      priority: 'medium',
      deadline: null
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

  test('includes all planet category options', () => {
    render(
      <TodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    const planetCategories = [
      '🚀 General Mission',
      '☀️ Solar Research',
      '🌑 Mercury Study',
      '💛 Venus Research',
      '🌍 Earth Studies',
      '🔴 Mars Exploration',
      '🪐 Jupiter Investigation',
      '🪐 Saturn Analysis',
      '🔵 Uranus Research',
      '🔷 Neptune Analysis'
    ];

    planetCategories.forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
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

  test('displays deadline field with help text', () => {
    render(
      <TodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByLabelText('Mission Deadline')).toBeInTheDocument();
    expect(screen.getByText('Optional: Set a deadline to track mission urgency')).toBeInTheDocument();
  });

  test('sets minimum date for deadline input', () => {
    render(
      <TodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    const deadlineInput = screen.getByLabelText('Mission Deadline');
    const today = new Date().toISOString().split('T')[0];
    
    expect(deadlineInput).toHaveAttribute('min', today);
  });
});