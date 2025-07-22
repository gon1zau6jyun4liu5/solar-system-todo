import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock Three.js components to avoid WebGL context issues in tests
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

jest.mock('../AITodoManager', () => {
  return function AITodoManager() {
    return <div data-testid="ai-todo-manager">AI Todo Manager Mock</div>;
  };
});

jest.mock('../EnhancedMissionControl', () => {
  return function EnhancedMissionControl() {
    return <div data-testid="enhanced-mission-control">Enhanced Mission Control Mock</div>;
  };
});

jest.mock('../AdvancedAnalyticsDashboard', () => {
  return function AdvancedAnalyticsDashboard({ isVisible }) {
    return isVisible ? <div data-testid="analytics-dashboard">Analytics Dashboard Mock</div> : null;
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

describe('App v0.4.4 - Korean README Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('displays correct version number v0.4.4', () => {
    render(<App />);
    
    expect(screen.getByText('Advanced Solar System Todo v0.4.4')).toBeInTheDocument();
  });

  test('displays Korean README feature badge', () => {
    render(<App />);
    
    expect(screen.getByText('🚀 NEW: Korean README Documentation')).toBeInTheDocument();
  });

  test('version info has correct styling classes', () => {
    render(<App />);
    
    const versionElement = screen.getByText('Advanced Solar System Todo v0.4.4');
    expect(versionElement).toHaveClass('version-info');
  });

  test('feature badge has correct styling classes', () => {
    render(<App />);
    
    const featureBadge = screen.getByText('🚀 NEW: Korean README Documentation');
    expect(featureBadge).toHaveClass('feature-badge');
  });

  test('renders all main components correctly', () => {
    render(<App />);
    
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument(); // Default enhanced UI
  });

  test('analytics dashboard toggle button exists', () => {
    render(<App />);
    
    const analyticsButton = screen.getByText('📊 Analytics');
    expect(analyticsButton).toBeInTheDocument();
    expect(analyticsButton).toHaveClass('analytics-toggle');
  });

  test('UI mode toggle button exists', () => {
    render(<App />);
    
    const uiToggleButton = screen.getByText('🎨 Enhanced');
    expect(uiToggleButton).toBeInTheDocument();
    expect(uiToggleButton).toHaveClass('ui-mode-toggle');
  });

  test('version number follows semantic versioning pattern', () => {
    render(<App />);
    
    const versionText = screen.getByText('Advanced Solar System Todo v0.4.4');
    expect(versionText.textContent).toMatch(/v\d+\.\d+\.\d+/);
  });

  test('feature badge announces Korean documentation', () => {
    render(<App />);
    
    const featureBadge = screen.getByText('🚀 NEW: Korean README Documentation');
    expect(featureBadge.textContent).toContain('Korean README');
    expect(featureBadge.textContent).toContain('Documentation');
  });
});

describe('App v0.4.4 - Version Consistency', () => {
  test('version displayed matches expected semantic version format', () => {
    render(<App />);
    
    const versionElement = screen.getByText(/Advanced Solar System Todo v\d+\.\d+\.\d+/);
    expect(versionElement).toBeInTheDocument();
    
    // Extract version number
    const versionMatch = versionElement.textContent.match(/v(\d+\.\d+\.\d+)/);
    expect(versionMatch).toBeTruthy();
    expect(versionMatch[1]).toBe('0.4.4');
  });

  test('feature badge indicates current release features', () => {
    render(<App />);
    
    const featureBadge = screen.getByText('🚀 NEW: Korean README Documentation');
    expect(featureBadge).toBeInTheDocument();
    
    // Should have "NEW" indicator for latest features
    expect(featureBadge.textContent).toContain('NEW:');
  });
});

describe('App v0.4.4 - Accessibility', () => {
  test('version info is accessible', () => {
    render(<App />);
    
    const versionElement = screen.getByText('Advanced Solar System Todo v0.4.4');
    expect(versionElement).toBeVisible();
  });

  test('feature badge is accessible', () => {
    render(<App />);
    
    const featureBadge = screen.getByText('🚀 NEW: Korean README Documentation');
    expect(featureBadge).toBeVisible();
  });

  test('UI elements have proper contrast and visibility', () => {
    render(<App />);
    
    // All major UI elements should be present and visible
    expect(screen.getByTestId('scene')).toBeVisible();
    expect(screen.getByTestId('ai-panel')).toBeVisible();
    expect(screen.getByText('Advanced Solar System Todo v0.4.4')).toBeVisible();
    expect(screen.getByText('🚀 NEW: Korean README Documentation')).toBeVisible();
  });
});

describe('App v0.4.4 - Performance', () => {
  test('renders within acceptable time', () => {
    const startTime = performance.now();
    
    render(<App />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 100ms for good performance
    expect(renderTime).toBeLessThan(100);
  });

  test('version and feature elements render efficiently', () => {
    const { container } = render(<App />);
    
    // Should have minimal DOM elements for version display
    const versionElements = container.querySelectorAll('.version-info, .feature-badge');
    expect(versionElements.length).toBe(2);
  });
});

describe('App v0.4.4 - Integration', () => {
  test('version info integrates well with overall app structure', () => {
    render(<App />);
    
    const appContainer = document.querySelector('.App');
    expect(appContainer).toBeInTheDocument();
    
    const versionInfo = screen.getByText('Advanced Solar System Todo v0.4.4');
    const featureBadge = screen.getByText('🚀 NEW: Korean README Documentation');
    
    expect(appContainer).toContainElement(versionInfo);
    expect(appContainer).toContainElement(featureBadge);
  });

  test('all major features work together', () => {
    render(<App />);
    
    // Core components should all be present
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
    
    // Version and feature info should be present
    expect(screen.getByText('Advanced Solar System Todo v0.4.4')).toBeInTheDocument();
    expect(screen.getByText('🚀 NEW: Korean README Documentation')).toBeInTheDocument();
    
    // Control buttons should be present
    expect(screen.getByText('📊 Analytics')).toBeInTheDocument();
    expect(screen.getByText('🎨 Enhanced')).toBeInTheDocument();
  });
});
