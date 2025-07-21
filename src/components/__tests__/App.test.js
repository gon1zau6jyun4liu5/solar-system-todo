import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock the 3D components to avoid WebGL issues in tests
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: () => {},
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Stars: () => <div data-testid="stars" />
}));

jest.mock('../Scene', () => {
  return function Scene({ isAnimationPlaying }) {
    return (
      <div data-testid="scene" data-animation-playing={isAnimationPlaying}>
        3D Scene Mock
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

jest.mock('../TodoManager', () => {
  return function TodoManager() {
    return <div data-testid="todo-manager">Todo Manager Mock</div>;
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

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders all main components', () => {
    render(<App />);
    
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('todo-manager')).toBeInTheDocument();
  });

  test('displays version information', () => {
    render(<App />);
    
    expect(screen.getByText('Solar System Todo v0.3.0')).toBeInTheDocument();
  });

  test('handles animation toggle correctly', () => {
    render(<App />);
    
    // Initially should be playing
    const scene = screen.getByTestId('scene');
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
    expect(screen.getByText('Pause')).toBeInTheDocument();
    
    // Click toggle button
    const toggleButton = screen.getByTestId('animation-toggle');
    fireEvent.click(toggleButton);
    
    // Should now be paused
    expect(scene).toHaveAttribute('data-animation-playing', 'false');
    expect(screen.getByText('Play')).toBeInTheDocument();
  });

  test('passes animation state to Scene component', () => {
    render(<App />);
    
    const scene = screen.getByTestId('scene');
    const toggleButton = screen.getByTestId('animation-toggle');
    
    // Initially playing
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
    
    // Toggle to paused
    fireEvent.click(toggleButton);
    expect(scene).toHaveAttribute('data-animation-playing', 'false');
    
    // Toggle back to playing
    fireEvent.click(toggleButton);
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
  });

  test('starts with animation playing by default', () => {
    render(<App />);
    
    const scene = screen.getByTestId('scene');
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
  });

  test('version info has correct styling class', () => {
    render(<App />);
    
    const versionElement = screen.getByText('Solar System Todo v0.3.0');
    expect(versionElement).toHaveClass('version-info');
  });

  test('App has correct main class', () => {
    const { container } = render(<App />);
    
    const appDiv = container.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
  });

  test('handles multiple animation toggles correctly', () => {
    render(<App />);
    
    const scene = screen.getByTestId('scene');
    const toggleButton = screen.getByTestId('animation-toggle');
    
    // Start: playing
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
    
    // First toggle: pause
    fireEvent.click(toggleButton);
    expect(scene).toHaveAttribute('data-animation-playing', 'false');
    
    // Second toggle: play
    fireEvent.click(toggleButton);
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
    
    // Third toggle: pause
    fireEvent.click(toggleButton);
    expect(scene).toHaveAttribute('data-animation-playing', 'false');
  });

  test('renders without crashing', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });
});