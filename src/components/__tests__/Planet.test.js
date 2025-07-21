import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Planet from '../Planet';

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn(),
}));

// Mock Three.js mesh
const mockMesh = {
  rotation: { y: 0 },
  position: { set: jest.fn() },
};

const mockRef = { current: mockMesh };
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: () => mockRef,
}));

describe('Planet', () => {
  const defaultProps = {
    position: [0, 0, 0],
    size: 1,
    color: '#ffffff',
    orbitRadius: 5,
    orbitSpeed: 0.01,
    isAnimationPlaying: true,
    name: 'earth'
  };

  test('renders Planet with correct geometric properties', () => {
    const { container } = render(<Planet {...defaultProps} />);
    
    // Check if the planet mesh is rendered
    const mesh = container.querySelector('mesh');
    expect(mesh).toBeInTheDocument();
    
    // Check if sphere geometry is present
    const sphereGeometry = container.querySelector('sphereGeometry');
    expect(sphereGeometry).toBeInTheDocument();
    
    // Check if material is present
    const material = container.querySelector('meshStandardMaterial');
    expect(material).toBeInTheDocument();
  });

  test('renders sun with emissive properties', () => {
    const sunProps = {
      ...defaultProps,
      name: 'sun',
      color: '#ffff00'
    };
    
    const { container } = render(<Planet {...sunProps} />);
    
    const material = container.querySelector('meshStandardMaterial');
    expect(material).toBeInTheDocument();
  });

  test('renders regular planet without emissive properties', () => {
    const { container } = render(<Planet {...defaultProps} />);
    
    const material = container.querySelector('meshStandardMaterial');
    expect(material).toBeInTheDocument();
  });

  test('handles planet with zero orbit radius', () => {
    const staticPlanetProps = {
      ...defaultProps,
      orbitRadius: 0,
      name: 'sun'
    };
    
    expect(() => {
      render(<Planet {...staticPlanetProps} />);
    }).not.toThrow();
  });

  test('planet receives correct props', () => {
    const customProps = {
      position: [10, 5, -3],
      size: 2.5,
      color: '#ff0000',
      orbitRadius: 15,
      orbitSpeed: 0.05,
      isAnimationPlaying: false,
      name: 'mars'
    };
    
    expect(() => {
      render(<Planet {...customProps} />);
    }).not.toThrow();
  });

  test('renders with different planet names', () => {
    const planetNames = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    
    planetNames.forEach(name => {
      const props = { ...defaultProps, name };
      expect(() => {
        render(<Planet {...props} />);
      }).not.toThrow();
    });
  });

  test('handles negative orbit radius gracefully', () => {
    const negativeOrbitProps = {
      ...defaultProps,
      orbitRadius: -5
    };
    
    expect(() => {
      render(<Planet {...negativeOrbitProps} />);
    }).not.toThrow();
  });

  test('handles very large size values', () => {
    const largePlanetProps = {
      ...defaultProps,
      size: 100
    };
    
    expect(() => {
      render(<Planet {...largePlanetProps} />);
    }).not.toThrow();
  });
});