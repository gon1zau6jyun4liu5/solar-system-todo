import { render, screen } from '@testing-library/react';
import App from './App';

// Mock Three.js components to avoid WebGL context issues in tests
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: () => {},
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
}));

jest.mock('./components/Scene', () => {
  return function Scene() {
    return <div data-testid="scene">3D Scene</div>;
  };
});

describe('App Component', () => {
  test('renders the main App component', () => {
    render(<App />);
    const appElement = screen.getByTestId('scene');
    expect(appElement).toBeInTheDocument();
  });

  test('renders 3D scene component', () => {
    render(<App />);
    const sceneElement = screen.getByTestId('scene');
    expect(sceneElement).toHaveTextContent('3D Scene');
  });
});
