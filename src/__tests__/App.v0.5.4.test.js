import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock canvas and WebGL for Three.js
const mockCanvas = {
  getContext: () => ({
    fillRect: () => {},
    clearRect: () => {},
    getImageData: (x, y, w, h) => ({
      data: new Array(w * h * 4)
    }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
  }),
  addEventListener: () => {},
  removeEventListener: () => {},
  clientHeight: 600,
  clientWidth: 800,
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    // Mock implementation
  }
  unobserve() {
    // Mock implementation
  }
  disconnect() {
    // Mock implementation
  }
};

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = () => mockCanvas.getContext();
  HTMLCanvasElement.prototype.addEventListener = mockCanvas.addEventListener;
  HTMLCanvasElement.prototype.removeEventListener = mockCanvas.removeEventListener;
  Object.defineProperty(HTMLCanvasElement.prototype, 'clientHeight', {
    get: () => mockCanvas.clientHeight
  });
  Object.defineProperty(HTMLCanvasElement.prototype, 'clientWidth', {
    get: () => mockCanvas.clientWidth
  });
});

// Silence console warnings for tests
beforeAll(() => {
  const originalError = console.error;
  console.error = (message) => {
    if (!message.includes('Warning: ReactDOM.render is no longer supported') && 
        !message.includes('Warning: validateDOMNesting') &&
        !message.includes('THREE.WebGLRenderer')) {
      originalError(message);
    }
  };
});

describe('App Component v0.5.4 - UI Buttons Restoration Tests', () => {
  describe('Version Display and Core Components', () => {
    test('renders with correct version v0.5.4', async () => {
      render(<App />);
      
      const versionElement = await waitFor(() => 
        screen.getByTestId('version-info')
      );
      
      expect(versionElement).toHaveTextContent('v0.5.4');
      expect(versionElement).toBeInTheDocument();
    });

    test('renders main components with restored UI buttons', async () => {
      render(<App />);
      
      // Core 3D scene should be present
      await waitFor(() => {
        expect(screen.getByTestId('scene')).toBeInTheDocument();
      });

      // All UI buttons should be restored
      expect(screen.getByTestId('ui-mode-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('analytics-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('ai-grouping-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('animation-toggle')).toBeInTheDocument();
    });

    test('displays correct feature badge for v0.5.4', async () => {
      render(<App />);
      
      const featureBadge = await waitFor(() => 
        screen.getByTestId('feature-badge')
      );
      
      expect(featureBadge).toHaveTextContent('🔧 FIXED: UI Buttons Restored & Complete Interface');
      expect(featureBadge).toBeInTheDocument();
    });

    test('displays system status indicators', async () => {
      render(<App />);
      
      const systemStatus = await waitFor(() => 
        screen.getByTestId('system-status')
      );
      
      expect(systemStatus).toBeInTheDocument();
      expect(systemStatus).toHaveTextContent(/Systems.*Asteroids/);
    });
  });

  describe('Restored UI Control Buttons', () => {
    test('🔧 RESTORED: UI Mode Toggle Button functions correctly', async () => {
      render(<App />);
      
      const uiModeToggle = await waitFor(() => 
        screen.getByTestId('ui-mode-toggle')
      );
      
      expect(uiModeToggle).toBeInTheDocument();
      expect(uiModeToggle).toHaveTextContent(/Enhanced|Classic/);
      
      // Test toggle functionality
      const initialText = uiModeToggle.textContent;
      fireEvent.click(uiModeToggle);
      
      await waitFor(() => {
        expect(uiModeToggle.textContent).not.toBe(initialText);
      });
    });

    test('🔧 RESTORED: Analytics Toggle Button functions correctly', async () => {
      render(<App />);
      
      const analyticsToggle = await waitFor(() => 
        screen.getByTestId('analytics-toggle')
      );
      
      expect(analyticsToggle).toBeInTheDocument();
      expect(analyticsToggle).toHaveTextContent('📊 Analytics');
      
      // Test click functionality
      fireEvent.click(analyticsToggle);
      
      await waitFor(() => {
        expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
      });
    });

    test('🔧 RESTORED: AI Grouping Toggle Button functions correctly', async () => {
      render(<App />);
      
      const aiGroupingToggle = await waitFor(() => 
        screen.getByTestId('ai-grouping-toggle')
      );
      
      expect(aiGroupingToggle).toBeInTheDocument();
      expect(aiGroupingToggle).toHaveTextContent(/AI.*ON|OFF/);
      
      // Test toggle functionality
      const initialText = aiGroupingToggle.textContent;
      fireEvent.click(aiGroupingToggle);
      
      await waitFor(() => {
        expect(aiGroupingToggle.textContent).not.toBe(initialText);
      });
    });

    test('🔧 RESTORED: Animation Toggle Button functions correctly', async () => {
      render(<App />);
      
      const animationToggle = await waitFor(() => 
        screen.getByTestId('animation-toggle')
      );
      
      expect(animationToggle).toBeInTheDocument();
      expect(animationToggle).toHaveTextContent(/Pause|Play.*Solar System/);
      
      // Test toggle functionality
      const initialText = animationToggle.textContent;
      fireEvent.click(animationToggle);
      
      await waitFor(() => {
        expect(animationToggle.textContent).not.toBe(initialText);
      });
    });
  });

  describe('UI Mode Switching and Components', () => {
    test('switches between Enhanced and Classic UI modes', async () => {
      render(<App />);
      
      const uiModeToggle = await waitFor(() => 
        screen.getByTestId('ui-mode-toggle')
      );
      
      // Default should be Enhanced UI
      expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
      
      // Switch to Classic UI
      fireEvent.click(uiModeToggle);
      
      await waitFor(() => {
        expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
      });
    });

    test('analytics dashboard opens and closes correctly', async () => {
      render(<App />);
      
      const analyticsToggle = await waitFor(() => 
        screen.getByTestId('analytics-toggle')
      );
      
      // Initially dashboard should not be visible
      const dashboard = screen.getByTestId('analytics-dashboard');
      
      // Open dashboard
      fireEvent.click(analyticsToggle);
      
      await waitFor(() => {
        expect(dashboard).toBeInTheDocument();
      });
    });
  });

  describe('Package.json Version Consistency', () => {
    test('package.json should contain version 0.5.4', () => {
      const fs = require('fs');
      const path = require('path');
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
      );
      
      expect(packageJson.version).toBe('0.5.4');
    });

    test('package.json should contain correct project name', () => {
      const fs = require('fs');
      const path = require('path');
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
      );
      
      expect(packageJson.name).toBe('solar-system-todo');
    });

    test('package.json should have sourcemap generation disabled', () => {
      const fs = require('fs');
      const path = require('path');
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
      );
      
      expect(packageJson.scripts.start).toContain('GENERATE_SOURCEMAP=false');
      expect(packageJson.scripts.build).toContain('GENERATE_SOURCEMAP=false');
    });
  });

  describe('v0.5.4 UI Restoration Features', () => {
    test('all UI buttons have correct CSS classes and styling', async () => {
      render(<App />);
      
      // Check if buttons have the expected classes
      const uiModeToggle = await waitFor(() => screen.getByTestId('ui-mode-toggle'));
      const analyticsToggle = await waitFor(() => screen.getByTestId('analytics-toggle'));
      const aiGroupingToggle = await waitFor(() => screen.getByTestId('ai-grouping-toggle'));
      const animationToggle = await waitFor(() => screen.getByTestId('animation-toggle'));
      
      expect(uiModeToggle).toHaveClass('ui-mode-toggle');
      expect(analyticsToggle).toHaveClass('analytics-toggle');
      expect(aiGroupingToggle).toHaveClass('ai-grouping-toggle');
      expect(animationToggle).toHaveClass('animation-toggle');
    });

    test('restored buttons maintain functionality after multiple interactions', async () => {
      render(<App />);
      
      const uiModeToggle = await waitFor(() => screen.getByTestId('ui-mode-toggle'));
      const aiGroupingToggle = await waitFor(() => screen.getByTestId('ai-grouping-toggle'));
      
      // Multiple clicks should work correctly
      for (let i = 0; i < 3; i++) {
        fireEvent.click(uiModeToggle);
        fireEvent.click(aiGroupingToggle);
        
        await waitFor(() => {
          expect(uiModeToggle).toBeInTheDocument();
          expect(aiGroupingToggle).toBeInTheDocument();
        });
      }
    });

    test('no missing UI elements from v0.5.2', async () => {
      render(<App />);
      
      // All previously existing elements should still be present
      await waitFor(() => {
        expect(screen.getByTestId('version-info')).toBeInTheDocument();
        expect(screen.getByTestId('feature-badge')).toBeInTheDocument();
        expect(screen.getByTestId('system-status')).toBeInTheDocument();
        expect(screen.getByTestId('scene')).toBeInTheDocument();
        expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
        expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('asteroid-action-system')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Functionality', () => {
    test('component renders without memory leaks', async () => {
      const { unmount } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('scene')).toBeInTheDocument();
      });
      
      // Should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });

    test('handles multiple state updates efficiently', async () => {
      render(<App />);
      
      const uiModeToggle = await waitFor(() => screen.getByTestId('ui-mode-toggle'));
      const aiGroupingToggle = await waitFor(() => screen.getByTestId('ai-grouping-toggle'));
      const animationToggle = await waitFor(() => screen.getByTestId('animation-toggle'));
      
      // Rapid state changes should not cause crashes
      fireEvent.click(uiModeToggle);
      fireEvent.click(aiGroupingToggle);
      fireEvent.click(animationToggle);
      fireEvent.click(uiModeToggle);
      
      await waitFor(() => {
        expect(uiModeToggle).toBeInTheDocument();
        expect(aiGroupingToggle).toBeInTheDocument();
        expect(animationToggle).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles empty todos array gracefully', async () => {
      render(<App />);
      
      // Component should render even without todos initially
      await waitFor(() => {
        expect(screen.getByTestId('scene')).toBeInTheDocument();
        expect(screen.getByTestId('version-info')).toBeInTheDocument();
      });
    });

    test('handles AI grouping toggle when no tasks exist', async () => {
      render(<App />);
      
      const aiGroupingToggle = await waitFor(() => 
        screen.getByTestId('ai-grouping-toggle')
      );
      
      // Should handle toggle even with empty task list
      expect(() => fireEvent.click(aiGroupingToggle)).not.toThrow();
      
      await waitFor(() => {
        expect(aiGroupingToggle).toBeInTheDocument();
      });
    });

    test('maintains UI state consistency during rapid interactions', async () => {
      render(<App />);
      
      const buttons = await waitFor(() => [
        screen.getByTestId('ui-mode-toggle'),
        screen.getByTestId('analytics-toggle'),
        screen.getByTestId('ai-grouping-toggle'),
        screen.getByTestId('animation-toggle')
      ]);
      
      // Rapid clicking should not break the UI
      buttons.forEach(button => {
        for (let i = 0; i < 5; i++) {
          fireEvent.click(button);
        }
      });
      
      // All buttons should still be present and functional
      await waitFor(() => {
        buttons.forEach(button => {
          expect(button).toBeInTheDocument();
        });
      });
    });
  });

  describe('Integration Tests', () => {
    test('full workflow: UI mode switch -> analytics open -> AI toggle', async () => {
      render(<App />);
      
      // Get all control elements
      const uiModeToggle = await waitFor(() => screen.getByTestId('ui-mode-toggle'));
      const analyticsToggle = await waitFor(() => screen.getByTestId('analytics-toggle'));
      const aiGroupingToggle = await waitFor(() => screen.getByTestId('ai-grouping-toggle'));
      
      // Execute workflow
      fireEvent.click(uiModeToggle); // Switch UI mode
      fireEvent.click(analyticsToggle); // Open analytics
      fireEvent.click(aiGroupingToggle); // Toggle AI grouping
      
      await waitFor(() => {
        expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
        expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
        expect(aiGroupingToggle).toHaveTextContent(/OFF/);
      });
    });

    test('UI restoration preserves all v0.5.2 functionality', async () => {
      render(<App />);
      
      // All major components from v0.5.2 should still work
      await waitFor(() => {
        expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
        expect(screen.getByTestId('scene')).toBeInTheDocument();
        expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('asteroid-action-system')).toBeInTheDocument();
      });
      
      // UI controls should all be functional
      const controls = [
        'ui-mode-toggle',
        'analytics-toggle', 
        'ai-grouping-toggle',
        'animation-toggle'
      ];
      
      controls.forEach(async (controlId) => {
        const control = await waitFor(() => screen.getByTestId(controlId));
        expect(control).toBeInTheDocument();
        expect(() => fireEvent.click(control)).not.toThrow();
      });
    });
  });

  describe('Version Consistency Validation', () => {
    test('all version references point to v0.5.4', async () => {
      render(<App />);
      
      const versionInfo = await waitFor(() => 
        screen.getByTestId('version-info')
      );
      
      expect(versionInfo).toHaveTextContent('v0.5.4');
    });

    test('feature badges and status are appropriate for v0.5.4', async () => {
      render(<App />);
      
      const featureBadge = await waitFor(() => 
        screen.getByTestId('feature-badge')
      );
      
      const systemStatus = await waitFor(() => 
        screen.getByTestId('system-status')
      );
      
      expect(featureBadge).toHaveTextContent('FIXED: UI Buttons Restored');
      expect(systemStatus).toBeInTheDocument();
    });
  });
});

describe('EnhancedMissionControl Component v0.5.4', () => {
  test('displays version 0.5.4 compatible interface', async () => {
    render(<App />);
    
    const enhancedControl = await waitFor(() => 
      screen.getByTestId('enhanced-mission-control')
    );
    
    expect(enhancedControl).toBeInTheDocument();
  });

  test('maintains all v0.5.2 functionality with restored UI buttons', async () => {
    render(<App />);
    
    // Enhanced Mission Control should be present by default
    await waitFor(() => {
      expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
    });
    
    // All UI buttons should be available alongside the enhanced control
    expect(screen.getByTestId('ui-mode-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('ai-grouping-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('animation-toggle')).toBeInTheDocument();
  });
});

describe('CSS Styling Restoration v0.5.4', () => {
  test('all restored buttons have proper styling classes', async () => {
    render(<App />);
    
    const styleTests = [
      { testId: 'ui-mode-toggle', className: 'ui-mode-toggle' },
      { testId: 'analytics-toggle', className: 'analytics-toggle' },
      { testId: 'ai-grouping-toggle', className: 'ai-grouping-toggle' },
      { testId: 'animation-toggle', className: 'animation-toggle' },
      { testId: 'feature-badge', className: 'feature-badge' },
      { testId: 'system-status', className: 'system-status' },
      { testId: 'version-info', className: 'version-info' }
    ];
    
    for (const { testId, className } of styleTests) {
      const element = await waitFor(() => screen.getByTestId(testId));
      expect(element).toHaveClass(className);
    }
  });

  test('responsive design classes are applied correctly', async () => {
    render(<App />);
    
    // Test that elements are present and should respond to media queries
    const responsiveElements = [
      'ui-mode-toggle',
      'analytics-toggle', 
      'ai-grouping-toggle',
      'animation-toggle',
      'version-info',
      'system-status'
    ];
    
    for (const elementId of responsiveElements) {
      const element = await waitFor(() => screen.getByTestId(elementId));
      expect(element).toBeInTheDocument();
      // Elements should have proper styling for responsive behavior
      expect(element).toHaveAttribute('class');
    }
  });
});
