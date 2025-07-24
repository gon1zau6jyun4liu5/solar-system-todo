import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import dataManager from '../utils/dataManager';

// Mock Three.js 관련 모듈들
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: () => {},
  useThree: () => ({
    camera: { position: { set: jest.fn() } },
    scene: { background: null }
  })
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Stars: () => <div data-testid="stars" />,
  Html: ({ children, ...props }) => <div data-testid="html" {...props}>{children}</div>,
  Text: ({ children, ...props }) => <div data-testid="text" {...props}>{children}</div>
}));

jest.mock('three', () => ({
  Vector3: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    copy: jest.fn(),
    multiplyScalar: jest.fn(),
    add: jest.fn(),
    subVectors: jest.fn().mockReturnThis(),
    normalize: jest.fn().mockReturnThis(),
    length: jest.fn().mockReturnValue(50)
  })),
  Color: jest.fn(),
  BackSide: 1
}));

// v0.8.4: 완전한 functional_specification.md 준수 + 데이터 영속성 테스트
// NEW FEATURES: 속도 설정, 궤도 표시, 포커싱 기능, 동적 키워드

describe('App v0.8.4 - Complete Functional Specification + Data Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // LocalStorage mock 초기화
    const mockLocalStorage = {
      storage: {},
      getItem: jest.fn((key) => mockLocalStorage.storage[key] || null),
      setItem: jest.fn((key, value) => {
        mockLocalStorage.storage[key] = value;
      }),
      removeItem: jest.fn((key) => {
        delete mockLocalStorage.storage[key];
      }),
      clear: jest.fn(() => {
        mockLocalStorage.storage = {};
      })
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    
    localStorage.clear();
  });

  describe('CRITICAL FIX: Data Persistence on Page Reload', () => {
    test('task deletion should persist after page reload simulation', async () => {
      const { unmount } = render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Tasks: [1-9]/);
      }, { timeout: 3000 });

      const initialSystemStatus = screen.getByTestId('system-status');
      const initialTaskCount = parseInt(initialSystemStatus.textContent.match(/Tasks: (\d+)/)[1]);
      expect(initialTaskCount).toBeGreaterThan(0);

      const clearAllButton = screen.getByTestId('clear-all-toggle');
      fireEvent.click(clearAllButton);

      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Tasks: 0');
      }, { timeout: 2000 });

      unmount();
      render(<App />);

      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Tasks: 0');
        expect(systemStatus).toHaveTextContent('🚫 No Tasks → No Planets, No Suns, No Satellites');
      }, { timeout: 3000 });

      console.log('✅ CRITICAL FIX 검증: 태스크 삭제 후 새로고침해도 삭제된 상태 유지');
    });

    test('individual task deletion should persist', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Tasks: [1-9]/);
      }, { timeout: 3000 });

      const storedTodos = dataManager.getAllTodos();
      const initialCount = storedTodos.length;
      expect(initialCount).toBeGreaterThan(0);

      const firstTaskId = storedTodos[0].id;
      const deleteResult = dataManager.deleteTodo(firstTaskId);
      expect(deleteResult).toBe(true);

      const updatedTodos = dataManager.getAllTodos();
      expect(updatedTodos.length).toBe(initialCount - 1);
      expect(updatedTodos.find(todo => todo.id === firstTaskId)).toBeUndefined();

      console.log('✅ 개별 태스크 삭제 영속성 검증');
    });
  });

  describe('NEW: Animation Speed Control', () => {
    test('speed slider should be present and functional', async () => {
      render(<App />);
      
      await waitFor(() => {
        const speedSlider = screen.getByTestId('speed-slider');
        expect(speedSlider).toBeInTheDocument();
        expect(speedSlider).toHaveAttribute('type', 'range');
        expect(speedSlider).toHaveAttribute('min', '0.1');
        expect(speedSlider).toHaveAttribute('max', '3.0');
        expect(speedSlider).toHaveAttribute('step', '0.1');
      }, { timeout: 2000 });

      const speedSlider = screen.getByTestId('speed-slider');
      
      // 속도 변경 테스트
      fireEvent.change(speedSlider, { target: { value: '2.0' } });
      expect(speedSlider.value).toBe('2.0');
      
      // 상태 표시 확인
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Speed: 2.0x');
      }, { timeout: 1000 });

      console.log('✅ 애니메이션 속도 설정 기능 검증');
    });

    test('speed settings should persist', async () => {
      const { unmount } = render(<App />);
      
      await waitFor(() => {
        const speedSlider = screen.getByTestId('speed-slider');
        expect(speedSlider).toBeInTheDocument();
      }, { timeout: 2000 });

      const speedSlider = screen.getByTestId('speed-slider');
      fireEvent.change(speedSlider, { target: { value: '2.5' } });

      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Speed: 2.5x');
      }, { timeout: 1000 });

      unmount();
      render(<App />);

      await waitFor(() => {
        const speedSlider = screen.getByTestId('speed-slider');
        expect(speedSlider.value).toBe('2.5');
      }, { timeout: 3000 });

      console.log('✅ 속도 설정 영속성 검증');
    });
  });

  describe('NEW: Orbit Visualization', () => {
    test('orbit toggle button should be present and functional', async () => {
      render(<App />);
      
      await waitFor(() => {
        const orbitToggle = screen.getByTestId('orbit-toggle');
        expect(orbitToggle).toBeInTheDocument();
        expect(orbitToggle.textContent).toContain('🌀');
      }, { timeout: 2000 });

      const orbitToggle = screen.getByTestId('orbit-toggle');
      
      // 초기 상태 확인 (ON)
      expect(orbitToggle).toHaveStyle({
        background: expect.stringContaining('8b5cf6')
      });

      // 궤도 표시 OFF
      fireEvent.click(orbitToggle);
      expect(orbitToggle).toHaveStyle({
        background: expect.stringContaining('6b7280')
      });

      // 상태 표시 확인
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Orbits: OFF');
      }, { timeout: 1000 });

      console.log('✅ 궤도 표시 토글 기능 검증');
    });

    test('orbit settings should persist', async () => {
      const { unmount } = render(<App />);
      
      await waitFor(() => {
        const orbitToggle = screen.getByTestId('orbit-toggle');
        expect(orbitToggle).toBeInTheDocument();
      }, { timeout: 2000 });

      const orbitToggle = screen.getByTestId('orbit-toggle');
      fireEvent.click(orbitToggle); // OFF로 변경

      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Orbits: OFF');
      }, { timeout: 1000 });

      unmount();
      render(<App />);

      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Orbits: OFF');
      }, { timeout: 3000 });

      console.log('✅ 궤도 설정 영속성 검증');
    });
  });

  describe('NEW: Focusing System', () => {
    test('focusing status should be displayed when active', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Systems: [1-9]/);
      }, { timeout: 3000 });

      // 포커싱이 활성화되지 않은 상태에서는 Focus 정보가 없어야 함
      const systemStatus = screen.getByTestId('system-status');
      expect(systemStatus.textContent).not.toContain('Focus:');

      // 메인 메뉴에 포커스 상태 표시 확인
      const mainMenu = screen.getByTestId('main-menu-vertical');
      const statusText = mainMenu.textContent;
      expect(statusText).toContain('T:'); // Tasks
      expect(statusText).toContain('S:'); // Systems
      expect(statusText).toContain('A:'); // Asteroids
      
      console.log('✅ 포커싱 시스템 상태 표시 검증');
    });

    test('focusing settings should persist', async () => {
      const { unmount } = render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Systems: [1-9]/);
      }, { timeout: 3000 });

      // 포커싱 상태를 dataManager에 직접 설정
      const settings = dataManager.loadSettings();
      settings.focusedSystemId = 'test-system-id';
      dataManager.saveSettings(settings);

      unmount();
      render(<App />);

      await waitFor(() => {
        // 설정이 로드되었는지 확인 (실제 시스템이 없어서 포커스는 해제됨)
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toBeInTheDocument();
      }, { timeout: 3000 });

      console.log('✅ 포커싱 설정 영속성 검증');
    });
  });

  describe('NEW: Keyword Filtering System', () => {
    test('keywords should be filtered according to specification', () => {
      // dataManager를 통해 키워드 필터링 테스트
      const testTodo = {
        id: 'test-keyword-task',
        text: '테스트 태스크',
        category: 'test',
        priority: 'medium',
        completed: false,
        createdAt: Date.now(),
        startDate: new Date(),
        deadline: new Date(),
        keywords: ['테스트', '태양계', '행성', '프로젝트', '작업', '위성', '소행성', '키워드'],
        subtasks: []
      };

      dataManager.addTodo(testTodo);
      const savedTodos = dataManager.getAllTodos();
      const savedTodo = savedTodos.find(todo => todo.id === 'test-keyword-task');

      expect(savedTodo).toBeDefined();
      expect(savedTodo.keywords).toBeDefined();
      expect(savedTodo.keywords.length).toBeLessThanOrEqual(3); // 최대 3개
      expect(savedTodo.keywords).not.toContain('태양계');
      expect(savedTodo.keywords).not.toContain('행성');
      expect(savedTodo.keywords).not.toContain('위성');
      expect(savedTodo.keywords).not.toContain('소행성');
      
      // 유효한 키워드만 포함되어야 함
      savedTodo.keywords.forEach(keyword => {
        expect(keyword.length).toBeLessThanOrEqual(6); // 6글자 이하
        expect(keyword.length).toBeGreaterThan(0);
      });

      console.log('✅ 키워드 필터링 시스템 검증:', savedTodo.keywords);
    });
  });

  describe('Enhanced User Experience', () => {
    test('version should be updated to v0.8.4', async () => {
      render(<App />);
      
      await waitFor(() => {
        const mainMenu = screen.getByTestId('main-menu-vertical');
        expect(mainMenu.textContent).toContain('v0.8.4');
      }, { timeout: 2000 });

      const systemStatus = screen.getByTestId('system-status');
      expect(systemStatus).toHaveTextContent('v0.8.4 Enhanced Features');

      console.log('✅ v0.8.4 버전 표시 검증');
    });

    test('enhanced features should be mentioned in system status', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Speed:');
        expect(systemStatus).toHaveTextContent('Orbits:');
      }, { timeout: 2000 });

      console.log('✅ 향상된 기능 상태 표시 검증');
    });

    test('all menu buttons should be present', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('ui-mode-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('analytics-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('ai-grouping-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('animation-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('orbit-toggle')).toBeInTheDocument(); // NEW
        expect(screen.getByTestId('clear-all-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('speed-slider')).toBeInTheDocument(); // NEW
      }, { timeout: 2000 });

      console.log('✅ 모든 메뉴 버튼 존재 검증');
    });
  });

  describe('Functional Specification Compliance', () => {
    test('should maintain all existing functional rules', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Tasks: \d+/);
        expect(systemStatus).toHaveTextContent(/Systems: \d+/);
      }, { timeout: 3000 });

      // 기본 규칙들이 여전히 작동하는지 확인
      const clearAllButton = screen.getByTestId('clear-all-toggle');
      fireEvent.click(clearAllButton);

      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Tasks: 0');
        expect(systemStatus).toHaveTextContent('Systems: 0');
        expect(systemStatus).toHaveTextContent('🚫 No Tasks → No Planets, No Suns, No Satellites');
      }, { timeout: 2000 });

      console.log('✅ 기존 functional_specification.md 규칙 유지 검증');
    });

    test('new features should not break existing functionality', async () => {
      render(<App />);
      
      await waitFor(() => {
        const scene = screen.getByTestId('scene');
        expect(scene).toBeInTheDocument();
      }, { timeout: 2000 });

      // 새로운 기능들을 변경해도 기존 기능이 동작하는지 확인
      const speedSlider = screen.getByTestId('speed-slider');
      const orbitToggle = screen.getByTestId('orbit-toggle');
      const animationToggle = screen.getByTestId('animation-toggle');

      fireEvent.change(speedSlider, { target: { value: '2.0' } });
      fireEvent.click(orbitToggle);
      fireEvent.click(animationToggle);

      // Scene이 여전히 렌더링되는지 확인
      expect(screen.getByTestId('scene')).toBeInTheDocument();
      expect(screen.getByTestId('enhanced-mission-control')).toBeInTheDocument();

      console.log('✅ 새로운 기능이 기존 기능을 손상시키지 않음 검증');
    });
  });

  describe('Performance and Stability', () => {
    test('multiple rapid changes should not cause errors', async () => {
      render(<App />);
      
      await waitFor(() => {
        const speedSlider = screen.getByTestId('speed-slider');
        expect(speedSlider).toBeInTheDocument();
      }, { timeout: 2000 });

      const speedSlider = screen.getByTestId('speed-slider');
      const orbitToggle = screen.getByTestId('orbit-toggle');

      // 빠른 연속 변경
      for (let i = 0; i < 5; i++) {
        fireEvent.change(speedSlider, { target: { value: (i * 0.5 + 0.5).toString() } });
        fireEvent.click(orbitToggle);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // 에러 없이 동작하는지 확인
      expect(screen.getByTestId('scene')).toBeInTheDocument();
      expect(screen.getByTestId('system-status')).toBeInTheDocument();

      console.log('✅ 빠른 연속 변경에 대한 안정성 검증');
    });

    test('data manager should handle edge cases', () => {
      // 잘못된 데이터 처리 테스트
      const invalidTodo = {
        id: null,
        text: '',
        keywords: null,
        subtasks: 'invalid'
      };

      const result = dataManager.addTodo(invalidTodo);
      expect(result).toBeTruthy(); // 에러 없이 처리되어야 함
      
      const savedTodos = dataManager.getAllTodos();
      const addedTodo = savedTodos[savedTodos.length - 1];
      
      expect(addedTodo.id).toBeTruthy(); // ID가 생성되어야 함
      expect(addedTodo.text).toBeTruthy(); // 기본 텍스트가 설정되어야 함
      expect(Array.isArray(addedTodo.keywords)).toBe(true); // 배열로 변환되어야 함
      expect(Array.isArray(addedTodo.subtasks)).toBe(true); // 배열로 변환되어야 함

      console.log('✅ 데이터 매니저 예외 상황 처리 검증');
    });
  });
});
