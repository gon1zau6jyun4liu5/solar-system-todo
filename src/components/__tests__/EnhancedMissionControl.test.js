import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedMissionControl from '../EnhancedMissionControl';

// Mock todos for testing
const mockTodos = [
  {
    id: 1,
    text: 'Complete project proposal',
    category: 'work',
    hierarchyType: 'planet',
    priority: 'high',
    completed: false,
    createdAt: new Date('2025-07-20'),
    deadline: new Date('2025-07-25'),
    visualProperties: {
      daysUntilDeadline: 3,
      rotationSpeed: 0.01,
      sizeMultiplier: 1.5,
      brightness: 2.0,
      urgencyColor: '#ff8800'
    }
  },
  {
    id: 2,
    text: 'Review quarterly reports',
    category: 'work',
    hierarchyType: 'satellite',
    priority: 'medium',
    completed: true,
    createdAt: new Date('2025-07-18'),
    deadline: new Date('2025-07-22'),
    visualProperties: {
      daysUntilDeadline: 0,
      rotationSpeed: 0.005,
      sizeMultiplier: 1.0,
      brightness: 1.0,
      urgencyColor: '#44aa44'
    }
  },
  {
    id: 3,
    text: 'Plan family vacation',
    category: 'personal',
    hierarchyType: 'sun',
    priority: 'low',
    completed: false,
    createdAt: new Date('2025-07-19'),
    deadline: new Date('2025-08-01'),
    visualProperties: {
      daysUntilDeadline: 10,
      rotationSpeed: 0.002,
      sizeMultiplier: 0.8,
      brightness: 1.2,
      urgencyColor: '#44ff44'
    }
  }
];

const defaultProps = {
  todos: mockTodos,
  onTodoUpdate: jest.fn(),
  onTodoAdd: jest.fn(),
  onTodoDelete: jest.fn(),
  selectedCategory: null,
  onCategoryChange: jest.fn()
};

describe('EnhancedMissionControl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Enhanced Mission Control with version 0.4.2', () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    expect(screen.getByText('🚀 Enhanced Mission Control v0.4.2')).toBeInTheDocument();
  });

  test('displays correct statistics', () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    expect(screen.getByText('3')).toBeInTheDocument(); // Total Missions
    expect(screen.getByText('1')).toBeInTheDocument(); // Completed
    expect(screen.getByText('1')).toBeInTheDocument(); // Urgent (daysUntilDeadline <= 3)
    expect(screen.getByText('33%')).toBeInTheDocument(); // Success Rate
  });

  test('search functionality works correctly', async () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/Search missions/);
    fireEvent.change(searchInput, { target: { value: 'project' } });
    
    await waitFor(() => {
      expect(screen.getByText('Complete project proposal')).toBeInTheDocument();
      expect(screen.queryByText('Plan family vacation')).not.toBeInTheDocument();
    });
  });

  test('clear search button works', async () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/Search missions/);
    fireEvent.change(searchInput, { target: { value: 'project' } });
    
    await waitFor(() => {
      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);
      expect(searchInput.value).toBe('');
    });
  });

  test('filter by urgent missions works', async () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    const filterSelect = screen.getByDisplayValue('All Missions');
    fireEvent.change(filterSelect, { target: { value: 'urgent' } });
    
    await waitFor(() => {
      expect(screen.getByText('Complete project proposal')).toBeInTheDocument();
      expect(screen.queryByText('Plan family vacation')).not.toBeInTheDocument();
    });
  });

  test('sorting by priority works correctly', async () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    const sortSelect = screen.getByDisplayValue('Sort by Priority');
    fireEvent.change(sortSelect, { target: { value: 'deadline' } });
    
    // Should re-render with deadline sorting
    expect(sortSelect.value).toBe('deadline');
  });

  test('view mode switching works', () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    const listViewBtn = screen.getByTitle('List View');
    const timelineViewBtn = screen.getByTitle('Timeline View');
    
    fireEvent.click(listViewBtn);
    expect(listViewBtn).toHaveClass('active');
    
    fireEvent.click(timelineViewBtn);
    expect(timelineViewBtn).toHaveClass('active');
  });

  test('todo selection and bulk operations work', async () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    // Select first todo
    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(firstCheckbox);
    
    await waitFor(() => {
      expect(screen.getByText(/1 missions selected/)).toBeInTheDocument();
      expect(screen.getByText('✓ Complete All')).toBeInTheDocument();
    });
  });

  test('bulk complete operation calls onTodoUpdate', async () => {
    const mockOnTodoUpdate = jest.fn();
    render(<EnhancedMissionControl {...defaultProps} onTodoUpdate={mockOnTodoUpdate} />);
    
    // Select incomplete todo
    const checkboxes = screen.getAllByRole('checkbox');
    const incompleteCheckbox = checkboxes.find(cb => {
      const card = cb.closest('.enhanced-mission-card');
      return card && card.textContent.includes('Complete project proposal');
    });
    
    fireEvent.click(incompleteCheckbox);
    
    await waitFor(() => {
      const completeAllBtn = screen.getByText('✓ Complete All');
      fireEvent.click(completeAllBtn);
      expect(mockOnTodoUpdate).toHaveBeenCalledWith(1, { completed: true });
    });
  });

  test('bulk delete operation calls onTodoDelete', async () => {
    const mockOnTodoDelete = jest.fn();
    window.confirm = jest.fn(() => true);
    
    render(<EnhancedMissionControl {...defaultProps} onTodoDelete={mockOnTodoDelete} />);
    
    // Select a todo
    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(firstCheckbox);
    
    await waitFor(() => {
      const deleteBtn = screen.getByText('🗑️ Delete Selected');
      fireEvent.click(deleteBtn);
      expect(mockOnTodoDelete).toHaveBeenCalled();
    });
  });

  test('empty state is shown when no todos match filters', async () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/Search missions/);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    await waitFor(() => {
      expect(screen.getByText('No missions found')).toBeInTheDocument();
      expect(screen.getByText('No missions match "nonexistent"')).toBeInTheDocument();
      expect(screen.getByText('🚀 Create New Mission')).toBeInTheDocument();
    });
  });

  test('empty state create button calls onTodoAdd', async () => {
    const mockOnTodoAdd = jest.fn();
    render(<EnhancedMissionControl {...defaultProps} todos={[]} onTodoAdd={mockOnTodoAdd} />);
    
    const createBtn = screen.getByText('🚀 Create New Mission');
    fireEvent.click(createBtn);
    
    expect(mockOnTodoAdd).toHaveBeenCalled();
  });

  test('keyboard shortcuts work correctly', () => {
    const mockOnTodoAdd = jest.fn();
    render(<EnhancedMissionControl {...defaultProps} onTodoAdd={mockOnTodoAdd} />);
    
    // Test Ctrl+N for new todo
    fireEvent.keyDown(window, { key: 'n', ctrlKey: true });
    expect(mockOnTodoAdd).toHaveBeenCalled();
    
    // Test Ctrl+F for search focus
    const searchInput = screen.getByPlaceholderText(/Search missions/);
    fireEvent.keyDown(window, { key: 'f', ctrlKey: true });
    expect(document.activeElement).toBe(searchInput);
  });

  test('keyboard help toggle works', () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    const helpButton = screen.getByTitle(/Keyboard Shortcuts/);
    fireEvent.click(helpButton);
    
    expect(screen.getByText('⌨️ Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('New Mission')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    
    const closeButton = screen.getByText('Got it!');
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('⌨️ Keyboard Shortcuts')).not.toBeInTheDocument();
  });

  test('mission card quick edit functionality works', async () => {
    const mockOnTodoUpdate = jest.fn();
    render(<EnhancedMissionControl {...defaultProps} onTodoUpdate={mockOnTodoUpdate} />);
    
    const missionText = screen.getByText('Complete project proposal');
    fireEvent.doubleClick(missionText);
    
    await waitFor(() => {
      const editInput = screen.getByDisplayValue('Complete project proposal');
      fireEvent.change(editInput, { target: { value: 'Updated project proposal' } });
      fireEvent.keyDown(editInput, { key: 'Enter' });
      
      expect(mockOnTodoUpdate).toHaveBeenCalledWith(1, { text: 'Updated project proposal' });
    });
  });

  test('mission card quick actions work', () => {
    const mockOnTodoUpdate = jest.fn();
    const mockOnTodoDelete = jest.fn();
    window.confirm = jest.fn(() => true);
    
    render(<EnhancedMissionControl {...defaultProps} onTodoUpdate={mockOnTodoUpdate} onTodoDelete={mockOnTodoDelete} />);
    
    // Find complete button for incomplete todo
    const projectCard = screen.getByText('Complete project proposal').closest('.enhanced-mission-card');
    const completeBtn = projectCard.querySelector('.quick-action.complete');
    
    fireEvent.click(completeBtn);
    expect(mockOnTodoUpdate).toHaveBeenCalledWith(1, { completed: true });
    
    // Test delete button
    const deleteBtn = projectCard.querySelector('.quick-action.delete');
    fireEvent.click(deleteBtn);
    expect(mockOnTodoDelete).toHaveBeenCalledWith(1);
  });

  test('urgency levels are displayed correctly', () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    // High priority, urgent deadline todo should have critical styling
    const urgentCard = screen.getByText('Complete project proposal').closest('.enhanced-mission-card');
    expect(urgentCard).toHaveClass('urgent');
    
    // Completed todo should have completed styling
    const completedCard = screen.getByText('Review quarterly reports').closest('.enhanced-mission-card');
    expect(completedCard).toHaveClass('completed');
  });

  test('category and hierarchy badges are displayed', () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('personal')).toBeInTheDocument();
    expect(screen.getByText('planet')).toBeInTheDocument();
    expect(screen.getByText('satellite')).toBeInTheDocument();
    expect(screen.getByText('sun')).toBeInTheDocument();
  });

  test('priority badges are displayed with correct styling', () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    const highPriorityBadge = screen.getByText('HIGH');
    expect(highPriorityBadge).toHaveClass('priority-badge', 'high');
    
    const mediumPriorityBadge = screen.getByText('MEDIUM');
    expect(mediumPriorityBadge).toHaveClass('priority-badge', 'medium');
    
    const lowPriorityBadge = screen.getByText('LOW');
    expect(lowPriorityBadge).toHaveClass('priority-badge', 'low');
  });
});

describe('EnhancedMissionControl Accessibility', () => {
  test('has proper ARIA labels and roles', () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    
    checkboxes.forEach(checkbox => {
      expect(checkbox).toHaveAttribute('aria-label');
    });
  });

  test('keyboard navigation works', () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    // Test escape key clears selection
    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(firstCheckbox);
    
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(firstCheckbox).not.toBeChecked();
  });

  test('search input has proper focus management', () => {
    render(<EnhancedMissionControl {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/Search missions/);
    expect(searchInput).toHaveAttribute('id', 'search-input');
  });
});

describe('EnhancedMissionControl Performance', () => {
  test('renders efficiently with large todo lists', () => {
    const largeTodoList = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      text: `Todo item ${i + 1}`,
      category: ['work', 'personal', 'education'][i % 3],
      hierarchyType: ['sun', 'planet', 'satellite'][i % 3],
      priority: ['low', 'medium', 'high'][i % 3],
      completed: i % 4 === 0,
      createdAt: new Date(),
      deadline: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)),
      visualProperties: {
        daysUntilDeadline: i % 10 + 1,
        rotationSpeed: 0.005,
        sizeMultiplier: 1.0,
        brightness: 1.0,
        urgencyColor: '#44aa44'
      }
    }));
    
    const startTime = performance.now();
    render(<EnhancedMissionControl {...defaultProps} todos={largeTodoList} />);
    const endTime = performance.now();
    
    // Should render within reasonable time
    expect(endTime - startTime).toBeLessThan(1000);
    
    // Should display first few items
    expect(screen.getByText('Todo item 1')).toBeInTheDocument();
  });

  test('search performance with large datasets', async () => {
    const largeTodoList = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      text: `Todo item ${i + 1}`,
      category: 'work',
      hierarchyType: 'satellite',
      priority: 'medium',
      completed: false,
      createdAt: new Date(),
      visualProperties: {
        daysUntilDeadline: 5,
        rotationSpeed: 0.005,
        sizeMultiplier: 1.0,
        brightness: 1.0,
        urgencyColor: '#44aa44'
      }
    }));
    
    render(<EnhancedMissionControl {...defaultProps} todos={largeTodoList} />);
    
    const startTime = performance.now();
    const searchInput = screen.getByPlaceholderText(/Search missions/);
    fireEvent.change(searchInput, { target: { value: 'item 50' } });
    
    await waitFor(() => {
      expect(screen.getByText('Todo item 50')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(200); // Search should be fast
  });
});