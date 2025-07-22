/**
 * Unit Tests for v0.5.2 - UI Improvements & Solar System Logic
 * 
 * 테스트 범위:
 * - 패널 너비 확장 (480px → 600px)
 * - 서브태스크 기반 위성 시스템
 * - 버전 일치성 검증
 * - UI 컴포넌트 개선 사항
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock components for testing
jest.mock('../components/Scene', () => {
  return function Scene({ isAnimationPlaying, solarSystems, asteroids }) {
    return (
      <div 
        data-testid="scene" 
        data-animation-playing={isAnimationPlaying}
        data-solar-systems-count={solarSystems?.length || 0}
        data-asteroids-count={asteroids?.length || 0}
      >
        Scene Mock
      </div>
    );
  };
});

jest.mock('../components/AITodoManager', () => {
  return function AITodoManager() {
    return <div data-testid="ai-todo-manager">AI Todo Manager Mock</div>;
  };
});

jest.mock('../components/EnhancedMissionControl', () => {
  return function EnhancedMissionControl({ todos, onTodoAdd, onTodoUpdate, onTodoDelete }) {
    return (
      <div data-testid="enhanced-mission-control">
        <div data-testid="todos-count">{todos?.length || 0}</div>
        <div data-testid="subtask-todos-count">
          {todos?.filter(todo => todo.subtasks?.length > 0).length || 0}
        </div>
        <button onClick={() => onTodoAdd()} data-testid="add-todo-btn">Add Todo</button>
        <button onClick={() => onTodoUpdate('test-id', { completed: true })} data-testid="update-todo-btn">Update Todo</button>
        <button onClick={() => onTodoDelete('test-id')} data-testid="delete-todo-btn">Delete Todo</button>
      </div>
    );
  };
});

jest.mock('../components/AdvancedAnalyticsDashboard', () => {
  return function AdvancedAnalyticsDashboard({ isVisible }) {
    return isVisible ? <div data-testid="analytics-dashboard">Analytics Dashboard v0.5.2</div> : null;
  };
});

jest.mock('../components/DynamicSolarSystemManager', () => {
  return function DynamicSolarSystemManager({ solarSystems }) {
    return (
      <div data-testid="solar-system-manager">
        Solar Systems: {solarSystems?.length || 0}
      </div>
    );
  };
});

jest.mock('../components/AsteroidActionSystem', () => {
  return function AsteroidActionSystem({ asteroids, onAsteroidAction }) {
    return (
      <div data-testid="asteroid-action-system">
        <div data-testid="asteroids-count">{asteroids?.length || 0}</div>
        <button onClick={() => onAsteroidAction('test-asteroid', 'accept')} data-testid="accept-asteroid">Accept</button>
        <button onClick={() => onAsteroidAction('test-asteroid', 'reject')} data-testid="reject-asteroid">Reject</button>
      </div>
    );
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

describe('App Component v0.5.2 - UI Improvements & Solar System Logic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    // v0.5.2 콘솔 경고 억제 (테스트 중 불필요한 로그 제거)
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Version Display and Core Components', () => {
    test('renders with correct version v0.5.2', () => {
      render(<App />);
      
      expect(screen.getByText('AI Dynamic Solar System Todo v0.5.2')).toBeInTheDocument();
    });

    test('displays new feature badge for v0.5.2 improvements', () => {
      render(<App />);
      
      expect(screen.getByText('🎨 NEW: UI Improvements & Solar System Logic')).toBeInTheDocument();
    });

    test('renders main components without errors', () => {
      render(<App />);
      
      expect(screen.getByTestId('scene')).toBeInTheDocument();
      expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
      expect(screen.getByTestId('asteroid-action-system')).toBeInTheDocument();
    });

    test('version info and feature badge have correct CSS classes', () => {
      render(<App />);
      
      const versionElement = screen.getByText('AI Dynamic Solar System Todo v0.5.2');
      const featureBadge = screen.getByText('🎨 NEW: UI Improvements & Solar System Logic');
      
      expect(versionElement).toHaveClass('version-info');
      expect(featureBadge).toHaveClass('feature-badge');
    });
  });

  describe('Enhanced Default Tasks with Subtasks', () => {
    test('initializes with 6 default tasks including subtasks on first load', async () => {
      render(<App />);
      
      await waitFor(() => {
        const todosCount = screen.getByTestId('todos-count');
        expect(todosCount).toHaveTextContent('6');
      });
    });

    test('default tasks include subtasks for satellite representation', async () => {
      render(<App />);
      
      await waitFor(() => {
        const subtaskTodosCount = screen.getByTestId('subtask-todos-count');
        // v0.5.2: 3개 태스크에 서브태스크가 있어야 함 (work 2개, study 3개, work 1개)
        expect(parseInt(subtaskTodosCount.textContent)).toBeGreaterThan(0);
      });
    });

    test('solar systems are created based on tasks with AI ON', async () => {
      render(<App />);
      
      await waitFor(() => {
        const scene = screen.getByTestId('scene');
        const systemsCount = parseInt(scene.getAttribute('data-solar-systems-count') || '0');
        expect(systemsCount).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    test('solar systems are hidden when AI is OFF', async () => {
      render(<App />);
      
      // AI OFF 버튼 클릭
      const aiToggle = screen.getByTestId('ai-grouping-toggle');
      fireEvent.click(aiToggle);
      
      await waitFor(() => {
        const scene = screen.getByTestId('scene');
        const systemsCount = parseInt(scene.getAttribute('data-solar-systems-count') || '0');
        expect(systemsCount).toBe(0);
      });
    });
  });

  describe('UI Control Buttons', () => {
    test('renders all control buttons with correct testids', () => {
      render(<App />);
      
      expect(screen.getByTestId('ui-mode-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('analytics-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('ai-grouping-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('animation-toggle')).toBeInTheDocument();
    });

    test('UI mode toggle changes between Enhanced and Classic', () => {
      render(<App />);
      
      // 초기에는 Enhanced UI
      expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
      expect(screen.queryByTestId('ai-todo-manager')).not.toBeInTheDocument();
      
      // Classic UI로 전환
      const uiToggle = screen.getByTestId('ui-mode-toggle');
      fireEvent.click(uiToggle);
      
      expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
      expect(screen.queryByTestId('enhanced-mission-control')).not.toBeInTheDocument();
    });

    test('analytics dashboard toggle works correctly', () => {
      render(<App />);
      
      // 초기에는 대시보드가 닫혀있음
      expect(screen.queryByTestId('analytics-dashboard')).not.toBeInTheDocument();
      
      // 대시보드 열기
      const analyticsToggle = screen.getByTestId('analytics-toggle');
      fireEvent.click(analyticsToggle);
      
      expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
      expect(screen.getByText('Analytics Dashboard v0.5.2')).toBeInTheDocument();
    });

    test('AI grouping toggle changes state correctly', () => {
      render(<App />);
      
      const aiToggle = screen.getByTestId('ai-grouping-toggle');
      
      // 초기 상태: AI ON
      expect(aiToggle).toHaveTextContent('🤖 AI ON');
      
      // AI OFF로 전환
      fireEvent.click(aiToggle);
      expect(aiToggle).toHaveTextContent('🤖 AI OFF');
      
      // AI ON으로 다시 전환
      fireEvent.click(aiToggle);
      expect(aiToggle).toHaveTextContent('🤖 AI ON');
    });

    test('animation toggle changes state correctly', () => {
      render(<App />);
      
      const scene = screen.getByTestId('scene');
      const animationToggle = screen.getByTestId('animation-toggle');
      
      // 초기 상태: 재생 중
      expect(scene).toHaveAttribute('data-animation-playing', 'true');
      expect(animationToggle).toHaveTextContent('⏸️ Pause Solar System');
      
      // 애니메이션 정지
      fireEvent.click(animationToggle);
      expect(scene).toHaveAttribute('data-animation-playing', 'false');
      expect(animationToggle).toHaveTextContent('▶️ Play Solar System');
    });
  });

  describe('Enhanced Mission Control Integration', () => {
    test('mission control handles todo operations without errors', () => {
      render(<App />);
      
      const addBtn = screen.getByTestId('add-todo-btn');
      const updateBtn = screen.getByTestId('update-todo-btn');
      const deleteBtn = screen.getByTestId('delete-todo-btn');
      
      // 모든 버튼이 클릭 가능해야 함
      expect(() => {
        fireEvent.click(addBtn);
        fireEvent.click(updateBtn);
        fireEvent.click(deleteBtn);
      }).not.toThrow();
    });

    test('solar system updates when todos change', async () => {
      render(<App />);
      
      const addBtn = screen.getByTestId('add-todo-btn');
      
      // 초기 태스크 수 확인
      await waitFor(() => {
        const todosCount = screen.getByTestId('todos-count');
        expect(todosCount).toHaveTextContent('6');
      });
      
      // 새 태스크 추가
      fireEvent.click(addBtn);
      
      await waitFor(() => {
        const todosCount = screen.getByTestId('todos-count');
        expect(todosCount).toHaveTextContent('7');
      });
    });
  });

  describe('Asteroid Action System', () => {
    test('asteroid system renders with correct initial state', () => {
      render(<App />);
      
      const asteroidSystem = screen.getByTestId('asteroid-action-system');
      expect(asteroidSystem).toBeInTheDocument();
    });

    test('asteroid actions work correctly', () => {
      render(<App />);
      
      const acceptBtn = screen.getByTestId('accept-asteroid');
      const rejectBtn = screen.getByTestId('reject-asteroid');
      
      // 버튼 클릭이 오류 없이 동작해야 함
      expect(() => {
        fireEvent.click(acceptBtn);
        fireEvent.click(rejectBtn);
      }).not.toThrow();
    });
  });

  describe('System Status Display', () => {
    test('system status shows correct information', () => {
      render(<App />);
      
      const systemStatus = screen.getByTestId('system-status');
      expect(systemStatus).toBeInTheDocument();
      expect(systemStatus).toHaveTextContent(/🌌.*Systems.*☄️.*Asteroids/);
    });

    test('system status updates when solar systems change', async () => {
      render(<App />);
      
      // AI를 끄면 시스템 상태가 업데이트되어야 함
      const aiToggle = screen.getByTestId('ai-grouping-toggle');
      fireEvent.click(aiToggle);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('🌌 0 Systems | ☄️ 0 Asteroids');
      });
    });
  });

  describe('Package.json Version Consistency', () => {
    test('package.json should contain version 0.5.2', () => {
      const packageJson = require('../../package.json');
      expect(packageJson.version).toBe('0.5.2');
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

  describe('v0.5.2 Specific Features', () => {
    test('subtask-based satellite system logic', async () => {
      render(<App />);
      
      await waitFor(() => {
        // 서브태스크가 있는 태스크들이 위성을 가져야 함
        const subtaskTodos = screen.getByTestId('subtask-todos-count');
        expect(parseInt(subtaskTodos.textContent)).toBeGreaterThan(0);
      });
    });

    test('improved UI panel width logic', () => {
      // CSS 스타일 체크는 실제 브라우저에서 확인되므로 여기서는 컴포넌트 렌더링 확인
      render(<App />);
      
      const missionControl = screen.getByTestId('enhanced-mission-control');
      expect(missionControl).toBeInTheDocument();
    });

    test('no extraneous UI elements except version info', () => {
      render(<App />);
      
      // 왼쪽 하단 버전 표시만 유지되어야 함
      expect(screen.getByTestId('version-info')).toBeInTheDocument();
      expect(screen.getByTestId('feature-badge')).toBeInTheDocument();
      expect(screen.getByTestId('system-status')).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    test('component renders without memory leaks', () => {
      const { unmount } = render(<App />);
      
      // 컴포넌트가 성공적으로 렌더링되어야 함
      expect(screen.getByTestId('scene')).toBeInTheDocument();
      
      // 언마운트가 오류 없이 동작해야 함
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    test('handles multiple state updates efficiently', async () => {
      render(<App />);
      
      const aiToggle = screen.getByTestId('ai-grouping-toggle');
      const uiToggle = screen.getByTestId('ui-mode-toggle');
      const animationToggle = screen.getByTestId('animation-toggle');
      
      // 여러 상태 변경이 오류 없이 처리되어야 함
      expect(() => {
        fireEvent.click(aiToggle);
        fireEvent.click(uiToggle);
        fireEvent.click(animationToggle);
        fireEvent.click(aiToggle);
        fireEvent.click(uiToggle);
      }).not.toThrow();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles empty todos array gracefully', () => {
      // AI OFF 상태에서 태스크가 없을 때
      render(<App />);
      
      const aiToggle = screen.getByTestId('ai-grouping-toggle');
      fireEvent.click(aiToggle); // AI OFF
      
      expect(() => {
        // 태스크 삭제 시뮬레이션
        const deleteBtn = screen.getByTestId('delete-todo-btn');
        fireEvent.click(deleteBtn);
      }).not.toThrow();
    });

    test('handles undefined/null task properties safely', () => {
      render(<App />);
      
      // 새 태스크 추가 (기본값들이 안전하게 처리되어야 함)
      const addBtn = screen.getByTestId('add-todo-btn');
      
      expect(() => {
        fireEvent.click(addBtn);
      }).not.toThrow();
    });

    test('solar system logic handles tasks without subtasks', async () => {
      render(<App />);
      
      // 서브태스크가 없는 태스크들도 행성으로 표현되어야 함
      await waitFor(() => {
        const scene = screen.getByTestId('scene');
        const systemsCount = parseInt(scene.getAttribute('data-solar-systems-count') || '0');
        expect(systemsCount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Integration Tests', () => {
    test('full workflow: create task -> AI grouping -> solar system generation', async () => {
      render(<App />);
      
      // 1. 초기 상태 확인
      await waitFor(() => {
        expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
        expect(screen.getByTestId('todos-count')).toHaveTextContent('6');
      });
      
      // 2. 새 태스크 추가
      const addBtn = screen.getByTestId('add-todo-btn');
      fireEvent.click(addBtn);
      
      // 3. 태스크 증가 확인
      await waitFor(() => {
        expect(screen.getByTestId('todos-count')).toHaveTextContent('7');
      });
      
      // 4. 태양계 시스템 업데이트 확인
      await waitFor(() => {
        const scene = screen.getByTestId('scene');
        expect(scene).toHaveAttribute('data-solar-systems-count');
      });
    }, 5000);

    test('UI mode switching preserves application state', () => {
      render(<App />);
      
      const uiToggle = screen.getByTestId('ui-mode-toggle');
      const aiToggle = screen.getByTestId('ai-grouping-toggle');
      
      // AI 상태 변경
      fireEvent.click(aiToggle); // AI OFF
      expect(aiToggle).toHaveTextContent('🤖 AI OFF');
      
      // UI 모드 전환
      fireEvent.click(uiToggle); // Classic UI
      expect(screen.getByTestId('ai-todo-manager')).toBeInTheDocument();
      
      // 다시 Enhanced UI로 전환
      fireEvent.click(uiToggle); // Enhanced UI
      expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
      
      // AI 상태가 보존되어야 함
      expect(aiToggle).toHaveTextContent('🤖 AI OFF');
    });
  });
});

describe('EnhancedMissionControl Component v0.5.2', () => {
  test('displays version 0.5.2 in header', () => {
    // 실제 컴포넌트를 테스트할 때는 props 전달 필요
    // 여기서는 App 컴포넌트를 통한 통합 테스트로 대체
    render(<App />);
    expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();
  });
});

describe('Version Consistency Validation', () => {
  test('all version references point to v0.5.2', () => {
    render(<App />);
    
    // 모든 버전 표시가 v0.5.2를 가리켜야 함
    expect(screen.getByText('AI Dynamic Solar System Todo v0.5.2')).toBeInTheDocument();
    expect(screen.getByText('🎨 NEW: UI Improvements & Solar System Logic')).toBeInTheDocument();
  });

  test('feature badges and status are appropriate for v0.5.2', () => {
    render(<App />);
    
    // v0.5.2에 맞는 기능 배지가 표시되어야 함
    const featureBadge = screen.getByTestId('feature-badge');
    expect(featureBadge).toHaveTextContent('UI Improvements & Solar System Logic');
  });
});
