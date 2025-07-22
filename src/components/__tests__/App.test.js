import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock the 3D components to avoid WebGL issues in tests
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: jest.fn(),
  useThree: jest.fn(() => ({
    camera: { position: { clone: jest.fn(), set: jest.fn() } },
    controls: { target: { clone: jest.fn() }, update: jest.fn() }
  }))
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Stars: () => <div data-testid="stars" />
}));

jest.mock('../MultiSolarSystemScene', () => {
  return function MultiSolarSystemScene({ 
    todoData, 
    selectedTodoId, 
    focusedCelestialBody, 
    isAnimationPlaying, 
    onCelestialBodyClick 
  }) {
    return (
      <div 
        data-testid="multi-solar-system-scene" 
        data-animation-playing={isAnimationPlaying}
        data-selected-todo-id={selectedTodoId}
        data-focused-body={focusedCelestialBody ? JSON.stringify(focusedCelestialBody) : null}
        onClick={() => onCelestialBodyClick && onCelestialBodyClick({ id: 1, hierarchyType: 'planet' })}
      >
        Multi Solar System Scene Mock - {todoData.length} todos
      </div>
    );
  };
});

jest.mock('../AIPanel', () => {
  return function AIPanel({ onAnimationToggle, isAnimationPlaying }) {
    return (
      <div data-testid="ai-panel">
        <button onClick={onAnimationToggle} data-testid="animation-toggle">
          {isAnimationPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    );
  };
});

jest.mock('../AITodoManager', () => {
  return function AITodoManager({ onTodoDataChange, selectedTodoId, onTaskClick }) {
    const mockTodos = [
      { id: 1, text: 'Test todo 1', hierarchyType: 'planet' },
      { id: 2, text: 'Test todo 2', hierarchyType: 'satellite' }
    ];
    
    React.useEffect(() => {
      onTodoDataChange(mockTodos);
    }, [onTodoDataChange]);

    return (
      <div data-testid="ai-todo-manager" data-selected-todo-id={selectedTodoId}>
        <button 
          onClick={() => onTaskClick && onTaskClick(mockTodos[0])}
          data-testid="task-click-button"
        >
          Click Task 1
        </button>
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

describe('App v0.4.0', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders all main components for v0.4.0', () => {
    render(<App />);
    
    expect(screen.getByTestId('multi-solar-system-scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
  });

  test('displays correct version information v0.4.0', () => {
    render(<App />);
    
    expect(screen.getByText('Solar System Todo v0.4.0')).toBeInTheDocument();
  });

  test('handles animation toggle correctly', () => {
    render(<App />);
    
    // Initially should be playing
    const scene = screen.getByTestId('multi-solar-system-scene');
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
    expect(screen.getByText('Pause')).toBeInTheDocument();
    
    // Click toggle button
    const toggleButton = screen.getByTestId('animation-toggle');
    fireEvent.click(toggleButton);
    
    // Should now be paused
    expect(scene).toHaveAttribute('data-animation-playing', 'false');
    expect(screen.getByText('Play')).toBeInTheDocument();
  });

  test('handles celestial body click from 3D scene', () => {
    render(<App />);
    
    const scene = screen.getByTestId('multi-solar-system-scene');
    
    // Initially no selection
    expect(scene).toHaveAttribute('data-selected-todo-id', '');
    
    // Click on celestial body in 3D scene
    fireEvent.click(scene);
    
    // Should update selected todo and focused body
    expect(scene).toHaveAttribute('data-selected-todo-id', '1');
    const focusedBodyData = JSON.parse(scene.getAttribute('data-focused-body'));
    expect(focusedBodyData.id).toBe(1);
    expect(focusedBodyData.type).toBe('planet');
  });

  test('handles task click from todo manager for camera focusing', () => {
    render(<App />);
    
    const scene = screen.getByTestId('multi-solar-system-scene');
    const taskButton = screen.getByTestId('task-click-button');
    
    // Initially no selection
    expect(scene).toHaveAttribute('data-selected-todo-id', '');
    
    // Click task in todo manager
    fireEvent.click(taskButton);
    
    // Should update focused celestial body for camera tracking
    expect(scene).toHaveAttribute('data-selected-todo-id', '1');
    const focusedBodyData = JSON.parse(scene.getAttribute('data-focused-body'));
    expect(focusedBodyData.id).toBe(1);
    expect(focusedBodyData.type).toBe('planet');
  });

  test('passes todo data to MultiSolarSystemScene', () => {
    render(<App />);
    
    const scene = screen.getByTestId('multi-solar-system-scene');
    
    // Should receive mock todo data
    expect(scene).toHaveTextContent('2 todos');
  });

  test('manages state correctly for multiple interactions', () => {
    render(<App />);
    
    const scene = screen.getByTestId('multi-solar-system-scene');
    const taskButton = screen.getByTestId('task-click-button');
    const animationButton = screen.getByTestId('animation-toggle');
    
    // Start with animation playing, no selection
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
    expect(scene).toHaveAttribute('data-selected-todo-id', '');
    
    // Click task to focus
    fireEvent.click(taskButton);
    expect(scene).toHaveAttribute('data-selected-todo-id', '1');
    
    // Toggle animation while task is selected
    fireEvent.click(animationButton);
    expect(scene).toHaveAttribute('data-animation-playing', 'false');
    expect(scene).toHaveAttribute('data-selected-todo-id', '1'); // Should maintain selection
    
    // Click celestial body in 3D scene
    fireEvent.click(scene);
    expect(scene).toHaveAttribute('data-selected-todo-id', '1'); // Updated selection
    expect(scene).toHaveAttribute('data-animation-playing', 'false'); // Maintain animation state
  });

  test('initializes with correct default state', () => {
    render(<App />);
    
    const scene = screen.getByTestId('multi-solar-system-scene');
    
    // Check default state
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
    expect(scene).toHaveAttribute('data-selected-todo-id', '');
    expect(scene).toHaveAttribute('data-focused-body', 'null');
  });

  test('App has correct main class and structure', () => {
    const { container } = render(<App />);
    
    const appDiv = container.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
    
    // Check if all major components are present
    expect(screen.getByTestId('multi-solar-system-scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
    expect(screen.getByText('Solar System Todo v0.4.0')).toBeInTheDocument();
  });

  test('handles edge cases gracefully', () => {
    render(<App />);
    
    const scene = screen.getByTestId('multi-solar-system-scene');
    
    // Test rapid clicks
    fireEvent.click(scene);
    fireEvent.click(scene);
    fireEvent.click(scene);
    
    // Should still function normally
    expect(scene).toHaveAttribute('data-selected-todo-id', '1');
  });

  test('renders without crashing with v0.4.0 features', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });

  test('maintains animation state across interactions', () => {
    render(<App />);
    
    const scene = screen.getByTestId('multi-solar-system-scene');
    const toggleButton = screen.getByTestId('animation-toggle');
    const taskButton = screen.getByTestId('task-click-button');
    
    // Pause animation
    fireEvent.click(toggleButton);
    expect(scene).toHaveAttribute('data-animation-playing', 'false');
    
    // Click task - animation state should be preserved
    fireEvent.click(taskButton);
    expect(scene).toHaveAttribute('data-animation-playing', 'false');
    expect(scene).toHaveAttribute('data-selected-todo-id', '1');
    
    // Resume animation
    fireEvent.click(toggleButton);
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
    expect(scene).toHaveAttribute('data-selected-todo-id', '1'); // Selection preserved
  });
});

describe('App v0.4.0 Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('integrates all components correctly for v0.4.0', () => {
    const { container } = render(<App />);
    
    // Check component hierarchy
    const app = container.querySelector('.App');
    expect(app).toBeInTheDocument();
    
    // Check all main components are mounted
    expect(screen.getByTestId('multi-solar-system-scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
    
    // Check version display
    expect(screen.getByText('Solar System Todo v0.4.0')).toBeInTheDocument();
  });

  test('data flow works correctly between components', () => {
    render(<App />);
    
    const scene = screen.getByTestId('multi-solar-system-scene');
    const todoManager = screen.getByTestId('ai-todo-manager');
    
    // TodoManager should provide data to Scene
    expect(scene).toHaveTextContent('2 todos');
    
    // Selection state should be synchronized
    expect(scene).toHaveAttribute('data-selected-todo-id', '');
    expect(todoManager).toHaveAttribute('data-selected-todo-id', '');
  });
});