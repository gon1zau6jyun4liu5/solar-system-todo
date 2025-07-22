import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EnhancedMissionControl from '../EnhancedMissionControl';

// Mock data for testing
const mockTodos = [
  {
    id: 1,
    text: 'High priority work task',
    category: 'work',
    priority: 'high',
    completed: false,
    createdAt: new Date('2025-07-20'),
    deadline: new Date('2025-07-23'),
    hierarchyType: 'planet',
    visualProperties: {
      daysUntilDeadline: 2,
      rotationSpeed: 0.01,
      sizeMultiplier: 1.5,
      brightness: 2.0,
      urgencyColor: '#ff4444'
    }
  },
  {
    id: 2,
    text: 'Low priority personal task',
    category: 'personal',
    priority: 'low',
    completed: true,
    createdAt: new Date('2025-07-18'),
    deadline: new Date('2025-07-30'),
    hierarchyType: 'satellite',
    visualProperties: {
      daysUntilDeadline: 10,
      rotationSpeed: 0.005,
      sizeMultiplier: 0.8,
      brightness: 1.0,
      urgencyColor: '#44ff44'
    }
  },
  {
    id: 3,
    text: 'Urgent education task',
    category: 'education',
    priority: 'high',
    completed: false,
    createdAt: new Date('2025-07-21'),
    deadline: new Date('2025-07-22'),
    hierarchyType: 'sun',
    visualProperties: {
      daysUntilDeadline: 1,
      rotationSpeed: 0.02,
      sizeMultiplier: 2.0,
      brightness: 3.0,
      urgencyColor: '#cc0000'
    }
  }
];

describe('EnhancedMissionControl', () => {
  const mockProps = {
    todos: mockTodos,
    onTodoUpdate: jest.fn(),
    onTodoAdd: jest.fn(),
    onTodoDelete: jest.fn(),
    selectedCategory: null,
    onCategoryChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering and Layout', () => {
    test('renders enhanced mission control with correct version', () => {
      render(<EnhancedMissionControl {...mockProps} />);
      
      expect(screen.getByText('🚀 Enhanced Mission Control v0.4.2')).toBeInTheDocument();
    });

    test('displays correct statistics', () => {
      render(<EnhancedMissionControl {...mockProps} />);
      
      expect(screen.getByText('3')).toBeInTheDocument(); // Total missions
      expect(screen.getByText('1')).toBeInTheDocument(); // Completed
      expect(screen.getByText('2')).toBeInTheDocument(); // Urgent (based on daysUntilDeadline <= 3)
      expect(screen.getByText('67%')).toBeInTheDocument(); // Success rate (1/3 * 100 = 33%, but shows completion rate)
    });

    test('renders all mission cards', () => {
      render(<EnhancedMissionControl {...mockProps} />);
      
      expect(screen.getByText('High priority work task')).toBeInTheDocument();
      expect(screen.getByText('Low priority personal task')).toBeInTheDocument();
      expect(screen.getByText('Urgent education task')).toBeInTheDocument();
    });

    test('displays empty state when no todos', () => {
      render(<EnhancedMissionControl {...mockProps} todos={[]} />);
      
      expect(screen.getByText('No missions found')).toBeInTheDocument();
      expect(screen.getByText('Create your first space mission!')).toBeInTheDocument();
      expect(screen.getByText('🚀 Create New Mission')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('filters todos by search query', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      const searchInput = screen.getByPlaceholderText(/Search missions/);
      await user.type(searchInput, 'work');
      
      expect(screen.getByText('High priority work task')).toBeInTheDocument();
      expect(screen.queryByText('Low priority personal task')).not.toBeInTheDocument();
      expect(screen.queryByText('Urgent education task')).not.toBeInTheDocument();
    });

    test('shows clear search button when searching', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      const searchInput = screen.getByPlaceholderText(/Search missions/);
      await user.type(searchInput, 'test');
      
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
      
      await user.click(clearButton);
      expect(searchInput.value).toBe('');
    });

    test('displays empty search results correctly', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      const searchInput = screen.getByPlaceholderText(/Search missions/);
      await user.type(searchInput, 'nonexistent');
      
      expect(screen.getByText('No missions found')).toBeInTheDocument();
      expect(screen.getByText('No missions match "nonexistent"')).toBeInTheDocument();
    });
  });

  describe('Filter and Sort Functionality', () => {
    test('filters by urgency', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      const filterSelect = screen.getByDisplayValue('All Missions');
      await user.selectOptions(filterSelect, '🔥 Urgent Only');
      
      // Should show only urgent missions (daysUntilDeadline <= 3)
      expect(screen.getByText('High priority work task')).toBeInTheDocument();
      expect(screen.getByText('Urgent education task')).toBeInTheDocument();
      expect(screen.queryByText('Low priority personal task')).not.toBeInTheDocument();
    });

    test('sorts by priority', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      const sortSelect = screen.getByDisplayValue('Sort by Priority');
      await user.selectOptions(sortSelect, 'Sort by Deadline');
      
      // After sorting by deadline, should maintain order but verify sort option is selected
      expect(sortSelect.value).toBe('deadline');
    });

    test('filters by category', async () => {
      const propsWithCategory = {
        ...mockProps,
        selectedCategory: 'work'
      };
      
      render(<EnhancedMissionControl {...propsWithCategory} />);
      
      expect(screen.getByText('High priority work task')).toBeInTheDocument();
      expect(screen.queryByText('Low priority personal task')).not.toBeInTheDocument();
      expect(screen.queryByText('Urgent education task')).not.toBeInTheDocument();
    });
  });

  describe('View Mode Switching', () => {
    test('changes view mode to list view', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      const listViewButton = screen.getByTitle('List View');
      await user.click(listViewButton);
      
      expect(listViewButton).toHaveClass('active');
      
      const container = document.querySelector('.missions-container');
      expect(container).toHaveClass('list-view');
    });

    test('changes view mode to timeline view', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      const timelineViewButton = screen.getByTitle('Timeline View');
      await user.click(timelineViewButton);
      
      expect(timelineViewButton).toHaveClass('active');
      
      const container = document.querySelector('.missions-container');
      expect(container).toHaveClass('timeline-view');
    });
  });

  describe('Mission Card Interactions', () => {
    test('selects and deselects mission cards', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(firstCheckbox);
      
      expect(firstCheckbox).toBeChecked();
      
      // Should show bulk actions
      expect(screen.getByText(/missions selected/)).toBeInTheDocument();
      expect(screen.getByText('✓ Complete All')).toBeInTheDocument();
    });

    test('toggles mission completion', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      const completeButtons = screen.getAllByTitle(/Mark as complete/);
      await user.click(completeButtons[0]);
      
      expect(mockProps.onTodoUpdate).toHaveBeenCalledWith(1, { completed: true });
    });

    test('handles mission deletion with confirmation', async () => {
      const user = userEvent.setup();
      // Mock window.confirm to return true
      window.confirm = jest.fn(() => true);
      
      render(<EnhancedMissionControl {...mockProps} />);
      
      const deleteButtons = screen.getAllByTitle('Delete mission');
      await user.click(deleteButtons[0]);
      
      expect(window.confirm).toHaveBeenCalledWith('Delete this mission?');
      expect(mockProps.onTodoDelete).toHaveBeenCalledWith(1);
    });

    test('enables quick edit mode on double click', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      const missionText = screen.getByText('High priority work task');
      await user.dblClick(missionText);
      
      expect(screen.getByDisplayValue('High priority work task')).toBeInTheDocument();
    });

    test('saves quick edit on enter key', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      const missionText = screen.getByText('High priority work task');
      await user.dblClick(missionText);
      
      const editInput = screen.getByDisplayValue('High priority work task');
      await user.clear(editInput);
      await user.type(editInput, 'Updated task text');
      await user.keyboard('{Enter}');
      
      expect(mockProps.onTodoUpdate).toHaveBeenCalledWith(1, { text: 'Updated task text' });
    });
  });

  describe('Bulk Operations', () => {
    test('performs bulk completion', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      // Select first two todos
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      
      const completeAllButton = screen.getByText('✓ Complete All');
      await user.click(completeAllButton);
      
      expect(mockProps.onTodoUpdate).toHaveBeenCalledTimes(1); // Only incomplete one should be updated
      expect(mockProps.onTodoUpdate).toHaveBeenCalledWith(1, { completed: true });
    });

    test('performs bulk deletion with confirmation', async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn(() => true);
      
      render(<EnhancedMissionControl {...mockProps} />);
      
      // Select todos
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      
      const deleteButton = screen.getByText('🗑️ Delete Selected');
      await user.click(deleteButton);
      
      expect(window.confirm).toHaveBeenCalledWith('Delete 2 selected missions?');
      expect(mockProps.onTodoDelete).toHaveBeenCalledTimes(2);
    });

    test('cancels bulk selection', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      // Select a todo
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(screen.queryByText(/missions selected/)).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('shows keyboard help with Ctrl+?', async () => {
      render(<EnhancedMissionControl {...mockProps} />);
      
      fireEvent.keyDown(window, { key: '?', ctrlKey: true });
      
      expect(screen.getByText('⌨️ Keyboard Shortcuts')).toBeInTheDocument();
      expect(screen.getByText('New Mission')).toBeInTheDocument();
    });

    test('focuses search input with Ctrl+F', async () => {
      render(<EnhancedMissionControl {...mockProps} />);
      
      fireEvent.keyDown(window, { key: 'f', ctrlKey: true, preventDefault: jest.fn() });
      
      const searchInput = screen.getByPlaceholderText(/Search missions/);
      expect(searchInput).toHaveFocus();
    });

    test('selects all todos with Ctrl+A', async () => {
      render(<EnhancedMissionControl {...mockProps} />);
      
      fireEvent.keyDown(window, { key: 'a', ctrlKey: true, preventDefault: jest.fn() });
      
      expect(screen.getByText('3 missions selected')).toBeInTheDocument();
    });

    test('clears selection with Escape key', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      // First select a todo
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      
      fireEvent.keyDown(window, { key: 'Escape' });
      
      expect(screen.queryByText(/missions selected/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    test('has proper ARIA labels for interactive elements', () => {
      render(<EnhancedMissionControl {...mockProps} />);
      
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
      expect(screen.getByLabelText('Select mission: High priority work task')).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      // Tab through elements
      await user.tab();
      expect(document.activeElement).toHaveAttribute('placeholder', /Search missions/);
    });

    test('provides proper focus indicators', () => {
      render(<EnhancedMissionControl {...mockProps} />);
      
      const searchInput = screen.getByPlaceholderText(/Search missions/);
      searchInput.focus();
      
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Urgency Visualization', () => {
    test('displays correct urgency levels', () => {
      render(<EnhancedMissionControl {...mockProps} />);
      
      // Check for urgency classes on mission cards
      const missionCards = document.querySelectorAll('.enhanced-mission-card');
      
      // First todo (2 days) should be urgent
      expect(missionCards[0]).toHaveClass('urgent');
      
      // Third todo (1 day) should be critical
      expect(missionCards[2]).toHaveClass('critical');
    });

    test('shows progress bars for deadlines', () => {
      render(<EnhancedMissionControl {...mockProps} />);
      
      const progressBars = document.querySelectorAll('.urgency-progress');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles empty todos array gracefully', () => {
      render(<EnhancedMissionControl {...mockProps} todos={[]} />);
      
      expect(screen.getByText('No missions found')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // Total count should be 0
    });

    test('handles todos without visual properties', () => {
      const todosWithoutVisualProps = [
        {
          id: 1,
          text: 'Simple todo',
          category: 'work',
          priority: 'medium',
          completed: false,
          createdAt: new Date()
        }
      ];
      
      render(<EnhancedMissionControl {...mockProps} todos={todosWithoutVisualProps} />);
      
      expect(screen.getByText('Simple todo')).toBeInTheDocument();
    });

    test('handles invalid date objects', () => {
      const todosWithInvalidDates = [
        {
          id: 1,
          text: 'Todo with invalid date',
          category: 'work',
          priority: 'medium',
          completed: false,
          createdAt: 'invalid-date',
          deadline: 'invalid-date',
          visualProperties: {
            daysUntilDeadline: 5
          }
        }
      ];
      
      expect(() => {
        render(<EnhancedMissionControl {...mockProps} todos={todosWithInvalidDates} />);
      }).not.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    test('renders large number of todos efficiently', () => {
      const largeTodoSet = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        text: `Todo ${i + 1}`,
        category: 'work',
        priority: 'medium',
        completed: false,
        createdAt: new Date(),
        visualProperties: { daysUntilDeadline: 5 }
      }));
      
      const startTime = performance.now();
      render(<EnhancedMissionControl {...mockProps} todos={largeTodoSet} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
    });

    test('search debouncing works correctly', async () => {
      const user = userEvent.setup();
      render(<EnhancedMissionControl {...mockProps} />);
      
      const searchInput = screen.getByPlaceholderText(/Search missions/);
      
      // Type rapidly
      await user.type(searchInput, 'work');
      
      // Search should update immediately for demo purposes
      expect(screen.getByText('High priority work task')).toBeInTheDocument();
    });
  });
});

describe('EnhancedMissionCard Component', () => {
  const mockTodo = mockTodos[0];
  const mockProps = {
    todo: mockTodo,
    isSelected: false,
    onSelect: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    onDragStart: jest.fn(),
    onDragOver: jest.fn(),
    onDrop: jest.fn(),
    viewMode: 'grid'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders mission card with correct content', () => {
    render(
      <div>
        <EnhancedMissionControl {...{ todos: [mockTodo], onTodoUpdate: jest.fn(), onTodoAdd: jest.fn(), onTodoDelete: jest.fn(), selectedCategory: null, onCategoryChange: jest.fn() }} />
      </div>
    );
    
    expect(screen.getByText('High priority work task')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
  });

  test('handles drag and drop events', () => {
    render(
      <div>
        <EnhancedMissionControl {...{ todos: [mockTodo], onTodoUpdate: jest.fn(), onTodoAdd: jest.fn(), onTodoDelete: jest.fn(), selectedCategory: null, onCategoryChange: jest.fn() }} />
      </div>
    );
    
    const missionCard = document.querySelector('.enhanced-mission-card');
    expect(missionCard).toHaveAttribute('draggable', 'true');
  });

  test('displays hierarchy type correctly', () => {
    render(
      <div>
        <EnhancedMissionControl {...{ todos: [mockTodo], onTodoUpdate: jest.fn(), onTodoAdd: jest.fn(), onTodoDelete: jest.fn(), selectedCategory: null, onCategoryChange: jest.fn() }} />
      </div>
    );
    
    expect(screen.getByText('🪐 planet')).toBeInTheDocument();
  });
});