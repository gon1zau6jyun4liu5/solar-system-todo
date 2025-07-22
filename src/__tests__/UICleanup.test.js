import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('UI Cleanup Tests - v0.5.3', () => {
  test('should only display version info in the UI', () => {
    render(<App />);
    
    // 버전 정보는 표시되어야 함
    const versionElement = screen.queryByText(/v0\.5\./);
    expect(versionElement).toBeInTheDocument();
  });

  test('should not display UI mode toggle button', () => {
    render(<App />);
    
    // UI 모드 토글 버튼은 존재하지 않아야 함
    const uiModeToggle = screen.queryByText(/UI Mode/i);
    expect(uiModeToggle).not.toBeInTheDocument();
  });

  test('should not display analytics toggle button', () => {
    render(<App />);
    
    // 분석 토글 버튼은 존재하지 않아야 함
    const analyticsToggle = screen.queryByText(/Analytics/i);
    expect(analyticsToggle).not.toBeInTheDocument();
  });

  test('should not display AI grouping toggle button', () => {
    render(<App />);
    
    // AI 그룹핑 토글 버튼은 존재하지 않아야 함
    const aiGroupingToggle = screen.queryByText(/AI Grouping/i);
    expect(aiGroupingToggle).not.toBeInTheDocument();
  });

  test('should not display feature badge', () => {
    render(<App />);
    
    // 기능 배지는 존재하지 않아야 함
    const featureBadge = screen.queryByText(/NEW:/i);
    expect(featureBadge).not.toBeInTheDocument();
  });

  test('should not display system status', () => {
    render(<App />);
    
    // 시스템 상태는 존재하지 않아야 함
    const systemStatus = screen.queryByText(/Systems/i);
    expect(systemStatus).not.toBeInTheDocument();
    
    const asteroidsStatus = screen.queryByText(/Asteroids/i);
    expect(asteroidsStatus).not.toBeInTheDocument();
  });

  test('should not display asteroid action panel', () => {
    render(<App />);
    
    // 소행성 액션 패널은 존재하지 않아야 함
    const asteroidPanel = screen.queryByText(/Action Suggestion/i);
    expect(asteroidPanel).not.toBeInTheDocument();
  });

  test('should have clean UI with minimal elements', () => {
    const { container } = render(<App />);
    
    // 제거된 클래스들이 DOM에 없는지 확인
    expect(container.querySelector('.ui-mode-toggle')).not.toBeInTheDocument();
    expect(container.querySelector('.analytics-toggle')).not.toBeInTheDocument();
    expect(container.querySelector('.ai-grouping-toggle')).not.toBeInTheDocument();
    expect(container.querySelector('.feature-badge')).not.toBeInTheDocument();
    expect(container.querySelector('.system-status')).not.toBeInTheDocument();
    expect(container.querySelector('.asteroid-action-panel')).not.toBeInTheDocument();
  });

  test('should maintain version info styling', () => {
    const { container } = render(<App />);
    
    // 버전 정보 요소는 여전히 존재해야 함
    const versionInfo = container.querySelector('.version-info');
    expect(versionInfo).toBeInTheDocument();
  });

  test('should have proper CSS cleanup', () => {
    // CSS 파일의 내용을 확인하는 것은 어렵지만, 
    // 스타일이 적용되지 않는 요소들이 렌더링되지 않는지 확인
    render(<App />);
    
    // DOM에 불필요한 버튼들이 없는지 확인
    const allButtons = screen.queryAllByRole('button');
    
    // 특정 UI 정리 관련 버튼들이 없는지 확인
    allButtons.forEach(button => {
      expect(button).not.toHaveTextContent('UI Mode');
      expect(button).not.toHaveTextContent('Analytics');
      expect(button).not.toHaveTextContent('AI Grouping');
    });
  });
});