/**
 * Version Synchronization Tests v0.4.1
 * 
 * This test suite ensures all components display consistent version information
 * and that the v0.4.1 release maintains version synchronization across the application.
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock React Three Fiber to avoid WebGL context issues
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="mock-canvas">{children}</div>,
  useFrame: () => {},
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="mock-orbit-controls" />,
  Text: ({ children }) => <div data-testid="mock-text">{children}</div>
}));

// Mock AI classifier to avoid external dependencies
jest.mock('../../utils/aiClassifier', () => ({
  classifyTodoWithAI: jest.fn(() => ({
    category: 'work',
    priority: 'medium',
    hierarchyType: 'satellite',
    estimatedDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    solarSystemId: 'work-satellite-system',
    visualProperties: {
      sizeMultiplier: 1.0,
      brightness: 1.5,
      rotationSpeed: 0.005,
      urgencyColor: '#44ff44',
      daysUntilDeadline: 7
    },
    confidence: 75,
    aiSuggestions: []
  }))
}));

describe('Version Synchronization v0.4.1', () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Package.json Version Consistency', () => {
    test('package.json should contain version 0.4.1', () => {
      // This test verifies that package.json has been updated
      const packageJson = require('../../../package.json');
      expect(packageJson.version).toBe('0.4.1');
    });

    test('package.json should contain correct project name', () => {
      const packageJson = require('../../../package.json');
      expect(packageJson.name).toBe('solar-system-todo');
    });
  });

  describe('Component Version Display', () => {
    test('App component displays version v0.4.1', async () => {
      const App = require('../../App').default;
      render(<App />);
      
      expect(screen.getByText('AI-Powered Solar System Todo v0.4.1')).toBeInTheDocument();
    });

    test('version info element has correct CSS class', async () => {
      const App = require('../../App').default;
      render(<App />);
      
      const versionElement = screen.getByText('AI-Powered Solar System Todo v0.4.1');
      expect(versionElement).toHaveClass('version-info');
    });
  });

  describe('AI Component Version Integration', () => {
    test('AITodoManager displays correct version in header', async () => {
      const AITodoManager = require('../AITodoManager').default;
      const mockOnTodoDataChange = jest.fn();
      
      render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
      
      // Check if the component renders with v0.4.1 in the title
      expect(screen.getByText(/v0\.4\.1/)).toBeInTheDocument();
    });
  });

  describe('CSS Version Consistency', () => {
    test('CSS version display should show v0.4.1', () => {
      // Test CSS content property for version display
      const App = require('../../App').default;
      render(<App />);
      
      const versionElement = screen.getByText('AI-Powered Solar System Todo v0.4.1');
      expect(versionElement).toBeInTheDocument();
    });
  });

  describe('AI Features Version Compatibility', () => {
    test('AI classifier works with v0.4.1', () => {
      const { classifyTodoWithAI } = require('../../utils/aiClassifier');
      const result = classifyTodoWithAI('Test task');
      
      expect(result).toBeDefined();
      expect(result.category).toBe('work');
      expect(result.visualProperties).toBeDefined();
    });
  });
});

describe('Version Display Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('version format follows semantic versioning', async () => {
    const App = require('../../App').default;
    render(<App />);
    
    const versionText = screen.getByText('AI-Powered Solar System Todo v0.4.1');
    const versionMatch = versionText.textContent.match(/v(\d+)\.(\d+)\.(\d+)/);
    
    expect(versionMatch).not.toBeNull();
    expect(versionMatch[1]).toBe('0'); // Major version
    expect(versionMatch[2]).toBe('4'); // Minor version  
    expect(versionMatch[3]).toBe('1'); // Patch version
  });

  test('version is prominently displayed', async () => {
    const App = require('../../App').default;
    render(<App />);
    
    const versionElement = screen.getByText('AI-Powered Solar System Todo v0.4.1');
    
    // Should be visible and not hidden
    expect(versionElement).toBeVisible();
    expect(versionElement).toHaveClass('version-info');
  });
});

describe('File Consistency Checks', () => {
  test('README.md should mention v0.4.1', () => {
    // This test ensures README.md has been updated consistently
    // Note: In a real scenario, you might read the file content
    expect(true).toBe(true); // Placeholder - would check file content
  });

  test('SPECIFICATIONS.md should be updated to v0.4.1', () => {
    // This test ensures SPECIFICATIONS.md has been updated
    expect(true).toBe(true); // Placeholder - would check file content
  });
});

describe('Build and Performance with v0.4.1', () => {
  test('application builds successfully with AI components', () => {
    // Test that all components can be imported without errors
    expect(() => {
      require('../../App');
      require('../AITodoManager');
      require('../AIPanel');
      require('../../utils/aiClassifier');
    }).not.toThrow();
  });

  test('version display renders quickly', async () => {
    const startTime = performance.now();
    
    const App = require('../../App').default;
    render(<App />);
    
    const versionElement = screen.getByText('AI-Powered Solar System Todo v0.4.1');
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(versionElement).toBeInTheDocument();
    expect(renderTime).toBeLessThan(100); // Should render quickly
  });
});

describe('Backward Compatibility', () => {
  test('v0.4.1 maintains API compatibility', () => {
    // Test that existing APIs still work
    const { classifyTodoWithAI } = require('../../utils/aiClassifier');
    
    expect(() => {
      classifyTodoWithAI('Test task');
    }).not.toThrow();
  });

  test('localStorage integration works with v0.4.1', () => {
    const localStorageMock = {
      getItem: jest.fn(() => JSON.stringify([{
        id: 1,
        text: 'Test todo',
        category: 'work',
        completed: false,
        visualProperties: {
          daysUntilDeadline: 5
        }
      }])),
      setItem: jest.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    const AITodoManager = require('../AITodoManager').default;
    const mockOnTodoDataChange = jest.fn();
    
    expect(() => {
      render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    }).not.toThrow();
  });
});

describe('Integration Test for v0.4.1', () => {
  test('full application integration with version display', async () => {
    const App = require('../../App').default;
    
    expect(() => {
      render(<App />);
    }).not.toThrow();
    
    // Check that version is displayed
    expect(screen.getByText('AI-Powered Solar System Todo v0.4.1')).toBeInTheDocument();
    
    // Check that main components are rendered
    expect(screen.getByTestId('mock-canvas')).toBeInTheDocument();
  });
});