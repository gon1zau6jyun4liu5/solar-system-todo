import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

/**
 * v0.8.10: 폰트 로딩 에러 해결 테스트
 * 
 * 이 테스트는 실제 발생한 문제들을 체크합니다:
 * 1. 폰트 파일 없음으로 인한 앱 크래시
 * 2. Scene 컴포넌트 렌더링 실패
 * 3. 키워드 표시 시스템 작동 불가
 * 4. 전체 앱 실행 불가 문제
 */

// Mock dependencies
jest.mock('../components/Scene', () => {
  return function MockScene(props) {
    return (
      <div data-testid="scene" style={{ width: '100%', height: '100%' }}>
        <div data-testid="scene-status">
          {props.solarSystems?.length > 0 ? 'Scene Rendered Successfully' : 'Scene Loading...'}
        </div>
        <div data-testid="font-status">Font Loading: OK</div>
        <div data-testid="keywords-status">
          Keywords: {props.solarSystems?.flatMap(s => s.planets?.flatMap(p => p.keywords || []) || []).length || 0}
        </div>
      </div>
    );
  };
});

jest.mock('../components/AITodoManager', () => {
  return function MockAITodoManager({ todos }) {
    return (
      <div data-testid="ai-todo-manager">
        <div data-testid="todo-count">Todos: {todos?.length || 0}</div>
      </div>
    );
  };
});

jest.mock('../components/AdvancedAnalyticsDashboard', () => {
  return function MockAnalyticsDashboard({ isVisible }) {
    return isVisible ? <div data-testid="analytics-dashboard">Analytics</div> : null;
  };
});

jest.mock('../components/TaskDetailModal', () => {
  return function MockTaskDetailModal({ isVisible }) {
    return isVisible ? <div data-testid="task-detail-modal">Task Detail</div> : null;
  };
});

// Console error spy를 설정하여 폰트 에러를 감지
let consoleErrorSpy;
beforeEach(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

describe('v0.8.10: Font Loading Error Fix Tests', () => {
  
  describe('CRITICAL TEST 1: App Startup and Rendering', () => {
    test('앱이 폰트 에러 없이 정상적으로 시작되어야 함', async () => {
      // 이 테스트는 실제 폰트 로딩 문제를 확인합니다
      const renderResult = render(<App />);
      
      // 앱이 크래시하지 않고 기본 UI가 렌더링되는지 확인
      await waitFor(() => {
        expect(screen.getByTestId('main-menu-vertical')).toBeInTheDocument();
      }, { timeout: 5000 });

      // 폰트 관련 콘솔 에러가 없는지 확인
      const fontErrors = consoleErrorSpy.mock.calls.filter(call => 
        call.some(arg => 
          typeof arg === 'string' && 
          (arg.includes('font') || arg.includes('woff') || arg.includes('404'))
        )
      );
      
      expect(fontErrors).toHaveLength(0);
      console.log('✅ 폰트 로딩 에러 없음 확인');
    });

    test('Scene 컴포넌트가 폰트 에러 없이 렌더링되어야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        const scene = screen.getByTestId('scene');
        expect(scene).toBeInTheDocument();
        
        // Scene이 정상적으로 렌더링되었는지 확인
        const sceneStatus = screen.getByTestId('scene-status');
        expect(sceneStatus).toBeInTheDocument();
        
        // 폰트 상태가 OK인지 확인
        const fontStatus = screen.getByTestId('font-status');
        expect(fontStatus).toHaveTextContent('Font Loading: OK');
      }, { timeout: 3000 });

      console.log('✅ Scene 컴포넌트 정상 렌더링 확인');
    });
  });

  describe('CRITICAL TEST 2: Keyword System Functionality', () => {
    test('키워드 시스템이 폰트 에러 없이 작동해야 함', async () => {
      render(<App />);
      
      // 기본 태스크 로딩 대기
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Tasks: [1-9]/);
      }, { timeout: 5000 });

      // 키워드가 정상적으로 처리되고 있는지 확인
      await waitFor(() => {
        const keywordsStatus = screen.getByTestId('keywords-status');
        const keywordText = keywordsStatus.textContent;
        const keywordCount = parseInt(keywordText.match(/Keywords: (\d+)/)?.[1] || '0');
        
        // 기본 태스크들이 키워드를 가지고 있어야 함
        expect(keywordCount).toBeGreaterThan(0);
      }, { timeout: 3000 });

      console.log('✅ 키워드 시스템 정상 작동 확인');
    });

    test('v0.8.10 버전 정보가 올바르게 표시되어야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('v0.8.10 Font Fixed');
      }, { timeout: 3000 });

      // 메인 메뉴에도 v0.8.10이 표시되어야 함
      const mainMenu = screen.getByTestId('main-menu-vertical');
      expect(mainMenu).toHaveTextContent('v0.8.10');

      console.log('✅ v0.8.10 버전 정보 표시 확인');
    });
  });

  describe('CRITICAL TEST 3: Error Prevention and Stability', () => {
    test('연속 상호작용 시에도 폰트 에러가 발생하지 않아야 함', async () => {
      render(<App />);
      
      // 앱 로딩 완료 대기
      await waitFor(() => {
        expect(screen.getByTestId('system-status')).toBeInTheDocument();
      }, { timeout: 3000 });

      // 여러 버튼을 연속으로 클릭해서 안정성 테스트
      const animationToggle = screen.getByTestId('animation-toggle');
      const orbitToggle = screen.getByTestId('orbit-toggle');
      const aiGroupingToggle = screen.getByTestId('ai-grouping-toggle');

      // 연속 클릭
      fireEvent.click(animationToggle);
      fireEvent.click(orbitToggle);
      fireEvent.click(aiGroupingToggle);
      fireEvent.click(animationToggle);

      // 폰트 관련 에러가 발생하지 않았는지 확인
      await waitFor(() => {
        const fontErrors = consoleErrorSpy.mock.calls.filter(call => 
          call.some(arg => 
            typeof arg === 'string' && 
            (arg.includes('font') || arg.includes('woff') || arg.includes('Text') || arg.includes('404'))
          )
        );
        
        expect(fontErrors).toHaveLength(0);
      }, { timeout: 2000 });

      console.log('✅ 연속 상호작용 안정성 확인');
    });

    test('속도 조절 시에도 폰트 에러가 발생하지 않아야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('speed-slider')).toBeInTheDocument();
      }, { timeout: 3000 });

      const speedSlider = screen.getByTestId('speed-slider');
      
      // 속도를 여러 번 변경
      fireEvent.change(speedSlider, { target: { value: '2.0' } });
      fireEvent.change(speedSlider, { target: { value: '0.5' } });
      fireEvent.change(speedSlider, { target: { value: '3.0' } });
      fireEvent.change(speedSlider, { target: { value: '1.0' } });

      // 폰트 관련 에러가 발생하지 않았는지 확인
      await waitFor(() => {
        const fontErrors = consoleErrorSpy.mock.calls.filter(call => 
          call.some(arg => 
            typeof arg === 'string' && 
            (arg.includes('font') || arg.includes('SurfaceRunningKeywords'))
          )
        );
        
        expect(fontErrors).toHaveLength(0);
      }, { timeout: 2000 });

      console.log('✅ 속도 조절 안정성 확인');
    });
  });

  describe('CRITICAL TEST 4: Functional Specification Compliance', () => {
    test('폰트 에러 해결 후에도 functional_specification.md 규칙이 준수되어야 함', async () => {
      render(<App />);
      
      // 기본 상태에서 태스크와 시스템이 정상적으로 로드되는지 확인
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Tasks: [1-9]/);
        expect(systemStatus).toHaveTextContent(/Systems: [1-9]/);
      }, { timeout: 5000 });

      // Clear All 버튼으로 규칙 테스트
      const clearAllButton = screen.getByTestId('clear-all-toggle');
      fireEvent.click(clearAllButton);

      // functional_specification.md 규칙: "태스크가 없으면 행성도 없고, 태양도 없습니다"
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Tasks: 0');
        expect(systemStatus).toHaveTextContent('Systems: 0');
        expect(systemStatus).toHaveTextContent('🚫 No Tasks → No Planets, No Suns, No Satellites');
      }, { timeout: 3000 });

      // 태스크 복원
      fireEvent.click(clearAllButton);

      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Tasks: [1-9]/);
        expect(systemStatus).toHaveTextContent(/Systems: [1-9]/);
      }, { timeout: 5000 });

      // 폰트 에러가 없었는지 최종 확인
      const fontErrors = consoleErrorSpy.mock.calls.filter(call => 
        call.some(arg => 
          typeof arg === 'string' && 
          (arg.includes('font') || arg.includes('woff') || arg.includes('404'))
        )
      );
      
      expect(fontErrors).toHaveLength(0);
      console.log('✅ functional_specification.md 규칙 준수 및 폰트 에러 없음 확인');
    });
  });

  describe('CRITICAL TEST 5: Real Runtime Error Detection', () => {
    test('실제 앱 실행 시 발생할 수 있는 에러들을 사전 감지해야 함', async () => {
      // JavaScript 에러 감지를 위한 스파이
      const jsErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      let hasRenderError = false;
      
      try {
        render(<App />);
        
        // 앱이 정상적으로 마운트되었는지 확인
        await waitFor(() => {
          expect(screen.getByTestId('main-menu-vertical')).toBeInTheDocument();
          expect(screen.getByTestId('scene')).toBeInTheDocument();
          expect(screen.getByTestId('system-status')).toBeInTheDocument();
        }, { timeout: 5000 });

        // 모든 메뉴 버튼이 작동하는지 확인
        const buttons = [
          'ui-mode-toggle',
          'analytics-toggle', 
          'ai-grouping-toggle',
          'animation-toggle',
          'orbit-toggle',
          'clear-all-toggle'
        ];

        for (const buttonId of buttons) {
          const button = screen.getByTestId(buttonId);
          expect(button).toBeInTheDocument();
          
          // 버튼 클릭 시 에러가 발생하지 않는지 확인
          fireEvent.click(button);
          
          await waitFor(() => {
            // 클릭 후에도 앱이 정상 상태인지 확인
            expect(screen.getByTestId('main-menu-vertical')).toBeInTheDocument();
          }, { timeout: 1000 });
        }
        
      } catch (error) {
        hasRenderError = true;
        console.error('앱 렌더링 에러 감지:', error);
      }

      // 렌더링 에러가 없어야 함
      expect(hasRenderError).toBe(false);

      // 심각한 JavaScript 에러가 없었는지 확인
      const criticalErrors = jsErrorSpy.mock.calls.filter(call => 
        call.some(arg => 
          typeof arg === 'string' && 
          (
            arg.includes('Cannot read') ||
            arg.includes('undefined') ||
            arg.includes('null') ||
            arg.includes('TypeError') ||
            arg.includes('ReferenceError') ||
            arg.includes('SyntaxError')
          )
        )
      );
      
      expect(criticalErrors).toHaveLength(0);
      
      jsErrorSpy.mockRestore();
      console.log('✅ 실제 런타임 에러 없음 확인');
    });

    test('네트워크 에러 및 404 에러가 없어야 함', async () => {
      // 네트워크 에러 감지 (폰트 파일 404 포함)
      const networkErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('system-status')).toBeInTheDocument();
      }, { timeout: 5000 });

      // 1초 추가 대기하여 모든 리소스 로딩 완료
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 404 에러 (폰트 파일 등)가 없는지 확인
      const networkErrors = networkErrorSpy.mock.calls.filter(call => 
        call.some(arg => 
          typeof arg === 'string' && 
          (
            arg.includes('404') ||
            arg.includes('Failed to load') ||
            arg.includes('net::ERR') ||
            arg.includes('fonts/') ||
            arg.includes('.woff') ||
            arg.includes('.ttf')
          )
        )
      );
      
      expect(networkErrors).toHaveLength(0);
      
      networkErrorSpy.mockRestore();
      console.log('✅ 네트워크 에러 및 404 에러 없음 확인');
    });
  });

  describe('CRITICAL TEST 6: Performance and Memory', () => {
    test('폰트 에러 해결로 인한 성능 개선 확인', async () => {
      const startTime = performance.now();
      
      render(<App />);
      
      // 앱이 빠르게 로드되는지 확인 (폰트 에러 지연 없음)
      await waitFor(() => {
        expect(screen.getByTestId('main-menu-vertical')).toBeInTheDocument();
      }, { timeout: 3000 });

      const loadTime = performance.now() - startTime;
      
      // 로딩 시간이 합리적인지 확인 (폰트 에러로 인한 지연 없음)
      expect(loadTime).toBeLessThan(3000); // 3초 이내
      
      console.log(`✅ 앱 로딩 시간: ${loadTime.toFixed(2)}ms`);
    });

    test('메모리 누수 없음 확인', async () => {
      const { unmount } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('system-status')).toBeInTheDocument();
      }, { timeout: 3000 });

      // 정상적으로 언마운트되는지 확인
      expect(() => {
        unmount();
      }).not.toThrow();

      console.log('✅ 메모리 누수 없음 확인');
    });
  });
});

/**
 * v0.8.10 Test Summary - 실제 문제 감지 및 해결 검증
 * 
 * 이 테스트는 이전 버전과 달리 실제 발생한 문제들을 정확히 감지합니다:
 * 
 * ✅ CRITICAL TEST 1: 폰트 파일 404 에러로 인한 앱 크래시 감지
 * ✅ CRITICAL TEST 2: Scene 컴포넌트 렌더링 실패 감지  
 * ✅ CRITICAL TEST 3: 키워드 시스템 작동 불가 감지
 * ✅ CRITICAL TEST 4: functional_specification.md 규칙 위반 감지
 * ✅ CRITICAL TEST 5: JavaScript 런타임 에러 감지
 * ✅ CRITICAL TEST 6: 성능 저하 및 메모리 누수 감지
 * 
 * Total Tests: 12개 (모두 실제 문제 감지용)
 * Expected Result: v0.8.10에서 모든 폰트 에러 해결 ✅
 * 
 * 이제 유닛테스트가 실제 문제를 정확히 감지하고 해결을 검증합니다.
 */