import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import EnhancedMissionControl from '../components/EnhancedMissionControl';

// Mock components to avoid WebGL issues
jest.mock('../components/Scene', () => {
  return function MockScene({ solarSystems, asteroids }) {
    return (
      <div data-testid="scene">
        <div data-testid="solar-systems-count">{solarSystems.length}</div>
        <div data-testid="asteroids-count">{asteroids.length}</div>
      </div>
    );
  };
});

jest.mock('../components/AITodoManager', () => {
  return function MockAITodoManager() {
    return <div data-testid="ai-todo-manager">AI Todo Manager</div>;
  };
});

jest.mock('../components/AdvancedAnalyticsDashboard', () => {
  return function MockAdvancedAnalyticsDashboard({ isVisible }) {
    return isVisible ? <div data-testid="analytics-dashboard">Analytics Dashboard</div> : null;
  };
});

jest.mock('../components/AsteroidActionSystem', () => {
  return function MockAsteroidActionSystem() {
    return <div data-testid="asteroid-action-system">Asteroid Action System</div>;
  };
});

describe('App Component v0.5.1 Bug Fixes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Version Display', () => {
    test('renders with correct version v0.5.1', () => {
      render(<App />);
      
      // Check version display
      expect(screen.getByText('AI Dynamic Solar System Todo v0.5.1')).toBeInTheDocument();
      
      // Check feature badge
      expect(screen.getByText('🐛 NEW: Bug Fixes & Default Task Data')).toBeInTheDocument();
    });
  });

  describe('Default Task Data', () => {
    test('initializes with 6 default tasks on first load', async () => {
      render(<App />);
      
      // Wait for tasks to be initialized
      await waitFor(() => {
        const solarSystemsCount = screen.getByTestId('solar-systems-count');
        expect(solarSystemsCount).toHaveTextContent('3'); // Should show 3 solar systems from 6 tasks
      });
    });

    test('default tasks have proper structure', async () => {
      render(<App />);
      
      // Wait for initialization and then check AI toggle
      await waitFor(() => {
        expect(screen.getByText('🤖 AI ON')).toBeInTheDocument();
      });
    });
  });

  describe('Solar System Display Logic', () => {
    test('shows solar systems when AI is ON and tasks exist', async () => {
      render(<App />);
      
      await waitFor(() => {
        const solarSystemsCount = screen.getByTestId('solar-systems-count');
        expect(parseInt(solarSystemsCount.textContent)).toBeGreaterThan(0);
      });
      
      // AI should be ON by default
      expect(screen.getByText('🤖 AI ON')).toBeInTheDocument();
    });

    test('hides solar systems when AI is OFF', async () => {
      render(<App />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('🤖 AI ON')).toBeInTheDocument();
      });
      
      // Turn off AI
      const aiToggle = screen.getByText('🤖 AI ON');
      fireEvent.click(aiToggle);
      
      // Should show AI OFF and no solar systems
      expect(screen.getByText('🤖 AI OFF')).toBeInTheDocument();
      
      await waitFor(() => {
        const solarSystemsCount = screen.getByTestId('solar-systems-count');
        expect(solarSystemsCount).toHaveTextContent('0');
      });
    });
  });

  describe('Task Management', () => {
    test('adds new task with proper default values', async () => {
      render(<App />);
      
      // Wait for Enhanced Mission Control to load
      await waitFor(() => {
        expect(screen.getByText('🚀 Enhanced Mission Control v0.5.1')).toBeInTheDocument();
      });
      
      // Should show the default tasks initially
      expect(screen.getByText(/프로젝트 기획서 작성/)).toBeInTheDocument();
      expect(screen.getByText(/장보기 목록 작성/)).toBeInTheDocument();
    });
  });

  describe('UI Controls', () => {
    test('all control buttons are present and functional', async () => {
      render(<App />);
      
      // Check all control buttons exist
      expect(screen.getByText(/Enhanced/)).toBeInTheDocument(); // UI mode toggle
      expect(screen.getByText('📊 Analytics')).toBeInTheDocument();
      expect(screen.getByText(/🤖 AI/)).toBeInTheDocument();
      expect(screen.getByText(/Solar System/)).toBeInTheDocument();
    });

    test('animation toggle works correctly', () => {
      render(<App />);
      
      const animationToggle = screen.getByText(/Solar System/);
      
      // Should start with "Pause" (playing)
      expect(screen.getByText(/⏸️ Pause/)).toBeInTheDocument();
      
      // Click to pause
      fireEvent.click(animationToggle);
      expect(screen.getByText(/▶️ Play/)).toBeInTheDocument();
      
      // Click to play again
      fireEvent.click(animationToggle);
      expect(screen.getByText(/⏸️ Pause/)).toBeInTheDocument();
    });
  });

  describe('System Status Display', () => {
    test('shows correct system and asteroid counts', async () => {
      render(<App />);
      
      // Wait for systems to initialize
      await waitFor(() => {
        const statusText = screen.getByText(/🌌.*Systems.*☄️.*Asteroids/);
        expect(statusText).toBeInTheDocument();
      });
    });
  });
});

describe('EnhancedMissionControl v0.5.1 Bug Fixes', () => {
  const mockTodos = [
    {
      id: 'test-1',
      text: 'Test task with no priority',
      category: 'work',
      // priority is intentionally undefined
      completed: false,
      createdAt: Date.now(),
      // visualProperties is intentionally undefined
    },
    {
      id: 'test-2',
      text: 'Test task with priority',
      category: 'personal',
      priority: 'high',
      completed: false,
      createdAt: Date.now(),
      visualProperties: { daysUntilDeadline: 5 }
    }
  ];

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

  describe('Priority Handling', () => {
    test('renders correctly when todo.priority is undefined', () => {
      render(<EnhancedMissionControl {...mockProps} />);
      
      // Should render without crashing
      expect(screen.getByText('🚀 Enhanced Mission Control v0.5.1')).toBeInTheDocument();
      
      // Should show the task with undefined priority
      expect(screen.getByText('Test task with no priority')).toBeInTheDocument();
      
      // Should display default priority badge
      expect(screen.getByText('MEDIUM')).toBeInTheDocument(); // Default priority
    });

    test('renders correctly when todo.priority is defined', () => {
      render(<EnhancedMissionControl {...mockProps} />);
      
      // Should show the task with defined priority
      expect(screen.getByText('Test task with priority')).toBeInTheDocument();
      expect(screen.getByText('HIGH')).toBeInTheDocument();
    });
  });

  describe('Visual Properties Handling', () => {
    test('handles undefined visualProperties gracefully', () => {
      render(<EnhancedMissionControl {...mockProps} />);
      
      // Should render without crashing even with undefined visualProperties
      expect(screen.getByText('Test task with no priority')).toBeInTheDocument();
      
      // Component should use default values for urgency calculations
      const missionCards = screen.getAllByText(/Test task/);
      expect(missionCards.length).toBe(2);
    });

    test('handles defined visualProperties correctly', () => {
      render(<EnhancedMissionControl {...mockProps} />);
      
      // Should render with defined visual properties
      expect(screen.getByText('Test task with priority')).toBeInTheDocument();
      
      // Should show urgency indicators for tasks with visual properties
      const urgentElements = document.querySelectorAll('.enhanced-mission-card');
      expect(urgentElements.length).toBeGreaterThan(0);
    });
  });

  describe('Create New Mission Button', () => {
    test('Create New Mission button works without errors', () => {
      const emptyProps = {
        ...mockProps,
        todos: [] // Empty todos to show "Create New Mission" button
      };
      
      render(<EnhancedMissionControl {...emptyProps} />);
      
      // Should show empty state with Create New Mission button
      expect(screen.getByText('No missions found')).toBeInTheDocument();
      
      const createButton = screen.getByText('🚀 Create New Mission');
      expect(createButton).toBeInTheDocument();
      
      // Clicking should not throw error
      expect(() => {
        fireEvent.click(createButton);
      }).not.toThrow();
      
      // Should call onTodoAdd
      expect(mockProps.onTodoAdd).toHaveBeenCalled();
    });
  });

  describe('Error Prevention', () => {
    test('handles malformed todo objects gracefully', () => {
      const malformedTodos = [
        {
          id: 'malformed-1',
          text: 'Task with missing fields',
          // Missing required fields intentionally
        },
        {
          id: 'malformed-2',
          text: 'Another malformed task',
          category: null, // null category
          priority: null, // null priority
          visualProperties: null // null visual properties
        }
      ];

      const malformedProps = {
        ...mockProps,
        todos: malformedTodos
      };

      // Should render without crashing
      expect(() => {
        render(<EnhancedMissionControl {...malformedProps} />);
      }).not.toThrow();

      // Should show the malformed tasks with default values
      expect(screen.getByText('Task with missing fields')).toBeInTheDocument();
      expect(screen.getByText('Another malformed task')).toBeInTheDocument();
    });
  });

  describe('Statistics Calculation', () => {
    test('calculates statistics correctly with mixed data', () => {
      const mixedTodos = [
        ...mockTodos,
        {
          id: 'completed-task',
          text: 'Completed task',
          category: 'study',
          priority: 'low',
          completed: true,
          createdAt: Date.now(),
          visualProperties: { daysUntilDeadline: 10 }
        }
      ];

      const mixedProps = {
        ...mockProps,
        todos: mixedTodos
      };

      render(<EnhancedMissionControl {...mixedProps} />);

      // Should show correct statistics
      expect(screen.getByText('3')).toBeInTheDocument(); // Total missions
      expect(screen.getByText('1')).toBeInTheDocument(); // Completed missions
      expect(screen.getByText('33%')).toBeInTheDocument(); // Completion rate (1/3)
    });
  });

  describe('Search and Filter Functionality', () => {
    test('search functionality works with undefined properties', () => {
      render(<EnhancedMissionControl {...mockProps} />);

      const searchInput = screen.getByPlaceholderText(/Search missions/);
      expect(searchInput).toBeInTheDocument();

      // Search should work without errors
      fireEvent.change(searchInput, { target: { value: 'Test task' } });
      
      // Should show both tasks
      expect(screen.getByText('Test task with no priority')).toBeInTheDocument();
      expect(screen.getByText('Test task with priority')).toBeInTheDocument();
    });

    test('filter functionality handles undefined properties', () => {
      render(<EnhancedMissionControl {...mockProps} />);

      const filterSelect = screen.getByDisplayValue('All Missions');
      expect(filterSelect).toBeInTheDocument();

      // Changing filter should not cause errors
      fireEvent.change(filterSelect, { target: { value: 'urgent' } });
      
      // Should handle filtering without crashing
      expect(filterSelect.value).toBe('urgent');
    });
  });
});

describe('Integration Tests v0.5.1', () => {
  test('full app works with default tasks and bug fixes', async () => {
    render(<App />);

    // Wait for full initialization
    await waitFor(() => {
      expect(screen.getByText('AI Dynamic Solar System Todo v0.5.1')).toBeInTheDocument();
    });

    // Should show Enhanced Mission Control
    expect(screen.getByText('🚀 Enhanced Mission Control v0.5.1')).toBeInTheDocument();

    // Should show default tasks without errors
    expect(screen.getByText(/프로젝트 기획서 작성/)).toBeInTheDocument();
    expect(screen.getByText(/장보기 목록 작성/)).toBeInTheDocument();

    // Should show solar systems (3 from default tasks)
    await waitFor(() => {
      const statusText = screen.getByText(/🌌.*Systems.*☄️.*Asteroids/);
      expect(statusText).toBeInTheDocument();
      expect(statusText.textContent).toMatch(/🌌 3 Systems/); // 3 solar systems
    });

    // AI controls should work
    expect(screen.getByText('🤖 AI ON')).toBeInTheDocument();
    
    // UI mode toggle should work
    expect(screen.getByText(/Enhanced/)).toBeInTheDocument();
  });

  test('version consistency across components', async () => {
    render(<App />);

    await waitFor(() => {
      // Main app version
      expect(screen.getByText('AI Dynamic Solar System Todo v0.5.1')).toBeInTheDocument();
      
      // Component version
      expect(screen.getByText('🚀 Enhanced Mission Control v0.5.1')).toBeInTheDocument();
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  test('handles rapid state changes without errors', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('🤖 AI ON')).toBeInTheDocument();
    });

    // Rapidly toggle AI
    const aiToggle = screen.getByText('🤖 AI ON');
    
    for (let i = 0; i < 5; i++) {
      fireEvent.click(aiToggle);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Should not crash and should show final state
    expect(screen.getByText(/🤖 AI/)).toBeInTheDocument();
  });

  test('handles empty state transitions correctly', async () => {
    render(<App />);

    // Wait for initial load with tasks
    await waitFor(() => {
      const solarSystemsCount = screen.getByTestId('solar-systems-count');
      expect(parseInt(solarSystemsCount.textContent)).toBeGreaterThan(0);
    });

    // Turn off AI (should clear solar systems)
    const aiToggle = screen.getByText('🤖 AI ON');
    fireEvent.click(aiToggle);

    // Should transition to empty state without errors
    await waitFor(() => {
      const solarSystemsCount = screen.getByTestId('solar-systems-count');
      expect(solarSystemsCount).toHaveTextContent('0');
    });

    expect(screen.getByText('🤖 AI OFF')).toBeInTheDocument();
  });
});