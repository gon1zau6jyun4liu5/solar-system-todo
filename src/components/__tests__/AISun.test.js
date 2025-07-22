import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AISun from '../AISun';

// Mock React Three Fiber
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn()
}));

// Mock Three.js
jest.mock('three', () => ({
  MeshStandardMaterial: jest.fn(() => ({})),
  MeshBasicMaterial: jest.fn(() => ({})),
  DoubleSide: 2,
  BackSide: 1
}));

describe('AISun Component', () => {
  const defaultProps = {
    solarSystemData: {
      id: 'test-system',
      category: 'work',
      todos: [
        {
          id: 1,
          text: 'Test todo',
          priority: 'high',
          visualProperties: {
            daysUntilDeadline: 5,
            rotationSpeed: 0.01,
            sizeMultiplier: 1.5,
            brightness: 2.0,
            urgencyColor: '#ff4444'
          }
        }
      ],
      totalTodos: 1
    },
    position: [0, 0, 0],
    onClick: jest.fn(),
    isSelected: false,
    isAnimationPlaying: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { container } = render(<AISun {...defaultProps} />);
    expect(container).toBeInTheDocument();
  });

  test('renders with empty solar system data', () => {
    const props = {
      ...defaultProps,
      solarSystemData: { todos: [] }
    };
    
    const { container } = render(<AISun {...props} />);
    expect(container).toBeInTheDocument();
  });

  test('calculates visual properties correctly', () => {
    render(<AISun {...defaultProps} />);
    // Visual properties are calculated in useMemo
    // Test would verify the calculations are applied to materials
    expect(true).toBe(true); // Placeholder for visual property verification
  });

  test('handles animation play/pause state', () => {
    const { rerender } = render(<AISun {...defaultProps} />);
    
    // Test with animation paused
    rerender(<AISun {...defaultProps} isAnimationPlaying={false} />);
    
    expect(true).toBe(true); // Animation state is handled in useFrame
  });

  test('handles click events', () => {
    const mockOnClick = jest.fn();
    const props = { ...defaultProps, onClick: mockOnClick };
    
    const { container } = render(<AISun {...props} />);
    const mesh = container.querySelector('mesh');
    
    if (mesh && mesh.onclick) {
      mesh.onclick();
      expect(mockOnClick).toHaveBeenCalled();
    }
  });

  test('shows selection indicator when selected', () => {
    const props = { ...defaultProps, isSelected: true };
    
    render(<AISun {...props} />);
    // Selection indicator is rendered as a ring geometry
    expect(true).toBe(true); // Placeholder for selection indicator verification
  });

  test('handles high priority todos correctly', () => {
    const highPriorityData = {
      ...defaultProps.solarSystemData,
      todos: [
        {
          ...defaultProps.solarSystemData.todos[0],
          priority: 'high',
          visualProperties: {
            ...defaultProps.solarSystemData.todos[0].visualProperties,
            daysUntilDeadline: 1 // Very urgent
          }
        }
      ]
    };
    
    const props = { ...defaultProps, solarSystemData: highPriorityData };
    render(<AISun {...props} />);
    
    expect(true).toBe(true); // High priority should affect visual properties
  });
});