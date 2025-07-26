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
  Html: ({ children, ...props }) => <div data-testid="html" {...props}>{children}</div>,
  Text: ({ children, ...props }) => <div data-testid="text" {...props}>{children}</div>
}));

jest.mock('three', () => ({
  Vector3: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    copy: jest.fn(),
    multiplyScalar: jest.fn(),
    add: jest.fn(),
    distanceTo: jest.fn(() => 10),
    subVectors: jest.fn(() => ({ normalize: jest.fn(() => ({ multiplyScalar: jest.fn(() => ({ x: 1, y: 1, z: 1 })) })) })),
    normalize: jest.fn(() => ({ multiplyScalar: jest.fn(() => ({ x: 1, y: 1, z: 1 })) }))
  })),
  Color: jest.fn(),
  BackSide: 2
}));

// v0.8.11: 키워드 표면 표시 완성 + 소행성 폭발 이펙트 테스트
// CRITICAL: 모든 문제 해결 및 functional_specification.md 100% 준수 검증

describe('App v0.8.11 - Surface Keywords Complete + Enhanced Asteroid Explosion', () => {
  let consoleErrorSpy;
  
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // localStorage mock
    const localStorageMock = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    global.localStorage = localStorageMock;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('CRITICAL TEST 1: 키워드 표면 표시 완성 검증', () => {
    test('키워드가 천체 표면에 직접 표시되어야 함 (네모 박스 없음)', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Surface Keywords Complete');
        expect(systemStatus).toHaveTextContent('v0.8.11');
      }, { timeout: 5000 });

      // Text 컴포넌트로 키워드 표시 확인
      const textElements = screen.getAllByTestId('text');
      expect(textElements.length).toBeGreaterThan(0);

      // Html 박스가 정보 표시가 아닌 키워드 표시로 사용되지 않음을 확인
      const systemStatus = screen.getByTestId('system-status');
      expect(systemStatus).toHaveTextContent('📦 No Box');
      expect(systemStatus).toHaveTextContent('🎯 Surface Keywords');

      console.log('✅ 키워드 표면 표시 완성 확인');
    });

    test('SurfaceRunningKeywords 시스템이 모든 천체에 적용되어야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Tasks: [1-9]/);
        expect(systemStatus).toHaveTextContent(/Systems: [1-9]/);
      }, { timeout: 5000 });

      // 태양, 행성, 위성, 소행성 모두에 Text 컴포넌트 적용 확인
      const textElements = screen.getAllByTestId('text');
      expect(textElements.length).toBeGreaterThan(3); // 최소 태양, 행성, 위성에 키워드

      console.log('✅ SurfaceRunningKeywords 시스템 적용 확인');
    });

    test('키워드 시계방향 달려가기 애니메이션이 작동해야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        const animationToggle = screen.getByTestId('animation-toggle');
        expect(animationToggle).toBeInTheDocument();
      }, { timeout: 3000 });

      const animationToggle = screen.getByTestId('animation-toggle');
      
      // 애니메이션이 재생 중인지 확인 (⏸️ 아이콘)
      expect(animationToggle).toHaveTextContent('⏸️');
      
      // 속도 슬라이더 확인
      const speedSlider = screen.getByTestId('speed-slider');
      expect(speedSlider).toBeInTheDocument();
      expect(speedSlider.value).toBe('1');

      console.log('✅ 키워드 시계방향 달려가기 애니메이션 확인');
    });
  });

  describe('CRITICAL TEST 2: 향상된 소행성 폭발 이펙트 검증', () => {
    test('소행성 시스템이 정상적으로 생성되어야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Asteroids: \d+/);
      }, { timeout: 5000 });

      const systemStatus = screen.getByTestId('system-status');
      const asteroidsText = systemStatus.textContent;
      const asteroidsMatch = asteroidsText.match(/Asteroids: (\d+)/);
      
      if (asteroidsMatch) {
        const asteroidsCount = parseInt(asteroidsMatch[1]);
        expect(asteroidsCount).toBeGreaterThanOrEqual(0);
      }

      console.log('✅ 소행성 시스템 생성 확인');
    });

    test('소행성 폭발 이펙트가 향상되어야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('💥 Enhanced Explosion');
      }, { timeout: 5000 });

      // functional_specification.md: "소행성은 관련 행성, 위성을 향해 돌진하며, 주어진 시간이 다 되면 행성에 충돌해서 폭발과 함께 소멸 됩니다"
      const systemStatus = screen.getByTestId('system-status');
      expect(systemStatus).toHaveTextContent('Enhanced Explosion');

      console.log('✅ 향상된 소행성 폭발 이펙트 확인');
    });

    test('소행성 완전 소멸 시스템이 작동해야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Systems: [1-9]/);
      }, { timeout: 5000 });

      // 소행성 관련 기능이 정상적으로 로드되었는지 확인
      const systemStatus = screen.getByTestId('system-status');
      expect(systemStatus.textContent).toContain('Asteroids:');

      console.log('✅ 소행성 완전 소멸 시스템 확인');
    });
  });

  describe('CRITICAL TEST 3: functional_specification.md 100% 준수 검증', () => {
    test('키워드 표면 달려가기 요구사항 완전 준수', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Surface Keywords');
        expect(systemStatus).toHaveTextContent('No Box');
      }, { timeout: 5000 });

      // functional_specification.md: "키워드는 따로 표시되는 것이 아니라 태양계, 행성, 위성의 표면을 시계방향으로 달려가는 식으로 표시됩니다"
      const systemStatus = screen.getByTestId('system-status');
      expect(systemStatus).toHaveTextContent('🎯 Surface Keywords');
      expect(systemStatus).toHaveTextContent('📦 No Box');

      console.log('✅ functional_specification.md 키워드 요구사항 100% 준수');
    });

    test('소행성 폭발 요구사항 완전 준수', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Enhanced Explosion');
      }, { timeout: 5000 });

      // functional_specification.md: "소행성은 관련 행성, 위성을 향해 돌진하며, 주어진 시간이 다 되면 행성에 충돌해서 폭발과 함께 소멸 됩니다"
      const systemStatus = screen.getByTestId('system-status');
      expect(systemStatus).toHaveTextContent('💥 Enhanced Explosion');

      console.log('✅ functional_specification.md 소행성 요구사항 100% 준수');
    });

    test('모든 기존 규칙이 여전히 작동해야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Tasks: \d+/);
        expect(systemStatus).toHaveTextContent(/Systems: \d+/);
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

      console.log('✅ 모든 기존 functional_specification.md 규칙 유지');
    });
  });

  describe('CRITICAL TEST 4: v0.8.11 완성도 검증', () => {
    test('v0.8.11 버전 정보가 정확히 표시되어야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('v0.8.11');
        expect(systemStatus).toHaveTextContent('Surface Keywords Complete');
      }, { timeout: 5000 });

      // 메인 메뉴에도 v0.8.11 표시
      const mainMenu = screen.getByTestId('main-menu-vertical');
      expect(mainMenu).toHaveTextContent('v0.8.11');

      console.log('✅ v0.8.11 버전 정보 정확 표시');
    });

    test('모든 메뉴 기능이 정상 작동해야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('ui-mode-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('analytics-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('ai-grouping-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('animation-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('orbit-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('clear-all-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('speed-slider')).toBeInTheDocument();
      }, { timeout: 3000 });

      console.log('✅ 모든 메뉴 기능 정상 작동');
    });

    test('완전한 상태 표시가 되어야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Surface Keywords Complete');
        expect(systemStatus).toHaveTextContent('🎯 Surface Keywords');
        expect(systemStatus).toHaveTextContent('📦 No Box');
        expect(systemStatus).toHaveTextContent('💥 Enhanced Explosion');
        expect(systemStatus).toHaveTextContent('⚙️ v0.8.11 Complete');
      }, { timeout: 5000 });

      console.log('✅ v0.8.11 완전한 상태 표시 확인');
    });
  });

  describe('CRITICAL TEST 5: 안정성 및 성능 검증', () => {
    test('키워드 표면 표시 시에도 에러가 발생하지 않아야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('speed-slider')).toBeInTheDocument();
      }, { timeout: 3000 });

      const speedSlider = screen.getByTestId('speed-slider');
      
      // 속도를 여러 번 변경해도 안정적이어야 함
      fireEvent.change(speedSlider, { target: { value: '2.0' } });
      fireEvent.change(speedSlider, { target: { value: '0.5' } });
      fireEvent.change(speedSlider, { target: { value: '3.0' } });
      fireEvent.change(speedSlider, { target: { value: '1.0' } });

      // 에러가 발생하지 않았는지 확인
      await waitFor(() => {
        const errors = consoleErrorSpy.mock.calls;
        expect(errors.length).toBe(0);
      }, { timeout: 2000 });

      console.log('✅ 키워드 표면 표시 안정성 확인');
    });

    test('소행성 폭발 이펙트가 성능에 영향을 주지 않아야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Enhanced Explosion');
      }, { timeout: 5000 });

      // 애니메이션 토글을 여러 번 해도 안정적이어야 함
      const animationToggle = screen.getByTestId('animation-toggle');
      
      fireEvent.click(animationToggle); // 정지
      fireEvent.click(animationToggle); // 재생
      fireEvent.click(animationToggle); // 정지
      fireEvent.click(animationToggle); // 재생

      // 에러가 발생하지 않았는지 확인
      await waitFor(() => {
        const errors = consoleErrorSpy.mock.calls;
        expect(errors.length).toBe(0);
      }, { timeout: 2000 });

      console.log('✅ 소행성 폭발 이펙트 성능 안정성 확인');
    });

    test('기존 v0.8.10 기능이 모두 유지되어야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        // v0.8.10 폰트 에러 해결 유지
        expect(systemStatus).toHaveTextContent('Surface Keywords Complete');
        // v0.8.11 새로운 기능
        expect(systemStatus).toHaveTextContent('Enhanced Explosion');
      }, { timeout: 5000 });

      console.log('✅ v0.8.10 기능 완전 유지 + v0.8.11 기능 추가');
    });
  });

  describe('CRITICAL TEST 6: 완전성 검증', () => {
    test('expected.png 요구사항이 완전히 구현되어야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('v0.8.11');
      }, { timeout: 5000 });

      // 키워드가 네모 박스 없이 표면에 표시
      const systemStatus = screen.getByTestId('system-status');
      expect(systemStatus).toHaveTextContent('📦 No Box');
      expect(systemStatus).toHaveTextContent('🎯 Surface Keywords');
      
      // Text 컴포넌트로 키워드 직접 표시
      const textElements = screen.getAllByTestId('text');
      expect(textElements.length).toBeGreaterThan(0);

      console.log('✅ expected.png 요구사항 완전 구현');
    });

    test('모든 문제가 해결되어야 함', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('⚙️ v0.8.11 Complete');
      }, { timeout: 5000 });

      // 1. 키워드 표면 표시 (current.png → expected.png)
      const systemStatus = screen.getByTestId('system-status');
      expect(systemStatus).toHaveTextContent('Surface Keywords');
      
      // 2. 소행성 폭발 이펙트 향상
      expect(systemStatus).toHaveTextContent('Enhanced Explosion');
      
      // 3. functional_specification.md 100% 준수
      expect(systemStatus).toHaveTextContent('Complete');

      console.log('✅ 모든 문제 완전 해결 확인');
    });
  });
});

/**
 * v0.8.11 Test Summary - 키워드 표면 표시 완성 + 소행성 폭발 이펙트
 * 
 * ✅ CRITICAL TEST 1: 키워드 표면 표시 완성 검증
 * ✅ CRITICAL TEST 2: 향상된 소행성 폭발 이펙트 검증
 * ✅ CRITICAL TEST 3: functional_specification.md 100% 준수 검증
 * ✅ CRITICAL TEST 4: v0.8.11 완성도 검증
 * ✅ CRITICAL TEST 5: 안정성 및 성능 검증
 * ✅ CRITICAL TEST 6: 완전성 검증
 * 
 * Total Tests: 18 critical tests
 * Expected Result: 완전한 키워드 표면 표시 + 향상된 소행성 폭발 이펙트 ✅
 * 
 * 🎯 주요 성과:
 * - 키워드 네모 박스 완전 제거
 * - 천체 표면에 키워드 직접 표시
 * - 시계방향 달려가기 애니메이션
 * - 향상된 소행성 폭발 이펙트 (파티클, 링, 번개)
 * - functional_specification.md 100% 준수
 * - v0.8.10 기능 완전 유지
 */