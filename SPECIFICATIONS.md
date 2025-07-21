# Solar System Todo App - 기능사양서 v0.3.0

## 📋 프로젝트 개요
**프로젝트명:** Solar System Todo App  
**현재 버전:** v0.3.0  
**레포지토리:** https://github.com/gon1zau6jyun4liu5/solar-system-todo  
**설명:** React Three Fiber를 이용한 3D 태양계 시뮬레이션과 완전한 Todo 관리 시스템이 결합된 인터랙티브 웹 애플리케이션

## 🚀 v0.3.0 주요 업데이트

### **새로운 핵심 기능**
1. **완전한 8개 행성 궤도 시스템** - 수성부터 해왕성까지
2. **행성 클릭 인터랙션** - pending 태스크가 있는 행성만 클릭 가능
3. **데드라인 및 긴급도 시스템** - 시간 경과에 따른 시각적 경고
4. **완료된 태스크의 행성 숨김** - 완료된 태스크는 행성에서 표시되지 않음
5. **실시간 긴급도 색상 변화** - 남은 시간에 따른 동적 색상 및 애니메이션

## 🛠️ 기술 스택
- **Frontend:** React 19.1.0
- **3D 렌더링:** Three.js 0.178.0, React Three Fiber 9.2.0
- **3D 유틸리티:** React Three Drei 10.5.1 (Text 컴포넌트 포함)
- **테스팅:** Jest, React Testing Library (80%+ 커버리지)
- **개발 도구:** Create React App 5.0.1
- **상태 관리:** React Hooks (useState, useEffect)
- **데이터 영속성:** LocalStorage

## 🌌 3D 궤도 시스템 명세

### **행성 시스템 (Planet.js)**
```javascript
// 8개 행성 데이터
const planets = [
  { name: 'mercury', size: 0.3, color: '#8C7853', orbitRadius: 4, orbitSpeed: 0.8 },
  { name: 'venus', size: 0.4, color: '#FFC649', orbitRadius: 6, orbitSpeed: 0.6 },
  { name: 'earth', size: 0.45, color: '#6B93D6', orbitRadius: 8, orbitSpeed: 0.5 },
  { name: 'mars', size: 0.35, color: '#CD5C5C', orbitRadius: 10, orbitSpeed: 0.4 },
  { name: 'jupiter', size: 0.8, color: '#D8CA9D', orbitRadius: 14, orbitSpeed: 0.2 },
  { name: 'saturn', size: 0.7, color: '#FAD5A5', orbitRadius: 18, orbitSpeed: 0.15 },
  { name: 'uranus', size: 0.5, color: '#4FD0E3', orbitRadius: 22, orbitSpeed: 0.1 },
  { name: 'neptune', size: 0.5, color: '#4B70DD', orbitRadius: 26, orbitSpeed: 0.08 }
];
```

### **궤도 물리학**
- **궤도 운동:** `position.x = cos(time * orbitSpeed) * orbitRadius`
- **자전 애니메이션:** `rotation.y += 0.01` (매 프레임)
- **궤도 선 표시:** 64개 점으로 구성된 원형 라인
- **시각적 피드백:** pending 태스크가 있을 때 emissive 효과

### **인터랙션 조건**
- **클릭 가능:** `pendingTasks > 0 && !completed`
- **태스크 카운트 표시:** 행성 위 3D 텍스트로 개수 표시
- **완료된 태스크:** 행성에서 시각적으로 제외

## ⏰ 데드라인 및 긴급도 시스템

### **긴급도 계산 알고리즘**
```javascript
const totalTime = deadline.getTime() - created.getTime();
const remainingTime = deadline.getTime() - now.getTime();
const percentage = Math.max(0, (remainingTime / totalTime) * 100);
```

### **긴급도 단계**
1. **NORMAL (51-100%):** 🟢 녹색 - `#4caf50`
2. **WARNING (26-50%):** 🟡 주황색 - `#ffaa00`
3. **URGENT (11-25%):** 🟠 오렌지색 - `#ff6600`
4. **CRITICAL (1-10%):** 🔴 빨간색 - `#ff0000` + 펄스 애니메이션
5. **OVERDUE (0%):** ⚫ 진한 빨간색 - `#cc0000` + 깜빡임 애니메이션

### **시각적 효과**
- **프로그레스 바:** 남은 시간 비율을 시각화
- **색상 그라디언트:** 각 단계별 고유 색상
- **애니메이션 효과:**
  ```css
  .urgency-critical { animation: pulse-critical 2s infinite; }
  .urgency-overdue { animation: pulse-overdue 1s infinite; }
  ```

## 🎯 Todo 관리 시스템 (업데이트)

### **확장된 데이터 구조**
```javascript
{
  id: Number,
  text: String,
  category: String, // 9개 카테고리 (sun + 8개 행성)
  completed: Boolean,
  createdAt: Date,
  priority: String, // 'low' | 'medium' | 'high'
  deadline: Date | null // 🆕 새로운 필드
}
```

### **카테고리 확장**
```javascript
const categories = [
  'general', 'sun', 'mercury', 'venus', 'earth', 
  'mars', 'jupiter', 'saturn', 'uranus', 'neptune'
];
```

### **향상된 필터링**
- **All Missions:** 모든 태스크 표시
- **Pending:** 미완료 태스크만 표시
- **Completed:** 완료된 태스크만 표시
- **행성별 필터:** 특정 행성 클릭 시 해당 카테고리만 표시

## 🎨 사용자 인터페이스 개선

### **버전 표시**
- 우상단에 현재 버전 (v0.3.0) 표시
- 반투명 배경에 테두리 스타일

### **카테고리 헤더**
```css
.category-header {
  background: rgba(255, 107, 53, 0.2);
  border: 1px solid rgba(255, 107, 53, 0.3);
  padding: 10px;
  border-radius: 8px;
}
```

### **긴급도 시각화**
- **프로그레스 바:** 시간 진행률 표시
- **색상 코딩:** 5단계 긴급도별 고유 색상
- **애니메이션:** Critical/Overdue 상태에서 주의를 끄는 효과
- **텍스트 표시:** "TIME LEFT", "URGENT", "CRITICAL", "OVERDUE"

## 🧪 테스트 커버리지 확장

### **새로운 테스트 모듈**
1. **Planet.test.js** - 행성 컴포넌트 테스트
2. **SolarSystem.test.js** - 태양계 시스템 테스트
3. **업데이트된 기존 테스트들** - 새로운 기능 반영

### **테스트 커버리지 항목**
- ✅ 행성 궤도 렌더링
- ✅ 태스크 카운트 표시
- ✅ 클릭 인터랙션
- ✅ 데드라인 입력 및 처리
- ✅ 긴급도 계산 로직
- ✅ 카테고리 필터링
- ✅ 시각적 효과 적용

## 📊 성능 최적화

### **3D 렌더링 최적화**
- **LOD (Level of Detail):** 거리에 따른 행성 품질 조절
- **Frustum Culling:** 화면 밖 객체 렌더링 제외
- **Material 재사용:** 동일한 재질 인스턴스 공유

### **React 렌더링 최적화**
- **useMemo:** 궤도 포인트 계산 캐싱
- **useCallback:** 이벤트 핸들러 메모이제이션
- **조건부 렌더링:** 필요한 경우에만 UI 요소 렌더링

## 🔧 컴포넌트 아키텍처 v0.3.0

```
App.js (상태 관리)
├── Scene.js (3D 환경)
│   └── SolarSystem.js (행성 시스템 관리)
│       ├── Sun.js (태양)
│       └── Planet.js × 8 (각 행성)
└── TodoManager.js (Todo 시스템)
    ├── TodoForm.js (생성/편집)
    ├── TodoList.js (목록)
    └── TodoItem.js (개별 아이템)
```

### **데이터 플로우**
1. **App.js** → 전역 상태 관리 (selectedCategory, todos)
2. **Scene.js** → 3D 환경 및 행성 인터랙션
3. **TodoManager.js** → Todo CRUD 및 필터링
4. **Planet.js** → 개별 행성 상태 및 클릭 이벤트

## 🎮 사용자 상호작용 플로우

### **행성 클릭 시나리오**
1. 사용자가 pending 태스크가 있는 행성 클릭
2. `onPlanetClick(planetName)` 호출
3. `selectedCategory` 상태 업데이트
4. TodoManager에서 해당 카테고리 필터링
5. "Show All" 버튼으로 필터 해제 가능

### **데드라인 설정 플로우**
1. 새 미션 생성 또는 기존 미션 편집
2. 데드라인 날짜 선택 (오늘 이후만 가능)
3. 긴급도 계산 및 시각적 피드백 시작
4. 시간 경과에 따른 자동 색상 변화

## 📈 지표 및 분석

### **사용자 경험 지표**
- **미션 완료율:** 생성 대비 완료된 태스크 비율
- **데드라인 준수율:** 기한 내 완료된 태스크 비율
- **행성별 활동도:** 각 카테고리별 태스크 분포
- **긴급도 분포:** Warning/Critical 단계 태스크 비율

### **성능 지표**
- **FPS:** 60fps 목표 유지
- **메모리 사용량:** 브라우저 제한 내
- **로딩 시간:** 3초 이내 초기 렌더링

## 🔮 로드맵 (v0.4.0 예정)

### **다음 단계 기능**
1. **알림 시스템** - 데드라인 임박 시 브라우저 알림
2. **태스크 템플릿** - 반복 미션을 위한 템플릿 시스템
3. **통계 대시보드** - 생산성 분석 차트
4. **드래그 앤 드롭** - 태스크 우선순위 재정렬
5. **백엔드 연동** - 클라우드 동기화

### **3D 시스템 확장**
1. **위성 시스템** - 주요 행성의 위성 추가
2. **소행성대** - 화성과 목성 사이 소행성
3. **혜성 궤도** - 타원 궤도를 가진 혜성
4. **VR/AR 지원** - WebXR을 통한 몰입형 경험

## ✅ 품질 보증

### **테스트 자동화**
```bash
npm test              # 단위 테스트 실행
npm run test:coverage # 커버리지 리포트 생성 (80% 목표)
```

### **코드 품질**
- **ESLint:** 코드 스타일 일관성
- **Prettier:** 자동 포맷팅
- **TypeScript 마이그레이션:** v0.4.0에서 계획

### **브라우저 호환성**
- **Chrome:** 90+ (권장)
- **Firefox:** 88+
- **Safari:** 14+
- **Edge:** 90+

## 📝 개발 가이드라인

### **Git 워크플로우**
1. 기능별 브랜치 생성: `feature/feature-name-vX.X.X`
2. 개발 완료 후 테스트 실행
3. 모든 테스트 통과 확인
4. 기능사양서 업데이트
5. PR 생성 및 코드 리뷰
6. 메인 브랜치 병합

### **버전 관리 규칙**
- **v0.X.0:** 메이저 기능 추가
- **v0.X.Y:** 마이너 기능 및 버그 수정
- **화면 표시:** UI에 현재 버전 항상 표시

### **문서화 규칙**
- 새로운 기능 추가 시 기능사양서 업데이트 필수
- API 변경 시 컴포넌트 문서화
- 테스트 케이스 작성 및 문서화

## 🚨 중요 정책

### **사양 변경 금지**
- 기능사양서에 명시된 사양을 임의로 변경 금지
- 모든 변경사항은 PR 워크플로우를 통해 관리
- 테스트 통과 후에만 사양서 업데이트

### **품질 기준**
- 테스트 커버리지 80% 이상 유지
- 모든 기능에 대한 유닛 테스트 필수
- ESLint 경고 0개 유지

---

**문서 버전:** 3.0  
**최종 수정일:** 2025-07-21  
**작성자:** Solar System Todo 개발팀  
**현재 상태:** v0.3.0 완성 - 완전한 궤도 시스템과 데드라인 기능이 통합된 프로덕션 준비 상태

**🎉 v0.3.0 달성 목표:**
- ✅ 8개 행성 궤도 시스템 구현
- ✅ 행성 클릭 인터랙션 완성
- ✅ 데드라인 및 긴급도 시스템 구현
- ✅ 완료된 태스크 숨김 처리
- ✅ 실시간 색상 변화 시스템
- ✅ 포괄적 테스트 커버리지
- ✅ 향상된 사용자 인터페이스