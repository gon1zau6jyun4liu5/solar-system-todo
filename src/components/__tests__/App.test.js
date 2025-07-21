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
  Text: ({ children, ...props }) => <div data-testid="text" {...props}>{children}</div>
}));

jest.mock('./components/MultiSolarSystemScene', () => {
  return function MultiSolarSystemScene({ todoData, isAnimationPlaying, onCelestialBodyClick }) {
    return (
      <div 
        data-testid="multi-solar-system-scene" 
        data-animation-playing={isAnimationPlaying}
        data-todo-count={todoData?.length || 0}
        onClick={() => onCelestialBodyClick?.({ id: 'test-todo' })}
      >
        3D Multi Solar System Scene Mock
      </div>
    );
  };
});

jest.mock('./components/AIPanel', () => {
  return function AIPanel({ onAnimationToggle, isAnimationPlaying }) {
    return (
      <div data-testid="ai-panel">
        <button 
          onClick={onAnimationToggle} 
          data-testid="animation-toggle"
          data-animation-state={isAnimationPlaying ? 'playing' : 'paused'}
        >
          {isAnimationPlaying ? 'Pause' : 'Play'} Animation
        </button>
      </div>
    );
  };
});

jest.mock('./components/AITodoManager', () => {
  return function AITodoManager({ onTodoDataChange }) {
    React.useEffect(() => {
      onTodoDataChange?.([
        { id: 1, text: 'Test todo', hierarchyType: 'satellite' },
        { id: 2, text: 'Test planet', hierarchyType: 'planet' }
      ]);
    }, [onTodoDataChange]);
    
    return <div data-testid="ai-todo-manager">AI Todo Manager Mock</div>;
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

describe('App v0.3.1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders all main components for v0.3.1', () => {
    render(<App />);
    
    expect(screen.getByTestId('multi-solar-system-scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
  });

  test('displays correct version number v0.3.1', () => {
    render(<App />);
    
    expect(screen.getByText('Solar System Todo v0.3.1')).toBeInTheDocument();
  });

  test('handles animation toggle correctly', () => {
    render(<App />);
    
    // Initially should be playing
    const scene = screen.getByTestId('multi-solar-system-scene');
    const toggleButton = screen.getByTestId('animation-toggle');
    
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
    expect(toggleButton).toHaveAttribute('data-animation-state', 'playing');
    expect(screen.getByText('Pause Animation')).toBeInTheDocument();
    
    // Click toggle button
    fireEvent.click(toggleButton);
    
    // Should now be paused
    expect(scene).toHaveAttribute('data-animation-playing', 'false');
    expect(toggleButton).toHaveAttribute('data-animation-state', 'paused');
    expect(screen.getByText('Play Animation')).toBeInTheDocument();
  });

  test('passes todo data to MultiSolarSystemScene', () => {
    render(<App />);
    
    const scene = screen.getByTestId('multi-solar-system-scene');
    // Should receive todo data from AITodoManager
    expect(scene).toHaveAttribute('data-todo-count', '2');
  });

  test('handles celestial body clicks', () => {
    render(<App />);
    
    const scene = screen.getByTestId('multi-solar-system-scene');
    
    // Should not crash when clicking celestial bodies
    expect(() => {
      fireEvent.click(scene);
    }).not.toThrow();
  });

  test('starts with animation playing by default', () => {
    render(<App />);
    
    const scene = screen.getByTestId('multi-solar-system-scene');
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
  });

  test('maintains state consistency between components', () => {
    render(<App />);
    
    const scene = screen.getByTestId('multi-solar-system-scene');
    const toggleButton = screen.getByTestId('animation-toggle');
    
    // Initial state
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
    expect(toggleButton).toHaveAttribute('data-animation-state', 'playing');
    
    // After multiple toggles
    fireEvent.click(toggleButton);
    expect(scene).toHaveAttribute('data-animation-playing', 'false');
    expect(toggleButton).toHaveAttribute('data-animation-state', 'paused');
    
    fireEvent.click(toggleButton);
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
    expect(toggleButton).toHaveAttribute('data-animation-state', 'playing');
  });

  test('version info has correct styling class', () => {
    render(<App />);
    
    const versionElement = screen.getByText('Solar System Todo v0.3.1');
    expect(versionElement).toHaveClass('version-info');
  });

  test('App has correct main class', () => {
    const { container } = render(<App />);
    
    const appDiv = container.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
  });

  test('handles todo data changes from AITodoManager', () => {
    render(<App />);
    
    // AITodoManager should trigger todo data change
    const scene = screen.getByTestId('multi-solar-system-scene');
    expect(scene).toHaveAttribute('data-todo-count', '2');
  });

  test('renders without crashing with AI features', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });
});