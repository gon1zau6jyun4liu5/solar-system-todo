import React, { useState, useEffect, useCallback } from 'react';
import Scene from './components/Scene';
import AITodoManager from './components/AITodoManager';
import EnhancedMissionControl from './components/EnhancedMissionControl';
import AdvancedAnalyticsDashboard from './components/AdvancedAnalyticsDashboard';
import AsteroidActionSystem from './components/AsteroidActionSystem';
import TaskDetailModal from './components/TaskDetailModal';
import './App.css';

// 유틸리티 함수들
const generateId = () => Math.random().toString(36).substr(2, 9);

// v0.8.0: functional_specification.md 정확한 구현
// CORRECT INTERPRETATION:
// "그룹명이 2개 이상이면 태양도 2개 이상입니다. 태양계도 2개 이상이 됩니다."
// 
// 올바른 구조:
// 1. 태스크가 없으면 행성도 없습니다
// 2. 서브 태스크가 없으면 위성도 없습니다
// 3. 태스크가 없으면 태스크 그룹도 없고, 태양도 없습니다
// 4. AI가 태스크를 분석해서 여러 그룹으로 나눔
// 5. 각 그룹 = 하나의 태양계 (그룹명 = 태양 이름)
// 6. 여러 그룹 = 여러 태양계 시스템

function App() {
  // 기본 상태 관리
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
  const [todos, setTodos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [useEnhancedUI, setUseEnhancedUI] = useState(true);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [aiGroupingActive, setAiGroupingActive] = useState(true);
  const [currentView, setCurrentView] = useState('all');
  
  // v0.8.0: 다중 태양계 시스템 (올바른 구현)
  const [solarSystems, setSolarSystems] = useState([]); // 여러 태양계
  const [asteroids, setAsteroids] = useState([]);
  
  // 상세정보 모달 상태
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  // 빈 상태 초기화
  const initializeEmptyState = useCallback(() => {
    setTodos([]);
    setSolarSystems([]); // 태스크가 없으면 태양계도 없습니다
    setAsteroids([]); // 태스크가 없으면 소행성도 없습니다
    console.log('🚫 v0.8.0: 태스크 없음 - 모든 태양계 시스템 제거');
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
        keywords: ['기획서', '프로젝트', '작성'],
        subtasks: [
          { 
            id: 'subtask-1-1', 
            text: '요구사항 분석', 
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            keywords: ['요구사항', '분석']
          },
          { 
            id: 'subtask-1-2', 
            text: '기술 스택 선정', 
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            keywords: ['기술', '스택', '선정']
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
        keywords: ['회의', '준비'],
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
        keywords: ['장보기', '목록'],
        subtasks: [
          {
            id: 'subtask-3-1',
            text: '냉장고 확인',
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            keywords: ['냉장고', '확인']
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
        keywords: ['운동', '계획'],
        subtasks: [
          {
            id: 'subtask-4-1',
            text: '헬스장 등록',
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            keywords: ['헬스장', '등록']
          },
          {
            id: 'subtask-4-2',
            text: '운동 스케줄 작성',
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            keywords: ['스케줄', '작성']
          }
        ]
      }
    ];

    setTodos(defaultTasks);
    console.log('🌟 v0.8.0: 기본 태스크 초기화 완료 - 다중 카테고리로 여러 태양계 생성 예정');
  }, []);

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
          work: '업무 태양계',
          personal: '개인 태양계', 
          health: '건강 태양계',
          study: '학습 태양계',
          general: '일반 태양계'
        };

        // 그룹 키워드 생성 (모든 태스크의 키워드 수집)
        const groupKeywords = [...new Set(tasks.flatMap(task => task.keywords || []))];

        groups.push({
          sunName: sunNames[category] || '미분류 태양계',
          category: category,
          tasks: tasks,
          keywords: groupKeywords, // 태양에 표시할 키워드
          theme: getCategoryTheme(category),
          priority: Math.max(...tasks.map(t => getPriorityValue(t.priority)))
        });

        console.log(`☀️ 태양 생성: ${sunNames[category]} (태스크 ${tasks.length}개)`);
      }
    });

    console.log(`🌌 AI 그룹핑 결과: ${groups.length}개의 태양계 그룹`);
    return groups;
  }, [getCategoryTheme, getPriorityValue]);

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

  // 공전 속도 계산 (데드라인 기반)
  const calculateOrbitSpeed = useCallback((deadline) => {
    if (!deadline) return 1.0;
    
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 1) return 3.0;     // 매우 빠름
    if (daysLeft <= 3) return 2.0;     // 빠름
    if (daysLeft <= 7) return 1.5;     // 보통
    return 0.8;                        // 느림
  }, []);

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

  // 소행성 생성 (AI가 랜덤으로 생성)
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
            keywords: ['액션', '제안', ...planet.keywords.slice(0, 2)],
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
            speed: 0.5 + Math.random() * 0.5,
            timeLimit: Date.now() + (30 + Math.random() * 60) * 1000,
            color: calculateUrgencyColor(planet.task.deadline),
            startDate: planet.task.startDate,
            deadline: planet.task.deadline
          };
          
          newAsteroids.push(asteroid);
          console.log(`☄️ 소행성 생성: ${planet.task.text}를 향해 돌진`);
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
                keywords: ['서브액션', '알림', ...satellite.keywords.slice(0, 2)],
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
                speed: 0.8 + Math.random() * 0.7,
                timeLimit: Date.now() + (20 + Math.random() * 40) * 1000,
                color: calculateUrgencyColor(satellite.subtask.deadline),
                startDate: satellite.subtask.startDate,
                deadline: satellite.subtask.deadline
              };
              
              newAsteroids.push(asteroid);
              console.log(`☄️ 소행성 생성: ${satellite.subtask.text} 위성을 향해 돌진`);
            }
          });
        }
      });
    });
    
    console.log('☄️ v0.8.0: 생성된 소행성:', newAsteroids.length, '개');
    setAsteroids(newAsteroids);
  }, [calculateUrgencyColor]);

  // 천체 클릭 핸들러 (상세정보 창 표시)
  const handleCelestialBodyClick = useCallback((type, data) => {
    console.log(`🖱️ ${type} 클릭:`, data);
    
    if (data) {
      setSelectedTask({...data, type: type});
      setShowTaskDetail(true);
    }
  }, []);

  // v0.8.0: 다중 태양계 생성 (functional_specification.md 정확한 준수)
  const updateSolarSystems = useCallback(async () => {
    console.log('🔄 v0.8.0: 다중 태양계 업데이트 시작');
    console.log('📋 현재 태스크 수:', todos.length);

    // 규칙 1: 태스크가 없으면 태양도 없습니다
    if (!aiGroupingActive || todos.length === 0) {
      console.log('🚫 태스크가 없으므로 모든 태양계 제거');
      setSolarSystems([]);
      setAsteroids([]);
      return;
    }

    try {
      // AI가 태스크를 분석해서 여러 그룹으로 나눔
      const taskGroups = groupTasksByAI(todos);
      
      if (taskGroups.length === 0) {
        console.log('🚫 태스크 그룹이 없으므로 태양계 없음');
        setSolarSystems([]);
        setAsteroids([]);
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
                  keywords: subtask.keywords || [],
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
            keywords: task.keywords || [],
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
            keywords: group.keywords, // 키워드 항상 표시
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

      console.log('🌌 v0.8.0: 생성된 태양계 시스템:', newSolarSystems.length, '개');
      newSolarSystems.forEach((system, index) => {
        console.log(`  ${index + 1}. ${system.name} - ${system.planets.length}개 행성`);
      });
      
      setSolarSystems(newSolarSystems);
      
      // 소행성 시스템 업데이트
      generateAsteroids(newSolarSystems);
      
    } catch (error) {
      console.error('태양계 생성 오류:', error);
      setSolarSystems([]);
      setAsteroids([]);
    }
  }, [todos, aiGroupingActive, groupTasksByAI, calculateSystemPosition, calculatePlanetOrbit, calculateSatelliteOrbit, calculateOrbitSpeed, calculateUrgencyColor, handleCelestialBodyClick, generateAsteroids]);

  // 모달 닫기
  const closeTaskDetail = useCallback(() => {
    setShowTaskDetail(false);
    setSelectedTask(null);
  }, []);

  // 초기 로드 시 기본 태스크 설정
  useEffect(() => {
    if (todos.length === 0) {
      initializeDefaultTasks();
    }
  }, [todos.length, initializeDefaultTasks]);

  // 태스크 변경 시 태양계 재생성
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updateSolarSystems();
    }, 1000); // 1초 디바운스

    return () => clearTimeout(debounceTimer);
  }, [todos.length, updateSolarSystems]);

  // 애니메이션 토글
  const toggleAnimation = useCallback(() => {
    setIsAnimationPlaying(prev => !prev);
  }, []);

  // 태스크 업데이트
  const handleTodoUpdate = useCallback((todoId, updates) => {
    setTodos(prev => prev.map(todo => 
      todo.id === todoId ? { ...todo, ...updates } : todo
    ));
  }, []);

  // 태스크 추가
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
      keywords: newTodo.keywords || [newTodo.text?.split(' ')[0] || 'Task'],
      subtasks: newTodo.subtasks || []
    };
    
    setTodos(prev => [...prev, todo]);
    console.log('✅ 새 태스크 추가:', todo);
  }, []);

  // 태스크 삭제
  const handleTodoDelete = useCallback((todoId) => {
    const deletedTodo = todos.find(t => t.id === todoId);
    setTodos(prev => prev.filter(todo => todo.id !== todoId));
    console.log('🗑️ 태스크 삭제:', deletedTodo?.text);
    
    // 태스크가 모두 삭제되면 태양계도 제거
    if (todos.length === 1) { // 삭제 후 0개가 될 예정
      console.log('🚫 마지막 태스크 삭제 - 모든 태양계 제거 예정');
    }
  }, [todos]);

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

  // 소행성 액션 처리
  const handleAsteroidAction = useCallback((asteroidId, action) => {
    if (action === 'accept') {
      console.log('✅ 소행성 제안 수락:', asteroidId);
      setAsteroids(prev => prev.filter(a => a.id !== asteroidId));
    } else if (action === 'reject') {
      console.log('❌ 소행성 제안 거부:', asteroidId);
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

  return (
    <div className="App" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* v0.8.0: functional_specification.md 정확한 준수 - 다중 태양계 3D 씬 */}
      <Scene 
        isAnimationPlaying={isAnimationPlaying}
        solarSystems={solarSystems} // 다중 태양계 시스템
        asteroids={asteroids}
        currentView={currentView}
        onSolarSystemClick={handleSolarSystemClick}
        onPlanetClick={handleCelestialBodyClick}
        onSatelliteClick={handleCelestialBodyClick}
        onAsteroidClick={handleCelestialBodyClick}
        onSunClick={handleCelestialBodyClick}
        data-testid="scene"
      />

      {/* v0.8.0: 반응형 UI 컨트롤 (PC, 태블릿, 모바일 대응) */}
      <div className="control-panel" style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000
      }}>
        {/* UI 모드 토글 버튼 */}
        <button 
          className="ui-mode-toggle"
          onClick={toggleUIMode}
          title={`Switch to ${useEnhancedUI ? 'Classic' : 'Enhanced'} UI`}
          data-testid="ui-mode-toggle"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {useEnhancedUI ? '🎨' : '🚀'} {useEnhancedUI ? 'Enhanced' : 'Classic'}
        </button>

        {/* 분석 대시보드 토글 */}
        <button 
          className="analytics-toggle"
          onClick={toggleAnalyticsDashboard}
          title="Toggle Advanced Analytics Dashboard"
          data-testid="analytics-toggle"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          📊 Analytics
        </button>

        {/* AI 그룹핑 토글 */}
        <button 
          className="ai-grouping-toggle"
          onClick={toggleAIGrouping}
          title="Toggle AI Grouping"
          data-testid="ai-grouping-toggle"
          style={{
            background: aiGroupingActive ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🤖 AI {aiGroupingActive ? 'ON' : 'OFF'}
        </button>

        {/* 애니메이션 토글 */}
        <button 
          className="animation-toggle"
          onClick={toggleAnimation}
          title={`${isAnimationPlaying ? 'Pause' : 'Play'} Solar System`}
          data-testid="animation-toggle"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isAnimationPlaying ? '⏸️ Pause' : '▶️ Play'} Solar System
        </button>

        {/* v0.8.0: 테스트용 버튼 - 규칙 검증 */}
        <button 
          className="clear-all-toggle"
          onClick={handleClearAllToggle}
          title="Clear All Tasks (Test Rule Compliance)"
          data-testid="clear-all-toggle"
          style={{
            background: 'rgba(255, 87, 34, 0.8)',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🧹 Clear All
        </button>
      </div>

      {/* 시스템 상태 표시 - 규칙 준수 확인 */}
      <div 
        className="system-status"
        data-testid="system-status"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
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
        <br />
        🚀 v0.8.0 Correct Functional Specification Implementation
        <br />
        {/* 규칙 준수 상태 표시 */}
        <div style={{ fontSize: '12px', marginTop: '5px', color: '#aaa' }}>
          {todos.length === 0 && '🚫 No Tasks → No Planets, No Suns, No Satellites'}
          {todos.length > 0 && !aiGroupingActive && '🚫 Tasks exist but AI grouping disabled'}
          {todos.length > 0 && solarSystems.length === 0 && aiGroupingActive && '🔄 Processing...'}
          {todos.length > 0 && solarSystems.length > 0 && `✅ ${solarSystems.length} solar system${solarSystems.length > 1 ? 's' : ''} active`}
        </div>
      </div>

      {/* v0.8.0: 조건부 UI 렌더링 */}
      {useEnhancedUI ? (
        <EnhancedMissionControl
          todos={todos}
          selectedCategory={selectedCategory}
          onTodoUpdate={handleTodoUpdate}
          onTodoAdd={handleTodoAdd}
          onTodoDelete={handleTodoDelete}
          onCategoryChange={handleCategoryChange}
          solarSystems={solarSystems} // 다중 시스템 전달
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

      {/* 분석 대시보드 */}
      {showAnalyticsDashboard && (
        <AdvancedAnalyticsDashboard
          todos={todos}
          solarSystems={solarSystems} // 다중 시스템 전달
          asteroids={asteroids}
          isVisible={showAnalyticsDashboard}
          onClose={closeAnalyticsDashboard}
          data-testid="analytics-dashboard"
        />
      )}

      {/* 소행성 액션 시스템 */}
      <AsteroidActionSystem
        asteroids={asteroids}
        solarSystems={solarSystems} // 다중 시스템 전달
        onAsteroidAction={handleAsteroidAction}
        data-testid="asteroid-action-system"
      />

      {/* v0.8.0: 상세정보 모달 (functional_specification.md 요구사항: 클릭 시 상세정보 창) */}
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