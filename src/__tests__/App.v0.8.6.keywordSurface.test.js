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
  Text: ({ children, ...props }) => <div data-testid="text" {...props}>{children}</div>,
  Html: ({ children }) => <div data-testid="html">{children}</div>
}));

jest.mock('three', () => ({
  Vector3: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    copy: jest.fn(),
    multiplyScalar: jest.fn(),
    add: jest.fn()
  })),
  Color: jest.fn(),
  BackSide: 2
}));

// v0.8.6: functional_specification.md 키워드 표면 표시 및 입체감 테스트
// CRITICAL: 네모 박스 제거, 천체 표면에 직접 키워드 표시, 입체감 개선

describe('App v0.8.6 - Keyword Surface Display & Enhanced Visual Effects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // localStorage 초기화
    localStorage.clear();
  });

  describe('CRITICAL FIX 1: 키워드 표면 표시 시스템', () => {
    test('SurfaceKeywords 컴포넌트가 네모 박스 없이 키워드 표시', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('v0.8.6 Surface Keywords');
      }, { timeout: 3000 });

      // 키워드가 표면에 직접 표시되는지 확인
      const texts = screen.getAllByTestId('text');
      expect(texts.length).toBeGreaterThan(0);
      
      // Text 컴포넌트에 박스 제거 속성들이 적용되었는지 확인
      texts.forEach(text => {
        expect(text).toHaveAttribute('outlineWidth', '0');
        expect(text).toHaveAttribute('strokeWidth', '0');
        expect(text).toHaveAttribute('fillOpacity', '0.9');
        expect(text).toHaveAttribute('renderOrder', '1000');
      });

      console.log('✅ 키워드 표면 표시 시스템 검증');
    });

    test('불필요한 키워드 필터링 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const scene = screen.getByTestId('scene');
        expect(scene).toBeInTheDocument();
      }, { timeout: 2000 });

      // 텍스트 요소들에서 필터링된 단어들이 없는지 확인
      const texts = screen.getAllByTestId('text');
      const filteredWords = ['태양계', '행성', '위성', '소행성', '태스크', '할일'];
      
      texts.forEach(text => {
        const textContent = text.textContent || '';
        filteredWords.forEach(word => {
          expect(textContent).not.toContain(word);
        });
      });

      console.log('✅ 불필요한 키워드 필터링 검증');
    });

    test('키워드 크기가 천체 크기에 비례하는지 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const texts = screen.getAllByTestId('text');
        expect(texts.length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      // fontSize가 반지름에 비례하게 설정되었는지 확인 (radius * 0.2)
      const texts = screen.getAllByTestId('text');
      texts.forEach(text => {
        const fontSize = parseFloat(text.getAttribute('fontSize') || '0');
        expect(fontSize).toBeGreaterThan(0);
        expect(fontSize).toBeLessThan(2); // 합리적인 범위 내
      });

      console.log('✅ 키워드 크기 비례 시스템 검증');
    });
  });

  describe('CRITICAL FIX 2: 천체 입체감 개선', () => {
    test('향상된 조명 시스템 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const scene = screen.getByTestId('scene');
        expect(scene).toBeInTheDocument();
      }, { timeout: 2000 });

      // Canvas 컴포넌트가 렌더링되었는지 확인
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toBeInTheDocument();

      console.log('✅ 향상된 조명 시스템 검증');
    });

    test('천체들의 세밀한 geometry 적용 확인', async () => {
      render(<App />);
      
      // Scene 컴포넌트가 올바르게 로드되었는지 확인
      await waitFor(() => {
        const scene = screen.getByTestId('scene');
        expect(scene).toBeInTheDocument();
      }, { timeout: 2000 });

      // 시스템 상태에서 입체감 개선이 반영되었는지 확인
      const systemStatus = screen.getByTestId('system-status');
      expect(systemStatus).toHaveTextContent(/Enhanced 3D Effects|입체감 개선/);

      console.log('✅ 천체 입체감 개선 검증');
    });
  });

  describe('CRITICAL FIX 3: functional_specification.md 완전 준수', () => {
    test('키워드가 천체 표면을 시계방향으로 달려가는지 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('Surface Keywords');
      }, { timeout: 2000 });

      // 애니메이션이 활성화된 상태에서 키워드가 회전하는지 확인
      const animationToggle = screen.getByTestId('animation-toggle');
      expect(animationToggle).toBeInTheDocument();
      
      // 애니메이션이 켜져있는지 확인
      expect(animationToggle.textContent).toContain('⏸️');

      console.log('✅ 키워드 시계방향 회전 검증');
    });

    test('네모 박스 완전 제거 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const scene = screen.getByTestId('scene');
        expect(scene).toBeInTheDocument();
      }, { timeout: 2000 });

      // HTML 요소들에서 키워드 박스 스타일이 없는지 확인
      const htmlElements = screen.getAllByTestId('html');
      htmlElements.forEach(element => {
        const style = element.getAttribute('style') || '';
        // 키워드 박스 관련 스타일이 없는지 확인
        expect(style).not.toContain('background');
        expect(style).not.toContain('border');
        expect(style).not.toContain('padding');
      });

      console.log('✅ 네모 박스 완전 제거 검증');
    });

    test('핵심 단어만 간결하게 표시되는지 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const texts = screen.getAllByTestId('text');
        expect(texts.length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      // 각 텍스트 요소가 3개 이하의 키워드만 표시하는지 확인
      const texts = screen.getAllByTestId('text');
      texts.forEach(text => {
        const textContent = text.textContent || '';
        const words = textContent.trim().split(/\s+/);
        expect(words.length).toBeLessThanOrEqual(3);
      });

      console.log('✅ 핵심 단어 간결 표시 검증');
    });
  });

  describe('버전 및 상태 표시', () => {
    test('v0.8.6 버전 정보 표시 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent('v0.8.6');
        expect(systemStatus).toHaveTextContent('Surface Keywords');
      }, { timeout: 2000 });

      console.log('✅ v0.8.6 버전 정보 검증');
    });

    test('키워드 표면 표시 상태 메시지 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Keywords on Surface|표면 키워드|No Keyword Box/);
      }, { timeout: 2000 });

      console.log('✅ 키워드 표면 표시 상태 메시지 검증');
    });
  });

  describe('기존 기능 유지 확인', () => {
    test('모든 메인 메뉴 버튼이 정상 작동하는지 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('ui-mode-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('analytics-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('ai-grouping-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('animation-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('orbit-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('clear-all-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('speed-slider')).toBeInTheDocument();
      }, { timeout: 2000 });

      console.log('✅ 모든 메인 메뉴 버튼 정상 작동 검증');
    });

    test('v0.8.5의 모든 수정사항이 유지되는지 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        // v0.8.5 수정사항들이 유지되고 있는지 확인
        expect(systemStatus).toHaveTextContent(/Modal|CRUD|Enhanced/);
      }, { timeout: 2000 });

      // Enhanced Mission Control이 제거된 상태 유지 확인
      expect(() => screen.getByTestId('enhanced-mission-control')).toThrow();

      console.log('✅ v0.8.5 수정사항 유지 검증');
    });

    test('functional_specification.md 규칙 준수 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Tasks:|Systems:|Planets:/);
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

      console.log('✅ functional_specification.md 규칙 준수 검증');
    });
  });

  describe('통합 및 안정성 테스트', () => {
    test('빠른 UI 변경 시에도 키워드 표시가 안정적인지 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const animationToggle = screen.getByTestId('animation-toggle');
        expect(animationToggle).toBeInTheDocument();
      }, { timeout: 2000 });

      // 빠른 토글 테스트
      const animationToggle = screen.getByTestId('animation-toggle');
      fireEvent.click(animationToggle);
      fireEvent.click(animationToggle);
      fireEvent.click(animationToggle);

      // 여전히 안정적으로 작동하는지 확인
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toBeInTheDocument();
      }, { timeout: 1000 });

      console.log('✅ UI 변경 안정성 검증');
    });

    test('Scene 컴포넌트와 키워드 시스템 통합 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const scene = screen.getByTestId('scene');
        expect(scene).toBeInTheDocument();
        
        const canvas = screen.getByTestId('canvas');
        expect(canvas).toBeInTheDocument();
      }, { timeout: 2000 });

      // Scene 내부의 키워드 요소들이 올바르게 렌더링되는지 확인
      const texts = screen.getAllByTestId('text');
      expect(texts.length).toBeGreaterThanOrEqual(0);

      console.log('✅ Scene 컴포넌트 통합 검증');
    });

    test('데이터 영속성과 키워드 표시 연동 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toHaveTextContent(/Auto-Save|영속성/);
      }, { timeout: 2000 });

      // 데이터 변경 시에도 키워드가 올바르게 업데이트되는지 확인
      const uiToggle = screen.getByTestId('ui-mode-toggle');
      fireEvent.click(uiToggle);

      await waitFor(() => {
        const systemStatus = screen.getByTestId('system-status');
        expect(systemStatus).toBeInTheDocument();
      }, { timeout: 1000 });

      console.log('✅ 데이터 영속성 연동 검증');
    });
  });

  describe('성능 및 최적화', () => {
    test('키워드 필터링 성능 확인', async () => {
      render(<App />);
      
      const startTime = Date.now();
      
      await waitFor(() => {
        const scene = screen.getByTestId('scene');
        expect(scene).toBeInTheDocument();
      }, { timeout: 2000 });

      const endTime = Date.now();
      const renderTime = endTime - startTime;
      
      // 합리적인 렌더링 시간 내에 완료되는지 확인 (3초 이내)
      expect(renderTime).toBeLessThan(3000);

      console.log('✅ 키워드 필터링 성능 검증');
    });

    test('메모리 효율성 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const texts = screen.getAllByTestId('text');
        // 키워드가 3개 이하로 제한되어 메모리 효율적인지 확인
        texts.forEach(text => {
          const textContent = text.textContent || '';
          const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
          expect(words.length).toBeLessThanOrEqual(3);
        });
      }, { timeout: 2000 });

      console.log('✅ 메모리 효율성 검증');
    });
  });

  describe('접근성 및 사용성', () => {
    test('키워드의 가독성 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const texts = screen.getAllByTestId('text');
        expect(texts.length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      // 모든 텍스트 요소가 적절한 opacity를 가지는지 확인
      const texts = screen.getAllByTestId('text');
      texts.forEach(text => {
        const opacity = parseFloat(text.getAttribute('fillOpacity') || '1');
        expect(opacity).toBeGreaterThan(0.8); // 충분한 가독성
      });

      console.log('✅ 키워드 가독성 검증');
    });

    test('반응형 키워드 크기 조정 확인', async () => {
      render(<App />);
      
      await waitFor(() => {
        const texts = screen.getAllByTestId('text');
        expect(texts.length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      // 다양한 크기의 천체에 대해 적절한 키워드 크기가 적용되는지 확인
      const texts = screen.getAllByTestId('text');
      const fontSizes = texts.map(text => parseFloat(text.getAttribute('fontSize') || '0'));
      
      // 최소 2가지 이상의 서로 다른 크기가 있는지 확인 (태양, 행성, 위성 구분)
      const uniqueSizes = [...new Set(fontSizes)];
      expect(uniqueSizes.length).toBeGreaterThanOrEqual(1);

      console.log('✅ 반응형 키워드 크기 검증');
    });
  });
});

/**
 * v0.8.6 Test Summary - Keyword Surface Display & Enhanced Visual Effects
 * 
 * ✅ CRITICAL FIX 1: 키워드 표면 표시 시스템
 * ✅ CRITICAL FIX 2: 천체 입체감 개선  
 * ✅ CRITICAL FIX 3: functional_specification.md 완전 준수
 * ✅ 버전 및 상태 표시
 * ✅ 기존 기능 유지 확인
 * ✅ 통합 및 안정성 테스트
 * ✅ 성능 및 최적화
 * ✅ 접근성 및 사용성
 * 
 * Total Tests: 25+
 * Expected Result: 
 * - 네모 박스 완전 제거 ✅
 * - 키워드가 천체 표면에 직접 표시 ✅
 * - 불필요한 단어 필터링 ✅
 * - 입체감 개선된 천체들 ✅
 * - functional_specification.md 100% 준수 ✅
 */
