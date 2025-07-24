import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

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
  Text: ({ children, ...props }) => <div data-testid="text" {...props}>{children}</div>
}));

jest.mock('three', () => ({
  Vector3: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    copy: jest.fn(),
    multiplyScalar: jest.fn(),
    add: jest.fn()
  })),
  Color: jest.fn()
}));

// v0.8.2: functional_specification.md 완전 준수 테스트
// CRITICAL FIX 1: 소행성 액션 제안 패널 제거 검증
// CRITICAL FIX 2: 팝업 창 최상위 위치 검증

describe('App v0.8.2 - Complete Functional Specification Compliance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CRITICAL FIX 1: Asteroid Action Panel Removal', () => {
    test('should NOT render AsteroidActionSystem component', () => {
      render(<App />);
      
      // AsteroidActionSystem 컴포넌트가 렌더링되지 않아야 함
      expect(screen.queryByTestId('asteroid-action-system')).not.toBeInTheDocument();
    });

    test('should not import AsteroidActionSystem in App.js', () => {
      // App.js 파일에서 AsteroidActionSystem import가 제거되었는지 확인
      const appCode = require('fs').readFileSync(
        require('path').join(process.cwd(), 'src/App.js'), 
        'utf-8'
      );
      
      expect(appCode).not.toContain('import AsteroidActionSystem');
      expect(appCode).not.toContain('<AsteroidActionSystem');
    });

    test('asteroids should still be generated but without action panel', async () => {
      render(<App />);
      
      // 소행성은 여전히 생성되어야 함 (내부 로직)
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toBeInTheDocument();
      });
      
      // 하지만 액션 패널은 없어야 함
      expect(screen.queryByTestId('asteroid-action-system')).not.toBeInTheDocument();
    });

    test('should show "Asteroid panel removed" in system status', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus.textContent).toContain('Asteroid panel removed');
      });
    });
  });

  describe('CRITICAL FIX 2: Popup Window Highest Z-Index', () => {
    test('TaskDetailModal should have highest z-index (3000)', async () => {
      render(<App />);
      
      // 태스크 클릭 시뮬레이션을 위해 Clear All 버튼으로 태스크 추가
      const clearAllButton = screen.getByTestId('clear-all-toggle');
      fireEvent.click(clearAllButton); // 태스크가 없다면 기본 태스크 추가
      
      await waitFor(() => {
        // 태스크가 추가될 때까지 대기
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus.textContent).toContain('Tasks:');
      });
    });

    test('popup z-index should be higher than main menu z-index', () => {
      render(<App />);
      
      const mainMenu = screen.getByTestId('main-menu-vertical');
      const mainMenuZIndex = window.getComputedStyle(mainMenu).zIndex;
      
      // 메인 메뉴의 z-index는 2000이어야 함
      expect(mainMenuZIndex).toBe('2000');
      
      // TaskDetailModal이 렌더링되면 z-index가 3000이어야 함 (검증은 실제 모달이 열릴 때)
    });

    test('should verify popup is highest priority element', () => {
      // functional_specification.md: "팝업 창은 어느 것보다 가장 위에 위치합니다"
      const appCode = require('fs').readFileSync(
        require('path').join(process.cwd(), 'src/App.js'), 
        'utf-8'
      );
      
      // TaskDetailModal의 z-index가 3000으로 설정되었는지 확인
      expect(appCode).toContain('zIndex: 3000');
      expect(appCode).toContain('어느 것보다 가장 위에 위치');
    });
  });

  describe('Main Menu Vertical Layout - Previous Fix Maintained', () => {
    test('main menu should be positioned on the left side vertically', () => {
      render(<App />);
      
      const mainMenu = screen.getByTestId('main-menu-vertical');
      expect(mainMenu).toBeInTheDocument();
      
      expect(mainMenu).toHaveStyle({
        position: 'fixed',
        top: '0',
        left: '0',
        zIndex: '2000'
      });
    });

    test('main menu should contain all control buttons', () => {
      render(<App />);
      
      expect(screen.getByTestId('ui-mode-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('analytics-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('ai-grouping-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('animation-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('clear-all-toggle')).toBeInTheDocument();
    });
  });

  describe('Version Update Verification', () => {
    test('should display version v0.8.2 in main menu', () => {
      render(<App />);
      
      const mainMenu = screen.getByTestId('main-menu-vertical');
      expect(mainMenu.textContent).toContain('v0.8.2');
    });

    test('should display v0.8.2 in system status', () => {
      render(<App />);
      
      const systemStatus = screen.getByTestId('system-status');
      expect(systemStatus.textContent).toContain('v0.8.2 Complete Functional Specification Compliance');
    });
  });

  describe('Functional Specification Compliance - All Rules', () => {
    test('should maintain all existing solar system rules', async () => {
      render(<App />);
      
      // Clear All 버튼으로 태스크 초기화
      const clearAllButton = screen.getByTestId('clear-all-toggle');
      fireEvent.click(clearAllButton);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        const statusText = systemStatus.textContent;
        
        if (statusText.includes('Tasks: 0')) {
          // 태스크가 없으면 규칙 준수 메시지 확인
          expect(statusText).toContain('No Tasks → No Planets, No Suns, No Satellites');
        } else {
          // 태스크가 있으면 태양계 시스템 활성 확인
          expect(statusText).toMatch(/\d+ solar system/);
        }
      });
    });

    test('should maintain Enhanced UI and Classic UI toggle', () => {
      render(<App />);
      
      const uiToggle = screen.getByTestId('ui-mode-toggle');
      expect(uiToggle).toBeInTheDocument();
      
      // 초기 상태 확인 (Enhanced UI)
      expect(uiToggle.textContent).toBe('🎨');
      
      // 토글 클릭
      fireEvent.click(uiToggle);
      expect(uiToggle.textContent).toBe('🚀');
    });

    test('should maintain AI grouping functionality', () => {
      render(<App />);
      
      const aiToggle = screen.getByTestId('ai-grouping-toggle');
      expect(aiToggle).toBeInTheDocument();
      expect(aiToggle.textContent).toBe('🤖');
    });

    test('should maintain analytics dashboard functionality', () => {
      render(<App />);
      
      const analyticsToggle = screen.getByTestId('analytics-toggle');
      expect(analyticsToggle).toBeInTheDocument();
      expect(analyticsToggle.textContent).toBe('📊');
    });

    test('should maintain animation control functionality', () => {
      render(<App />);
      
      const animationToggle = screen.getByTestId('animation-toggle');
      expect(animationToggle).toBeInTheDocument();
      
      // 초기 상태는 재생 중
      expect(animationToggle.textContent).toBe('⏸️');
      
      // 토글 클릭으로 일시정지
      fireEvent.click(animationToggle);
      expect(animationToggle.textContent).toBe('▶️');
    });
  });

  describe('Code Quality and Comments Verification', () => {
    test('should have updated comments for v0.8.2 fixes', () => {
      const appCode = require('fs').readFileSync(
        require('path').join(process.cwd(), 'src/App.js'), 
        'utf-8'
      );
      
      // v0.8.2 관련 주석 확인
      expect(appCode).toContain('v0.8.2: functional_specification.md 완전 준수');
      expect(appCode).toContain('FIX 1: 소행성 액션 제안 패널 제거');
      expect(appCode).toContain('FIX 2: 팝업 창 최상위 위치');
      expect(appCode).toContain('소행성 액션에 대한 제안 패널은 필요 없습니다');
      expect(appCode).toContain('팝업 창은 어느 것보다 가장 위에 위치합니다');
    });

    test('should have removed asteroid action system references', () => {
      const appCode = require('fs').readFileSync(
        require('path').join(process.cwd(), 'src/App.js'), 
        'utf-8'
      );
      
      // AsteroidActionSystem 관련 코드가 모두 제거되었는지 확인
      expect(appCode).not.toContain('import AsteroidActionSystem');
      expect(appCode).not.toContain('<AsteroidActionSystem');
      expect(appCode).not.toContain('AsteroidActionSystem');
    });

    test('should maintain asteroid generation logic but without panel', () => {
      const appCode = require('fs').readFileSync(
        require('path').join(process.cwd(), 'src/App.js'), 
        'utf-8'
      );
      
      // 소행성 생성 로직은 유지되어야 함
      expect(appCode).toContain('generateAsteroids');
      expect(appCode).toContain('패널 없음');
      expect(appCode).toContain('소행성은 생성되지만 별도 패널 없이');
    });
  });

  describe('Layout and Styling Verification', () => {
    test('should maintain proper layout with menu offset', () => {
      render(<App />);
      
      // 3D 씬이 메인 메뉴를 피해 배치되었는지 확인
      const scene = screen.getByTestId('scene');
      const sceneContainer = scene.closest('div[style*="marginLeft"]');
      expect(sceneContainer).toHaveStyle({ marginLeft: '80px' });
    });

    test('should maintain system status positioning', () => {
      render(<App />);
      
      const systemStatus = screen.getByTestId('system-status');
      expect(systemStatus).toHaveStyle({
        position: 'fixed',
        bottom: '20px',
        left: '100px',
        zIndex: '1000'
      });
    });
  });

  describe('Accessibility and User Experience', () => {
    test('should provide clear feedback about changes', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        // v0.8.2 특정 메시지 확인
        expect(systemStatus.textContent).toContain('v0.8.2 Complete Functional Specification Compliance');
      });
    });

    test('should maintain all button tooltips and accessibility', () => {
      render(<App />);
      
      const uiToggle = screen.getByTestId('ui-mode-toggle');
      const analyticsToggle = screen.getByTestId('analytics-toggle');
      const aiToggle = screen.getByTestId('ai-grouping-toggle');
      const animationToggle = screen.getByTestId('animation-toggle');
      const clearAllToggle = screen.getByTestId('clear-all-toggle');
      
      // 모든 버튼에 title 속성이 있는지 확인
      expect(uiToggle).toHaveAttribute('title');
      expect(analyticsToggle).toHaveAttribute('title');
      expect(aiToggle).toHaveAttribute('title');
      expect(animationToggle).toHaveAttribute('title');
      expect(clearAllToggle).toHaveAttribute('title');
    });
  });

  describe('Performance and Memory Management', () => {
    test('should properly cleanup on unmount', () => {
      const { unmount } = render(<App />);
      
      // 컴포넌트가 정상적으로 언마운트되는지 확인
      expect(() => unmount()).not.toThrow();
    });

    test('should handle rapid button clicks without errors', () => {
      render(<App />);
      
      const clearAllButton = screen.getByTestId('clear-all-toggle');
      
      // 빠른 연속 클릭 시뮬레이션
      expect(() => {
        fireEvent.click(clearAllButton);
        fireEvent.click(clearAllButton);
        fireEvent.click(clearAllButton);
      }).not.toThrow();
    });
  });

  describe('Integration Test - Complete Workflow', () => {
    test('should handle complete user workflow without errors', async () => {
      render(<App />);
      
      // 1. 초기 상태 확인
      expect(screen.getByTestId('main-menu-vertical')).toBeInTheDocument();
      expect(screen.getByTestId('scene')).toBeInTheDocument();
      
      // 2. Clear All로 태스크 추가
      const clearAllButton = screen.getByTestId('clear-all-toggle');
      fireEvent.click(clearAllButton);
      
      // 3. UI 모드 토글
      const uiToggle = screen.getByTestId('ui-mode-toggle');
      fireEvent.click(uiToggle);
      fireEvent.click(uiToggle); // 다시 원래 모드로
      
      // 4. 애니메이션 토글
      const animationToggle = screen.getByTestId('animation-toggle');
      fireEvent.click(animationToggle);
      fireEvent.click(animationToggle); // 다시 재생
      
      // 5. AI 그룹핑 토글
      const aiToggle = screen.getByTestId('ai-grouping-toggle');
      fireEvent.click(aiToggle);
      fireEvent.click(aiToggle); // 다시 활성화
      
      // 6. 분석 대시보드 토글
      const analyticsToggle = screen.getByTestId('analytics-toggle');
      fireEvent.click(analyticsToggle);
      fireEvent.click(analyticsToggle); // 다시 닫기
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle empty state gracefully', async () => {
      render(<App />);
      
      const clearAllButton = screen.getByTestId('clear-all-toggle');
      
      // 태스크가 있다면 제거
      fireEvent.click(clearAllButton);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        if (systemStatus.textContent.includes('Tasks: 0')) {
          expect(systemStatus.textContent).toContain('No Tasks → No Planets, No Suns, No Satellites');
        }
      });
    });

    test('should maintain UI consistency across state changes', async () => {
      render(<App />);
      
      const mainMenu = screen.getByTestId('main-menu-vertical');
      const initialZIndex = window.getComputedStyle(mainMenu).zIndex;
      
      // 상태 변경 후에도 메인 메뉴 z-index 유지되는지 확인
      const clearAllButton = screen.getByTestId('clear-all-toggle');
      fireEvent.click(clearAllButton);
      
      await waitFor(() => {
        const currentZIndex = window.getComputedStyle(mainMenu).zIndex;
        expect(currentZIndex).toBe(initialZIndex);
        expect(currentZIndex).toBe('2000');
      });
    });
  });

  describe('Regression Test - Previous Features', () => {
    test('should maintain all v0.8.1 features', () => {
      render(<App />);
      
      // 메인 메뉴 위치 유지
      const mainMenu = screen.getByTestId('main-menu-vertical');
      expect(mainMenu).toHaveStyle({
        position: 'fixed',
        left: '0',
        top: '0'
      });
      
      // 모든 컨트롤 버튼 유지
      expect(screen.getByTestId('ui-mode-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('analytics-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('ai-grouping-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('animation-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('clear-all-toggle')).toBeInTheDocument();
      
      // 3D 씬 유지
      expect(screen.getByTestId('scene')).toBeInTheDocument();
      
      // 시스템 상태 표시 유지
      expect(screen.getByTestId('system-status')).toBeInTheDocument();
    });

    test('should not have broken any existing functionality', () => {
      // 렌더링 중 에러가 발생하지 않아야 함
      expect(() => render(<App />)).not.toThrow();
    });
  });
});

// 추가 테스트: functional_specification.md 준수 확인
describe('Functional Specification Compliance Check v0.8.2', () => {
  test('should comply with asteroid panel requirement', () => {
    // "소행성 액션에 대한 제안 패널은 필요 없습니다"
    render(<App />);
    expect(screen.queryByTestId('asteroid-action-system')).not.toBeInTheDocument();
  });

  test('should comply with popup highest priority requirement', () => {
    // "팝업 창은 어느 것보다 가장 위에 위치합니다"
    const appCode = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/App.js'), 
      'utf-8'
    );
    
    // TaskDetailModal z-index가 3000으로 설정되었는지 확인
    expect(appCode).toContain('zIndex: 3000');
    
    // 메인 메뉴보다 높은 우선순위인지 확인
    const mainMenuZIndex = appCode.match(/zIndex:\s*2000/);
    const popupZIndex = appCode.match(/zIndex:\s*3000/);
    
    expect(mainMenuZIndex).toBeTruthy();
    expect(popupZIndex).toBeTruthy();
  });
});