# 🚀 Solar System Todo App v0.4.4

**React Three Fiber 기반 3D 태양계 Todo 관리 시스템** - 인터랙티브 우주 환경과 포괄적인 할일 관리 기능, 데드라인 관리를 통합한 혁신적인 웹 애플리케이션

![Version](https://img.shields.io/badge/version-0.4.4-blue.svg)
![React](https://img.shields.io/badge/React-19.1.0-61dafb.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.178.0-black.svg)
![Tests](https://img.shields.io/badge/tests-passing-green.svg)
![Coverage](https://img.shields.io/badge/coverage-85%25+-yellow.svg)

## 📋 프로젝트 개요

**프로젝트명:** Solar System Todo App  
**현재 버전:** v0.4.4  
**개발 기간:** 2025년 7월  
**기술 스택:** React 19, Three.js, React Three Fiber  
**레포지토리:** https://github.com/gon1zau6jyun4liu5/solar-system-todo  

## ✨ v0.4.4의 새로운 기능

### 🌌 **완전한 궤도 시스템**
- **8개 행성 실제 궤도** - 수성부터 해왕성까지 현실적인 궤도 속도와 크기
- **대화형 행성 클릭** - 미완료 태스크가 있는 행성을 클릭하여 할일 필터링
- **궤도 역학** - 각 행성마다 고유한 궤도 반지름, 속도, 크기 적용
- **시각적 태스크 표시** - 3D 텍스트로 행성 위에 미완료 태스크 수 표시

### ⏰ **고급 데드라인 시스템**
- **데드라인 설정** - 각 미션에 선택적 데드라인 추가 가능
- **긴급도 색상 코딩** - 일반부터 연체까지 5단계 시스템
- **실시간 진행바** - 남은 시간을 시각적으로 표시하는 진행률 표시기
- **긴급 애니메이션** - 긴급하거나 연체된 태스크에 대한 펄스 효과

### 🎯 **향상된 상호작용**
- **스마트 행성 표시** - 미완료 태스크가 있는 행성만 클릭 가능
- **카테고리 필터링** - 행성을 클릭하여 특정 미션 유형에 집중
- **완료된 태스크 숨김** - 완료된 미션은 행성 뷰를 어지럽히지 않음
- **동적 통계** - 행성별 실시간 미션 수 카운트

## 🌟 핵심 기능

### 🌍 **3D 태양계**
- **완전한 행성계** - 정확한 상대적 크기를 가진 8개 행성 모두
- **궤도 애니메이션** - 현실적인 궤도 속도와 자전
- **대화형 컨트롤** - 마우스/터치를 통한 줌, 패닝 내비게이션
- **우주 환경** - 궤도 트레일 시각화가 있는 우주 배경

### 📋 **고급 Todo 관리**
- **완전한 CRUD 작업** - 미션 생성, 읽기, 업데이트, 삭제
- **행성 기반 카테고리** - 모든 행성과 태양을 포함한 10개 카테고리
- **우선순위 시스템** - 색상 코딩이 있는 높음/중간/낮음
- **데드라인 관리** - 긴급도 추적이 있는 선택적 데드라인
- **스마트 필터링** - 상태, 카테고리 또는 행성 선택으로 필터링
- **로컬 저장소** - 자동 데이터 지속성

### 🎨 **긴급도 시각화 시스템**
- **🟢 일반 (51-100%)** - 충분한 시간 남음
- **🟡 경고 (26-50%)** - 데드라인 접근 중
- **🟠 긴급 (11-25%)** - 시간 부족
- **🔴 위험 (1-10%)** - 펄스 애니메이션으로 매우 긴급
- **⚫ 연체 (0%)** - 경고 애니메이션으로 데드라인 초과

## 🚀 빠른 시작

```bash
# 저장소 복제
git clone https://github.com/gon1zau6jyun4liu5/solar-system-todo.git

# 프로젝트 디렉토리로 이동
cd solar-system-todo

# 의존성 설치
npm install

# 개발 서버 시작
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 앱을 확인하세요.

## 🧪 테스트

```bash
# 테스트 실행
npm test

# 커버리지 포함 테스트 (85%+ 목표)
npm run test:coverage

# 프로덕션 빌드
npm run build
```

## 🎮 사용 방법

### **미션 생성**
1. "+ New Mission" 버튼 클릭
2. 미션 설명 입력
3. 행성 카테고리 선택 (수성부터 해왕성까지)
4. 우선순위 레벨 선택 (낮음/중간/높음)
5. 긴급도 추적을 위한 데드라인 설정 (선택사항)
6. "Launch Mission" 클릭

### **행성 상호작용**
- **행성 클릭** - 미완료 태스크가 있는 행성을 클릭하여 미션 필터링
- **태스크 카운터** - 활성 미션이 있는 행성 위에 표시
- **완료된 미션** - 행성 뷰에서 자동으로 숨김
- **"Show All" 버튼** - 전체 미션 뷰로 복귀

### **데드라인 관리**
- 미션 생성 또는 편집 시 데드라인 설정
- **색상 코딩 진행바**로 남은 시간 확인
- **위험 미션**은 시간이 부족할 때 빨간색으로 펄스
- **연체 미션**은 주의를 끌기 위해 깜빡임

## 📊 행성 카테고리

| 행성 | 카테고리 | 아이콘 | 궤도 | 색상 |
|--------|----------|------|--------|-------|
| 태양 | `sun` | ☀️ | 중심 | 노란색 |
| 수성 | `mercury` | 🌑 | 가장 안쪽 | 회갈색 |
| 금성 | `venus` | 💛 | 2번째 | 황금색 |
| 지구 | `earth` | 🌍 | 3번째 | 파란색 |
| 화성 | `mars` | 🔴 | 4번째 | 빨간색 |
| 목성 | `jupiter` | 🪐 | 5번째 | 황갈색 |
| 토성 | `saturn` | 🪐 | 6번째 | 연한 금색 |
| 천왕성 | `uranus` | 🔵 | 7번째 | 청록색 |
| 해왕성 | `neptune` | 🔷 | 가장 바깥쪽 | 진한 파란색 |

## 🏗️ 프로젝트 구조

```
src/
├── components/
│   ├── Scene.js              # 3D 환경 설정
│   ├── SolarSystem.js        # 행성계 관리자
│   ├── Planet.js             # 개별 행성 컴포넌트
│   ├── Sun.js                # 중앙 태양 컴포넌트
│   ├── TodoManager.js        # Todo 상태 관리
│   ├── TodoList.js           # Todo 목록 렌더러
│   ├── TodoItem.js           # 긴급도 표시가 있는 개별 todo
│   ├── TodoForm.js           # 데드라인이 있는 생성/편집 폼
│   ├── TodoManager.css       # 향상된 스타일링
│   └── __tests__/            # 포괄적인 테스트 스위트
├── App.js                    # 상태가 있는 루트 컴포넌트
├── App.css                   # 전역 스타일
└── index.js                  # 애플리케이션 진입점
```

## 🛠️ 기술 스택

- **프론트엔드 프레임워크:** React 19.1.0
- **3D 그래픽:** Three.js 0.178.0 + React Three Fiber 9.2.0
- **3D 유틸리티:** React Three Drei 10.5.1 (Text, OrbitControls)
- **테스트:** Jest + React Testing Library
- **빌드 도구:** Create React App 5.0.1
- **상태 관리:** React Hooks
- **데이터 영속성:** Local Storage API

## 📋 샘플 미션 데이터

앱에는 데드라인이 있는 6개의 사전 로드된 우주 미션이 포함되어 있습니다:

1. **태양의 표면 온도 조사하기** (태양 연구, 높은 우선순위, 2025-07-25 마감)
2. **지구의 자전축 기울기 23.5도 확인** (지구 연구, 완료, 2025-07-22 마감이었음)
3. **화성 탐사 로버 데이터 분석** (화성 탐사, 높은 우선순위, 2025-07-23 마감)
4. **목성의 대적점 관측 일지 작성** (목성 연구, 낮은 우선순위, 2025-07-30 마감)
5. **토성 고리의 구성 물질 연구** (토성 분석, 완료, 2025-07-24 마감이었음)
6. **혜성 궤도 계산 프로그램 완성하기** (일반 미션, 높은 우선순위, 2025-07-22 마감)

## 🧪 테스트 커버리지

애플리케이션은 다음을 포함하여 85%+ 테스트 커버리지를 유지합니다:

- ✅ 행성 궤도 역학 및 렌더링
- ✅ 데드라인이 있는 Todo CRUD 작업
- ✅ 긴급도 계산 알고리즘
- ✅ 행성 클릭 상호작용
- ✅ 카테고리 필터링 로직
- ✅ 로컬 저장소 통합
- ✅ 폼 검증 및 데드라인 처리
- ✅ 컴포넌트 렌더링 및 사용자 상호작용

## 🚀 개발 워크플로우

1. **브랜치 생성:** 모든 변경사항에 대해 기능 브랜치 (`feature/feature-name-v0.X.X`)
2. **테스트 주도 개발:** 새로운 기능에 대한 테스트 작성
3. **품질 보증:** PR 전에 모든 테스트가 통과해야 함
4. **문서화:** 테스트 후 사양서 업데이트
5. **버전 관리:** 각 릴리스마다 버전 증가 및 화면에 표시

## 🎯 핵심 기능 명세

### 1. 3D 태양계 시뮬레이션
**기능 ID:** F001  
**우선순위:** 높음  
**설명:** 인터랙티브 3D 태양계 환경 제공

#### 1.1 태양 컴포넌트 (Sun.js)
- **형태:** 구체 기하학 (SphereGeometry)
- **크기:** 반지름 2 단위
- **재질:** MeshStandardMaterial
  - 기본 색상: `yellow`
  - 발광 색상: `yellow` 
  - 발광 강도: `2`
- **애니메이션:** Y축 기준 0.005 rad/frame 회전
- **성능 요구사항:** 60 FPS 유지

#### 1.2 3D 장면 설정 (Scene.js)
- **카메라 위치:** `[0, 20, 30]`
- **시야각:** 45도
- **조명 설정:**
  - 환경광: 강도 0.5
  - 점광원: 위치 `[10, 10, 10]`
- **컨트롤:** OrbitControls (회전, 확대/축소, 패닝)

### 2. 행성 시스템 (Planet.js)

**8개 행성 데이터:**
```javascript
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

**궤도 물리학:**
- **궤도 운동:** `position.x = cos(time * orbitSpeed) * orbitRadius`
- **자전 애니메이션:** `rotation.y += 0.01` (매 프레임)
- **궤도 선 표시:** 64개 점으로 구성된 원형 라인
- **시각적 피드백:** pending 태스크가 있을 때 emissive 효과

**인터랙션 조건:**
- **클릭 가능:** `pendingTasks > 0 && !completed`
- **태스크 카운트 표시:** 행성 위 3D 텍스트로 개수 표시
- **완료된 태스크:** 행성에서 시각적으로 제외

### 3. 데드라인 및 긴급도 시스템

**긴급도 계산 알고리즘:**
```javascript
const totalTime = deadline.getTime() - created.getTime();
const remainingTime = deadline.getTime() - now.getTime();
const percentage = Math.max(0, (remainingTime / totalTime) * 100);
```

**긴급도 단계:**
1. **NORMAL (51-100%):** 🟢 녹색 - `#4caf50`
2. **WARNING (26-50%):** 🟡 주황색 - `#ffaa00`
3. **URGENT (11-25%):** 🟠 오렌지색 - `#ff6600`
4. **CRITICAL (1-10%):** 🔴 빨간색 - `#ff0000` + 펄스 애니메이션
5. **OVERDUE (0%):** ⚫ 진한 빨간색 - `#cc0000` + 깜빡임 애니메이션

**시각적 효과:**
- **프로그레스 바:** 남은 시간 비율을 시각화
- **색상 그라디언트:** 각 단계별 고유 색상
- **애니메이션 효과:**
  ```css
  .urgency-critical { animation: pulse-critical 2s infinite; }
  .urgency-overdue { animation: pulse-overdue 1s infinite; }
  ```

### 4. Todo 관리 시스템

**확장된 데이터 구조:**
```javascript
{
  id: Number,
  text: String,
  category: String, // 9개 카테고리 (sun + 8개 행성)
  completed: Boolean,
  createdAt: Date,
  priority: String, // 'low' | 'medium' | 'high'
  deadline: Date | null // 새로운 필드
}
```

**카테고리 확장:**
```javascript
const categories = [
  'general', 'sun', 'mercury', 'venus', 'earth', 
  'mars', 'jupiter', 'saturn', 'uranus', 'neptune'
];
```

**향상된 필터링:**
- **All Missions:** 모든 태스크 표시
- **Pending:** 미완료 태스크만 표시
- **Completed:** 완료된 태스크만 표시
- **행성별 필터:** 특정 행성 클릭 시 해당 카테고리만 표시

## 📈 성능 및 최적화

### **3D 렌더링 최적화**
- **LOD (Level of Detail):** 거리에 따른 행성 품질 조절
- **Frustum Culling:** 화면 밖 객체 렌더링 제외
- **Material 재사용:** 동일한 재질 인스턴스 공유

### **React 렌더링 최적화**
- **useMemo:** 궤도 포인트 계산 캐싱
- **useCallback:** 이벤트 핸들러 메모이제이션
- **조건부 렌더링:** 필요한 경우에만 UI 요소 렌더링

### **성능 지표**
- **FPS:** 60fps 목표 유지
- **메모리 사용량:** 브라우저 제한 내
- **로딩 시간:** 3초 이내 초기 렌더링

## 🔧 컴포넌트 아키텍처 v0.4.4

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

**데이터 플로우:**
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

## 🔮 다음 기능 (v0.5.0 예정)

### **생산성 향상**
- 🔔 **브라우저 알림** - 데드라인 알림
- 📊 **분석 대시보드** - 생산성 지표 및 차트
- 🏷️ **미션 템플릿** - 재사용 가능한 미션 패턴
- 🔍 **고급 검색** - 텍스트 내용으로 미션 찾기
- 📱 **PWA 지원** - 오프라인 기능

### **3D 시스템 확장**
- 🌙 **달 시스템** - 행성에 주요 위성 추가
- ☄️ **소행성대** - 인터랙티브 소행성 지역
- 🚀 **우주 정거장** - 3D 미션 허브
- 🌌 **별자리** - 동적 배경 별들

## ⚡ 성능 기능

- **최적화된 렌더링:** 효율적인 Three.js 사용으로 60fps 목표
- **스마트 재렌더링:** 최소 업데이트를 위한 React hooks
- **메모리 관리:** 3D 리소스의 적절한 정리
- **반응형 디자인:** 모바일 및 데스크톱 최적화
- **로컬 저장소:** 캐시된 데이터로 즉시 로딩 시간

## 🌐 브라우저 지원

- **Chrome:** 90+ (권장)
- **Firefox:** 88+
- **Safari:** 14+
- **Edge:** 90+
- **모바일:** iOS Safari 14+, Chrome Mobile 90+

## 📊 수학적 계산

### **3D 회전 계산**
**회전 공식:**
```
rotation.y += 0.005 rad/frame
rotation.y = (rotation.y + 0.005) % (2π)
```

**FPS 계산:**
```
회전 속도 = 0.005 rad/frame × 60 fps = 0.3 rad/s
완전 회전 시간 = 2π / 0.3 ≈ 20.9초
```

### **카메라 위치 계산**
**거리 계산:**
```
카메라 거리 = √(0² + 20² + 30²) = √1300 ≈ 36.06 단위
```

## ✅ 품질 보증

### **테스트 자동화**
```bash
npm test              # 단위 테스트 실행
npm run test:coverage # 커버리지 리포트 생성 (85% 목표)
```

### **코드 품질**
- **ESLint:** 코드 스타일 일관성
- **Prettier:** 자동 포맷팅
- **TypeScript 마이그레이션:** v0.5.0에서 계획

### **개발 완료 기준**
- [ ] 모든 단위 테스트 통과 (85%+ 커버리지)
- [ ] ESLint 경고 0개
- [ ] 보안 취약점 해결
- [ ] 크로스 브라우저 테스트
- [ ] 성능 벤치마크 통과
- [ ] 문서화 완료

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

### **중요 정책**

**사양 변경 금지:**
- 기능사양서에 명시된 사양을 임의로 변경 금지
- 모든 변경사항은 PR 워크플로우를 통해 관리
- 테스트 통과 후에만 사양서 업데이트

**품질 기준:**
- 테스트 커버리지 85% 이상 유지
- 모든 기능에 대한 유닛 테스트 필수
- ESLint 경고 0개 유지

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 라이선스가 부여됩니다.

## 🤝 기여하기

1. 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 만들고 테스트를 추가하세요
4. 모든 테스트가 통과하는지 확인하세요 (`npm run test:coverage`)
5. 필요한 경우 문서를 업데이트하세요
6. 변경사항을 커밋하세요 (`git commit -m 'Add amazing feature'`)
7. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
8. Pull Request를 열어주세요

## 📞 연락처

질문이나 제안 사항이 있으시면 GitHub에서 이슈를 열어주세요.

## 🙏 감사의 말

- **Three.js 커뮤니티** - 놀라운 3D 라이브러리
- **React Three Fiber** - 매끄러운 React/Three.js 통합
- **NASA** - 행성 데이터 영감
- **우주 탐사 애호가들** - 동기 부여

---

**🚀과 ❤️로 우주 탐사와 생산성을 위해 제작되었습니다**

**현재 상태:** v0.4.4 프로덕션 준비 완료 - 완전한 궤도 역학, 데드라인 관리 및 대화형 행성 시스템과 한국어 통합 문서

**🎉 v0.4.4 달성 목표:**
- ✅ 8개 행성 궤도 시스템 구현
- ✅ 행성 클릭 인터랙션 완성
- ✅ 데드라인 및 긴급도 시스템 구현
- ✅ 완료된 태스크 숨김 처리
- ✅ 실시간 색상 변화 시스템
- ✅ 포괄적 테스트 커버리지 (85%+)
- ✅ 향상된 사용자 인터페이스
- ✅ 한국어 통합 문서화

---

**문서 버전:** 4.4  
**최종 수정일:** 2025-07-22  
**작성자:** Solar System Todo 개발팀  
**승인자:** 프로젝트 매니저