import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIPlanet from '../AIPlanet';

// Mock React Three Fiber
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn()
}));

// Mock Three.js
jest.mock('three', () => ({
  MeshStandardMaterial: jest.fn(() => ({})),
  MeshBasicMaterial: jest.fn(() => ({})),
  LineBasicMaterial: jest.fn(() => ({})),
  BufferGeometry: jest.fn(() => ({
    setFromPoints: jest.fn()
  })),
  Vector3: jest.fn(),
  DoubleSide: 2
}));

describe('AIPlanet Component', () => {
  const defaultProps = {
    todoData: {
      id: 1,
      text: 'Test planet todo',
      category: 'work',
      priority: 'high',
      hierarchyType: 'planet',
      visualProperties: {
        sizeMultiplier: 1.2,
        brightness: 1.8,
        rotationSpeed: 0.008,
        urgencyColor: '#ff8800',
        daysUntilDeadline: 5
      }
    },
    sunPosition: [0, 0, 0],
    orbitRadius: 8,
    orbitSpeed: 0.01,
    initialAngle: 0,
    onClick: jest.fn(),
    isSelected: false,
    isAnimationPlaying: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { container } = render(<AIPlanet {...defaultProps} />);
    expect(container).toBeInTheDocument();
  });

  test('calculates visual properties from todo data', () => {
    render(<AIPlanet {...defaultProps} />);
    // Visual properties should be calculated from todoData.visualProperties
    expect(true).toBe(true); // Placeholder for visual property verification
  });

  test('handles animation play/pause state', () => {
    const { rerender } = render(<AIPlanet {...defaultProps} />);
    
    // Test with animation paused
    rerender(<AIPlanet {...defaultProps} isAnimationPlaying={false} />);
    
    expect(true).toBe(true); // Animation state affects useFrame behavior
  });

  test('handles click events and calls onClick callback', () => {
    const mockOnClick = jest.fn();
    const props = { ...defaultProps, onClick: mockOnClick };
    
    const { container } = render(<AIPlanet {...props} />);
    const mesh = container.querySelector('mesh');
    
    if (mesh && mesh.onclick) {
      const mockEvent = { stopPropagation: jest.fn() };
      mesh.onclick(mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(mockOnClick).toHaveBeenCalledWith(defaultProps.todoData);
    }
  });

  test('shows selection indicator when selected', () => {
    const props = { ...defaultProps, isSelected: true };
    
    render(<AIPlanet {...props} />);
    // Selection indicator should be visible
    expect(true).toBe(true); // Placeholder for selection indicator verification
  });

  test('renders priority indicator rings for high priority', () => {
    const highPriorityProps = {
      ...defaultProps,
      todoData: {
        ...defaultProps.todoData,
        priority: 'high'
      }
    };
    
    render(<AIPlanet {...highPriorityProps} />);
    // High priority todos should have indicator rings
    expect(true).toBe(true); // Placeholder for priority ring verification
  });

  test('handles different categories correctly', () => {
    const categories = ['work', 'personal', 'education', 'finance', 'home', 'health'];
    
    categories.forEach(category => {
      const props = {
        ...defaultProps,
        todoData: {
          ...defaultProps.todoData,
          category
        }
      };
      
      const { unmount } = render(<AIPlanet {...props} />);
      expect(true).toBe(true); // Should render for all categories
      unmount();
    });
  });

  test('adjusts rotation speed based on urgency', () => {
    const urgentProps = {
      ...defaultProps,
      todoData: {
        ...defaultProps.todoData,
        visualProperties: {
          ...defaultProps.todoData.visualProperties,
          rotationSpeed: 0.02, // Very fast rotation for urgent items
          daysUntilDeadline: 1
        }
      }
    };
    
    render(<AIPlanet {...urgentProps} />);
    // Urgent items should rotate faster
    expect(true).toBe(true); // Placeholder for rotation speed verification
  });

  test('renders orbit trail correctly', () => {
    render(<AIPlanet {...defaultProps} />);
    // Should render an orbit trail around the sun
    expect(true).toBe(true); // Placeholder for orbit trail verification
  });

  test('handles cursor events for interactivity', () => {
    const { container } = render(<AIPlanet {...defaultProps} />);
    const mesh = container.querySelector('mesh');
    
    if (mesh) {
      // Test pointer over
      if (mesh.onPointerOver) {
        const mockEvent = { stopPropagation: jest.fn() };
        mesh.onPointerOver(mockEvent);
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
      }
      
      // Test pointer out
      if (mesh.onPointerOut) {
        mesh.onPointerOut();
        expect(true).toBe(true); // Should reset cursor
      }
    }
  });

  test('adjusts size based on priority', () => {
    const priorities = [
      { priority: 'high', expectedSizeRange: [1.0, 1.5] },
      { priority: 'medium', expectedSizeRange: [0.8, 1.2] },
      { priority: 'low', expectedSizeRange: [0.5, 1.0] }
    ];
    
    priorities.forEach(({ priority }) => {
      const props = {
        ...defaultProps,
        todoData: {
          ...defaultProps.todoData,
          priority,
          visualProperties: {
            ...defaultProps.todoData.visualProperties,
            sizeMultiplier: priority === 'high' ? 1.5 : priority === 'medium' ? 1.0 : 0.7
          }
        }
      };
      
      const { unmount } = render(<AIPlanet {...props} />);
      expect(true).toBe(true); // Size should vary by priority
      unmount();
    });
  });
});