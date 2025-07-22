import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock the 3D components and AI components to avoid WebGL issues in tests
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: () => {},
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Stars: () => <div data-testid="stars" />,
  Text: ({ children, ...props }) => <div data-testid="text" {...props}>{children}</div>
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

jest.mock('../AITodoManager', () => {
  return function AITodoManager() {
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

describe('App v0.4.1 Version Synchronization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders all main AI-powered components', () => {
    render(<App />);
    
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
  });

  test('displays correct version v0.4.1 in UI', () => {
    render(<App />);
    
    expect(screen.getByText('AI-Powered Solar System Todo v0.4.1')).toBeInTheDocument();
  });

  test('version info has correct styling class', () => {
    render(<App />);
    
    const versionElement = screen.getByText('AI-Powered Solar System Todo v0.4.1');
    expect(versionElement).toHaveClass('version-info');
  });

  test('handles animation toggle correctly with AI components', () => {
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

  test('integrates AI components successfully', () => {
    render(<App />);
    
    // Check AI components are rendered
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
    
    // Check 3D scene is rendered
    expect(screen.getByTestId('scene')).toBeInTheDocument();
  });

  test('version consistency across components', () => {
    render(<App />);
    
    // Main app should display version
    const versionElement = screen.getByText('AI-Powered Solar System Todo v0.4.1');
    expect(versionElement).toBeInTheDocument();
    
    // Check version is displayed prominently
    expect(versionElement).toHaveClass('version-info');
  });

  test('App has correct main class and structure', () => {
    const { container } = render(<App />);
    
    const appDiv = container.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
    
    // Should contain all major components
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
  });

  test('renders without crashing with AI components', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });

  test('version format matches expected pattern', () => {
    render(<App />);
    
    const versionText = screen.getByText('AI-Powered Solar System Todo v0.4.1');
    expect(versionText.textContent).toMatch(/v\d+\.\d+\.\d+/);
    expect(versionText.textContent).toContain('v0.4.1');
  });

  test('AI components integration stability', () => {
    const { rerender } = render(<App />);
    
    // Initial render should be stable
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
    
    // Re-render should maintain stability
    rerender(<App />);
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
  });
});

describe('App v0.4.1 Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders within acceptable time with AI components', () => {
    const startTime = performance.now();
    
    render(<App />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 100ms even with AI components
    expect(renderTime).toBeLessThan(100);
  });

  test('version display renders quickly', () => {
    const startTime = performance.now();
    
    render(<App />);
    const versionElement = screen.getByText('AI-Powered Solar System Todo v0.4.1');
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(versionElement).toBeInTheDocument();
    expect(renderTime).toBeLessThan(50);
  });
});

describe('App v0.4.1 Accessibility Tests', () => {
  test('version information is accessible', () => {
    render(<App />);
    
    const versionElement = screen.getByText('AI-Powered Solar System Todo v0.4.1');
    expect(versionElement).toBeInTheDocument();
    
    // Version should be visible and readable
    expect(versionElement).toBeVisible();
  });

  test('AI components are properly integrated for accessibility', () => {
    render(<App />);
    
    // All major components should be accessible
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
  });
});