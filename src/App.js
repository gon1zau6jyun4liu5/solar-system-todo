import React, { useState, useEffect, useCallback } from 'react';
import Scene from './components/Scene';
import AITodoManager from './components/AITodoManager';
import EnhancedMissionControl from './components/EnhancedMissionControl';
import AdvancedAnalyticsDashboard from './components/AdvancedAnalyticsDashboard';
import TaskDetailModal from './components/TaskDetailModal';
import dataManager from './utils/dataManager'; // v0.8.4: 데이터 영속성 매니저
import './App.css';

// 유틸리티 함수들
const generateId = () => Math.random().toString(36).substr(2, 9);

// v0.8.4: functional_specification.md 완전 준수 + 데이터 영속성 보장
// NEW FEATURES: 속도 설정, 궤도 표시, 동적 키워드, 포커싱 기능

function App() {
  // 기본 상태 관리
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1.0); // NEW: 애니메이션 속도 설정
  const [showOrbits, setShowOrbits] = useState(true); // NEW: 궤도 표시 여부
  const [todos, setTodos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [useEnhancedUI, setUseEnhancedUI] = useState(true);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [aiGroupingActive, setAiGroupingActive] = useState(true);
  const [currentView, setCurrentView] = useState('all');
  const [focusedSystemId, setFocusedSystemId] = useState(null); // NEW: 포커싱 기능
  
  // v0.8.0: 다중 태양계 시스템 (올바른 구현)
  const [solarSystems, setSolarSystems] = useState([]); // 여러 태양계
  const [asteroids, setAsteroids] = useState([]);
  
  // 상세정보 모달 상태
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  // v0.8.4: 데이터 로딩 상태
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // v0.8.4: 설정 로드 및 저장
  const loadSettingsFromStorage = useCallback(() => {
    try {
      const settings = dataManager.loadSettings();
      setUseEnhancedUI(settings.useEnhancedUI);
      setShowAnalyticsDashboard(settings.showAnalyticsDashboard);
      setAiGroupingActive(settings.aiGroupingActive);
      setIsAnimationPlaying(settings.isAnimationPlaying);
      setAnimationSpeed(settings.animationSpeed || 1.0); // NEW
      setShowOrbits(settings.showOrbits !== false); // NEW: 기본값 true
      setCurrentView(settings.currentView);
      setFocusedSystemId(settings.focusedSystemId || null); // NEW
      console.log('⚙️ v0.8.4: 설정 로드 완료');
    } catch (error) {
      console.error('❌ 설정 로드 실패:', error);
    }
  }, []);

  const saveSettingsToStorage = useCallback(() => {
    try {
      const settings = {
        useEnhancedUI,
        showAnalyticsDashboard,
        aiGroupingActive,
        isAnimationPlaying,
        animationSpeed, // NEW
        showOrbits, // NEW
        currentView,
        focusedSystemId // NEW
      };
      dataManager.saveSettings(settings);
      console.log('⚙️ v0.8.4: 설정 저장 완료');
    } catch (error) {
      console.error('❌ 설정 저장 실패:', error);
    }
  }, [useEnhancedUI, showAnalyticsDashboard, aiGroupingActive, isAnimationPlaying, animationSpeed, showOrbits, currentView, focusedSystemId]);

  // v0.8.4: 태스크 데이터 로드
  const loadTodosFromStorage = useCallback(async () => {
    try {
      setIsDataLoading(true);
      console.log('📋 v0.8.4: 저장된 태스크 로드 시작...');
      
      const storedTodos = dataManager.getAllTodos();
      
      if (storedTodos && storedTodos.length > 0) {
        setTodos(storedTodos);
        console.log('✅ v0.8.4: 저장된 태스크 로드 완료:', storedTodos.length, '개');
      } else {
        // 저장된 데이터가 없으면 기본 태스크 생성
        console.log('📋 v0.8.4: 저장된 태스크 없음 - 기본 태스크 생성');
        initializeDefaultTasks();
      }
      
      setDataLoaded(true);
    } catch (error) {
      console.error('❌ v0.8.4: 태스크 로드 실패:', error);
      // 오류 시 기본 태스크 생성
      initializeDefaultTasks();
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  // v0.8.4: 태스크를 LocalStorage에 저장
  const saveTodosToStorage = useCallback((updatedTodos) => {
    try {
      dataManager.saveAllTodos(updatedTodos);
      console.log('💾 v0.8.4: 태스크 저장 완료:', updatedTodos.length, '개');
    } catch (error) {
      console.error('❌ v0.8.4: 태스크 저장 실패:', error);
    }
  }, []);

  // 빈 상태 초기화
  const initializeEmptyState = useCallback(() => {
    const emptyTodos = [];
    setTodos(emptyTodos);
    setSolarSystems([]); // 태스크가 없으면 태양계도 없습니다
    setAsteroids([]); // 태스크가 없으면 소행성도 없습니다
    setFocusedSystemId(null); // 포커스 해제
    
    // v0.8.4: 저장소에도 반영
    saveTodosToStorage(emptyTodos);
    
    console.log('🚫 v0.8.4: 태스크 없음 - 모든 태양계 시스템 제거 및 저장');
  }, [saveTodosToStorage]);

  // NEW: 키워드 정제 함수 (functional_specification.md 준수)
  const filterKeywords = useCallback((keywords) => {
    const excludeWords = ['태양계', '행성', '위성', '소행성', '태양', 'planet', 'satellite', 'sun', 'solar', 'system'];
    return keywords.filter(keyword => 
      keyword && 
      keyword.length > 0 && 
      !excludeWords.includes(keyword.toLowerCase()) &&
      keyword.length <= 6 // 간결성을 위해 6글자 이하만
    ).slice(0, 3); // 최대 3개까지만
  }, []);

  // 기본 태스크 데이터 (다양한 카테고리로 여러 태양계 생성 테스트)
  const initializeDefaultTasks = useCallback(() => {
    const defaultTasks = [
      // 업무 카테고리 태스크들 (업무 태양계)
      {
        id: 'task-1',
        text: '프로젝트 기획서 작성',
        category: 'work',
        priority: 'high',
        completed: false,
        createdAt: Date.now(),
        startDate: new Date(),
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        keywords: filterKeywords(['기획서', '프로젝트', '작성', '문서']),
        subtasks: [
          { 
            id: 'subtask-1-1', 
            text: '요구사항 분석', 
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            keywords: filterKeywords(['요구사항', '분석'])
          },
          { 
            id: 'subtask-1-2', 
            text: '기술 스택 선정', 
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            keywords: filterKeywords(['기술', '스택', '선정'])
          }
        ]
      },
      {
        id: 'task-2',
        text: '회의 준비',
        category: 'work',
        priority: 'medium',
        completed: false,
        createdAt: Date.now(),
        startDate: new Date(),
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        keywords: filterKeywords(['회의', '준비']),
        subtasks: [] // 서브태스크가 없으므로 위성도 없습니다
      },
      
      // 개인 카테고리 태스크들 (개인 태양계)
      {
        id: 'task-3',
        text: '장보기 목록 작성',
        category: 'personal',
        priority: 'medium',
        completed: false,
        createdAt: Date.now(),
        startDate: new Date(),
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        keywords: filterKeywords(['장보기', '목록']),
        subtasks: [
          {
            id: 'subtask-3-1',
            text: '냉장고 확인',
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            keywords: filterKeywords(['냉장고', '확인'])
          }
        ]
      },
      
      // 건강 카테고리 태스크들 (건강 태양계)
      {
        id: 'task-4',
        text: '운동 계획 세우기',
        category: 'health',
        priority: 'low',
        completed: false,
        createdAt: Date.now(),
        startDate: new Date(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        keywords: filterKeywords(['운동', '계획']),
        subtasks: [
          {
            id: 'subtask-4-1',
            text: '헬스장 등록',
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            keywords: filterKeywords(['헬스장', '등록'])
          },
          {
            id: 'subtask-4-2',
            text: '운동 스케줄 작성',
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            keywords: filterKeywords(['스케줄', '작성'])
          }
        ]
      }
    ];

    setTodos(defaultTasks);
    
    // v0.8.4: 저장소에 저장
    saveTodosToStorage(defaultTasks);
    
    console.log('🌟 v0.8.4: 기본 태스크 초기화 완료 및 저장 - 다중 카테고리로 여러 태양계 생성 예정');
  }, [saveTodosToStorage, filterKeywords]);

  // 카테고리별 테마
  const getCategoryTheme = useCallback((category) => {
    const themes = {
      work: { color: '#4CAF50', texture: 'corporate', primaryColor: '#388E3C' },
      personal: { color: '#2196F3', texture: 'casual', primaryColor: '#1976D2' },
      health: { color: '#FF9800', texture: 'organic', primaryColor: '#F57C00' },
      study: { color: '#9C27B0', texture: 'academic', primaryColor: '#7B1FA2' },
      general: { color: '#607D8B', texture: 'neutral', primaryColor: '#455A64' }
    };
    return themes[category] || themes.general;
  }, []);

  // 우선순위 값 변환
  const getPriorityValue = useCallback((priority) => {
    const values = { low: 1, medium: 2, high: 3 };
    return values[priority] || 1;
  }, []);

  // v0.8.0: AI 기반 태스크 그룹핑 (여러 그룹 = 여러 태양계)
  const groupTasksByAI = useCallback((taskList) => {
    // 규칙: 태스크가 없으면 그룹도 없습니다
    if (!taskList || taskList.length === 0) {
      console.log('🚫 태스크가 없으므로 그룹 생성 안함');
      return [];
    }

    const groups = [];
    const categoryGroups = {};

    // 카테고리별 그룹핑 (AI 분석 시뮬레이션)
    taskList.forEach(task => {
      const category = task.category || 'general';
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(task);
    });

    // 각 카테고리를 태양계로 변환 (태스크가 있는 경우에만)
    Object.entries(categoryGroups).forEach(([category, tasks]) => {
      if (tasks.length > 0) { // 태스크가 있을 때만 태양 생성
        // AI가 결정하는 태양 이름 (그룹명)
        const sunNames = {
          work: '업무',
          personal: '개인', 
          health: '건강',
          study: '학습',
          general: '일반'
        };

        // 그룹 키워드 생성 (모든 태스크의 키워드 수집 후 정제)
        const groupKeywords = filterKeywords([...new Set(tasks.flatMap(task => task.keywords || []))]);

        groups.push({
          sunName: sunNames[category] || '미분류',
          category: category,
          tasks: tasks,
          keywords: groupKeywords, // 태양에 표시할 키워드 (정제됨)
          theme: getCategoryTheme(category),
          priority: Math.max(...tasks.map(t => getPriorityValue(t.priority)))
        });

        console.log(`☀️ 태양 생성: ${sunNames[category]} (태스크 ${tasks.length}개)`);
      }
    });

    console.log(`🌌 AI 그룹핑 결과: ${groups.length}개의 태양계 그룹`);
    return groups;
  }, [getCategoryTheme, getPriorityValue, filterKeywords]);

  // 태양계 위치 계산 (여러 태양계를 적절히 배치)
  const calculateSystemPosition = useCallback((index, totalSystems) => {
    if (totalSystems === 1) return [0, 0, 0];
    
    const radius = Math.max(80, totalSystems * 25); // 태양계간 충분한 거리
    const angle = (index / totalSystems) * Math.PI * 2;
    
    return [
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ];
  }, []);

  // 색상 계산 (데드라인 기반)
  const calculateUrgencyColor = useCallback((deadline) => {
    if (!deadline) return '#4488FF';
    
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 1) return '#FF0000';      // 빨간색 (긴급)
    if (daysLeft <= 3) return '#FF6600';      // 주황색 (경고)
    if (daysLeft <= 7) return '#FFAA00';      // 노란색 (주의)
    return '#44FF44';                          // 초록색 (여유)
  }, []);

  // 공전 속도 계산 (데드라인 기반 + 전역 속도 설정)
  const calculateOrbitSpeed = useCallback((deadline) => {
    if (!deadline) return 1.0 * animationSpeed;
    
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    let baseSpeed = 0.8;
    if (daysLeft <= 1) baseSpeed = 3.0;     // 매우 빠름
    else if (daysLeft <= 3) baseSpeed = 2.0;     // 빠름
    else if (daysLeft <= 7) baseSpeed = 1.5;     // 보통
    
    return baseSpeed * animationSpeed; // 전역 속도 설정 적용
  }, [animationSpeed]);

  // 행성 위치 계산 (태양 주위 공전)
  const calculatePlanetOrbit = useCallback((index, totalPlanets) => {
    const baseRadius = 15; // 기본 반지름
    const radiusIncrement = 8; // 각 행성간 거리
    
    return {
      orbitRadius: baseRadius + (index * radiusIncrement),
      orbitSpeed: 1.0 + (Math.random() * 0.5), // 약간의 랜덤성
      initialAngle: (index / totalPlanets) * Math.PI * 2 // 균등 분배
    };
  }, []);

  // 위성 위치 계산 (행성 주위 공전)
  const calculateSatelliteOrbit = useCallback((index, totalSatellites) => {
    const baseRadius = 3; // 행성으로부터의 기본 거리
    const radiusIncrement = 1.5; // 각 위성간 거리
    
    return {
      orbitRadius: baseRadius + (index * radiusIncrement),
      orbitSpeed: 2.0 + (Math.random() * 1.0), // 행성보다 빠른 공전
      initialAngle: (index / totalSatellites) * Math.PI * 2
    };
  }, []);

  // v0.8.2: 소행성 생성 (AI가 랜덤으로 생성, 패널 없음)
  // functional_specification.md: "소행성 액션에 대한 제안 패널은 필요 없습니다. 예고 없이 나타나는 겁니다"
  const generateAsteroids = useCallback((systems) => {
    // 규칙: 태양계가 없으면 소행성도 없습니다
    if (!systems || systems.length === 0) {
      console.log('🚫 태양계가 없으므로 소행성 생성 안함');
      setAsteroids([]);
      return;
    }

    const newAsteroids = [];
    
    systems.forEach(system => {
      // 규칙: 행성이 없으면 소행성도 없습니다
      if (!system.planets || system.planets.length === 0) {
        console.log(`🚫 ${system.name}: 행성이 없으므로 소행성 생성 안함`);
        return;
      }

      system.planets.forEach(planet => {
        // 행성을 향한 소행성 (30% 확률)
        if (Math.random() < 0.3) {
          const asteroid = {
            id: `asteroid-${generateId()}`,
            targetType: 'planet',
            targetId: planet.id,
            targetSystemId: system.id,
            targetPosition: planet.position || [0, 0, 0],
            keywords: filterKeywords(['액션', '제안', ...planet.keywords.slice(0, 2)]), // 키워드 정제
            position: [
              (Math.random() - 0.5) * 100,
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 100
            ],
            suggestion: {
              action: ['진행상황 점검', '우선순위 조정', '일정 재검토', '리소스 확인'][Math.floor(Math.random() * 4)],
              description: `${planet.task.text}에 대한 AI 제안`,
              impact: Math.floor(Math.random() * 3) + 1
            },
            speed: (0.5 + Math.random() * 0.5) * animationSpeed, // 전역 속도 적용
            timeLimit: Date.now() + (30 + Math.random() * 60) * 1000,
            color: calculateUrgencyColor(planet.task.deadline),
            startDate: planet.task.startDate,
            deadline: planet.task.deadline
          };
          
          newAsteroids.push(asteroid);
          console.log(`☄️ 소행성 생성: ${planet.task.text}를 향해 돌진 (패널 없음)`);
        }

        // 위성들을 향한 소행성 (서브태스크가 있을 때만)
        if (planet.satellites && planet.satellites.length > 0) {
          planet.satellites.forEach(satellite => {
            if (Math.random() < 0.2) { // 20% 확률
              const asteroid = {
                id: `asteroid-${generateId()}`,
                targetType: 'satellite',
                targetId: satellite.id,
                targetPlanetId: planet.id,
                targetSystemId: system.id,
                targetPosition: satellite.position || [0, 0, 0],
                keywords: filterKeywords(['서브액션', '알림', ...satellite.keywords.slice(0, 2)]), // 키워드 정제
                position: [
                  (Math.random() - 0.5) * 80,
                  (Math.random() - 0.5) * 15,
                  (Math.random() - 0.5) * 80
                ],
                suggestion: {
                  action: ['세부 점검', '진행률 확인', '완료 예정일 조정'][Math.floor(Math.random() * 3)],
                  description: `${satellite.subtask.text}에 대한 AI 제안`,
                  impact: Math.floor(Math.random() * 2) + 1
                },
                speed: (0.8 + Math.random() * 0.7) * animationSpeed, // 전역 속도 적용
                timeLimit: Date.now() + (20 + Math.random() * 40) * 1000,
                color: calculateUrgencyColor(satellite.subtask.deadline),
                startDate: satellite.subtask.startDate,
                deadline: satellite.subtask.deadline
              };
              
              newAsteroids.push(asteroid);
              console.log(`☄️ 소행성 생성: ${satellite.subtask.text} 위성을 향해 돌진 (패널 없음)`);
            }
          });
        }
      });
    });
    
    console.log('☄️ v0.8.4: 생성된 소행성 (패널 없음):', newAsteroids.length, '개');
    setAsteroids(newAsteroids);
  }, [calculateUrgencyColor, animationSpeed, filterKeywords]);

  // 천체 클릭 핸들러 (상세정보 창 표시)
  const handleCelestialBodyClick = useCallback((type, data) => {
    console.log(`🖱️ ${type} 클릭:`, data);
    
    if (data) {
      setSelectedTask({...data, type: type});
      setShowTaskDetail(true);
    }
  }, []);

  // NEW: 포커싱 기능 - 특정 태양계만 표시
  const handleSolarSystemFocus = useCallback((systemId) => {
    if (focusedSystemId === systemId) {
      // 이미 포커스된 태양계를 다시 클릭하면 포커스 해제
      setFocusedSystemId(null);
      console.log('🔍 포커스 해제: 모든 태양계 표시');
    } else {
      // 새로운 태양계 포커스
      setFocusedSystemId(systemId);
      console.log('🔍 태양계 포커스:', systemId);
    }
  }, [focusedSystemId]);

  // v0.8.0: 다중 태양계 생성 (functional_specification.md 정확한 준수)
  const updateSolarSystems = useCallback(async () => {
    console.log('🔄 v0.8.4: 다중 태양계 업데이트 시작');
    console.log('📋 현재 태스크 수:', todos.length);

    // 규칙 1: 태스크가 없으면 태양도 없습니다
    if (!aiGroupingActive || todos.length === 0) {
      console.log('🚫 태스크가 없으므로 모든 태양계 제거');
      setSolarSystems([]);
      setAsteroids([]);
      setFocusedSystemId(null); // 포커스 해제
      return;
    }

    try {
      // AI가 태스크를 분석해서 여러 그룹으로 나눔
      const taskGroups = groupTasksByAI(todos);
      
      if (taskGroups.length === 0) {
        console.log('🚫 태스크 그룹이 없으므로 태양계 없음');
        setSolarSystems([]);
        setAsteroids([]);
        setFocusedSystemId(null); // 포커스 해제
        return;
      }

      // 각 그룹별로 태양계 생성
      const newSolarSystems = taskGroups.map((group, index) => {
        const position = calculateSystemPosition(index, taskGroups.length);

        // 행성들 생성 (각 태스크 = 하나의 행성)
        const planets = group.tasks.map((task, planetIndex) => {
          const orbitInfo = calculatePlanetOrbit(planetIndex, group.tasks.length);
          
          // 위성들 생성 (서브태스크가 있을 때만)
          const satellites = task.subtasks && task.subtasks.length > 0 
            ? task.subtasks.map((subtask, satIndex) => {
                const satOrbitInfo = calculateSatelliteOrbit(satIndex, task.subtasks.length);
                
                console.log(`  🛰️ 위성 생성: ${subtask.text} (부모: ${task.text})`);
                
                return {
                  id: `satellite-${subtask.id}`,
                  name: subtask.text,
                  keywords: filterKeywords(subtask.keywords || []), // 키워드 정제
                  subtask: subtask,
                  completed: subtask.completed,
                  orbitRadius: satOrbitInfo.orbitRadius,
                  orbitSpeed: calculateOrbitSpeed(subtask.deadline) * satOrbitInfo.orbitSpeed,
                  initialAngle: satOrbitInfo.initialAngle,
                  color: calculateUrgencyColor(subtask.deadline),
                  startDate: subtask.startDate,
                  deadline: subtask.deadline,
                  onClick: () => handleCelestialBodyClick('satellite', subtask)
                };
              })
            : [];
          
          console.log(`🪐 행성 생성: ${task.text} (위성 ${satellites.length}개) - ${group.sunName}`);
          
          return {
            id: `planet-${task.id}`,
            name: task.text,
            keywords: filterKeywords(task.keywords || []), // 키워드 정제
            task: task,
            completed: task.completed,
            orbitRadius: orbitInfo.orbitRadius,
            orbitSpeed: calculateOrbitSpeed(task.deadline) * orbitInfo.orbitSpeed,
            initialAngle: orbitInfo.initialAngle,
            color: calculateUrgencyColor(task.deadline),
            startDate: task.startDate,
            deadline: task.deadline,
            satellites: satellites, // 서브태스크가 없으면 빈 배열
            onClick: () => handleCelestialBodyClick('planet', task)
          };
        });

        // 태양계 시스템 생성
        const solarSystem = {
          id: `system-${generateId()}`,
          name: group.sunName,
          position: position,
          
          // 태양 (태스크 그룹명)
          sun: {
            id: `sun-${generateId()}`,
            name: group.sunName,
            keywords: group.keywords, // 키워드 항상 표시 (정제됨)
            totalTasks: group.tasks.length,
            category: group.category,
            theme: group.theme,
            onClick: () => handleCelestialBodyClick('sun', {
              type: 'sun',
              name: group.sunName,
              keywords: group.keywords,
              tasks: group.tasks,
              description: `${group.sunName}는 ${group.tasks.length}개의 태스크를 관리하는 태양입니다.`
            })
          },
          
          // 행성들 (태스크들)
          planets: planets,
          theme: group.theme,
          priority: group.priority
        };

        console.log(`☀️ 태양계 생성: ${group.sunName} (행성 ${planets.length}개)`);
        return solarSystem;
      });

      console.log('🌌 v0.8.4: 생성된 태양계 시스템:', newSolarSystems.length, '개');
      newSolarSystems.forEach((system, index) => {
        console.log(`  ${index + 1}. ${system.name} - ${system.planets.length}개 행성`);
      });
      
      setSolarSystems(newSolarSystems);
      
      // 포커스된 태양계가 더 이상 존재하지 않으면 포커스 해제
      if (focusedSystemId && !newSolarSystems.find(s => s.id === focusedSystemId)) {
        setFocusedSystemId(null);
        console.log('🔍 포커스된 태양계가 없어져서 포커스 해제');
      }
      
      // 소행성 시스템 업데이트 (패널 없음)
      generateAsteroids(newSolarSystems);
      
    } catch (error) {
      console.error('태양계 생성 오류:', error);
      setSolarSystems([]);
      setAsteroids([]);
      setFocusedSystemId(null);
    }
  }, [todos, aiGroupingActive, groupTasksByAI, calculateSystemPosition, calculatePlanetOrbit, calculateSatelliteOrbit, calculateOrbitSpeed, calculateUrgencyColor, handleCelestialBodyClick, generateAsteroids, focusedSystemId, filterKeywords]);

  // 모달 닫기
  const closeTaskDetail = useCallback(() => {
    setShowTaskDetail(false);
    setSelectedTask(null);
  }, []);

  // v0.8.4: 앱 초기화 - 데이터 로드 및 설정 복원
  useEffect(() => {
    console.log('🚀 v0.8.4: 앱 초기화 시작...');
    
    const initializeApp = async () => {
      // 설정 로드
      loadSettingsFromStorage();
      
      // 데이터 로드
      await loadTodosFromStorage();
      
      console.log('✅ v0.8.4: 앱 초기화 완료');
    };
    
    initializeApp();
  }, [loadSettingsFromStorage, loadTodosFromStorage]);

  // v0.8.4: 설정 변경 시 자동 저장
  useEffect(() => {
    if (dataLoaded) {
      saveSettingsToStorage();
    }
  }, [useEnhancedUI, showAnalyticsDashboard, aiGroupingActive, isAnimationPlaying, animationSpeed, showOrbits, currentView, focusedSystemId, dataLoaded, saveSettingsToStorage]);

  // v0.8.4: 태스크 변경 시 태양계 재생성 및 저장
  useEffect(() => {
    if (!dataLoaded || isDataLoading) return;

    const debounceTimer = setTimeout(() => {
      updateSolarSystems();
      // 태스크 변경 시 자동 저장은 개별 함수에서 처리
    }, 1000); // 1초 디바운스

    return () => clearTimeout(debounceTimer);
  }, [todos.length, updateSolarSystems, dataLoaded, isDataLoading]);

  // 애니메이션 토글
  const toggleAnimation = useCallback(() => {
    setIsAnimationPlaying(prev => !prev);
  }, []);

  // NEW: 속도 설정 기능
  const handleSpeedChange = useCallback((newSpeed) => {
    setAnimationSpeed(Math.max(0.1, Math.min(5.0, newSpeed))); // 0.1 ~ 5.0 범위
    console.log('⚡ 애니메이션 속도 변경:', newSpeed);
  }, []);

  // NEW: 궤도 표시 토글
  const toggleOrbits = useCallback(() => {
    setShowOrbits(prev => !prev);
    console.log('🌀 궤도 표시 토글:', !showOrbits);
  }, [showOrbits]);

  // v0.8.4: 태스크 업데이트 (영속성 보장)
  const handleTodoUpdate = useCallback((todoId, updates) => {
    setTodos(prev => {
      const updatedTodos = prev.map(todo => {
        if (todo.id === todoId) {
          const updated = { ...todo, ...updates };
          // 키워드 업데이트 시 정제 적용
          if (updates.keywords) {
            updated.keywords = filterKeywords(updates.keywords);
          }
          return updated;
        }
        return todo;
      });
      
      // v0.8.4: 즉시 저장
      saveTodosToStorage(updatedTodos);
      console.log('✅ v0.8.4: 태스크 업데이트 및 저장:', todoId);
      
      return updatedTodos;
    });
  }, [saveTodosToStorage, filterKeywords]);

  // v0.8.4: 태스크 추가 (영속성 보장)
  const handleTodoAdd = useCallback((newTodo = {}) => {
    const todo = {
      id: generateId(),
      text: newTodo.text || 'New Task',
      category: newTodo.category || 'general',
      priority: newTodo.priority || 'medium',
      completed: false,
      createdAt: Date.now(),
      startDate: new Date(),
      deadline: newTodo.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      keywords: filterKeywords(newTodo.keywords || [newTodo.text?.split(' ')[0] || 'Task']),
      subtasks: newTodo.subtasks || []
    };
    
    setTodos(prev => {
      const updatedTodos = [...prev, todo];
      
      // v0.8.4: 즉시 저장
      saveTodosToStorage(updatedTodos);
      console.log('✅ v0.8.4: 새 태스크 추가 및 저장:', todo.text);
      
      return updatedTodos;
    });
  }, [saveTodosToStorage, filterKeywords]);

  // v0.8.4: 태스크 삭제 (영속성 보장) - CRITICAL FIX
  const handleTodoDelete = useCallback((todoId) => {
    setTodos(prev => {
      const deletedTodo = prev.find(t => t.id === todoId);
      const updatedTodos = prev.filter(todo => todo.id !== todoId);
      
      // v0.8.4: 즉시 저장 - 이제 새로고침해도 삭제된 상태 유지
      saveTodosToStorage(updatedTodos);
      console.log('🗑️ v0.8.4: 태스크 삭제 및 저장:', deletedTodo?.text);
      
      // 태스크가 모두 삭제되면 태양계도 제거
      if (updatedTodos.length === 0) {
        console.log('🚫 마지막 태스크 삭제 - 모든 태양계 제거 예정');
        setFocusedSystemId(null); // 포커스 해제
      }
      
      return updatedTodos;
    });
  }, [saveTodosToStorage]);

  // 카테고리 변경
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  // UI 모드 토글
  const toggleUIMode = useCallback(() => {
    setUseEnhancedUI(prev => !prev);
  }, []);

  // 분석 대시보드 토글
  const toggleAnalyticsDashboard = useCallback(() => {
    setShowAnalyticsDashboard(prev => !prev);
  }, []);

  const closeAnalyticsDashboard = useCallback(() => {
    setShowAnalyticsDashboard(false);
  }, []);

  // AI 그룹핑 토글
  const toggleAIGrouping = useCallback(() => {
    setAiGroupingActive(prev => {
      const newState = !prev;
      if (!newState) {
        console.log('🤖 AI 그룹핑 비활성화 - 모든 태양계 제거');
        setSolarSystems([]);
        setAsteroids([]);
        setFocusedSystemId(null);
      } else {
        console.log('🤖 AI 그룹핑 활성화 - 태양계 재구성 시작');
      }
      return newState;
    });
  }, []);

  // 태양계 클릭
  const handleSolarSystemClick = useCallback((systemId) => {
    setCurrentView(currentView === `system-${systemId}` ? 'all' : `system-${systemId}`);
  }, [currentView]);

  // v0.8.2: 소행성 액션 처리 (패널 없이 직접 처리)
  // functional_specification.md: "소행성 액션에 대한 제안 패널은 필요 없습니다"
  const handleAsteroidAction = useCallback((asteroidId, action) => {
    if (action === 'accept') {
      console.log('✅ 소행성 제안 수락 (패널 없음):', asteroidId);
      setAsteroids(prev => prev.filter(a => a.id !== asteroidId));
    } else if (action === 'reject') {
      console.log('❌ 소행성 제안 거부 (패널 없음):', asteroidId);
      setAsteroids(prev => prev.filter(a => a.id !== asteroidId));
    }
  }, []);

  // Clear All 토글
  const handleClearAllToggle = useCallback(() => {
    if (todos.length > 0) {
      initializeEmptyState();
    } else {
      initializeDefaultTasks();
    }
  }, [todos.length, initializeEmptyState, initializeDefaultTasks]);

  // v0.8.4: 로딩 중일 때 표시할 컴포넌트
  if (isDataLoading) {
    return (
      <div className="App" style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🌌</div>
          <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Solar Todo v0.8.4</div>
          <div style={{ fontSize: '1rem', opacity: 0.7 }}>데이터 영속성 시스템 로딩중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="App" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* v0.8.4: functional_specification.md 완전 준수 - 메인 메뉴를 왼쪽 수직으로 배치 */}
      <div 
        className="main-menu-vertical"
        data-testid="main-menu-vertical"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '80px',
          height: '100vh',
          background: 'linear-gradient(180deg, rgba(15, 15, 35, 0.95) 0%, rgba(25, 25, 45, 0.95) 100%)',
          borderRight: '2px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 10px',
          gap: '15px',
          zIndex: 2000,
          boxShadow: '2px 0 20px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* 로고/타이틀 */}
        <div style={{
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '10px',
          transform: 'rotate(0deg)',
          lineHeight: '1.2'
        }}>
          🌌<br/>SOLAR<br/>TODO<br/>v0.8.4
        </div>

        {/* UI 모드 토글 */}
        <button 
          className="menu-button"
          onClick={toggleUIMode}
          title={`Switch to ${useEnhancedUI ? 'Classic' : 'Enhanced'} UI`}
          data-testid="ui-mode-toggle"
          style={{
            background: useEnhancedUI 
              ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' 
              : 'linear-gradient(135deg, #6b7280, #9ca3af)',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '18px',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}
        >
          {useEnhancedUI ? '🎨' : '🚀'}
        </button>

        {/* 분석 대시보드 토글 */}
        <button 
          className="menu-button"
          onClick={toggleAnalyticsDashboard}
          title="Toggle Advanced Analytics Dashboard"
          data-testid="analytics-toggle"
          style={{
            background: showAnalyticsDashboard 
              ? 'linear-gradient(135deg, #059669, #10b981)' 
              : 'linear-gradient(135deg, #374151, #4b5563)',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '18px',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}
        >
          📊
        </button>

        {/* AI 그룹핑 토글 */}
        <button 
          className="menu-button"
          onClick={toggleAIGrouping}
          title="Toggle AI Grouping"
          data-testid="ai-grouping-toggle"
          style={{
            background: aiGroupingActive 
              ? 'linear-gradient(135deg, #dc2626, #ef4444)' 
              : 'linear-gradient(135deg, #6b7280, #9ca3af)',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '18px',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}
        >
          🤖
        </button>

        {/* 애니메이션 토글 */}
        <button 
          className="menu-button"
          onClick={toggleAnimation}
          title={`${isAnimationPlaying ? 'Pause' : 'Play'} Solar System`}
          data-testid="animation-toggle"
          style={{
            background: isAnimationPlaying 
              ? 'linear-gradient(135deg, #f59e0b, #f97316)' 
              : 'linear-gradient(135deg, #6b7280, #9ca3af)',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '18px',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}
        >
          {isAnimationPlaying ? '⏸️' : '▶️'}
        </button>

        {/* NEW: 궤도 표시 토글 */}
        <button 
          className="menu-button"
          onClick={toggleOrbits}
          title="Toggle Orbit Visualization"
          data-testid="orbit-toggle"
          style={{
            background: showOrbits 
              ? 'linear-gradient(135deg, #8b5cf6, #a855f7)' 
              : 'linear-gradient(135deg, #6b7280, #9ca3af)',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '18px',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}
        >
          🌀
        </button>

        {/* Clear All 테스트 버튼 */}
        <button 
          className="menu-button"
          onClick={handleClearAllToggle}
          title="Clear All Tasks (Test Rule Compliance)"
          data-testid="clear-all-toggle"
          style={{
            background: 'linear-gradient(135deg, #7c2d12, #dc2626)',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '18px',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}
        >
          🧹
        </button>

        {/* NEW: 속도 설정 슬라이더 */}
        <div style={{
          marginTop: 'auto',
          marginBottom: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px'
        }}>
          <div style={{ color: '#888', fontSize: '10px' }}>속도</div>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            data-testid="speed-slider"
            style={{
              width: '60px',
              height: '20px',
              transform: 'rotate(-90deg)',
              transformOrigin: 'center'
            }}
          />
          <div style={{ color: '#888', fontSize: '8px' }}>
            {animationSpeed.toFixed(1)}x
          </div>
        </div>

        {/* 상태 표시 (축약형) */}
        <div style={{
          fontSize: '10px',
          color: '#888',
          textAlign: 'center',
          lineHeight: '1.2'
        }}>
          T:{todos.length}<br/>
          S:{solarSystems.length}<br/>
          A:{asteroids.length}<br/>
          {focusedSystemId && '🔍'}<br/>
          💾
        </div>
      </div>

      {/* v0.8.4: 3D 씬 - 메인 메뉴를 고려한 레이아웃 */}
      <div style={{ marginLeft: '80px', width: 'calc(100vw - 80px)', height: '100vh' }}>
        <Scene 
          isAnimationPlaying={isAnimationPlaying}
          animationSpeed={animationSpeed} // NEW: 속도 전달
          showOrbits={showOrbits} // NEW: 궤도 표시 전달
          solarSystems={solarSystems}
          asteroids={asteroids}
          currentView={currentView}
          focusedSystemId={focusedSystemId} // NEW: 포커싱 전달
          onSolarSystemClick={handleSolarSystemClick}
          onSolarSystemFocus={handleSolarSystemFocus} // NEW: 포커싱 핸들러
          onPlanetClick={handleCelestialBodyClick}
          onSatelliteClick={handleCelestialBodyClick}
          onAsteroidClick={handleCelestialBodyClick}
          onSunClick={handleCelestialBodyClick}
          data-testid="scene"
        />
      </div>

      {/* 시스템 상태 표시 - 위치 조정 */}
      <div 
        className="system-status"
        data-testid="system-status"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '100px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '15px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 1000
        }}
      >
        📋 Tasks: {todos.length} | 🌌 Systems: {solarSystems.length} | ☄️ Asteroids: {asteroids.length}
        {focusedSystemId && ` | 🔍 Focus: ${solarSystems.find(s => s.id === focusedSystemId)?.name || 'Unknown'}`}
        <br />
        💾 v0.8.4 Enhanced Features - Speed: {animationSpeed.toFixed(1)}x | Orbits: {showOrbits ? 'ON' : 'OFF'}
        <br />
        {/* 규칙 준수 상태 표시 */}
        <div style={{ fontSize: '12px', marginTop: '5px', color: '#aaa' }}>
          {todos.length === 0 && '🚫 No Tasks → No Planets, No Suns, No Satellites'}
          {todos.length > 0 && !aiGroupingActive && '🚫 Tasks exist but AI grouping disabled'}
          {todos.length > 0 && solarSystems.length === 0 && aiGroupingActive && '🔄 Processing...'}
          {todos.length > 0 && solarSystems.length > 0 && `✅ ${solarSystems.length} solar system${solarSystems.length > 1 ? 's' : ''} active | 💾 Auto-Save ON`}
        </div>
      </div>

      {/* v0.8.4: 조건부 UI 렌더링 - 메인 메뉴에 겹치지 않도록 위치 조정 */}
      <div style={{ marginLeft: '80px' }}>
        {useEnhancedUI ? (
          <EnhancedMissionControl
            todos={todos}
            selectedCategory={selectedCategory}
            onTodoUpdate={handleTodoUpdate}
            onTodoAdd={handleTodoAdd}
            onTodoDelete={handleTodoDelete}
            onCategoryChange={handleCategoryChange}
            solarSystems={solarSystems}
            asteroids={asteroids}
            data-testid="enhanced-mission-control"
          />
        ) : (
          <AITodoManager
            onTodoDataChange={setTodos}
            todos={todos}
            data-testid="ai-todo-manager"
          />
        )}
      </div>

      {/* 분석 대시보드 - 메인 메뉴보다 낮은 z-index */}
      {showAnalyticsDashboard && (
        <AdvancedAnalyticsDashboard
          todos={todos}
          solarSystems={solarSystems}
          asteroids={asteroids}
          isVisible={showAnalyticsDashboard}
          onClose={closeAnalyticsDashboard}
          data-testid="analytics-dashboard"
          style={{ zIndex: 1500 }}
        />
      )}

      {/* v0.8.4: 팝업 창 최상위 위치 - functional_specification.md 준수 */}
      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isVisible={showTaskDetail}
          onClose={closeTaskDetail}
          onUpdate={handleTodoUpdate}
          data-testid="task-detail-modal"
        />
      )}
    </div>
  );
}

export default App;
