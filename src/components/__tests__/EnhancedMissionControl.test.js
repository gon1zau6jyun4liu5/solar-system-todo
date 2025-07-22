import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedMissionControl from '../EnhancedMissionControl';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock components
jest.mock('../MultiSolarSystemScene', () => {
  return function MockMultiSolarSystemScene({ todoData, onCelestialBodyClick, selectedTodoId }) {
    return (
      <div data-testid="multi-solar-system-scene">
        <span data-testid="todo-count">{todoData.length}</span>
        <span data-testid="selected-todo">{selectedTodoId || 'none'}</span>
        <button 
          onClick={() => onCelestialBodyClick?.({ id: 1, text: 'Test Todo' })}
          data-testid="mock-celestial-body"
        >
          Mock Celestial Body
        </button>
      </div>
    );
  };
});

jest.mock('../AITodoManager', () => {
  return function MockAITodoManager({ onTodoDataChange }) {
    React.useEffect(() => {
      const mockTodos = [
        { 
          id: 1, 
          text: 'Test Todo 1', 
          category: 'work', 
          hierarchyType: 'satellite',
          completed: false,
          visualProperties: { daysUntilDeadline: 5 }
        },
        { 
          id: 2, 
          text: 'Test Todo 2', 
          category: 'personal', 
          hierarchyType: 'planet',
          completed: true,
          visualProperties: { daysUntilDeadline: 10 }
        }
      ];
      onTodoDataChange?.(mockTodos);
    }, [onTodoDataChange]);

    return (
      <div data-testid="ai-todo-manager">
        AI Todo Manager Mock
      </div>
    );
  };
});

describe('EnhancedMissionControl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders without crashing', () => {
    render(<EnhancedMissionControl />);
    expect(screen.getByTestId('multi-solar-system-scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
  });

  test('displays correct version in mission control panel', () => {
    render(<EnhancedMissionControl />);
    expect(screen.getByText('🚀 Enhanced Mission Control v0.4.2')).toBeInTheDocument();
  });

  test('shows performance metrics panel', () => {
    render(<EnhancedMissionControl />);
    expect(screen.getByText('📊 Performance Metrics')).toBeInTheDocument();
    expect(screen.getByText(/FPS:/)).toBeInTheDocument();
    expect(screen.getByText(/Memory:/)).toBeInTheDocument();
    expect(screen.getByText(/Objects:/)).toBeInTheDocument();
  });

  test('updates todo data when AITodoManager changes', async () => {
    render(<EnhancedMissionControl />);
    
    await waitFor(() => {
      expect(screen.getByTestId('todo-count')).toHaveTextContent('2');
    });
  });

  test('handles celestial body click correctly', async () => {
    render(<EnhancedMissionControl />);
    
    const celestialBody = screen.getByTestId('mock-celestial-body');
    fireEvent.click(celestialBody);
    
    await waitFor(() => {
      expect(screen.getByTestId('selected-todo')).toHaveTextContent('1');
    });
  });

  test('shows correct statistics in control panel', async () => {
    render(<EnhancedMissionControl />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Missions: 2')).toBeInTheDocument();
      expect(screen.getByText('Active: 1')).toBeInTheDocument();
      expect(screen.getByText('Completed: 1')).toBeInTheDocument();
    });
  });

  test('displays system health indicators', () => {
    render(<EnhancedMissionControl />);
    
    expect(screen.getByText('🟢 All Systems Operational')).toBeInTheDocument();
    expect(screen.getByText('🔋 Power: 100%')).toBeInTheDocument();
    expect(screen.getByText('📡 Communications: Online')).toBeInTheDocument();
    expect(screen.getByText('🛰️ Navigation: Active')).toBeInTheDocument();
  });

  test('shows universe overview with correct data', async () => {
    render(<EnhancedMissionControl />);
    
    await waitFor(() => {
      expect(screen.getByText('🌌 Universe Overview')).toBeInTheDocument();
      expect(screen.getByText('Solar Systems: 2')).toBeInTheDocument();
      expect(screen.getByText('Celestial Bodies: 2')).toBeInTheDocument();
    });
  });

  test('mission priorities section displays correctly', async () => {
    render(<EnhancedMissionControl />);
    
    await waitFor(() => {
      expect(screen.getByText('⚡ Mission Priorities')).toBeInTheDocument();
      expect(screen.getByText('Urgent: 0')).toBeInTheDocument();
      expect(screen.getByText('High: 0')).toBeInTheDocument();
      expect(screen.getByText('Medium: 0')).toBeInTheDocument();
      expect(screen.getByText('Low: 0')).toBeInTheDocument();
    });
  });

  test('handles mission control panel toggle', () => {
    render(<EnhancedMissionControl />);
    
    const toggleButton = screen.getByLabelText('Toggle Mission Control Panel');
    expect(toggleButton).toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    // Panel should still be visible but position might change
    expect(screen.getByText('🚀 Enhanced Mission Control v0.4.2')).toBeInTheDocument();
  });

  test('performance monitoring works correctly', () => {
    render(<EnhancedMissionControl />);
    
    // Performance metrics should be displayed
    expect(screen.getByText(/FPS: \d+/)).toBeInTheDocument();
    expect(screen.getByText(/Memory: \d+MB/)).toBeInTheDocument();
    expect(screen.getByText(/Objects: \d+/)).toBeInTheDocument();
  });

  test('calculates hierarchy distribution correctly', async () => {
    render(<EnhancedMissionControl />);
    
    await waitFor(() => {
      // Should show hierarchy breakdown
      const hierarchySection = screen.getByText('🏗️ Hierarchy Distribution');
      expect(hierarchySection).toBeInTheDocument();
    });
  });

  test('handles empty todo data gracefully', () => {
    // Mock empty todo data
    jest.mock('../AITodoManager', () => {
      return function MockAITodoManager({ onTodoDataChange }) {
        React.useEffect(() => {
          onTodoDataChange?.([]);
        }, [onTodoDataChange]);

        return <div data-testid="ai-todo-manager">AI Todo Manager Mock</div>;
      };
    });

    render(<EnhancedMissionControl />);
    
    expect(screen.getByText('Total Missions: 0')).toBeInTheDocument();
    expect(screen.getByText('Solar Systems: 0')).toBeInTheDocument();
  });

  test('responsive design works on mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(<EnhancedMissionControl />);
    
    expect(screen.getByTestId('multi-solar-system-scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
  });
});

describe('EnhancedMissionControl Performance', () => {
  test('renders within acceptable time', () => {
    const startTime = performance.now();
    
    render(<EnhancedMissionControl />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(200); // Should render within 200ms
  });

  test('handles large todo datasets efficiently', async () => {
    // Mock large dataset
    jest.mock('../AITodoManager', () => {
      return function MockAITodoManager({ onTodoDataChange }) {
        React.useEffect(() => {
          const largeTodoSet = Array.from({ length: 1000 }, (_, i) => ({
            id: i + 1,
            text: `Todo ${i + 1}`,
            category: ['work', 'personal', 'education'][i % 3],
            hierarchyType: ['sun', 'planet', 'satellite'][i % 3],
            completed: i % 5 === 0,
            visualProperties: { daysUntilDeadline: Math.floor(Math.random() * 30) }
          }));
          onTodoDataChange?.(largeTodoSet);
        }, [onTodoDataChange]);

        return <div data-testid="ai-todo-manager">AI Todo Manager Mock</div>;
      };
    });

    const startTime = performance.now();
    
    render(<EnhancedMissionControl />);
    
    await waitFor(() => {
      expect(screen.getByTestId('todo-count')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(1000); // Should handle 1000 todos within 1 second
  });
});

describe('EnhancedMissionControl Error Handling', () => {
  test('handles corrupted localStorage gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    
    expect(() => {
      render(<EnhancedMissionControl />);
    }).not.toThrow();
    
    expect(screen.getByTestId('multi-solar-system-scene')).toBeInTheDocument();
  });

  test('handles missing component props gracefully', () => {
    expect(() => {
      render(<EnhancedMissionControl />);
    }).not.toThrow();
  });

  test('handles API errors gracefully', () => {
    // Mock console.error to check if errors are properly handled
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<EnhancedMissionControl />);
    
    // Should not have any unhandled errors
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});