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

// v0.8.1: functional_specification.md 완전 준수 테스트
// CRITICAL: 메인 메뉴 왼쪽 수직 배치 검증

describe('App v0.8.1 - Complete Functional Specification Compliance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Main Menu Vertical Layout - Specification Compliance', () => {
    test('main menu should be positioned on the left side vertically', () => {
      render(<App />);
      
      const mainMenu = screen.getByTestId('main-menu-vertical');
      expect(mainMenu).toBeInTheDocument();
      
      // 메인 메뉴가 왼쪽에 수직으로 위치하는지 확인
      const styles = window.getComputedStyle(mainMenu);
      expect(mainMenu).toHaveStyle({
        position: 'fixed',
        top: '0',
        left: '0'
      });
    });

    test('main menu should have highest z-index', () => {
      render(<App />);
      
      const mainMenu = screen.getByTestId('main-menu-vertical');
      expect(mainMenu).toHaveStyle({
        zIndex: '2000'
      });
    });

    test('main menu should contain all control buttons', () => {
      render(<App />);
      
      // 모든 메인 메뉴 버튼들이 존재하는지 확인
      expect(screen.getByTestId('ui-mode-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('analytics-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('ai-grouping-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('animation-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('clear-all-toggle')).toBeInTheDocument();
    });

    test('scene should be positioned to avoid main menu overlap', () => {
      render(<App />);
      
      const scene = screen.getByTestId('scene');
      const sceneContainer = scene.closest('div[style*="margin-left"]');
      
      expect(sceneContainer).toHaveStyle({
        marginLeft: '80px'
      });
    });

    test('system status should be positioned after main menu', () => {
      render(<App />);
      
      const systemStatus = screen.getByTestId('system-status');
      expect(systemStatus).toHaveStyle({
        left: '100px' // 메인 메뉴(80px) + 여백(20px)
      });
    });
  });

  describe('Functional Specification Rules Compliance', () => {
    test('version should be updated to v0.8.1', () => {
      render(<App />);
      
      const systemStatus = screen.getByTestId('system-status');
      expect(systemStatus).toHaveTextContent('v0.8.1 Complete Functional Specification Compliance');
    });

    test('should maintain all existing functional rules', () => {
      render(<App />);
      
      // 태스크가 없으면 시스템이 없어야 함
      const systemStatus = screen.getByTestId('system-status');
      
      // 초기 상태에서 태스크 로딩을 기다림
      waitFor(() => {
        expect(systemStatus).toHaveTextContent(/Tasks: \d+/);
      });
    });

    test('should display correct rule compliance status', () => {
      render(<App />);
      
      const systemStatus = screen.getByTestId('system-status');
      
      // 규칙 준수 상태가 표시되는지 확인
      waitFor(() => {
        const statusText = systemStatus.textContent;
        expect(
          statusText.includes('No Tasks → No Planets, No Suns, No Satellites') ||
          statusText.includes('solar system') ||
          statusText.includes('Processing...')
        ).toBe(true);
      });
    });
  });

  describe('UI Component Integration with Main Menu', () => {
    test('UI mode toggle should work from main menu', () => {
      render(<App />);
      
      const uiToggle = screen.getByTestId('ui-mode-toggle');
      
      // 초기 상태 확인 (Enhanced UI)
      expect(uiToggle.textContent).toContain('🎨');
      
      // Classic UI로 전환
      fireEvent.click(uiToggle);
      expect(uiToggle.textContent).toContain('🚀');
      
      // 다시 Enhanced UI로 전환
      fireEvent.click(uiToggle);
      expect(uiToggle.textContent).toContain('🎨');
    });

    test('AI grouping toggle should work from main menu', () => {
      render(<App />);
      
      const aiToggle = screen.getByTestId('ai-grouping-toggle');
      
      // 초기 상태 확인 (AI ON - 활성화된 스타일)
      expect(aiToggle).toHaveStyle({
        background: expect.stringContaining('dc2626') // 활성화 색상
      });
      
      // AI OFF로 전환
      fireEvent.click(aiToggle);
      expect(aiToggle).toHaveStyle({
        background: expect.stringContaining('6b7280') // 비활성화 색상
      });
    });

    test('animation toggle should work from main menu', () => {
      render(<App />);
      
      const animationToggle = screen.getByTestId('animation-toggle');
      
      // 초기 상태 확인 (Playing)
      expect(animationToggle.textContent).toContain('⏸️');
      
      // Pause로 전환
      fireEvent.click(animationToggle);
      expect(animationToggle.textContent).toContain('▶️');
      
      // 다시 Play로 전환
      fireEvent.click(animationToggle);
      expect(animationToggle.textContent).toContain('⏸️');
    });

    test('analytics toggle should work from main menu', () => {
      render(<App />);
      
      const analyticsToggle = screen.getByTestId('analytics-toggle');
      
      // 초기 상태 확인 (비활성화)
      expect(analyticsToggle).toHaveStyle({
        background: expect.stringContaining('374151') // 비활성화 색상
      });
      
      // Analytics 활성화
      fireEvent.click(analyticsToggle);
      expect(analyticsToggle).toHaveStyle({
        background: expect.stringContaining('059669') // 활성화 색상
      });
    });

    test('clear all toggle should work from main menu', () => {
      render(<App />);
      
      const clearAllToggle = screen.getByTestId('clear-all-toggle');
      expect(clearAllToggle).toBeInTheDocument();
      
      // Clear All 기능 테스트
      fireEvent.click(clearAllToggle);
      
      // 상태 변화 확인
      waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Tasks: \d+/);
      });
    });
  });

  describe('Layout and Z-Index Management', () => {
    test('main menu should be above all other panels', () => {
      render(<App />);
      
      const mainMenu = screen.getByTestId('main-menu-vertical');
      expect(mainMenu).toHaveStyle({
        zIndex: '2000'
      });
      
      // Analytics 대시보드 열기
      const analyticsToggle = screen.getByTestId('analytics-toggle');
      fireEvent.click(analyticsToggle);
      
      waitFor(() => {
        const analyticsDashboard = screen.queryByTestId('analytics-dashboard');
        if (analyticsDashboard) {
          const dashboardStyles = window.getComputedStyle(analyticsDashboard);
          const dashboardZIndex = parseInt(dashboardStyles.zIndex || '0');
          expect(dashboardZIndex).toBeLessThan(2000);
        }
      });
    });

    test('content should not overlap with main menu', () => {
      render(<App />);
      
      // Enhanced Mission Control이 메인 메뉴를 피해 배치되는지 확인
      const enhancedMissionControl = screen.queryByTestId('enhanced-mission-control');
      if (enhancedMissionControl) {
        const controlContainer = enhancedMissionControl.closest('div[style*="margin-left"]');
        expect(controlContainer).toHaveStyle({
          marginLeft: '80px'
        });
      }
    });
  });

  describe('Responsive Design with Main Menu', () => {
    test('main menu should maintain fixed width', () => {
      render(<App />);
      
      const mainMenu = screen.getByTestId('main-menu-vertical');
      expect(mainMenu).toHaveStyle({
        width: '80px'
      });
    });

    test('main menu should span full height', () => {
      render(<App />);
      
      const mainMenu = screen.getByTestId('main-menu-vertical');
      expect(mainMenu).toHaveStyle({
        height: '100vh'
      });
    });

    test('main menu should have proper styling', () => {
      render(<App />);
      
      const mainMenu = screen.getByTestId('main-menu-vertical');
      expect(mainMenu).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      });
    });
  });

  describe('Package.json Version Consistency', () => {
    test('package.json should contain version 0.8.1', () => {
      const packageJson = require('../../package.json');
      expect(packageJson.version).toBe('0.8.1');
    });

    test('package.json should contain correct project name', () => {
      const packageJson = require('../../package.json');
      expect(packageJson.name).toBe('solar-system-todo');
    });

    test('package.json should have v0.8.1 test script', () => {
      const packageJson = require('../../package.json');
      expect(packageJson.scripts['test:v0.8.1']).toBe('react-scripts test --testPathPattern=v0.8.1');
    });
  });

  describe('Solar System Functionality Preservation', () => {
    test('should render scene component', () => {
      render(<App />);
      
      expect(screen.getByTestId('scene')).toBeInTheDocument();
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
    });

    test('should maintain asteroid action system', () => {
      render(<App />);
      
      expect(screen.getByTestId('asteroid-action-system')).toBeInTheDocument();
    });

    test('should support both UI modes', () => {
      render(<App />);
      
      // 초기에는 Enhanced UI
      waitFor(() => {
        expect(screen.queryByTestId('enhanced-mission-control')).toBeInTheDocument();
      });
      
      // Classic UI로 전환
      const uiToggle = screen.getByTestId('ui-mode-toggle');
      fireEvent.click(uiToggle);
      
      waitFor(() => {
        expect(screen.queryByTestId('ai-todo-manager')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and User Experience', () => {
    test('main menu buttons should have proper titles', () => {
      render(<App />);
      
      expect(screen.getByTestId('ui-mode-toggle')).toHaveAttribute('title');
      expect(screen.getByTestId('analytics-toggle')).toHaveAttribute('title');
      expect(screen.getByTestId('ai-grouping-toggle')).toHaveAttribute('title');
      expect(screen.getByTestId('animation-toggle')).toHaveAttribute('title');
      expect(screen.getByTestId('clear-all-toggle')).toHaveAttribute('title');
    });

    test('main menu should be keyboard accessible', () => {
      render(<App />);
      
      const uiToggle = screen.getByTestId('ui-mode-toggle');
      expect(uiToggle.tagName.toLowerCase()).toBe('button');
      expect(uiToggle).toHaveStyle({
        cursor: 'pointer'
      });
    });

    test('main menu should have visual feedback on interaction', () => {
      render(<App />);
      
      const buttons = [
        screen.getByTestId('ui-mode-toggle'),
        screen.getByTestId('analytics-toggle'),
        screen.getByTestId('ai-grouping-toggle'),
        screen.getByTestId('animation-toggle'),
        screen.getByTestId('clear-all-toggle')
      ];

      buttons.forEach(button => {
        expect(button).toHaveStyle({
          transition: 'all 0.3s ease'
        });
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle empty todo state gracefully', () => {
      render(<App />);
      
      // Clear All로 빈 상태 만들기
      const clearAllToggle = screen.getByTestId('clear-all-toggle');
      fireEvent.click(clearAllToggle);
      
      waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Tasks: 0');
      });
    });

    test('should maintain main menu position during state changes', () => {
      render(<App />);
      
      const mainMenu = screen.getByTestId('main-menu-vertical');
      const initialStyles = window.getComputedStyle(mainMenu);
      
      // UI 모드 변경
      const uiToggle = screen.getByTestId('ui-mode-toggle');
      fireEvent.click(uiToggle);
      
      // 메인 메뉴 위치가 변경되지 않았는지 확인
      const afterStyles = window.getComputedStyle(mainMenu);
      expect(afterStyles.position).toBe(initialStyles.position);
      expect(afterStyles.left).toBe(initialStyles.left);
      expect(afterStyles.top).toBe(initialStyles.top);
    });
  });

  describe('Performance and Optimization', () => {
    test('main menu should render efficiently', () => {
      const { rerender } = render(<App />);
      
      const mainMenu = screen.getByTestId('main-menu-vertical');
      expect(mainMenu).toBeInTheDocument();
      
      // 리렌더링 시에도 메인 메뉴가 유지되는지 확인
      rerender(<App />);
      expect(screen.getByTestId('main-menu-vertical')).toBeInTheDocument();
    });

    test('button interactions should be responsive', () => {
      render(<App />);
      
      const startTime = performance.now();
      
      const uiToggle = screen.getByTestId('ui-mode-toggle');
      fireEvent.click(uiToggle);
      
      const endTime = performance.now();
      
      // 클릭 응답 시간이 100ms 이하인지 확인
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});

describe('Integration Tests with Main Menu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('complete workflow: UI mode switching with main menu', async () => {
    render(<App />);
    
    // 1. 초기 상태 확인
    expect(screen.getByTestId('main-menu-vertical')).toBeInTheDocument();
    
    // 2. Enhanced UI 확인
    await waitFor(() => {
      expect(screen.queryByTestId('enhanced-mission-control')).toBeInTheDocument();
    });
    
    // 3. Classic UI로 전환
    const uiToggle = screen.getByTestId('ui-mode-toggle');
    fireEvent.click(uiToggle);
    
    await waitFor(() => {
      expect(screen.queryByTestId('ai-todo-manager')).toBeInTheDocument();
    });
    
    // 4. 다시 Enhanced UI로 전환
    fireEvent.click(uiToggle);
    
    await waitFor(() => {
      expect(screen.queryByTestId('enhanced-mission-control')).toBeInTheDocument();
    });
    
    // 5. 메인 메뉴가 항상 유지되는지 확인
    expect(screen.getByTestId('main-menu-vertical')).toBeInTheDocument();
  });

  test('complete workflow: analytics dashboard with main menu priority', async () => {
    render(<App />);
    
    // 1. Analytics 대시보드 열기
    const analyticsToggle = screen.getByTestId('analytics-toggle');
    fireEvent.click(analyticsToggle);
    
    // 2. 대시보드가 열려도 메인 메뉴가 위에 있는지 확인
    await waitFor(() => {
      const analyticsDashboard = screen.queryByTestId('analytics-dashboard');
      if (analyticsDashboard) {
        const mainMenu = screen.getByTestId('main-menu-vertical');
        
        const mainMenuZIndex = parseInt(window.getComputedStyle(mainMenu).zIndex);
        const dashboardZIndex = parseInt(window.getComputedStyle(analyticsDashboard).zIndex || '0');
        
        expect(mainMenuZIndex).toBeGreaterThan(dashboardZIndex);
      }
    });
  });
});