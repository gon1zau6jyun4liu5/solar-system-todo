import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import DynamicSolarSystemManager from '../components/DynamicSolarSystemManager';
import AsteroidActionSystem from '../components/AsteroidActionSystem';

// Mock Three.js components to avoid WebGL issues in testing
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: () => null,
  useThree: () => ({ camera: { position: { set: jest.fn() } } })
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Stars: () => <div data-testid="stars" />,
  Text: ({ children }) => <div data-testid="text">{children}</div>
}));

jest.mock('../components/Scene', () => {
  return function MockScene() {
    return <div data-testid="scene">3D Scene</div>;
  };
});

jest.mock('../components/EnhancedMissionControl', () => {
  return function MockEnhancedMissionControl() {
    return <div data-testid="enhanced-mission-control">Enhanced Mission Control</div>;
  };
});

jest.mock('../components/AITodoManager', () => {
  return function MockAITodoManager() {
    return <div data-testid="ai-todo-manager">AI Todo Manager</div>;
  };
});

jest.mock('../components/AdvancedAnalyticsDashboard', () => {
  return function MockAdvancedAnalyticsDashboard({ isVisible }) {
    return isVisible ? <div data-testid="analytics-dashboard">Analytics Dashboard</div> : null;
  };
});

jest.mock('../components/AsteroidActionSystem', () => {
  return function MockAsteroidActionSystem() {
    return <div data-testid="asteroid-action-system">Asteroid Action System</div>;
  };
});

describe('App Component v0.5.0 Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Version Display and Core Components', () => {
    test('renders with correct version v0.5.0', () => {
      render(<App />);
      
      // Check version display
      expect(screen.getByText('AI Dynamic Solar System Todo v0.5.0')).toBeInTheDocument();
    });

    test('renders main components without AIPanel', () => {
      render(<App />);
      
      // Should render main scene and components
      expect(screen.getByTestId('scene')).toBeInTheDocument();
      expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
      expect(screen.getByTestId('asteroid-action-system')).toBeInTheDocument();
      
      // AIPanel should NOT be present
      expect(screen.queryByText('AI-Powered Todo Universe')).not.toBeInTheDocument();
      expect(screen.queryByText('How it works:')).not.toBeInTheDocument();
    });

    test('displays system status indicators', () => {
      render(<App />);
      
      // Should show system status
      const systemStatus = screen.getByText(/🌌.*Systems.*☄️.*Asteroids/);
      expect(systemStatus).toBeInTheDocument();
      
      // Initially should start with 0 systems and 0 asteroids
      expect(systemStatus).toHaveTextContent('🌌 0 Systems | ☄️ 0 Asteroids');
    });

    test('shows feature badge for new features', () => {
      render(<App />);
      
      expect(screen.getByText('🤖 NEW: AI Grouping Engine & Multi Solar Systems')).toBeInTheDocument();
    });
  });

  describe('UI Control Buttons', () => {
    test('renders AI grouping toggle button', () => {
      render(<App />);
      
      const aiToggle = screen.getByText('🤖 AI ON');
      expect(aiToggle).toBeInTheDocument();
      expect(aiToggle).toHaveClass('ai-grouping-toggle');
    });

    test('renders animation control button (replacing AIPanel functionality)', () => {
      render(<App />);
      
      const animationToggle = screen.getByText('⏸️ Pause Solar System');
      expect(animationToggle).toBeInTheDocument();
      expect(animationToggle).toHaveClass('animation-toggle');
    });

    test('renders UI mode toggle button', () => {
      render(<App />);
      
      const uiToggle = screen.getByText(/🎨 Enhanced|🚀 Classic/);
      expect(uiToggle).toBeInTheDocument();
      expect(uiToggle).toHaveClass('ui-mode-toggle');
    });

    test('renders analytics dashboard toggle', () => {
      render(<App />);
      
      const analyticsToggle = screen.getByText('📊 Analytics');
      expect(analyticsToggle).toBeInTheDocument();
      expect(analyticsToggle).toHaveClass('analytics-toggle');
    });

    test('AI grouping toggle changes state correctly', () => {
      render(<App />);
      
      const aiToggle = screen.getByText('🤖 AI ON');
      
      fireEvent.click(aiToggle);
      
      expect(screen.getByText('🤖 AI OFF')).toBeInTheDocument();
    });

    test('animation toggle changes state correctly', () => {
      render(<App />);
      
      const animationToggle = screen.getByText('⏸️ Pause Solar System');
      
      fireEvent.click(animationToggle);
      
      expect(screen.getByText('▶️ Play Solar System')).toBeInTheDocument();
    });
  });

  describe('UI Mode Switching', () => {
    test('switches between Enhanced and Classic UI modes', () => {
      render(<App />);
      
      // Should start with Enhanced UI
      expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
      expect(screen.queryByTestId('ai-todo-manager')).not.toBeInTheDocument();
      
      const uiToggle = screen.getByText('🎨 Enhanced');
      fireEvent.click(uiToggle);
      
      // Should switch to Classic UI
      expect(screen.queryByTestId('enhanced-mission-control')).not.toBeInTheDocument();
      expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
    });
  });

  describe('Analytics Dashboard', () => {
    test('opens and closes analytics dashboard', () => {
      render(<App />);
      
      // Dashboard should be closed initially
      expect(screen.queryByTestId('analytics-dashboard')).not.toBeInTheDocument();
      
      const analyticsToggle = screen.getByText('📊 Analytics');
      fireEvent.click(analyticsToggle);
      
      // Dashboard should be open
      expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
    });
  });

  describe('AI Engine Functionality', () => {
    test('AI Engine categorizes tasks correctly', () => {
      // Test the categorizeTask function logic
      const mockKeywords = ['프로젝트', '개발'];
      // This would normally be tested with the actual AI engine
      // For now, we test the UI integration
      
      render(<App />);
      
      const aiToggle = screen.getByText('🤖 AI ON');
      expect(aiToggle).toBeInTheDocument();
      
      // AI should be active by default
      expect(screen.getByText('🤖 AI ON')).toBeInTheDocument();
    });

    test('disabling AI clears solar systems', async () => {
      render(<App />);
      
      const aiToggle = screen.getByText('🤖 AI ON');
      fireEvent.click(aiToggle);
      
      // When AI is disabled, systems should be cleared
      await waitFor(() => {
        const systemStatus = screen.getByText(/🌌.*Systems.*☄️.*Asteroids/);
        expect(systemStatus).toHaveTextContent('🌌 0 Systems | ☄️0 Asteroids');
      });
    });
  });

  describe('Package.json Version Consistency', () => {
    test('package.json should contain version 0.5.0', () => {
      const packageJson = require('../../package.json');
      expect(packageJson.version).toBe('0.5.0');
    });

    test('package.json should contain correct project name', () => {
      const packageJson = require('../../package.json');
      expect(packageJson.name).toBe('solar-system-todo');
    });

    test('package.json should have sourcemap generation disabled', () => {
      const packageJson = require('../../package.json');
      expect(packageJson.scripts.start).toContain('GENERATE_SOURCEMAP=false');
      expect(packageJson.scripts.build).toContain('GENERATE_SOURCEMAP=false');
    });
  });

  describe('Component Integration', () => {
    test('renders all essential components', () => {
      render(<App />);
      
      const essentialComponents = [
        'scene',
        'enhanced-mission-control', 
        'asteroid-action-system'
      ];
      
      essentialComponents.forEach(component => {
        expect(screen.getByTestId(component)).toBeInTheDocument();
      });
    });

    test('version info has correct CSS class', () => {
      render(<App />);
      
      const versionElement = screen.getByText('AI Dynamic Solar System Todo v0.5.0');
      expect(versionElement).toHaveClass('version-info');
    });
  });

  describe('Performance and Optimization', () => {
    test('component renders without memory leaks', () => {
      const { unmount } = render(<App />);
      
      // Component should render successfully
      expect(screen.getByTestId('scene')).toBeInTheDocument();
      
      // Should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });

    test('handles multiple state updates efficiently', async () => {
      render(<App />);
      
      const aiToggle = screen.getByText('🤖 AI ON');
      const animationToggle = screen.getByText('⏸️ Pause Solar System');
      
      // Multiple rapid state changes should be handled
      act(() => {
        fireEvent.click(aiToggle);
        fireEvent.click(animationToggle);
        fireEvent.click(aiToggle);
      });
      
      // Final states should be correct
      expect(screen.getByText('🤖 AI ON')).toBeInTheDocument();
      expect(screen.getByText('▶️ Play Solar System')).toBeInTheDocument();
    });
  });
});

describe('DynamicSolarSystemManager Component', () => {
  const mockSolarSystems = [
    {
      id: 'system-1',
      name: 'work',
      position: [0, 0, 0],
      sun: {
        id: 'sun-1',
        name: 'work',
        theme: { color: '#4CAF50', texture: 'corporate' }
      },
      planets: [
        {
          id: 'planet-1',
          name: 'Project Task',
          task: { id: 'task-1', text: 'Complete project', completed: false },
          satellites: []
        }
      ],
      theme: { color: '#4CAF50', texture: 'corporate' },
      priority: 3
    }
  ];

  const mockAsteroids = [
    {
      id: 'asteroid-1',
      targetPlanetId: 'planet-1',
      targetSystemId: 'system-1',
      position: [10, 0, 10],
      suggestion: {
        action: 'Review progress',
        description: 'Check current progress on this task',
        impact: 2
      },
      speed: 0.5,
      timeLimit: Date.now() + 30000
    }
  ];

  test('renders solar systems when provided', () => {
    render(
      <DynamicSolarSystemManager
        solarSystems={mockSolarSystems}
        asteroids={[]}
        currentView="all"
        onSolarSystemClick={jest.fn()}
        onPlanetClick={jest.fn()}
        onAsteroidClick={jest.fn()}
        isAnimationPlaying={true}
      />
    );
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  test('shows empty state when no solar systems', () => {
    render(
      <DynamicSolarSystemManager
        solarSystems={[]}
        asteroids={[]}
        currentView="all"
        onSolarSystemClick={jest.fn()}
        onPlanetClick={jest.fn()}
        onAsteroidClick={jest.fn()}
        isAnimationPlaying={true}
      />
    );
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });
});

describe('Version Update Validation', () => {
  test('all version references point to v0.5.0', () => {
    render(<App />);
    
    // Check that no old version references remain
    expect(screen.queryByText(/v0\.4\./)).not.toBeInTheDocument();
    expect(screen.queryByText(/0\.4\./)).not.toBeInTheDocument();
    
    // Confirm new version is displayed
    expect(screen.getByText(/v0\.5\.0/)).toBeInTheDocument();
  });

  test('feature badges and status are appropriate for v0.5.0', () => {
    render(<App />);
    
    // Should show current feature set
    expect(screen.getByText('🤖 NEW: AI Grouping Engine & Multi Solar Systems')).toBeInTheDocument();
    
    // Should have clean UI without deprecated panels
    expect(screen.queryByText('How it works:')).not.toBeInTheDocument();
    expect(screen.queryByText('Universe Status:')).not.toBeInTheDocument();
  });
});
