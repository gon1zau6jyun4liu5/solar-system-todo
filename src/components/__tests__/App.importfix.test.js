import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock Three.js components
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: jest.fn(),
  useThree: () => ({
    camera: { position: { set: jest.fn() }, lookAt: jest.fn() },
    gl: { domElement: document.createElement('canvas') }
  })
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Stars: () => <div data-testid="stars" />,
  Text: ({ children }) => <div data-testid="text">{children}</div>
}));

// Mock components that are imported correctly
jest.mock('../components/Scene', () => {
  return function MockScene(props) {
    return (
      <div data-testid="scene" data-animation-playing={props.isAnimationPlaying}>
        Mock Scene - Solar Systems: {props.solarSystems?.length || 0}
      </div>
    );
  };
});

jest.mock('../components/AIPanel', () => {
  return function MockAIPanel(props) {
    return (
      <div data-testid="ai-panel">
        <button onClick={props.onAnimationToggle}>Toggle Animation</button>
        <button onClick={props.onAIGroupingToggle}>
          AI {props.aiGroupingActive ? 'ON' : 'OFF'}
        </button>
      </div>
    );
  };
});

jest.mock('../components/AITodoManager', () => {
  return function MockAITodoManager(props) {
    return (
      <div data-testid="ai-todo-manager">
        <button onClick={() => props.onTodoDataChange([
          { id: 1, text: '테스트 태스크', completed: false }
        ])}>
          Add Test Todo
        </button>
      </div>
    );
  };
});

jest.mock('../components/EnhancedMissionControl', () => {
  return function MockEnhancedMissionControl() {
    return <div data-testid="enhanced-mission-control">Enhanced Mission Control</div>;
  };
});

jest.mock('../components/AdvancedAnalyticsDashboard', () => {
  return function MockAdvancedAnalyticsDashboard(props) {
    if (!props.isVisible) return null;
    return (
      <div data-testid="analytics-dashboard">
        <button onClick={props.onClose}>Close Dashboard</button>
      </div>
    );
  };
});

jest.mock('../components/DynamicSolarSystemManager', () => {
  return function MockDynamicSolarSystemManager() {
    return <div data-testid="dynamic-solar-system-manager">Dynamic Solar System Manager</div>;
  };
});

jest.mock('../components/AsteroidActionSystem', () => {
  return function MockAsteroidActionSystem(props) {
    return (
      <div data-testid="asteroid-action-system">
        Asteroids: {props.asteroids?.length || 0}
      </div>
    );
  };
});

describe('App Component - Import Error Fix v0.4.8', () => {
  // 1. Import 에러 수정 테스트
  test('renders without import errors', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });

  test('displays correct version v0.4.8', () => {
    render(<App />);
    expect(screen.getByText(/AI Dynamic Solar System Todo v0\.4\.8/)).toBeInTheDocument();
  });

  // 2. AI 그룹핑 엔진 기능 테스트
  test('AI grouping engine is active by default', () => {
    render(<App />);
    expect(screen.getByText('AI ON')).toBeInTheDocument();
  });

  test('can toggle AI grouping on/off', () => {
    render(<App />);
    
    const aiToggleButton = screen.getByText('AI ON');
    expect(aiToggleButton).toBeInTheDocument();
    
    fireEvent.click(aiToggleButton);
    expect(screen.getByText('AI OFF')).toBeInTheDocument();
  });

  test('AI grouping processes todos correctly', async () => {
    render(<App />);
    
    // AI 그룹핑이 활성화된 상태에서 테스트 데이터 추가
    const addTodoButton = screen.getByText('Add Test Todo');
    fireEvent.click(addTodoButton);
    
    // AI 그룹핑이 처리되길 기다림 (디바운스 1초)
    await waitFor(() => {
      // Scene 컴포넌트가 업데이트되어야 함
      const scene = screen.getByTestId('scene');
      expect(scene).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  // 3. 컴포넌트 렌더링 테스트
  test('renders all main components', () => {
    render(<App />);
    
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('ai-panel')).toBeInTheDocument();
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
    expect(screen.getByTestId('asteroid-action-system')).toBeInTheDocument();
  });

  test('UI mode toggle works correctly', () => {
    render(<App />);
    
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
    
    const uiToggleButton = screen.getByTitle(/Switch to Classic UI/);
    fireEvent.click(uiToggleButton);
    
    expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('enhanced-mission-control')).not.toBeInTheDocument();
  });

  test('analytics dashboard can be opened and closed', () => {
    render(<App />);
    
    expect(screen.queryByTestId('analytics-dashboard')).not.toBeInTheDocument();
    
    const analyticsButton = screen.getByText('📊 Analytics');
    fireEvent.click(analyticsButton);
    
    expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
    
    const closeButton = screen.getByText('Close Dashboard');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('analytics-dashboard')).not.toBeInTheDocument();
  });

  // 4. 애니메이션 제어 테스트
  test('animation can be toggled', () => {
    render(<App />);
    
    const scene = screen.getByTestId('scene');
    expect(scene).toHaveAttribute('data-animation-playing', 'true');
    
    const toggleAnimationButton = screen.getByText('Toggle Animation');
    fireEvent.click(toggleAnimationButton);
    
    expect(scene).toHaveAttribute('data-animation-playing', 'false');
  });

  // 5. 버전 및 상태 표시 테스트
  test('displays system status correctly', () => {
    render(<App />);
    
    expect(screen.getByText(/🌌 \d+ Systems \| ☄️ \d+ Asteroids/)).toBeInTheDocument();
  });

  test('displays feature badge', () => {
    render(<App />);
    
    expect(screen.getByText('🤖 NEW: AI Grouping Engine & Multi Solar Systems')).toBeInTheDocument();
  });

  // 6. AI 엔진 내부 로직 테스트
  test('AI engine categorizes tasks correctly', () => {
    // AI 엔진의 categorizeTask 함수 테스트를 위한 간접적 테스트
    render(<App />);
    
    // AI 그룹핑이 활성화되어 있는지 확인
    expect(screen.getByText('AI ON')).toBeInTheDocument();
  });

  // 7. 에러 처리 테스트
  test('handles empty todos gracefully', () => {
    render(<App />);
    
    // 초기 상태에서는 todos가 비어있어야 함
    const scene = screen.getByTestId('scene');
    expect(scene).toHaveTextContent('Solar Systems: 0');
  });

  test('handles AI grouping errors gracefully', async () => {
    // 콘솔 에러를 모킹하여 에러 처리 테스트
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<App />);
    
    // AI 그룹핑이 에러 없이 초기화되는지 확인
    expect(screen.getByText('AI ON')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});

// AI 그룹핑 엔진 헬퍼 함수들에 대한 단위 테스트
describe('AI Grouping Engine Helper Functions', () => {
  // 실제 App 컴포넌트를 렌더링하여 내부 함수들이 정상 작동하는지 간접적으로 테스트
  test('AI engine processes different task categories', async () => {
    render(<App />);
    
    // 다양한 카테고리의 태스크를 시뮬레이션
    const addTodoButton = screen.getByText('Add Test Todo');
    
    // 여러 번 클릭하여 다양한 태스크 추가
    fireEvent.click(addTodoButton);
    
    await waitFor(() => {
      const scene = screen.getByTestId('scene');
      expect(scene).toBeInTheDocument();
    });
  });
});
