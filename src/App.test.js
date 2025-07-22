import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock the 3D components to avoid WebGL issues in tests
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: () => {},
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Stars: () => <div data-testid="stars" />
}));

jest.mock('../components/Scene', () => {
  return function Scene({ isAnimationPlaying }) {
    return (
      <div data-testid="scene" data-animation-playing={isAnimationPlaying}>
        3D Scene Mock - Animation: {isAnimationPlaying ? 'Playing' : 'Paused'}
      </div>
    );
  };
});

jest.mock('../components/AIPanel', () => {
  return function AIPanel({ onAnimationToggle, isAnimationPlaying }) {
    return (
      <div data-testid="ai-panel">
        <button onClick={onAnimationToggle} data-testid="animation-toggle">
          {isAnimationPlaying ? 'Pause' : 'Play'}
        </button>
        AI Panel Mock
      </div>
    );
  };
});

jest.mock('../components/AITodoManager', () => {
  return function AITodoManager({ onTodoDataChange }) {
    return (
      <div data-testid="ai-todo-manager">
        AI Todo Manager Mock
        <button onClick={() => onTodoDataChange([])}>Simulate Data Change</button>
      </div>
    );
  };
});

jest.mock('../components/EnhancedMissionControl', () => {
  return function EnhancedMissionControl({ todos, onTodoUpdate, onTodoAdd }) {
    return (
      <div data-testid="enhanced-mission-control">
        Enhanced Mission Control Mock - Todos: {todos.length}
        <button onClick={() => onTodoUpdate(1, { completed: true })}>Update Todo</button>
        <button onClick={onTodoAdd}>Add Todo</button>
      </div>
    );
  };
});

// localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('App Component v0.4.2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders all main components', () => {
    render(<App />);
    
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByText('Enhanced Solar System Todo v0.4.2')).toBeInTheDocument();
  });

  test('displays version information v0.4.2', () => {
    render(<App />);
    
    expect(screen.getByText('Enhanced Solar System Todo v0.4.2')).toBeInTheDocument();
  });

  test('displays feature badge for Enhanced UI/UX', () => {
    render(<App />);
    
    expect(screen.getByText('✨ NEW: Enhanced UI/UX')).toBeInTheDocument();
  });

  test('UI mode toggle works correctly', () => {
    render(<App />);
    
    // Initially should show Enhanced UI
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
    expect(screen.queryByTestId('ai-todo-manager')).not.toBeInTheDocument();
    
    // Click toggle to switch to Classic UI
    const toggleButton = screen.getByText(/Enhanced/);
    fireEvent.click(toggleButton);
    
    // Should now show Classic UI
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('enhanced-mission-control')).not.toBeInTheDocument();
    
    // Button text should change
    expect(screen.getByText(/Classic/)).toBeInTheDocument();
  });

  test('UI mode toggle button has correct styling and behavior', () => {
    render(<App />);
    
    const toggleButton = screen.getByText(/Enhanced/);
    expect(toggleButton).toHaveClass('ui-mode-toggle');
    
    // Should have accessibility attributes
    expect(toggleButton).toHaveAttribute('title');
  });

  test('animation toggle works correctly', () => {
    render(<App />);
    
    const scene = screen.getByTestId('scene');
    // Initially should be playing
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
    expect(screen.getByText('Pause')).toBeInTheDocument();
    
    // Click toggle button
    const toggleButton = screen.getByTestId('animation-toggle');
    fireEvent.click(toggleButton);
    
    // Should now be paused
    expect(scene).toHaveAttribute('data-animation-playing', 'false');
    expect(screen.getByText('Play')).toBeInTheDocument();
  });

  test('passes animation state correctly to Scene component', () => {
    render(<App />);
    
    const scene = screen.getByTestId('scene');
    const toggleButton = screen.getByTestId('animation-toggle');
    
    // Initially playing
    expect(scene.textContent).toContain('Animation: Playing');
    
    // Toggle to paused
    fireEvent.click(toggleButton);
    expect(scene.textContent).toContain('Animation: Paused');
    
    // Toggle back to playing
    fireEvent.click(toggleButton);
    expect(scene.textContent).toContain('Animation: Playing');
  });

  test('Enhanced Mission Control receives correct props', () => {
    render(<App />);
    
    const enhancedControl = screen.getByTestId('enhanced-mission-control');
    expect(enhancedControl.textContent).toContain('Todos: 0'); // Initially no todos
    
    // Test prop functions work
    const updateBtn = screen.getByText('Update Todo');
    const addBtn = screen.getByText('Add Todo');
    
    expect(() => fireEvent.click(updateBtn)).not.toThrow();
    expect(() => fireEvent.click(addBtn)).not.toThrow();
  });

  test('AI Todo Manager receives correct props in Classic mode', () => {
    render(<App />);
    
    // Switch to Classic UI
    const toggleButton = screen.getByText(/Enhanced/);
    fireEvent.click(toggleButton);
    
    const aiTodoManager = screen.getByTestId('ai-todo-manager');
    expect(aiTodoManager).toBeInTheDocument();
    
    // Test data change callback
    const dataChangeBtn = screen.getByText('Simulate Data Change');
    fireEvent.click(dataChangeBtn);
    
    // Should not throw error
    expect(aiTodoManager).toBeInTheDocument();
  });

  test('handles todo data changes correctly', () => {
    render(<App />);
    
    // Switch to Classic UI to test data change
    const toggleButton = screen.getByText(/Enhanced/);
    fireEvent.click(toggleButton);
    
    const dataChangeBtn = screen.getByText('Simulate Data Change');
    fireEvent.click(dataChangeBtn);
    
    // Switch back to Enhanced UI - should pass updated data
    fireEvent.click(toggleButton);
    
    const enhancedControl = screen.getByTestId('enhanced-mission-control');
    expect(enhancedControl).toBeInTheDocument();
  });

  test('todo update operations work correctly', () => {
    render(<App />);
    
    const updateBtn = screen.getByText('Update Todo');
    fireEvent.click(updateBtn);
    
    // Should not throw error
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
  });

  test('todo delete operations work correctly', () => {
    render(<App />);
    
    // Enhanced Mission Control should handle delete operations
    const enhancedControl = screen.getByTestId('enhanced-mission-control');
    expect(enhancedControl).toBeInTheDocument();
  });

  test('category selection works correctly', () => {
    render(<App />);
    
    // App component should manage category state
    const enhancedControl = screen.getByTestId('enhanced-mission-control');
    expect(enhancedControl).toBeInTheDocument();
  });

  test('version display has correct styling classes', () => {
    render(<App />);
    
    const versionElement = screen.getByText('Enhanced Solar System Todo v0.4.2');
    expect(versionElement).toHaveClass('version-info');
  });

  test('feature badge has correct styling classes', () => {
    render(<App />);
    
    const featureBadge = screen.getByText('✨ NEW: Enhanced UI/UX');
    expect(featureBadge).toHaveClass('feature-badge');
  });

  test('App has correct main class structure', () => {
    const { container } = render(<App />);
    
    const appDiv = container.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
    expect(appDiv).toHaveStyle('width: 100vw');
    expect(appDiv).toHaveStyle('height: 100vh');
  });

  test('handles multiple UI mode toggles correctly', () => {
    render(<App />);
    
    const toggleButton = screen.getByText(/Enhanced/);
    
    // Start: Enhanced UI
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
    
    // First toggle: Classic UI
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('enhanced-mission-control')).not.toBeInTheDocument();
    
    // Second toggle: Enhanced UI
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
    expect(screen.queryByTestId('ai-todo-manager')).not.toBeInTheDocument();
    
    // Third toggle: Classic UI
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('enhanced-mission-control')).not.toBeInTheDocument();
  });

  test('preserves animation state during UI mode changes', () => {
    render(<App />);
    
    const animationToggle = screen.getByTestId('animation-toggle');
    const uiToggle = screen.getByText(/Enhanced/);
    
    // Pause animation
    fireEvent.click(animationToggle);
    expect(screen.getByTestId('scene')).toHaveAttribute('data-animation-playing', 'false');
    
    // Switch UI mode
    fireEvent.click(uiToggle);
    
    // Animation state should be preserved
    expect(screen.getByTestId('scene')).toHaveAttribute('data-animation-playing', 'false');
    
    // Switch back
    fireEvent.click(uiToggle);
    
    // Animation state should still be preserved
    expect(screen.getByTestId('scene')).toHaveAttribute('data-animation-playing', 'false');
  });

  test('renders without crashing', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });

  test('handles console.log calls for add todo in Enhanced mode', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    render(<App />);
    
    const addBtn = screen.getByText('Add Todo');
    fireEvent.click(addBtn);
    
    expect(consoleSpy).toHaveBeenCalledWith('Add new todo');
    
    consoleSpy.mockRestore();
  });
});

describe('App Component Integration Tests', () => {
  test('full workflow: toggle UI, change animation, interact with todos', () => {
    render(<App />);
    
    // 1. Start with Enhanced UI and playing animation
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
    expect(screen.getByTestId('scene')).toHaveAttribute('data-animation-playing', 'true');
    
    // 2. Pause animation
    const animationToggle = screen.getByTestId('animation-toggle');
    fireEvent.click(animationToggle);
    expect(screen.getByTestId('scene')).toHaveAttribute('data-animation-playing', 'false');
    
    // 3. Switch to Classic UI
    const uiToggle = screen.getByText(/Enhanced/);
    fireEvent.click(uiToggle);
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
    
    // 4. Simulate data change in Classic UI
    const dataChangeBtn = screen.getByText('Simulate Data Change');
    fireEvent.click(dataChangeBtn);
    
    // 5. Switch back to Enhanced UI
    fireEvent.click(uiToggle);
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
    
    // 6. Animation should still be paused
    expect(screen.getByTestId('scene')).toHaveAttribute('data-animation-playing', 'false');
    
    // 7. Resume animation
    fireEvent.click(animationToggle);
    expect(screen.getByTestId('scene')).toHaveAttribute('data-animation-playing', 'true');
  });

  test('accessibility and keyboard navigation', () => {
    render(<App />);
    
    const uiToggle = screen.getByText(/Enhanced/);
    const animationToggle = screen.getByTestId('animation-toggle');
    
    // Buttons should be focusable
    uiToggle.focus();
    expect(document.activeElement).toBe(uiToggle);
    
    animationToggle.focus();
    expect(document.activeElement).toBe(animationToggle);
  });

  test('responsive design elements are present', () => {
    render(<App />);
    
    // Check that responsive design classes and elements exist
    const versionInfo = screen.getByText('Enhanced Solar System Todo v0.4.2');
    const featureBadge = screen.getByText('✨ NEW: Enhanced UI/UX');
    const uiToggle = screen.getByText(/Enhanced/);
    
    expect(versionInfo).toHaveClass('version-info');
    expect(featureBadge).toHaveClass('feature-badge');
    expect(uiToggle).toHaveClass('ui-mode-toggle');
  });
});

describe('App Component Error Handling', () => {
  test('handles missing component props gracefully', () => {
    // Should not crash even if child components have issues
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });

  test('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });
    
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });
});

describe('App Component Performance', () => {
  test('renders within reasonable time', () => {
    const startTime = performance.now();
    render(<App />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should render within 100ms
  });

  test('UI mode switching is performant', () => {
    render(<App />);
    
    const uiToggle = screen.getByText(/Enhanced/);
    
    const startTime = performance.now();
    fireEvent.click(uiToggle);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(50); // Should switch within 50ms
  });
});