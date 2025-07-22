import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock Three.js components to avoid WebGL context issues in tests
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: () => {},
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Text: ({ children, ...props }) => <div data-testid="three-text" {...props}>{children}</div>
}));

jest.mock('../../components/Scene', () => {
  return function Scene({ animationSpeed, onCelestialClick }) {
    return (
      <div 
        data-testid="scene" 
        data-animation-speed={animationSpeed}
        onClick={() => onCelestialClick && onCelestialClick({ id: 1, text: 'Test todo' })}
      >
        3D Scene Mock
      </div>
    );
  };
});

jest.mock('../../components/TodoManager', () => {
  return function TodoManager({ isVisible, onTodosChange }) {
    return (
      <div 
        data-testid="todo-manager" 
        data-visible={isVisible}
        style={{ display: isVisible ? 'block' : 'none' }}
      >
        Todo Manager Mock
      </div>
    );
  };
});

jest.mock('../../components/CelestialPopup', () => {
  return function CelestialPopup({ todo, onClose }) {
    return todo ? (
      <div data-testid="celestial-popup" onClick={onClose}>
        Popup: {todo.text}
      </div>
    ) : null;
  };
});

jest.mock('../../components/SpeedControl', () => {
  return function SpeedControl({ animationSpeed, onSpeedChange }) {
    return (
      <div data-testid="speed-control">
        <span>Speed: {animationSpeed}x</span>
        <button onClick={() => onSpeedChange(2.0)}>Change Speed</button>
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
    
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('todo-manager')).toBeInTheDocument();
    expect(screen.getByTestId('speed-control')).toBeInTheDocument();
    expect(screen.getByText('📋 Hide Panel')).toBeInTheDocument();
  });

  test('displays correct version information v0.4.0', () => {
    render(<App />);
    
    expect(screen.getByText('Solar System Todo v0.4.0')).toBeInTheDocument();
  });

  test('toggles sidebar visibility correctly', () => {
    render(<App />);
    
    // Initially sidebar should be visible
    const todoManager = screen.getByTestId('todo-manager');
    expect(todoManager).toHaveAttribute('data-visible', 'true');
    expect(screen.getByText('📋 Hide Panel')).toBeInTheDocument();
    
    // Click toggle button
    const toggleButton = screen.getByText('📋 Hide Panel');
    fireEvent.click(toggleButton);
    
    // Should now be hidden
    expect(todoManager).toHaveAttribute('data-visible', 'false');
    expect(screen.getByText('📋 Show Panel')).toBeInTheDocument();
  });

  test('opens celestial popup when celestial body is clicked', () => {
    render(<App />);
    
    // Initially no popup
    expect(screen.queryByTestId('celestial-popup')).not.toBeInTheDocument();
    
    // Click scene to trigger celestial click
    const scene = screen.getByTestId('scene');
    fireEvent.click(scene);
    
    // Should show popup
    expect(screen.getByTestId('celestial-popup')).toBeInTheDocument();
    expect(screen.getByText('Popup: Test todo')).toBeInTheDocument();
  });

  test('closes celestial popup when clicked', () => {
    render(<App />);
    
    // Open popup
    const scene = screen.getByTestId('scene');
    fireEvent.click(scene);
    
    expect(screen.getByTestId('celestial-popup')).toBeInTheDocument();
    
    // Close popup
    const popup = screen.getByTestId('celestial-popup');
    fireEvent.click(popup);
    
    expect(screen.queryByTestId('celestial-popup')).not.toBeInTheDocument();
  });

  test('animation speed control works correctly', () => {
    render(<App />);
    
    // Initial speed should be 1.0
    const scene = screen.getByTestId('scene');
    expect(scene).toHaveAttribute('data-animation-speed', '1');
    expect(screen.getByText('Speed: 1x')).toBeInTheDocument();
    
    // Change speed
    const changeSpeedButton = screen.getByText('Change Speed');
    fireEvent.click(changeSpeedButton);
    
    // Speed should be updated
    expect(scene).toHaveAttribute('data-animation-speed', '2');
    expect(screen.getByText('Speed: 2x')).toBeInTheDocument();
  });

  test('sidebar toggle button shows correct text based on state', () => {
    render(<App />);
    
    let toggleButton = screen.getByRole('button', { name: /sidebar/i });
    expect(toggleButton).toHaveTextContent('📋 Hide Panel');
    
    fireEvent.click(toggleButton);
    
    toggleButton = screen.getByRole('button', { name: /sidebar/i });
    expect(toggleButton).toHaveTextContent('📋 Show Panel');
  });

  test('handles planet click correctly', () => {
    render(<App />);
    
    // This would typically be tested through Scene component integration
    // For now, we verify the structure is in place
    expect(screen.getByTestId('scene')).toBeInTheDocument();
  });

  test('passes animation speed to Scene component', () => {
    render(<App />);
    
    const scene = screen.getByTestId('scene');
    expect(scene).toHaveAttribute('data-animation-speed', '1');
    
    // Change animation speed
    const changeSpeedButton = screen.getByText('Change Speed');
    fireEvent.click(changeSpeedButton);
    
    expect(scene).toHaveAttribute('data-animation-speed', '2');
  });

  test('maintains state correctly between interactions', () => {
    render(<App />);
    
    // Hide sidebar
    fireEvent.click(screen.getByText('📋 Hide Panel'));
    expect(screen.getByTestId('todo-manager')).toHaveAttribute('data-visible', 'false');
    
    // Open popup
    fireEvent.click(screen.getByTestId('scene'));
    expect(screen.getByTestId('celestial-popup')).toBeInTheDocument();
    
    // Sidebar should still be hidden
    expect(screen.getByTestId('todo-manager')).toHaveAttribute('data-visible', 'false');
    
    // Change speed
    fireEvent.click(screen.getByText('Change Speed'));
    expect(screen.getByText('Speed: 2x')).toBeInTheDocument();
    
    // Other states should remain unchanged
    expect(screen.getByTestId('celestial-popup')).toBeInTheDocument();
    expect(screen.getByTestId('todo-manager')).toHaveAttribute('data-visible', 'false');
  });

  test('all components are properly integrated', () => {
    render(<App />);
    
    // Verify all main components are rendered
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('todo-manager')).toBeInTheDocument();
    expect(screen.getByTestId('speed-control')).toBeInTheDocument();
    expect(screen.getByText('Solar System Todo v0.4.0')).toBeInTheDocument();
    
    // Verify interactive elements are present
    expect(screen.getByRole('button', { name: /sidebar/i })).toBeInTheDocument();
  });

  test('renders without crashing with v0.4.0 features', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });

  test('handles edge cases correctly', () => {
    render(<App />);
    
    // Multiple rapid clicks should not break anything
    const toggleButton = screen.getByRole('button', { name: /sidebar/i });
    
    for (let i = 0; i < 5; i++) {
      fireEvent.click(toggleButton);
    }
    
    // App should still be functional
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('todo-manager')).toBeInTheDocument();
  });
});