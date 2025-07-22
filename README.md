# 🚀 태양계 투두 앱 v0.4.4

React Three Fiber를 사용한 3D 태양계 시뮬레이션과 할일 관리 시스템

![Version](https://img.shields.io/badge/version-0.4.4-blue.svg)
![React](https://img.shields.io/badge/React-19.1.0-61dafb.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.178.0-black.svg)

## ✨ 주요 기능

### 🌌 3D 태양계 시스템
- 태양을 중심으로 한 8개 행성 궤도 시스템
- 실제 행성 크기와 궤도 속도 반영
- 마우스로 줌, 회전, 이동 가능

### 📋 할일 관리
- 행성별 카테고리로 할일 분류 (수성~해왕성)
- 우선순위 설정 (높음/보통/낮음)
- 마감일 설정 및 긴급도 시각화
- 완료/미완료 상태 관리

### 🤖 AI 기능
- AI 기반 할일 자동 분류
- 스마트 우선순위 예측
- 생산성 분석 대시보드
- 실시간 인사이트 제공

### 📊 분석 대시보드
- 생산성 통계 및 트렌드 분석
- 카테고리별 완료율 시각화
- 시간대별 활동 패턴 분석
- 목표 달성률 추적

### 🎯 인터랙티브 기능
- 미완료 할일이 있는 행성 클릭 가능
- 행성 위에 할일 개수 표시
- 마감일에 따른 색상 변화 (초록→노랑→주황→빨강)
- 실시간 긴급도 애니메이션

## 🚀 빠른 시작

```bash
# 프로젝트 클론
git clone https://github.com/gon1zau6jyun4liu5/solar-system-todo.git

# 의존성 설치
cd solar-system-todo
npm install

# 개발 서버 실행
npm start
```

브라우저에서 http://localhost:3000 으로 접속

## 🧪 테스트

```bash
# 테스트 실행
npm test

# 커버리지 확인 (80% 목표)
npm run test:coverage

# 프로덕션 빌드
npm run build
```

## 🎮 사용법

### 할일 생성
1. 우측 패널의 "+ AI Smart Mission" 버튼 클릭
2. 할일 내용 입력 (AI가 자동으로 분류 제안)
3. 필요시 카테고리, 우선순위, 마감일 수동 조정
4. "Launch AI Mission" 클릭

### 분석 대시보드
1. 화면 하단의 "📊 Analytics" 버튼 클릭
2. 생산성 지표 및 트렌드 확인
3. 카테고리별 성과 분석
4. 개선 권장사항 확인

### 행성 인터랙션
- 미완료 할일이 있는 행성을 클릭하면 해당 카테고리 필터 적용
- 행성 위 숫자는 미완료 할일 개수
- "Show All" 버튼으로 전체 보기 복원

## 🛠️ 기술 스택

- **Frontend:** React 19.1.0
- **3D 렌더링:** Three.js 0.178.0 + React Three Fiber 9.2.0
- **3D 유틸리티:** React Three Drei 10.5.1
- **테스팅:** Jest + React Testing Library (85%+ 커버리지)
- **빌드:** Create React App 5.0.1
- **AI:** 자체 개발 분류 엔진

## 📊 긴급도 시스템

| 상태 | 색상 | 남은 시간 비율 |
|------|------|----------------|
| 보통 | 🟢 초록색 | 51-100% |
| 주의 | 🟡 노란색 | 26-50% |
| 긴급 | 🟠 주황색 | 11-25% |
| 심각 | 🔴 빨간색 | 1-10% |
| 연체 | ⚫ 진한 빨간색 | 0% |

## 📋 지원 브라우저

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔄 최신 업데이트 (v0.4.4)

- 📝 한국어 README 문서 제공
- 🎯 핵심 기능 위주로 문서 간소화
- 📊 분석 대시보드 기능 소개 추가
- 🤖 AI 기능 설명 보강

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork 후 feature 브랜치 생성
2. 변경사항 커밋
3. 테스트 통과 확인
4. Pull Request 생성

---

**Made with 🚀 and ❤️**
