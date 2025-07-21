import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoManager from '../TodoManager';

// localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// window.confirm mock
global.confirm = jest.fn(() => true);

describe('TodoManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders with initial todos when localStorage is empty', () => {
    render(<TodoManager />);
    
    expect(screen.getByText('🚀 Solar System Mission Control')).toBeInTheDocument();
    expect(screen.getByText('태양의 표면 온도 조사하기')).toBeInTheDocument();
    expect(screen.getByText('지구의 자전축 기울기 23.5도 확인')).toBeInTheDocument();
  });

  test('loads todos from localStorage if available', () => {
    const savedTodos = JSON.stringify([
      {
        id: 1,
        text: 'Test todo from localStorage',
        category: 'general',
        completed: false,
        createdAt: new Date(),
        priority: 'high'
      }
    ]);
    localStorageMock.getItem.mockReturnValue(savedTodos);

    render(<TodoManager />);
    
    expect(screen.getByText('Test todo from localStorage')).toBeInTheDocument();
  });

  test('opens todo form when "New Mission" button is clicked', () => {
    render(<TodoManager />);
    
    const newMissionBtn = screen.getByText('+ New Mission');
    fireEvent.click(newMissionBtn);
    
    expect(screen.getByText('🚀 Create New Mission')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your space mission...')).toBeInTheDocument();
  });

  test('filters todos correctly', () => {
    render(<TodoManager />);
    
    // Click on "Completed" filter
    const completedFilter = screen.getByText('Completed');
    fireEvent.click(completedFilter);
    
    // Should only show completed todos
    expect(screen.getByText('지구의 자전축 기울기 23.5도 확인')).toBeInTheDocument();
    expect(screen.queryByText('태양의 표면 온도 조사하기')).not.toBeInTheDocument();
  });

  test('toggles todo completion status', async () => {
    render(<TodoManager />);
    
    // Find an incomplete todo and click its checkbox
    const todoItem = screen.getByText('태양의 표면 온도 조사하기').closest('.todo-item');
    const checkbox = todoItem.querySelector('.todo-checkbox');
    
    fireEvent.click(checkbox);
    
    // Check if the todo item has completed class
    await waitFor(() => {
      expect(todoItem).toHaveClass('completed');
    });
  });

  test('displays correct statistics', () => {
    render(<TodoManager />);
    
    expect(screen.getByText('Total: 6')).toBeInTheDocument();
    expect(screen.getByText('Completed: 2')).toBeInTheDocument();
    expect(screen.getByText('Pending: 4')).toBeInTheDocument();
  });

  test('saves todos to localStorage when todos change', () => {
    render(<TodoManager />);
    
    // Simulate adding a new todo by clicking a checkbox
    const todoItem = screen.getByText('태양의 표면 온도 조사하기').closest('.todo-item');
    const checkbox = todoItem.querySelector('.todo-checkbox');
    fireEvent.click(checkbox);
    
    // Check if localStorage.setItem was called
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'solar-system-todos',
      expect.any(String)
    );
  });
});