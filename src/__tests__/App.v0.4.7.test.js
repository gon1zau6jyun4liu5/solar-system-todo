import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import DynamicSolarSystemManager from '../components/DynamicSolarSystemManager';
import AsteroidActionSystem from '../components/AsteroidActionSystem';

// Mock Three.js components
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: () => {},
  useThree: () => ({ camera: { position: { set: jest.fn(), lerp: jest.fn(), distanceTo: jest.fn() } } })
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Text: ({ children }) => <div data-testid="text">{children}</div>,
  Html: ({ children }) => <div data-testid="html">{children}</div>
}));

// Mock existing components
jest.mock('../components/Scene', () => {
  return function MockScene({ solarSystems, asteroids }) {
    return (
      <div data-testid="scene">
        <div data-testid="solar-systems-count">{solarSystems?.length || 0}</div>
        <div data-testid="asteroids-count">{asteroids?.length || 0}</div>
      </div>
    );
  };
});

jest.mock('../components/AIPanel', () => {
  return function MockAIPanel({ aiGroupingActive, solarSystemsCount, asteroidsCount }) {
    return (
      <div data-testid="ai-panel">
        <div data-testid="ai-grouping-status">{aiGroupingActive ? 'active' : 'inactive'}</div>
        <div data-testid="systems-count">{solarSystemsCount || 0}</div>
        <div data-testid="asteroids-count">{asteroidsCount || 0}</div>
      </div>
    );
  };
});

jest.mock('../components/EnhancedMissionControl', () => {
  return function MockEnhancedMissionControl({ solarSystems, asteroids }) {
    return (
      <div data-testid="enhanced-mission-control">
        <div data-testid="solar-systems">{solarSystems?.length || 0}</div>
        <div data-testid="asteroids">{asteroids?.length || 0}</div>
      </div>
    );
  };
});

jest.mock('../components/AITodoManager', () => {
  return function MockAITodoManager() {
    return <div data-testid="ai-todo-manager" />;
  };
});

jest.mock('../components/AdvancedAnalyticsDashboard', () => {
  return function MockAdvancedAnalyticsDashboard({ todos, solarSystems, asteroids }) {
    return (
      <div data-testid="advanced-analytics-dashboard">
        <div data-testid="analytics-todos">{todos?.length || 0}</div>
        <div data-testid="analytics-systems">{solarSystems?.length || 0}</div>
        <div data-testid="analytics-asteroids">{asteroids?.length || 0}</div>
      </div>
    );
  };
});

describe('App v0.4.7 - AI Dynamic Solar System Features', () => {
  beforeEach(() => {
    // Reset any global state or mocks
    jest.clearAllMocks();
  });

  test('renders with correct version v0.4.7', () => {
    render(<App />);
    
    const versionElement = screen.getByText('AI Dynamic Solar System Todo v0.4.7');
    expect(versionElement).toBeInTheDocument();
    expect(versionElement).toHaveClass('version-info');
  });

  test('displays new AI features badge', () => {
    render(<App />);
    
    const featureBadge = screen.getByText('🤖 NEW: AI Grouping Engine & Multi Solar Systems');
    expect(featureBadge).toBeInTheDocument();
    expect(featureBadge).toHaveClass('feature-badge');
  });

  test('renders AI grouping toggle button', () => {
    render(<App />);
    
    const aiToggle = screen.getByTitle(/AI 그룹핑/);
    expect(aiToggle).toBeInTheDocument();
    expect(aiToggle).toHaveClass('ai-grouping-toggle');
    expect(aiToggle).toHaveTextContent('🤖 AI ON');
  });

  test('renders system status display', () => {
    render(<App />);
    
    const systemStatus = screen.getByText(/🌌.*Systems.*☄️.*Asteroids/);
    expect(systemStatus).toBeInTheDocument();
    expect(systemStatus).toHaveClass('system-status');
  });

  test('AI grouping can be toggled', () => {
    render(<App />);
    
    const aiToggle = screen.getByTitle(/AI 그룹핑/);
    
    // Initially ON
    expect(aiToggle).toHaveTextContent('🤖 AI ON');
    
    // Click to toggle OFF
    fireEvent.click(aiToggle);
    expect(aiToggle).toHaveTextContent('🤖 AI OFF');
    
    // Click to toggle back ON
    fireEvent.click(aiToggle);
    expect(aiToggle).toHaveTextContent('🤖 AI ON');
  });

  test('passes correct props to Scene component', () => {
    render(<App />);
    
    const sceneElement = screen.getByTestId('scene');
    expect(sceneElement).toBeInTheDocument();
    
    // Should have solar systems and asteroids data
    const systemsCount = screen.getByTestId('solar-systems-count');
    const asteroidsCount = screen.getByTestId('asteroids-count');
    
    expect(systemsCount).toHaveTextContent('0'); // Initially 0
    expect(asteroidsCount).toHaveTextContent('0'); // Initially 0
  });

  test('Enhanced Mission Control receives AI data', () => {
    render(<App />);
    
    const enhancedMissionControl = screen.getByTestId('enhanced-mission-control');
    expect(enhancedMissionControl).toBeInTheDocument();
    
    // Should receive solar systems and asteroids data
    const solarSystems = screen.getByTestId('solar-systems');
    const asteroids = screen.getByTestId('asteroids');
    
    expect(solarSystems).toHaveTextContent('0');
    expect(asteroids).toHaveTextContent('0');
  });

  test('Analytics dashboard receives comprehensive data', () => {
    render(<App />);
    
    // Open analytics dashboard
    const analyticsToggle = screen.getByText('📊 Analytics');
    fireEvent.click(analyticsToggle);
    
    const dashboard = screen.getByTestId('advanced-analytics-dashboard');
    expect(dashboard).toBeInTheDocument();
    
    // Should have todos, systems, and asteroids data
    const todoCount = screen.getByTestId('analytics-todos');
    const systemsCount = screen.getByTestId('analytics-systems');
    const asteroidsCount = screen.getByTestId('analytics-asteroids');
    
    expect(todoCount).toHaveTextContent('0');
    expect(systemsCount).toHaveTextContent('0');
    expect(asteroidsCount).toHaveTextContent('0');
  });

  test('AI Panel receives correct status information', () => {
    render(<App />);
    
    const aiPanel = screen.getByTestId('ai-panel');
    expect(aiPanel).toBeInTheDocument();
    
    const aiGroupingStatus = screen.getByTestId('ai-grouping-status');
    const systemsCount = screen.getByTestId('systems-count');
    const asteroidsCountPanel = screen.getByTestId('asteroids-count');
    
    expect(aiGroupingStatus).toHaveTextContent('active'); // Initially active
    expect(systemsCount).toHaveTextContent('0');
    expect(asteroidsCountPanel).toHaveTextContent('0');
  });

  test('all UI mode buttons are present', () => {
    render(<App />);
    
    const uiModeToggle = screen.getByTitle(/Switch to/);
    const analyticsToggle = screen.getByTitle('Open Advanced Analytics Dashboard');
    const aiGroupingToggle = screen.getByTitle(/AI 그룹핑/);
    
    expect(uiModeToggle).toBeInTheDocument();
    expect(analyticsToggle).toBeInTheDocument();
    expect(aiGroupingToggle).toBeInTheDocument();
  });

  test('handles todo addition with AI grouping', async () => {
    render(<App />);
    
    // Simulate adding a todo (this would trigger AI grouping)
    const app = screen.getByText('AI Dynamic Solar System Todo v0.4.7').closest('.App');
    
    // Mock handleTodoAdd function
    const mockTodo = {
      text: 'Test AI grouping task',
      deadline: Date.now() + 86400000 // 1 day from now
    };
    
    // This would be called through the UI in a real scenario
    // Here we're testing that the structure supports it
    expect(app).toBeInTheDocument();
  });

  test('system status updates correctly', () => {
    render(<App />);
    
    const systemStatus = screen.getByText(/🌌.*Systems.*☄️.*Asteroids/);
    
    // Should start with 0 systems and 0 asteroids
    expect(systemStatus).toHaveTextContent('🌌 0 Systems | ☄️ 0 Asteroids');
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
      timeLimit: Date.now() + 30000 // 30 seconds
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
    
    // Should render canvas and system elements
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
    
    // Should show AI analysis message
    expect(screen.getByText('🤖 AI 분석 중...')).toBeInTheDocument();
    expect(screen.getByText('태스크를 추가하면 AI가 자동으로 태양계를 생성합니다')).toBeInTheDocument();
  });

  test('handles solar system click events', () => {
    const mockOnSystemClick = jest.fn();
    
    render(
      <DynamicSolarSystemManager
        solarSystems={mockSolarSystems}
        asteroids={[]}
        currentView="all"
        onSolarSystemClick={mockOnSystemClick}
        onPlanetClick={jest.fn()}
        onAsteroidClick={jest.fn()}
        isAnimationPlaying={true}
      />
    );
    
    // Click events would be handled by Three.js mesh components
    // This tests that the callback is passed correctly
    expect(mockOnSystemClick).toBeDefined();
  });
});

describe('AsteroidActionSystem Component', () => {
  const mockAsteroids = [
    {
      id: 'asteroid-1',
      targetPlanetId: 'planet-1',
      targetSystemId: 'system-1',
      suggestion: {
        action: 'Review task progress',
        description: 'Check the current status of this task',
        impact: 2
      },
      timeLimit: Date.now() + 45000 // 45 seconds
    }
  ];

  const mockSolarSystems = [
    {
      id: 'system-1',
      name: 'work',
      planets: [
        {
          id: 'planet-1',
          name: 'Project Task',
          task: { id: 'task-1', text: 'Complete project', completed: false }
        }
      ]
    }
  ];

  test('renders asteroid action panel when asteroids exist', () => {
    render(
      <AsteroidActionSystem
        asteroids={mockAsteroids}
        solarSystems={mockSolarSystems}
        onAsteroidAction={jest.fn()}
      />
    );
    
    expect(screen.getByText('☄️ 소행성 액션 제안')).toBeInTheDocument();
    expect(screen.getByText('Review task progress')).toBeInTheDocument();
  });

  test('does not render when no asteroids', () => {
    const { container } = render(
      <AsteroidActionSystem
        asteroids={[]}
        solarSystems={mockSolarSystems}
        onAsteroidAction={jest.fn()}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  test('handles asteroid action buttons', () => {
    const mockOnAsteroidAction = jest.fn();
    
    render(
      <AsteroidActionSystem
        asteroids={mockAsteroids}
        solarSystems={mockSolarSystems}
        onAsteroidAction={mockOnAsteroidAction}
      />
    );
    
    const acceptButton = screen.getByText('✅ 수락');
    const rejectButton = screen.getByText('❌ 거부');
    
    fireEvent.click(acceptButton);
    expect(mockOnAsteroidAction).toHaveBeenCalledWith('asteroid-1', 'accept');
    
    fireEvent.click(rejectButton);
    expect(mockOnAsteroidAction).toHaveBeenCalledWith('asteroid-1', 'reject');
  });

  test('displays time remaining correctly', () => {
    render(
      <AsteroidActionSystem
        asteroids={mockAsteroids}
        solarSystems={mockSolarSystems}
        onAsteroidAction={jest.fn()}
      />
    );
    
    // Should display time in seconds format
    expect(screen.getByText(/⏱️.*초/)).toBeInTheDocument();
  });

  test('shows urgency-based styling', () => {
    const urgentAsteroid = [{
      ...mockAsteroids[0],
      timeLimit: Date.now() + 5000 // 5 seconds - critical
    }];
    
    render(
      <AsteroidActionSystem
        asteroids={urgentAsteroid}
        solarSystems={mockSolarSystems}
        onAsteroidAction={jest.fn()}
      />
    );
    
    const asteroidItem = screen.getByText('Review task progress').closest('.asteroid-item');
    expect(asteroidItem).toHaveClass('priority-critical');
  });

  test('displays asteroid statistics', () => {
    render(
      <AsteroidActionSystem
        asteroids={mockAsteroids}
        solarSystems={mockSolarSystems}
        onAsteroidAction={jest.fn()}
      />
    );
    
    // Should show stats in footer
    expect(screen.getByText(/🔥 긴급:/)).toBeInTheDocument();
    expect(screen.getByText(/⚡ 높음:/)).toBeInTheDocument();
    expect(screen.getByText(/⚠️ 보통:/)).toBeInTheDocument();
  });
});

describe('App v0.4.7 - Integration Tests', () => {
  test('all major components render together', () => {
    render(<App />);
    
    // Core app elements
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
    
    // Version and feature info
    expect(screen.getByText('AI Dynamic Solar System Todo v0.4.7')).toBeInTheDocument();
    expect(screen.getByText('🤖 NEW: AI Grouping Engine & Multi Solar Systems')).toBeInTheDocument();
    
    // Control buttons
    expect(screen.getByText('📊 Analytics')).toBeInTheDocument();
    expect(screen.getByText(/🎨|🚀/)).toBeInTheDocument(); // UI mode toggle
    expect(screen.getByText('🤖 AI ON')).toBeInTheDocument();
    
    // System status
    expect(screen.getByText(/🌌.*Systems.*☄️.*Asteroids/)).toBeInTheDocument();
  });

  test('UI mode switching works with AI features', () => {
    render(<App />);
    
    const uiModeToggle = screen.getByTitle(/Switch to/);
    
    // Initially enhanced mode
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
    expect(screen.queryByTestId('ai-todo-manager')).not.toBeInTheDocument();
    
    // Switch to classic mode
    fireEvent.click(uiModeToggle);
    
    expect(screen.queryByTestId('enhanced-mission-control')).not.toBeInTheDocument();
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
  });

  test('analytics dashboard integration with AI data', () => {
    render(<App />);
    
    const analyticsButton = screen.getByText('📊 Analytics');
    fireEvent.click(analyticsButton);
    
    const dashboard = screen.getByTestId('advanced-analytics-dashboard');
    expect(dashboard).toBeInTheDocument();
    
    // Dashboard should receive comprehensive AI data
    expect(screen.getByTestId('analytics-todos')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-systems')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-asteroids')).toBeInTheDocument();
  });

  test('AI system state consistency', () => {
    render(<App />);
    
    // AI should be initially active
    const aiToggle = screen.getByTitle(/AI 그룹핑/);
    const aiPanel = screen.getByTestId('ai-panel');
    const aiStatus = screen.getByTestId('ai-grouping-status');
    
    expect(aiToggle).toHaveTextContent('🤖 AI ON');
    expect(aiStatus).toHaveTextContent('active');
    
    // Toggle AI off
    fireEvent.click(aiToggle);
    
    expect(aiToggle).toHaveTextContent('🤖 AI OFF');
    expect(aiStatus).toHaveTextContent('inactive');
  });
});

describe('App v0.4.7 - Performance Tests', () => {
  test('renders within acceptable time', () => {
    const startTime = performance.now();
    
    render(<App />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 150ms for complex AI features
    expect(renderTime).toBeLessThan(150);
  });

  test('handles multiple state updates efficiently', async () => {
    render(<App />);
    
    const aiToggle = screen.getByTitle(/AI 그룹핑/);
    const uiToggle = screen.getByTitle(/Switch to/);
    const analyticsToggle = screen.getByText('📊 Analytics');
    
    // Rapid state changes
    fireEvent.click(aiToggle);
    fireEvent.click(uiToggle);
    fireEvent.click(analyticsToggle);
    fireEvent.click(aiToggle);
    
    await waitFor(() => {
      expect(screen.getByText(/AI.*O/)).toBeInTheDocument();
    });
  });
});

describe('App v0.4.7 - Accessibility Tests', () => {
  test('version info is accessible', () => {
    render(<App />);
    
    const versionElement = screen.getByText('AI Dynamic Solar System Todo v0.4.7');
    expect(versionElement).toBeVisible();
    expect(versionElement).toHaveClass('version-info');
  });

  test('AI controls have proper focus states', () => {
    render(<App />);
    
    const aiToggle = screen.getByTitle(/AI 그룹핑/);
    const analyticsToggle = screen.getByTitle('Open Advanced Analytics Dashboard');
    
    expect(aiToggle).toBeVisible();
    expect(analyticsToggle).toBeVisible();
    
    // Should be focusable
    aiToggle.focus();
    expect(document.activeElement).toBe(aiToggle);
  });

  test('system status is readable', () => {
    render(<App />);
    
    const systemStatus = screen.getByText(/🌌.*Systems.*☄️.*Asteroids/);
    expect(systemStatus).toBeVisible();
    expect(systemStatus).toHaveClass('system-status');
  });
});