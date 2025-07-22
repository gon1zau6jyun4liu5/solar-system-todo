# Solar System Todo App - 기능사양서 v0.4.0

## 📋 프로젝트 개요
**프로젝트명:** Solar System Todo App  
**현재 버전:** v0.4.0  
**레포지토리:** https://github.com/gon1zau6jyun4liu5/solar-system-todo  
**설명:** AI 기반 다중 태양계 시스템을 통한 Todo 관리 및 3D 시각화 애플리케이션

## 🚀 v0.4.0 주요 업데이트

### **혁명적 변화: AI 기반 다중 태양계 시스템**
1. **완전한 AI 분류 시스템** - Todo 내용을 AI가 자동으로 분석하여 그룹, 타입, 우선순위, 기한 추정
2. **다중 태양계 시각화** - 각 Todo 그룹별로 독립적인 태양계 생성
3. **계층적 천체 시스템** - Sun(목표) → Planet(프로젝트) → Satellite(태스크) 구조
4. **실시간 카메라 추적** - 패널에서 태스크 클릭 시 해당 천체로 카메라 자동 이동
5. **마감일 기반 자전 속도** - 마감일이 가까워질수록 천체의 자전 속도 증가

### **AI 분류 엔진 (aiClassifier.js)**
```javascript
// 6가지 카테고리로 자동 분류
categories: {
  'work': { keywords: ['meeting', 'project', 'deadline', 'report'] },
  'personal': { keywords: ['workout', 'health', 'family', 'hobby'] },
  'education': { keywords: ['study', 'learn', 'course', 'exam'] },
  'finance': { keywords: ['budget', 'payment', 'tax', 'investment'] },
  'home': { keywords: ['clean', 'repair', 'cooking', 'organize'] },
  'health': { keywords: ['medical', 'therapy', 'diet', 'wellness'] }
}

// 3가지 계층 자동 분류
hierarchyTypes: {
  'sun': ['goal', 'objective', 'mission', 'vision'],      // 주요 목표
  'planet': ['project', 'initiative', 'plan', 'program'], // 프로젝트
  'satellite': ['task', 'action', 'step', 'item']         // 개별 태스크
}
```

## 🌌 다중 태양계 시스템 명세

### **태양계 구조**
- **태양 (Sun)**: 각 그룹의 주요 목표, 크기와 밝기는 우선순위에 따라 변화
- **행성 (Planet)**: 태양 주위를 공전하는 프로젝트들, 우선순위별 궤도 배치
- **위성 (Satellite)**: 행성 주위를 공전하는 개별 태스크들

### **시각적 속성 계산**
```javascript
const visualProperties = {
  sizeMultiplier: 0.7 + (priority_value / 3) * 0.8,    // 크기
  brightness: 1.0 + (priority_value / 3) * 2.0,        // 밝기
  rotationSpeed: 0.02 / Math.max(1, daysUntilDeadline), // 자전속도
  urgencyColor: daysUntilDeadline <= 3 ? '#ff4444' : '#44ff44' // 긴급색상
}
```

### **궤도 물리학**
- **태양 위치**: 각 시스템별 고유 좌표 `[x, y, z]`
- **행성 궤도**: `orbitRadius = 12 + planetIndex * 4`
- **위성 궤도**: `orbitRadius = 2 + satelliteIndex * 0.7`
- **공전 속도**: 마감일과 우선순위에 따라 동적 계산

## 🎯 카메라 추적 시스템

### **CameraController 컴포넌트**
```javascript
const CameraController = ({ focusedCelestialBody, isAnimationPlaying }) => {
  // 부드러운 카메라 전환 (2초 duration)
  // Ease-out cubic 애니메이션
  // 천체 타입별 최적 카메라 거리 자동 계산
}
```

### **포커스 거리 설정**
- **Sun**: 카메라 오프셋 `[15, 15, 15]`
- **Planet**: 카메라 오프셋 `[8, 8, 8]`
- **Satellite**: 카메라 오프셋 `[5, 5, 5]`

## 🤖 AI 기능 명세

### **자동 분류 과정**
1. **텍스트 분석**: 키워드 매칭으로 카테고리 분류
2. **우선순위 추정**: 긴급 키워드 감지로 우선순위 결정
3. **계층 타입 분류**: 목표/프로젝트/태스크 구분
4. **마감일 추정**: 카테고리와 우선순위 기반 일정 계산
5. **태양계 ID 생성**: `${category}-${hierarchyType}-system` 형식

### **신뢰도 계산**
```javascript
confidence = Math.min(100, (keywordMatches / totalKeywords) * 100 + 30)
```

### **AI 제안 시스템**
- 짧은 Todo에 대한 세부사항 추가 제안
- 높은 우선순위 태스크에 마감일 설정 제안
- 복잡한 개인 태스크 분할 제안

## 🎨 사용자 인터페이스 v0.4.0

### **AI 향상 Todo 매니저**
- **버전 표시**: v0.4.0 실시간 표시
- **포커스 가이드**: "🎯 Click any task to focus camera on its celestial body"
- **계층 필터**: ☀️ Suns, 🪐 Planets, 🛰️ Satellites
- **AI 통계**: 시스템 수, 긴급 태스크 수, AI 신뢰도

### **선택 시각적 피드백**
```css
.todo-item.selected {
  background: rgba(0, 170, 255, 0.2);
  border-color: #00aaff;
  box-shadow: 0 0 20px rgba(0, 170, 255, 0.4);
  transform: translateX(5px);
}

.selection-indicator {
  animation: pulse-selection 2s infinite;
  border: 2px solid #00aaff;
}
```

### **AI 분류 정보 표시**
- **신뢰도 바**: AI 분류 정확도 시각화
- **시스템 정보**: 소속 태양계 표시
- **계층 아이콘**: ☀️🪐🛰️ 타입별 구분
- **추천 적용 버튼**: AI 제안 원클릭 적용

## 🧪 테스트 커버리지 확장 (v0.4.0)

### **새로운 테스트 모듈**
1. **App.test.js** - 통합 테스트 및 카메라 추적
2. **MultiSolarSystemScene.test.js** - 다중 태양계 시스템
3. **aiClassifier.test.js** - AI 분류 엔진
4. **AITodoManager.test.js** - AI 향상 Todo 관리
5. **AITodoForm.test.js** - AI 분류 폼

### **커버리지 목표**
- **전체 라인 커버리지**: 85%+
- **함수 커버리지**: 90%+
- **브랜치 커버리지**: 80%+
- **성능 테스트**: 100개 Todo 1초 내 렌더링

## 🔧 컴포넌트 아키텍처 v0.4.0

```
App.js (메인 상태 관리)
├── MultiSolarSystemScene.js (3D 다중 태양계)
│   ├── CameraController (카메라 추적)
│   ├── AISun.js (AI 태양)
│   ├── AIPlanet.js (AI 행성)
│   └── AISatellite.js (AI 위성)
├── AIPanel.js (AI 제어판)
└── AITodoManager.js (AI Todo 관리)
    ├── AITodoForm.js (AI 분류 폼)
    ├── TodoList.js (목록 표시)
    └── TodoItem.js (개별 아이템)
```

### **데이터 플로우 v0.4.0**
1. **AITodoManager** → AI 분류 → Todo 데이터 생성
2. **App.js** → 상태 통합 관리 (todoData, selectedTodoId, focusedCelestialBody)
3. **MultiSolarSystemScene** → 3D 시각화 및 카메라 제어
4. **TodoItem 클릭** → 카메라 포커스 트리거

## 📊 성능 최적화 v0.4.0

### **3D 렌더링 최적화**
- **forwardRef 활용**: 각 천체 컴포넌트에 ref 전달로 위치 추적
- **useMemo 최적화**: 궤도 계산 및 재질 생성 캐싱
- **애니메이션 제어**: isAnimationPlaying으로 불필요한 계산 방지

### **AI 분류 최적화**
- **디바운싱**: 500ms 지연으로 과도한 AI 호출 방지
- **결과 캐싱**: 동일 텍스트에 대한 중복 분류 방지
- **점진적 분류**: 텍스트 길이에 따른 분류 정확도 조절

## 🔮 v0.5.0 로드맵

### **향상된 AI 기능**
1. **자연어 처리 강화** - GPT 연동으로 더 정확한 분류
2. **학습 시스템** - 사용자 수정 사항을 통한 AI 학습
3. **스마트 알림** - 마감일 기반 지능형 알림
4. **생산성 분석** - AI 기반 업무 패턴 분석

### **3D 시스템 확장**
1. **물리 엔진 통합** - Cannon.js로 realistic한 중력 시뮬레이션
2. **파티클 시스템** - 태스크 완료 시 화려한 효과
3. **VR/AR 지원** - WebXR로 몰입형 경험
4. **협업 기능** - 멀티플레이어 태양계 공유

## ✅ v0.4.0 완성 체크리스트

### **핵심 기능**
- ✅ AI 기반 Todo 자동 분류 시스템
- ✅ 다중 태양계 3D 시각화
- ✅ 계층적 천체 시스템 (Sun→Planet→Satellite)
- ✅ 패널 태스크 클릭 시 카메라 포커스
- ✅ 마감일 기반 자전 속도 제어
- ✅ 실시간 선택 시각적 피드백

### **기술적 완성도**
- ✅ forwardRef를 통한 천체 위치 추적
- ✅ 부드러운 카메라 전환 애니메이션
- ✅ AI 분류 엔진 완전 구현
- ✅ 포괄적 테스트 커버리지 (85%+)
- ✅ 성능 최적화 (100개 Todo 1초 내)

### **사용자 경험**
- ✅ 직관적인 태스크 포커스 기능
- ✅ AI 분류 신뢰도 표시
- ✅ 실시간 시각적 피드백
- ✅ 반응형 디자인 지원
- ✅ 애니메이션 제어 기능

## 📈 성능 지표 v0.4.0

### **렌더링 성능**
- **초기 로딩**: 3초 이내
- **60 FPS 유지**: 100개 Todo까지
- **카메라 전환**: 2초 부드러운 애니메이션
- **메모리 사용량**: 150MB 이하

### **AI 성능**
- **분류 속도**: 100ms 이내
- **정확도**: 키워드 기반 75%+
- **신뢰도**: 평균 65%+
- **디바운싱**: 500ms 지연

## 🚨 중요 정책 v0.4.0

### **기능 무결성**
- AI 분류 시스템은 핵심 기능으로 비활성화 불가
- 카메라 추적 기능은 모든 천체 타입 지원 필수
- 다중 태양계 시스템은 최소 1개 이상 보장

### **하위 호환성**
- 기존 v0.3.0 데이터 구조 완전 지원
- 레거시 행성 시스템과 AI 시스템 병행 지원
- 점진적 마이그레이션 지원

---

**문서 버전:** 4.0  
**최종 수정일:** 2025-07-22  
**작성자:** Solar System Todo 개발팀  
**현재 상태:** v0.4.0 완성 - AI 기반 다중 태양계 시스템과 카메라 추적 기능이 통합된 차세대 생산성 도구

**🎉 v0.4.0 혁신 달성:**
- ✅ 완전한 AI 기반 Todo 분류 시스템
- ✅ 다중 태양계 3D 시각화 엔진
- ✅ 실시간 카메라 추적 및 포커스 기능
- ✅ 계층적 천체 시스템 (Sun→Planet→Satellite)
- ✅ 마감일 기반 동적 물리 시뮬레이션
- ✅ 포괄적 테스트 커버리지 85%+
- ✅ 차세대 사용자 경험 구현