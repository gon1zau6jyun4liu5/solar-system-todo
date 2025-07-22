import fs from 'fs';
import path from 'path';

describe('Korean README Documentation Integration v0.4.4', () => {
  let readmeContent;

  beforeAll(() => {
    // Read the integrated Korean README file
    const readmePath = path.join(process.cwd(), 'README.md');
    readmeContent = fs.readFileSync(readmePath, 'utf-8');
  });

  describe('Version Information', () => {
    test('should display correct version 0.4.4', () => {
      expect(readmeContent).toContain('v0.4.4');
      expect(readmeContent).toContain('**현재 버전:** v0.4.4');
      expect(readmeContent).toContain('Solar System Todo App v0.4.4');
    });

    test('should have version badge with correct format', () => {
      expect(readmeContent).toContain('![Version](https://img.shields.io/badge/version-0.4.4-blue.svg)');
    });

    test('should show achievement goals for v0.4.4', () => {
      expect(readmeContent).toContain('**🎉 v0.4.4 달성 목표:**');
      expect(readmeContent).toContain('✅ 한국어 통합 문서화');
    });
  });

  describe('Korean Language Integration', () => {
    test('should contain Korean titles and headers', () => {
      expect(readmeContent).toContain('프로젝트 개요');
      expect(readmeContent).toContain('새로운 기능');
      expect(readmeContent).toContain('핵심 기능');
      expect(readmeContent).toContain('빠른 시작');
      expect(readmeContent).toContain('사용 방법');
      expect(readmeContent).toContain('행성 카테고리');
      expect(readmeContent).toContain('프로젝트 구조');
      expect(readmeContent).toContain('기술 스택');
    });

    test('should contain comprehensive Korean documentation', () => {
      expect(readmeContent).toContain('완전한 궤도 시스템');
      expect(readmeContent).toContain('고급 데드라인 시스템');
      expect(readmeContent).toContain('향상된 상호작용');
      expect(readmeContent).toContain('긴급도 시각화 시스템');
      expect(readmeContent).toContain('우주 환경');
    });

    test('should include Korean planet names and descriptions', () => {
      const koreanPlanets = [
        '수성', '금성', '지구', '화성', '목성', '토성', '천왕성', '해왕성'
      ];
      
      koreanPlanets.forEach(planet => {
        expect(readmeContent).toContain(planet);
      });
    });
  });

  describe('Technical Specifications in Korean', () => {
    test('should contain Korean technical documentation', () => {
      expect(readmeContent).toContain('궤도 물리학');
      expect(readmeContent).toContain('긴급도 계산 알고리즘');
      expect(readmeContent).toContain('확장된 데이터 구조');
      expect(readmeContent).toContain('성능 및 최적화');
      expect(readmeContent).toContain('컴포넌트 아키텍처');
    });

    test('should include Korean code examples and descriptions', () => {
      expect(readmeContent).toContain('// 8개 행성 데이터');
      expect(readmeContent).toContain('매 프레임');
      expect(readmeContent).toContain('새로운 필드');
      expect(readmeContent).toContain('전역 상태 관리');
    });

    test('should have Korean workflow descriptions', () => {
      expect(readmeContent).toContain('개발 워크플로우');
      expect(readmeContent).toContain('사용자 상호작용 플로우');
      expect(readmeContent).toContain('데드라인 설정 플로우');
      expect(readmeContent).toContain('행성 클릭 시나리오');
    });
  });

  describe('Merged Content Verification', () => {
    test('should contain content from original README', () => {
      expect(readmeContent).toContain('React Three Fiber');
      expect(readmeContent).toContain('Interactive planetary orbital system');
      expect(readmeContent).toContain('npm install');
      expect(readmeContent).toContain('npm start');
      expect(readmeContent).toContain('http://localhost:3000');
    });

    test('should contain content from original SPECIFICATIONS', () => {
      expect(readmeContent).toContain('기능 ID: F001');
      expect(readmeContent).toContain('SphereGeometry');
      expect(readmeContent).toContain('MeshStandardMaterial');
      expect(readmeContent).toContain('OrbitControls');
    });

    test('should contain comprehensive feature descriptions', () => {
      expect(readmeContent).toContain('3D 태양계 시뮬레이션');
      expect(readmeContent).toContain('데드라인 및 긴급도 시스템');
      expect(readmeContent).toContain('Todo 관리 시스템');
      expect(readmeContent).toContain('행성 시스템');
    });
  });

  describe('Development Guidelines in Korean', () => {
    test('should contain Korean development guidelines', () => {
      expect(readmeContent).toContain('개발 가이드라인');
      expect(readmeContent).toContain('Git 워크플로우');
      expect(readmeContent).toContain('버전 관리 규칙');
      expect(readmeContent).toContain('중요 정책');
      expect(readmeContent).toContain('품질 기준');
    });

    test('should contain Korean quality assurance information', () => {
      expect(readmeContent).toContain('품질 보증');
      expect(readmeContent).toContain('테스트 자동화');
      expect(readmeContent).toContain('코드 품질');
      expect(readmeContent).toContain('개발 완료 기준');
    });

    test('should include Korean contribution guidelines', () => {
      expect(readmeContent).toContain('기여하기');
      expect(readmeContent).toContain('저장소를 포크하세요');
      expect(readmeContent).toContain('Pull Request를 열어주세요');
    });
  });

  describe('Future Roadmap in Korean', () => {
    test('should contain Korean future features', () => {
      expect(readmeContent).toContain('다음 기능 (v0.5.0 예정)');
      expect(readmeContent).toContain('생산성 향상');
      expect(readmeContent).toContain('3D 시스템 확장');
      expect(readmeContent).toContain('브라우저 알림');
      expect(readmeContent).toContain('분석 대시보드');
    });

    test('should include Korean technology roadmap', () => {
      expect(readmeContent).toContain('달 시스템');
      expect(readmeContent).toContain('소행성대');
      expect(readmeContent).toContain('우주 정거장');
      expect(readmeContent).toContain('별자리');
    });
  });

  describe('Structure and Organization', () => {
    test('should have proper markdown structure', () => {
      // Check for main headers
      const headers = [
        '# 🚀 Solar System Todo App v0.4.4',
        '## 📋 프로젝트 개요',
        '## ✨ v0.4.4의 새로운 기능',
        '## 🌟 핵심 기능',
        '## 🚀 빠른 시작',
        '## 🎮 사용 방법',
        '## 📊 행성 카테고리'
      ];

      headers.forEach(header => {
        expect(readmeContent).toContain(header);
      });
    });

    test('should contain proper table formatting', () => {
      expect(readmeContent).toContain('| 행성 | 카테고리 | 아이콘 | 궤도 | 색상 |');
      expect(readmeContent).toContain('|--------|----------|------|--------|-------|');
    });

    test('should have code blocks with proper formatting', () => {
      expect(readmeContent).toContain('```bash');
      expect(readmeContent).toContain('```javascript');
      expect(readmeContent).toContain('```css');
    });
  });

  describe('Documentation Quality', () => {
    test('should have appropriate length and comprehensiveness', () => {
      expect(readmeContent.length).toBeGreaterThan(15000); // Should be comprehensive
      expect(readmeContent.split('\n').length).toBeGreaterThan(500); // Should have many lines
    });

    test('should contain emojis for better readability', () => {
      const emojis = ['🚀', '🌟', '🎯', '⏰', '📋', '🌍', '🎨', '⚡'];
      emojis.forEach(emoji => {
        expect(readmeContent).toContain(emoji);
      });
    });

    test('should have consistent formatting', () => {
      // Check for consistent bold formatting
      expect(readmeContent).toMatch(/\*\*[^*]+\*\*/g);
      
      // Check for consistent bullet points
      expect(readmeContent).toContain('- ✅');
      expect(readmeContent).toContain('- **');
    });
  });

  describe('Contact and Credits in Korean', () => {
    test('should contain Korean contact information', () => {
      expect(readmeContent).toContain('연락처');
      expect(readmeContent).toContain('GitHub에서 이슈를 열어주세요');
    });

    test('should contain Korean acknowledgments', () => {
      expect(readmeContent).toContain('감사의 말');
      expect(readmeContent).toContain('Three.js 커뮤니티');
      expect(readmeContent).toContain('React Three Fiber');
      expect(readmeContent).toContain('NASA');
      expect(readmeContent).toContain('우주 탐사 애호가들');
    });

    test('should contain Korean project status', () => {
      expect(readmeContent).toContain('현재 상태: v0.4.4 프로덕션 준비 완료');
      expect(readmeContent).toContain('우주 탐사와 생산성을 위해 제작되었습니다');
    });
  });
});

describe('README File Structure Validation', () => {
  test('should have removed SPECIFICATIONS.md reference', () => {
    const readmePath = path.join(process.cwd(), 'README.md');
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    
    // Should not contain references to separate SPECIFICATIONS.md file
    expect(readmeContent).not.toContain('SPECIFICATIONS.md');
    expect(readmeContent).not.toContain('기능사양서.md');
  });

  test('should be a single comprehensive file', () => {
    // Verify SPECIFICATIONS.md doesn't exist (if it was removed)
    const specsPath = path.join(process.cwd(), 'SPECIFICATIONS.md');
    expect(fs.existsSync(specsPath)).toBe(false);
  });
});