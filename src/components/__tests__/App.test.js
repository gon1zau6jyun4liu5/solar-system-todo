import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock the 3D components to avoid WebGL issues in tests
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />
}));

jest.mock('../Scene', () => {
  return function Scene() {
    return <div data-testid="scene">3D Scene Mock</div>;
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

  test('renders both Scene and TodoManager components', () => {
    render(<App />);
    
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByText('🚀 Solar System Mission Control')).toBeInTheDocument();
  });

  test('renders todo functionality', () => {
    render(<App />);
    
    expect(screen.getByText('+ New Mission')).toBeInTheDocument();
    expect(screen.getByText('All Missions')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('renders with initial todo data', () => {
    render(<App />);
    
    // Check if some of the initial todos are rendered
    expect(screen.getByText('태양의 표면 온도 조사하기')).toBeInTheDocument();
    expect(screen.getByText('지구의 자전축 기울기 23.5도 확인')).toBeInTheDocument();
  });
});