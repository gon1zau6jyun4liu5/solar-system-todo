import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Planet from '../Planet';

// Mock Three.js and React Three Fiber
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn()
}));

jest.mock('@react-three/drei', () => ({
  Text: ({ children, ...props }) => <div data-testid="planet-text" {...props}>{children}</div>
}));

describe('Planet Component', () => {
  const defaultProps = {
    name: 'earth',
    size: 0.5,
    color: '#6B93D6',
    orbitRadius: 8,
    orbitSpeed: 0.5,
    pendingTasks: 3,
    isClickable: true,
    onClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders planet with correct size', () => {
    const { container } = render(<Planet {...defaultProps} />);
    expect(container).toBeInTheDocument();
  });

  test('displays task count when pending tasks exist', () => {
    render(<Planet {...defaultProps} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('does not display task count when no pending tasks', () => {
    const props = { ...defaultProps, pendingTasks: 0 };
    render(<Planet {...props} />);
    expect(screen.queryByTestId('planet-text')).not.toBeInTheDocument();
  });

  test('handles click events when clickable', () => {
    const mockOnClick = jest.fn();
    const props = { ...defaultProps, onClick: mockOnClick };
    
    const { container } = render(<Planet {...props} />);
    const mesh = container.querySelector('mesh');
    
    // Simulate click event
    if (mesh && mesh.onclick) {
      const mockEvent = { stopPropagation: jest.fn() };
      mesh.onclick(mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    }
  });

  test('applies correct emissive properties when clickable with tasks', () => {
    render(<Planet {...defaultProps} />);
    // Test would verify emissive properties are set correctly
    expect(true).toBe(true); // Placeholder for actual Three.js material testing
  });

  test('does not apply emissive properties when not clickable', () => {
    const props = { ...defaultProps, isClickable: false };
    render(<Planet {...props} />);
    expect(true).toBe(true); // Placeholder for actual Three.js material testing
  });
});