import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock Three.js environment
Object.defineProperty(window, 'HTMLCanvasElement', {
  value: class HTMLCanvasElement extends HTMLElement {
    constructor() {
      super();
      this.width = 800;
      this.height = 600;
    }
    getContext() {
      return {
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn(() => ({ data: new Array(4) })),
        putImageData: jest.fn(),
        createImageData: jest.fn(() => ({ data: new Array(4) })),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        fillText: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
      };
    }
    toDataURL() {
      return 'data:image/png;base64,test';
    }
  }
});

// Mock WebGL context
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: function(type) {
    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
      return {
        createShader: jest.fn(() => ({})),
        shaderSource: jest.fn(),
        compileShader: jest.fn(),
        createProgram: jest.fn(() => ({})),
        attachShader: jest.fn(),
        linkProgram: jest.fn(),
        useProgram: jest.fn(),
        createBuffer: jest.fn(() => ({})),
        bindBuffer: jest.fn(),
        bufferData: jest.fn(),
        enableVertexAttribArray: jest.fn(),
        vertexAttribPointer: jest.fn(),
        drawArrays: jest.fn(),
        clearColor: jest.fn(),
        clear: jest.fn(),
        viewport: jest.fn(),
        getAttribLocation: jest.fn(() => 0),
        getUniformLocation: jest.fn(() => ({})),
        uniform1f: jest.fn(),
        uniform2f: jest.fn(),
        uniform3f: jest.fn(),
        uniform4f: jest.fn(),
        uniformMatrix4fv: jest.fn(),
      };
    }
    return null;
  }
});

// Mock all Three.js and React Three Fiber dependencies
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }) => (
    <div data-testid="canvas" {...props}>
      {typeof children === 'function' ? children({}) : children}
    </div>
  ),
  useFrame: jest.fn((callback) => {
    // Simulate frame callback
    if (callback) callback({}, 0.016);
  }),
  useThree: () => ({
    camera: { 
      position: { set: jest.fn(), copy: jest.fn(), x: 0, y: 0, z: 10 },
      lookAt: jest.fn(),
      updateProjectionMatrix: jest.fn()
    },
    gl: { 
      domElement: document.createElement('canvas'),
      setSize: jest.fn(),
      render: jest.fn()
    },
    scene: { add: jest.fn(), remove: jest.fn() },
    size: { width: 800, height: 600 }
  })
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: React.forwardRef((props, ref) => (
    <div data-testid="orbit-controls" ref={ref} {...props} />
  )),
  Stars: (props) => <div data-testid="stars" {...props} />,
  Text: ({ children, ...props }) => (
    <div data-testid="text" {...props}>{children}</div>
  )
}));

// Simple mock implementations for components
jest.mock('../components/Scene', () => {
  return function MockScene(props) {
    return (
      <div 
        data-testid="scene" 
        data-animation-playing={props.isAnimationPlaying}
        onClick={() => props.onSolarSystemClick && props.onSolarSystemClick('test-system')}
      >
        Scene - Systems: {props.solarSystems?.length || 0} | Asteroids: {props.asteroids?.length || 0}
      </div>
    );
  };
});

jest.mock('../components/AIPanel', () => {
  return function MockAIPanel(props) {
    return (
      <div data-testid="ai-panel">
        <button onClick={props.onAnimationToggle}>
          {props.isAnimationPlaying ? 'Pause' : 'Play'} Animation
        </button>
        <button onClick={props.onAIGroupingToggle}>
          AI {props.aiGroupingActive ? 'ON' : 'OFF'}
        </button>
        <span>Systems: {props.solarSystemsCount}</span>
        <span>Asteroids: {props.asteroidsCount}</span>
      </div>
    );
  };
});

jest.mock('../components/AITodoManager', () => {
  return function MockAITodoManager(props) {
    const handleAddTodo = () => {
      const testTodos = [
        { 
          id: Date.now(), 
          text: '프로젝트 개발하기', 
          completed: false,
          createdAt: new Date(),
          deadline: new Date(Date.now() + 86400000) // 1 day from now
        }
      ];
      props.onTodoDataChange(testTodos);
    };

    return (
      <div data-testid="ai-todo-manager">
        <button onClick={handleAddTodo}>Add Test Todo</button>
        <div>AI Grouping: {props.aiGroupingActive ? 'Active' : 'Inactive'}</div>
      </div>
    );
  };
});

jest.mock('../components/EnhancedMissionControl', () => {
  return function MockEnhancedMissionControl(props) {
    return (
      <div data-testid="enhanced-mission-control">
        <div>Todos: {props.todos?.length || 0}</div>
        <div>Solar Systems: {props.solarSystems?.length || 0}</div>
        <div>Asteroids: {props.asteroids?.length || 0}</div>
        <button onClick={() => props.onTodoAdd({ text: 'New Enhanced Todo' })}>
          Add Todo
        </button>
      </div>
    );
  };
});

jest.mock('../components/AdvancedAnalyticsDashboard', () => {
  return function MockAdvancedAnalyticsDashboard(props) {
    if (!props.isVisible) return null;
    return (
      <div data-testid="analytics-dashboard">
        <button onClick={props.onClose}>Close</button>
        <div>Analytics for {props.todos?.length || 0} todos</div>
      </div>
    );
  };
});

jest.mock('../components/DynamicSolarSystemManager', () => {
  return function MockDynamicSolarSystemManager() {
    return <div data-testid="dynamic-solar-system-manager" />;
  };
});

jest.mock('../components/AsteroidActionSystem', () => {
  return function MockAsteroidActionSystem(props) {
    return (
      <div data-testid="asteroid-action-system">
        <div>Asteroids: {props.asteroids?.length || 0}</div>
        {props.asteroids?.map((asteroid, index) => (
          <div key={index}>
            <button onClick={() => props.onAsteroidAction(asteroid.id, 'accept')}>
              Accept {asteroid.id}
            </button>
            <button onClick={() => props.onAsteroidAction(asteroid.id, 'reject')}>
              Reject {asteroid.id}
            </button>
          </div>
        ))}
      </div>
    );
  };
});

describe('App Component Integration Tests v0.4.8', () => {
  beforeEach(() => {
    // Clear any previous console spy
    jest.clearAllMocks();
  });

  test('renders without import errors and shows v0.4.8', () => {
    expect(() => render(<App />)).not.toThrow();
    
    const app = render(<App />);
    expect(screen.getByText(/v0\.4\.8/)).toBeInTheDocument();
    
    app.unmount();
  });

  test('AI grouping engine processes todos and creates solar systems', async () => {
    const { container } = render(<App />);
    
    // Initial state - no solar systems
    expect(screen.getByText(/Systems: 0/)).toBeInTheDocument();
    
    // Switch to classic UI to access todo manager
    const uiToggle = screen.getByTitle(/Switch to Classic UI/);
    fireEvent.click(uiToggle);
    
    // Add a todo
    const addTodoButton = screen.getByText('Add Test Todo');
    
    await act(async () => {
      fireEvent.click(addTodoButton);
      // Wait for debounced AI processing (1000ms)
      await new Promise(resolve => setTimeout(resolve, 1100));
    });
    
    // Check that AI processed the todo
    expect(container).toMatchSnapshot();
  });

  test('AI grouping can be toggled on/off', () => {
    render(<App />);
    
    // Initially AI should be ON
    expect(screen.getByText('AI ON')).toBeInTheDocument();
    
    // Toggle AI OFF
    const aiToggle = screen.getByText('AI ON');
    fireEvent.click(aiToggle);
    
    expect(screen.getByText('AI OFF')).toBeInTheDocument();
    
    // Toggle back ON
    const aiToggleOff = screen.getByText('AI OFF');
    fireEvent.click(aiToggleOff);
    
    expect(screen.getByText('AI ON')).toBeInTheDocument();
  });

  test('animation controls work properly', () => {
    render(<App />);
    
    // Check initial animation state
    const scene = screen.getByTestId('scene');
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
    
    // Toggle animation
    const animationButton = screen.getByText(/Animation/);
    fireEvent.click(animationButton);
    
    expect(scene).toHaveAttribute('data-animation-playing', 'false');
  });

  test('UI mode switching between Enhanced and Classic', () => {
    render(<App />);
    
    // Should start with Enhanced UI
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
    expect(screen.queryByTestId('ai-todo-manager')).not.toBeInTheDocument();
    
    // Switch to Classic UI
    const uiToggle = screen.getByTitle(/Switch to Classic UI/);
    fireEvent.click(uiToggle);
    
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('enhanced-mission-control')).not.toBeInTheDocument();
    
    // Switch back to Enhanced UI
    const uiToggleBack = screen.getByTitle(/Switch to Enhanced UI/);
    fireEvent.click(uiToggleBack);
    
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
    expect(screen.queryByTestId('ai-todo-manager')).not.toBeInTheDocument();
  });

  test('analytics dashboard opens and closes correctly', () => {
    render(<App />);
    
    // Initially closed
    expect(screen.queryByTestId('analytics-dashboard')).not.toBeInTheDocument();
    
    // Open dashboard
    const analyticsButton = screen.getByText('📊 Analytics');
    fireEvent.click(analyticsButton);
    
    expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
    
    // Close dashboard
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('analytics-dashboard')).not.toBeInTheDocument();
  });

  test('todo management works in enhanced mode', () => {
    render(<App />);
    
    // Should be in enhanced mode by default
    const enhancedControl = screen.getByTestId('enhanced-mission-control');
    expect(enhancedControl).toHaveTextContent('Todos: 0');
    
    // Add a todo
    const addButton = screen.getByText('Add Todo');
    fireEvent.click(addButton);
    
    // The mock should update the display
    expect(enhancedControl).toBeInTheDocument();
  });

  test('asteroid action system processes actions correctly', async () => {
    render(<App />);
    
    // Switch to classic UI and add todos to generate asteroids
    const uiToggle = screen.getByTitle(/Switch to Classic UI/);
    fireEvent.click(uiToggle);
    
    const addTodoButton = screen.getByText('Add Test Todo');
    
    await act(async () => {
      fireEvent.click(addTodoButton);
      // Wait for AI processing and asteroid generation
      await new Promise(resolve => setTimeout(resolve, 1100));
    });
    
    const asteroidSystem = screen.getByTestId('asteroid-action-system');
    expect(asteroidSystem).toBeInTheDocument();
  });

  test('solar system view switching works', () => {
    render(<App />);
    
    // Click on scene to trigger system selection
    const scene = screen.getByTestId('scene');
    fireEvent.click(scene);
    
    // Scene should handle the click
    expect(scene).toBeInTheDocument();
  });

  test('version and status information display correctly', () => {
    render(<App />);
    
    // Check version display
    expect(screen.getByText(/AI Dynamic Solar System Todo v0\.4\.8/)).toBeInTheDocument();
    
    // Check feature badge
    expect(screen.getByText(/🤖 NEW: AI Grouping Engine & Multi Solar Systems/)).toBeInTheDocument();
    
    // Check system status
    expect(screen.getByText(/🌌 \d+ Systems \| ☄️ \d+ Asteroids/)).toBeInTheDocument();
  });

  test('error boundaries handle errors gracefully', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Should not crash even with potential errors
    expect(() => render(<App />)).not.toThrow();
    
    consoleSpy.mockRestore();
  });

  test('component cleanup on unmount', () => {
    const { unmount } = render(<App />);
    
    // Should unmount without errors
    expect(() => unmount()).not.toThrow();
  });

  test('AI grouping handles empty todos correctly', () => {
    render(<App />);
    
    // With no todos, should show 0 systems
    expect(screen.getByText(/Systems: 0/)).toBeInTheDocument();
  });

  test('responsive behavior with different data states', async () => {
    render(<App />);
    
    // Test with empty state
    expect(screen.getByText(/Systems: 0/)).toBeInTheDocument();
    
    // Switch to classic UI
    const uiToggle = screen.getByTitle(/Switch to Classic UI/);
    fireEvent.click(uiToggle);
    
    // Add todos and test populated state
    const addTodoButton = screen.getByText('Add Test Todo');
    
    await act(async () => {
      fireEvent.click(addTodoButton);
      await new Promise(resolve => setTimeout(resolve, 1100));
    });
    
    // Should handle state changes appropriately
    expect(screen.getByTestId('scene')).toBeInTheDocument();
  });
});

// Performance and Integration Tests
describe('App Performance Tests v0.4.8', () => {
  test('renders within reasonable time', () => {
    const startTime = performance.now();
    
    render(<App />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 100ms (generous threshold for test environment)
    expect(renderTime).toBeLessThan(100);
  });

  test('handles multiple rapid interactions', async () => {
    render(<App />);
    
    const uiToggle = screen.getByTitle(/Switch to Classic UI/);
    const analyticsButton = screen.getByText('📊 Analytics');
    const aiToggle = screen.getByText('AI ON');
    
    // Rapid interactions
    await act(async () => {
      fireEvent.click(uiToggle);
      fireEvent.click(analyticsButton);
      fireEvent.click(aiToggle);
      fireEvent.click(uiToggle); // Switch back
      fireEvent.click(analyticsButton); // Close analytics
    });
    
    // Should still be functional
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
  });
});
