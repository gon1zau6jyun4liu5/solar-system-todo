import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SolarSystem from '../SolarSystem';

// Mock Planet component
jest.mock('../Planet', () => {
  return function MockPlanet({ position, size, color, name }) {
    return (
      <div 
        data-testid={`planet-${name}`}
        data-position={position.join(',')}
        data-size={size}
        data-color={color}
      >
        {name}
      </div>
    );
  };
});

describe('SolarSystem', () => {
  const defaultProps = {
    position: [0, 0, 0],
    isAnimationPlaying: true,
    systemName: 'main'
  };

  test('renders main solar system with all planets', () => {
    const { getByTestId } = render(<SolarSystem {...defaultProps} />);
    
    // Check for sun
    expect(getByTestId('planet-sun')).toBeInTheDocument();
    
    // Check for inner planets
    expect(getByTestId('planet-mercury')).toBeInTheDocument();
    expect(getByTestId('planet-venus')).toBeInTheDocument();
    expect(getByTestId('planet-earth')).toBeInTheDocument();
    expect(getByTestId('planet-mars')).toBeInTheDocument();
    
    // Check for outer planets
    expect(getByTestId('planet-jupiter')).toBeInTheDocument();
    expect(getByTestId('planet-saturn')).toBeInTheDocument();
    expect(getByTestId('planet-uranus')).toBeInTheDocument();
    expect(getByTestId('planet-neptune')).toBeInTheDocument();
  });

  test('renders binary solar system correctly', () => {
    const binaryProps = {
      ...defaultProps,
      systemName: 'binary'
    };
    
    const { container } = render(<SolarSystem {...binaryProps} />);
    
    // Should have two suns and two planets
    const planets = container.querySelectorAll('[data-testid^="planet-"]');
    expect(planets).toHaveLength(4);
  });

  test('renders distant solar system correctly', () => {
    const distantProps = {
      ...defaultProps,
      systemName: 'distant'
    };
    
    const { container } = render(<SolarSystem {...distantProps} />);
    
    // Should have one sun and three planets
    const planets = container.querySelectorAll('[data-testid^="planet-"]');
    expect(planets).toHaveLength(4);
  });

  test('handles unknown system name gracefully', () => {
    const unknownProps = {
      ...defaultProps,
      systemName: 'unknown'
    };
    
    const { container } = render(<SolarSystem {...unknownProps} />);
    
    // Should render no planets for unknown system
    const planets = container.querySelectorAll('[data-testid^="planet-"]');
    expect(planets).toHaveLength(0);
  });

  test('passes correct props to Planet components', () => {
    const { getByTestId } = render(<SolarSystem {...defaultProps} />);
    
    const earth = getByTestId('planet-earth');
    expect(earth).toHaveAttribute('data-position', '6,0,0');
    expect(earth).toHaveAttribute('data-size', '0.7');
    expect(earth).toHaveAttribute('data-color', '#6b93d6');
  });

  test('sun has correct properties in main system', () => {
    const { getByTestId } = render(<SolarSystem {...defaultProps} />);
    
    const sun = getByTestId('planet-sun');
    expect(sun).toHaveAttribute('data-position', '0,0,0');
    expect(sun).toHaveAttribute('data-size', '2');
    expect(sun).toHaveAttribute('data-color', '#ffff00');
  });

  test('renders with animation playing', () => {
    expect(() => {
      render(<SolarSystem {...defaultProps} />);
    }).not.toThrow();
  });

  test('renders with animation paused', () => {
    const pausedProps = {
      ...defaultProps,
      isAnimationPlaying: false
    };
    
    expect(() => {
      render(<SolarSystem {...pausedProps} />);
    }).not.toThrow();
  });

  test('renders at different positions', () => {
    const customPositionProps = {
      ...defaultProps,
      position: [100, 50, -25]
    };
    
    expect(() => {
      render(<SolarSystem {...customPositionProps} />);
    }).not.toThrow();
  });

  test('binary system has correct planet configuration', () => {
    const binaryProps = {
      ...defaultProps,
      systemName: 'binary'
    };
    
    const { container } = render(<SolarSystem {...binaryProps} />);
    
    // Check that we have the expected number of planets
    const suns = container.querySelectorAll('[data-testid="planet-sun"]');
    const planets = container.querySelectorAll('[data-testid^="planet-planet"]');
    
    expect(suns).toHaveLength(2);
    expect(planets).toHaveLength(2);
  });

  test('distant system has unique planet colors', () => {
    const distantProps = {
      ...defaultProps,
      systemName: 'distant'
    };
    
    const { getByTestId } = render(<SolarSystem {...distantProps} />);
    
    const planet1 = getByTestId('planet-planet1');
    expect(planet1).toHaveAttribute('data-color', '#dda0dd');
    
    const planet2 = getByTestId('planet-planet2');
    expect(planet2).toHaveAttribute('data-color', '#98fb98');
    
    const planet3 = getByTestId('planet-planet3');
    expect(planet3).toHaveAttribute('data-color', '#f0e68c');
  });
});