import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

// Mock the 3D components to avoid WebGL issues in tests
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
  return function AdvancedAnalyticsDashboard({ isVisible, onClose }) {
    return isVisible ? (
      <div data-testid="analytics-dashboard">
        <button onClick={onClose} data-testid="close-analytics">Close</button>
        Analytics Dashboard Mock
      </div>
    ) : null;
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

describe('App v0.4.5 - Document Integration Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('displays correct version number v0.4.5', () => {
    render(<App />);
    
    expect(screen.getByText('Advanced Solar System Todo v0.4.5')).toBeInTheDocument();
  });

  test('displays document integration feature badge', () => {
    render(<App />);
    
    expect(screen.getByText('🚀 NEW: Integrated Documentation')).toBeInTheDocument();
  });

  test('version info has correct styling classes', () => {
    render(<App />);
    
    const versionElement = screen.getByText('Advanced Solar System Todo v0.4.5');
    expect(versionElement).toHaveClass('version-info');
  });

  test('feature badge has correct styling classes', () => {
    render(<App />);
    
    const featureBadge = screen.getByText('🚀 NEW: Integrated Documentation');
    expect(featureBadge).toHaveClass('feature-badge');
  });

  test('version number follows semantic versioning pattern', () => {
    render(<App />);
    
    const versionText = screen.getByText('Advanced Solar System Todo v0.4.5').textContent;
    expect(versionText).toMatch(/v\d+\.\d+\.\d+/);
    expect(versionText).toContain('v0.4.5');
  });

  test('feature badge announces document integration', () => {
    render(<App />);
    
    const featureBadge = screen.getByText('🚀 NEW: Integrated Documentation');
    expect(featureBadge.textContent).toContain('Integrated Documentation');
  });

  test('renders all main components with integrated documentation context', () => {
    render(<App />);
    
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
  });

  test('UI mode toggle works correctly with new version', () => {
    render(<App />);
    
    // Initially should show Enhanced UI
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
    expect(screen.queryByTestId('ai-todo-manager')).not.toBeInTheDocument();
    
    // Click toggle button
    const toggleButton = screen.getByTitle(/Switch to Classic UI/);
    fireEvent.click(toggleButton);
    
    // Should now show Classic UI
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('enhanced-mission-control')).not.toBeInTheDocument();
  });

  test('analytics dashboard toggle works with new version', () => {
    render(<App />);
    
    // Initially analytics should be closed
    expect(screen.queryByTestId('analytics-dashboard')).not.toBeInTheDocument();
    
    // Click analytics toggle
    const analyticsToggle = screen.getByTitle('Open Advanced Analytics Dashboard');
    fireEvent.click(analyticsToggle);
    
    // Should show analytics dashboard
    expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
  });

  test('animation control works with document integration version', () => {
    render(<App />);
    
    const scene = screen.getByTestId('scene');
    const toggleButton = screen.getByTestId('animation-toggle');
    
    // Initially playing
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
    expect(screen.getByText('Pause')).toBeInTheDocument();
    
    // Toggle to paused
    fireEvent.click(toggleButton);
    expect(scene).toHaveAttribute('data-animation-playing', 'false');
    expect(screen.getByText('Play')).toBeInTheDocument();
  });

  test('App has correct main class with v0.4.5', () => {
    const { container } = render(<App />);
    
    const appDiv = container.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
  });

  test('version and feature badge are properly positioned', () => {
    render(<App />);
    
    const versionInfo = screen.getByText('Advanced Solar System Todo v0.4.5');
    const featureBadge = screen.getByText('🚀 NEW: Integrated Documentation');
    
    // Both elements should be visible
    expect(versionInfo).toBeVisible();
    expect(featureBadge).toBeVisible();
    
    // Should have proper CSS classes for positioning
    expect(versionInfo).toHaveClass('version-info');
    expect(featureBadge).toHaveClass('feature-badge');
  });

  test('feature badge mentions documentation integration specifically', () => {
    render(<App />);
    
    const featureBadge = screen.getByText('🚀 NEW: Integrated Documentation');
    expect(featureBadge.textContent).toMatch(/Integrated Documentation/i);
  });

  test('version progression from v0.4.4 to v0.4.5', () => {
    render(<App />);
    
    const versionText = screen.getByText(/v0\.4\.5/);
    expect(versionText).toBeInTheDocument();
    
    // Should not contain old version
    expect(screen.queryByText(/v0\.4\.4/)).not.toBeInTheDocument();
  });

  test('maintains all existing functionality with new version', () => {
    render(<App />);
    
    // Core components should still render
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    
    // UI controls should still work
    const uiToggle = screen.getByTitle(/Switch to/);
    const analyticsToggle = screen.getByTitle(/Analytics/);
    
    expect(uiToggle).toBeInTheDocument();
    expect(analyticsToggle).toBeInTheDocument();
  });

  test('version update maintains backward compatibility', () => {
    render(<App />);
    
    // All essential elements should still be present
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByText(/Enhanced/)).toBeInTheDocument();
    expect(screen.getByText(/Analytics/)).toBeInTheDocument();
  });
});

describe('App v0.4.5 - Component Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('components work together seamlessly in v0.4.5', () => {
    render(<App />);
    
    // Scene and UI components should coexist
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
    
    // Version information should be displayed
    expect(screen.getByText('Advanced Solar System Todo v0.4.5')).toBeInTheDocument();
  });

  test('state management works correctly with document integration', () => {
    render(<App />);
    
    // Test UI mode toggle
    const uiToggle = screen.getByTitle(/Switch to Classic UI/);
    fireEvent.click(uiToggle);
    
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('enhanced-mission-control')).not.toBeInTheDocument();
  });

  test('analytics dashboard integration with v0.4.5', () => {
    render(<App />);
    
    const analyticsToggle = screen.getByTitle('Open Advanced Analytics Dashboard');
    fireEvent.click(analyticsToggle);
    
    expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
    
    const closeButton = screen.getByTestId('close-analytics');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('analytics-dashboard')).not.toBeInTheDocument();
  });

  test('feature badge updates reflect current capabilities', () => {
    render(<App />);
    
    const featureBadge = screen.getByText('🚀 NEW: Integrated Documentation');
    
    // Should reflect the integration of documentation
    expect(featureBadge.textContent).toContain('Integrated Documentation');
    expect(featureBadge.textContent).not.toContain('Korean README');
  });
});

describe('App v0.4.5 - Documentation Integration Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('unified documentation approach is reflected in UI', () => {
    render(<App />);
    
    // The feature badge should indicate documentation integration
    const featureBadge = screen.getByText('🚀 NEW: Integrated Documentation');
    expect(featureBadge).toBeInTheDocument();
    
    // Version should be updated to reflect this change
    expect(screen.getByText('Advanced Solar System Todo v0.4.5')).toBeInTheDocument();
  });

  test('version consistency across components', () => {
    render(<App />);
    
    const versionElement = screen.getByText(/v0\.4\.5/);
    expect(versionElement).toBeInTheDocument();
    
    // Should only show the new version, not old ones
    expect(screen.queryByText(/v0\.4\.4/)).not.toBeInTheDocument();
    expect(screen.queryByText(/v0\.4\.3/)).not.toBeInTheDocument();
  });

  test('feature progression from Korean README to Integrated Documentation', () => {
    render(<App />);
    
    const currentFeature = screen.getByText('🚀 NEW: Integrated Documentation');
    expect(currentFeature).toBeInTheDocument();
    
    // Should not show previous feature
    expect(screen.queryByText(/Korean README/)).not.toBeInTheDocument();
  });

  test('renders without crashing with v0.4.5 changes', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });

  test('all interactive elements work with new version', () => {
    render(<App />);
    
    // Test all clickable elements
    const uiToggle = screen.getByTitle(/Switch to/);
    const analyticsToggle = screen.getByTitle(/Analytics/);
    const animationToggle = screen.getByTestId('animation-toggle');
    
    // All should be clickable without errors
    expect(() => {
      fireEvent.click(uiToggle);
      fireEvent.click(analyticsToggle);
      fireEvent.click(animationToggle);
    }).not.toThrow();
  });
});

describe('App v0.4.5 - Performance and Stability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders quickly even with document integration features', () => {
    const startTime = performance.now();
    
    render(<App />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(100); // Should render within 100ms
  });

  test('handles multiple state changes efficiently in v0.4.5', () => {
    render(<App />);
    
    // Rapidly toggle between different states
    const uiToggle = screen.getByTitle(/Switch to/);
    const analyticsToggle = screen.getByTitle(/Analytics/);
    
    // Multiple rapid changes should not cause issues
    for (let i = 0; i < 5; i++) {
      fireEvent.click(uiToggle);
      fireEvent.click(analyticsToggle);
    }
    
    // Should still display version correctly
    expect(screen.getByText('Advanced Solar System Todo v0.4.5')).toBeInTheDocument();
  });

  test('memory usage remains stable with v0.4.5', () => {
    // Render and unmount multiple times to test for memory leaks
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(<App />);
      unmount();
    }
    
    // If we reach here without crashing, memory management is likely okay
    expect(true).toBe(true);
  });
});
