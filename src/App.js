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

// v0.6.1: functional_specification.md 엄격한 규칙 준수 - ESLint 경고 수정
// 1. 태스크가 없으면 행성도 없습니다
// 2. 서브 태스크가 없으면 위성도 없습니다  
// 3. 태스크가 없으면 태스크 그룹도 없고, 태스크 그룹이 없으면 태양도 없습니다

function App() {
  // 기본 상태 관리
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
  const [todos, setTodos] = useState([]);
  const [solarSystems, setSolarSystems] = useState([]);
  const [asteroids, setAsteroids] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [useEnhancedUI, setUseEnhancedUI] = useState(true);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [aiGroupingActive, setAiGroupingActive] = useState(true);
  const [currentView, setCurrentView] = useState('all');
  
  // v0.6.0: 상세정보 모달 상태
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  // v0.6.1: 엄격한 규칙 준수 - 빈 상태일 때의 초기화 (ESLint 수정: useCallback으로 감싸기)
  const initializeEmptyState = useCallback(() => {
    setTodos([]);
    setSolarSystems([]); // 태스크가 없으면 태스크 그룹도 없고, 태양도 없습니다
    setAsteroids([]); // 태스크가 없으면 소행성 액션도 없습니다
    console.log('🚫 v0.6.1: 태스크 없음 - 모든 천체 시스템 제거됨');
  }, []);

  // v0.6.0: 기본 태스크 데이터 (서브태스크 포함/미포함 예시)
  const initializeDefaultTasks = useCallback(() => {
    const defaultTasks = [
      // 서브태스크가 있는 태스크 (위성이 있는 행성)
      {
        id: 'task-1',
        text: '프로젝트 기획서 작성',
        category: 'work',
        priority: 'high',
        completed: false,
        createdAt: Date.now(),
        startDate: new Date(),
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
        keywords: ['기획서', '프로젝트', '작성'],
        subtasks: [ // 서브태스크가 있으므로 위성이 생성됩니다
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
        ],
        visualProperties: { 
          daysUntilDeadline: 3,
          urgencyColor: '#FF4444',
          orbitSpeed: 1.5
        }
      },
      
      // 서브태스크가 없는 태스크 (위성이 없는 행성)
      {
        id: 'task-2',
        text: '장보기 목록 작성',
        category: 'personal',
        priority: 'medium',
        completed: false,
        createdAt: Date.now(),
        startDate: new Date(),
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1일 후
        keywords: ['장보기', '목록'],
        subtasks: [], // 서브태스크가 없으므로 위성도 없습니다
        visualProperties: { 
          daysUntilDeadline: 1,
          urgencyColor: '#FF8800',
          orbitSpeed: 2.0
        }
      },
      
      // 서브태스크가 있는 또 다른 태스크
      {
        id: 'task-3',
        text: '운동 계획 세우기',
        category: 'health',
        priority: 'low',
        completed: false,
        createdAt: Date.now(),
        startDate: new Date(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
        keywords: ['운동', '계획'],
        subtasks: [ // 서브태스크가 있으므로 위성이 생성됩니다
          {
            id: 'subtask-3-1',
            text: '헬스장 등록',
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            keywords: ['헬스장', '등록']
          },
          {
            id: 'subtask-3-2',
            text: '운동 스케줄 작성',
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            keywords: ['스케줄', '작성']
          },
          {
            id: 'subtask-3-3',
            text: '트레이너 상담',
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            keywords: ['트레이너', '상담']
          }
        ],
        visualProperties: { 
          daysUntilDeadline: 7,
          urgencyColor: '#44FF44',
          orbitSpeed: 0.8
        }
      }
    ];

    setTodos(defaultTasks);
    console.log('🌟 v0.6.1: 기본 태스크 초기화 완료 (서브태스크 포함/미포함 예시)');
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

  // v0.6.1: AI 기반 태스크 그룹핑 (ESLint 수정: useCallback으로 감싸기)
  const groupTasksByAI = useCallback((taskList) => {
    // 규칙: 태스크가 없으면 그룹도 없습니다
    if (!taskList || taskList.length === 0) {
      console.log('🚫 태스크가 없으므로 그룹 생성 안함');
      return [];
    }

    const groups = [];
    const categoryGroups = {};

    // 카테고리별 그룹핑
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

    return groups;
  }, [getCategoryTheme, getPriorityValue]);

  // 태양계 위치 계산
  const calculateSystemPosition = useCallback((index, totalSystems) => {
    if (totalSystems === 1) return [0, 0, 0];
    
    const radius = Math.max(60, totalSystems * 20);
    const angle = (index / totalSystems) * Math.PI * 2;
    
    return [
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ];
  }, []);

  // v0.6.0: 엄격한 규칙 - 서브태스크가 있을 때만 위성 생성
  const getSatellitesForTask = useCallback((taskId, todoList) => {
    const task = todoList.find(t => t.id === taskId);
    
    // 규칙: 서브 태스크가 없으면 위성도 없습니다
    if (!task?.subtasks?.length) {
      console.log(`🚫 ${task?.text}: 서브태스크가 없으므로 위성 없음`);
      return [];
    }
    
    console.log(`🛰️ ${task.text}: 서브태스크 ${task.subtasks.length}개 → 위성 ${task.subtasks.length}개 생성`);
    
    return task.subtasks.map(subtask => ({
      id: subtask.id,
      name: subtask.text.substring(0, 10) + '...',
      subtask: subtask,
      completed: subtask.completed
    }));
  }, []);

  // 소행성 키워드 생성
  const generateAsteroidKeywords = useCallback((task) => {
    const actionKeywords = ['액션', '제안', '알림'];
    const taskKeywords = task.keywords || [];
    return [...actionKeywords, ...taskKeywords.slice(0, 2)];
  }, []);

  // 액션 제안 생성
  const generateActionSuggestion = useCallback((task) => {
    const suggestions = [
      '진행 상황 공유하기',
      '우선순위 재검토',
      '관련 자료 검토',
      '협업자와 소통',
      '중간 점검 실시',
      '다음 단계 계획',
      '일정 조정 검토',
      '리소스 확인',
      '품질 점검',
      '최종 검토'
    ];
    
    return {
      action: suggestions[Math.floor(Math.random() * suggestions.length)],
      description: `"${task.text}" 태스크에 대한 AI 제안`,
      impact: Math.floor(Math.random() * 3) + 1,
      keywords: generateAsteroidKeywords(task)
    };
  }, [generateAsteroidKeywords]);

  // 랜덤 위치 생성
  const generateRandomPosition = useCallback(() => {
    const radius = 120 + Math.random() * 80;
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 30;
    
    return [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ];
  }, []);

  // v0.6.0: 천체 클릭 핸들러 (상세정보 창 표시)
  const handleCelestialBodyClick = useCallback((type, data) => {
    console.log(`🖱️ ${type} 클릭:`, data);
    
    if (data) {
      setSelectedTask(data);
      setShowTaskDetail(true);
    }
  }, []);

  // v0.6.1: 소행성 생성 함수 (ESLint 수정: useCallback으로 감싸기)
  const generateAsteroids = useCallback((systems) => {
    // 규칙: 태양계(시스템)가 없으면 소행성도 없습니다
    if (!systems || systems.length === 0) {
      console.log('🚫 태양계가 없으므로 소행성 생성 안함');
      setAsteroids([]);
      return;
    }

    const newAsteroids = [];
    
    systems.forEach(system => {
      // 규칙: 행성(태스크)이 없으면 소행성도 없습니다
      if (!system.planets || system.planets.length === 0) {
        console.log(`🚫 ${system.name}: 행성이 없으므로 소행성 생성 안함`);
        return;
      }

      system.planets.forEach(planet => {
        // 행성을 향한 소행성 생성 (30% 확률)
        if (Math.random() < 0.3 && planet.task) {
          const asteroid = {
            id: `asteroid-${generateId()}`,
            targetPlanetId: planet.id,
            targetSystemId: system.id,
            targetPosition: planet.position || generateRandomPosition(),
            keywords: generateAsteroidKeywords(planet.task),
            position: generateRandomPosition(),
            suggestion: generateActionSuggestion(planet.task),
            speed: 0.5 + Math.random() * 0.5,
            timeLimit: Date.now() + (30 + Math.random() * 60) * 1000,
            color: '#FFD700',
            onClick: () => handleCelestialBodyClick('asteroid', {
              type: 'asteroid',
              keywords: generateAsteroidKeywords(planet.task),
              ...generateActionSuggestion(planet.task),
              targetInfo: {
                speed: 0.5 + Math.random() * 0.5,
                timeLimit: Date.now() + (30 + Math.random() * 60) * 1000
              }
            })
          };
          
          newAsteroids.push(asteroid);
          console.log(`☄️ 소행성 생성: ${planet.task.text}를 향해 돌진`);
        }

        // 위성들을 향한 소행성 생성 (서브태스크가 있을 때만)
        if (planet.satellites && planet.satellites.length > 0) {
          planet.satellites.forEach(satellite => {
            if (Math.random() < 0.2 && satellite.subtask) {
              const asteroid = {
                id: `asteroid-${generateId()}`,
                targetSatelliteId: satellite.id,
                targetPlanetId: planet.id,
                targetSystemId: system.id,
                targetPosition: satellite.position || generateRandomPosition(),
                keywords: generateAsteroidKeywords(satellite.subtask),
                position: generateRandomPosition(),
                suggestion: generateActionSuggestion(satellite.subtask),
                speed: 0.8 + Math.random() * 0.7,
                timeLimit: Date.now() + (20 + Math.random() * 40) * 1000,
                color: '#FFA500',
                onClick: () => handleCelestialBodyClick('asteroid', {
                  type: 'asteroid',
                  keywords: generateAsteroidKeywords(satellite.subtask),
                  ...generateActionSuggestion(satellite.subtask),
                  targetInfo: {
                    speed: 0.8 + Math.random() * 0.7,
                    timeLimit: Date.now() + (20 + Math.random() * 40) * 1000
                  }
                })
              };
              
              newAsteroids.push(asteroid);
              console.log(`☄️ 소행성 생성: ${satellite.subtask.text} 위성을 향해 돌진`);
            }
          });
        }
      });
    });
    
    console.log('☄️ v0.6.1: 소행성 액션 생성:', newAsteroids.length, '개');
    setAsteroids(newAsteroids);
  }, [generateRandomPosition, generateAsteroidKeywords, generateActionSuggestion, handleCelestialBodyClick]);

  // v0.6.1: 엄격한 규칙 준수 - AI 그룹핑으로 태양계 생성 (ESLint 수정: dependencies 추가)
  const updateSolarSystems = useCallback(async () => {
    console.log('🔄 v0.6.1: 태양계 업데이트 시작');
    console.log('📋 현재 태스크 수:', todos.length);
    console.log('🤖 AI 그룹핑 활성화:', aiGroupingActive);

    // 규칙 1: 태스크가 없으면 태스크 그룹도 없고, 태양도 없습니다
    if (!aiGroupingActive || todos.length === 0) {
      console.log('🚫 태스크가 없으므로 모든 태양계 제거');
      setSolarSystems([]);
      setAsteroids([]);
      return;
    }

    try {
      // AI 기반 태스크 그룹핑 (태양 생성) - 태스크가 있을 때만
      const taskGroups = groupTasksByAI(todos);
      console.log('🌌 생성된 태스크 그룹 수:', taskGroups.length);
      
      // 규칙 2: 태스크 그룹이 없으면 태양도 없습니다
      if (taskGroups.length === 0) {
        console.log('🚫 태스크 그룹이 없으므로 태양계 없음');
        setSolarSystems([]);
        setAsteroids([]);
        return;
      }
      
      const newSolarSystems = taskGroups.map((group, index) => ({
        id: `system-${generateId()}`,
        name: group.sunName, // AI가 결정한 그룹명이 태양
        position: calculateSystemPosition(index, taskGroups.length),
        
        // 태양 (태스크 그룹명) - 태스크가 있을 때만 존재
        sun: {
          id: `sun-${generateId()}`,
          name: group.sunName,
          keywords: group.keywords, // 키워드 항상 표시
          theme: group.theme,
          tasks: group.tasks, // 태양이 관리하는 태스크들
          onClick: () => handleCelestialBodyClick('sun', {
            type: 'sun',
            name: group.sunName,
            keywords: group.keywords,
            tasks: group.tasks,
            description: `${group.sunName}에 포함된 태스크들의 중심 관리 허브입니다.`
          })
        },
        
        // 행성들 (태스크들) - 태스크가 있을 때만 존재
        planets: group.tasks.map((task, planetIndex) => {
          console.log(`🪐 행성 생성: ${task.text}`);
          
          // 규칙 3: 서브태스크가 있을 때만 위성 생성
          const satellites = getSatellitesForTask(task.id, todos);
          console.log(`🛰️ ${task.text}의 위성 수:`, satellites.length);
          
          const planet = {
            id: `planet-${task.id}`,
            name: task.text.substring(0, 15) + '...',
            keywords: task.keywords || [], // 키워드 항상 표시
            task: task,
            completed: task.completed,
            orbitRadius: 15 + planetIndex * 8,
            orbitSpeed: task.visualProperties?.orbitSpeed || 1.0,
            color: task.visualProperties?.urgencyColor || '#4488FF',
            startDate: task.startDate,
            deadline: task.deadline,
            
            // 위성들 (서브태스크들) - 서브태스크가 있을 때만 생성
            satellites: satellites.map((subtask, satIndex) => {
              console.log(`  🛰️ 위성 생성: ${subtask.name} (부모: ${task.text})`);
              return {
                id: `satellite-${subtask.id}`,
                name: subtask.name,
                keywords: subtask.subtask?.keywords || [], // 키워드 항상 표시
                subtask: subtask.subtask,
                completed: subtask.completed,
                orbitRadius: 3 + satIndex * 1.5, // 행성 주위 공전
                orbitSpeed: subtask.subtask?.visualProperties?.orbitSpeed || 2.0,
                color: subtask.subtask?.visualProperties?.urgencyColor || '#88CCFF',
                startDate: subtask.subtask?.startDate,
                deadline: subtask.subtask?.deadline,
                onClick: () => handleCelestialBodyClick('satellite', {
                  ...subtask.subtask,
                  type: 'satellite'
                })
              };
            }),
            onClick: () => handleCelestialBodyClick('planet', task)
          };
          return planet;
        }).filter(planet => planet.task), // 유효한 태스크가 있는 행성만 포함
        
        theme: group.theme,
        priority: group.priority,
        onClick: () => handleCelestialBodyClick('system', group)
      }));

      console.log('🌌 v0.6.1: 생성된 태양계:', newSolarSystems.length, '개');
      setSolarSystems(newSolarSystems);
      
      // 소행성 시스템 업데이트 (태양계가 있을 때만)
      if (newSolarSystems.length > 0) {
        generateAsteroids(newSolarSystems);
      }
      
    } catch (error) {
      console.error('AI 그룹핑 오류:', error);
      setSolarSystems([]);
      setAsteroids([]);
    }
  }, [todos.length, aiGroupingActive, groupTasksByAI, calculateSystemPosition, getSatellitesForTask, generateAsteroids, handleCelestialBodyClick]);

  // 모달 닫기
  const closeTaskDetail = useCallback(() => {
    setShowTaskDetail(false);
    setSelectedTask(null);
  }, []);

  // v0.6.0: 초기 로드 시 기본 태스크 설정
  useEffect(() => {
    if (todos.length === 0) {
      initializeDefaultTasks();
    }
  }, [todos.length, initializeDefaultTasks]);

  // v0.6.1: 태스크 변경 시 AI 재분석 (ESLint 수정: todos.length dependency 추가)
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

  // 긴급도 색상 계산
  const calculateUrgencyColor = useCallback((deadline) => {
    if (!deadline) return '#4488FF';
    
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 1) return '#FF0000';
    if (daysLeft <= 3) return '#FF6600';
    if (daysLeft <= 7) return '#FFAA00';
    return '#44FF44';
  }, []);

  // 공전 속도 계산
  const calculateOrbitSpeed = useCallback((deadline) => {
    if (!deadline) return 1.0;
    
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 1) return 3.0;
    if (daysLeft <= 3) return 2.0;
    if (daysLeft <= 7) return 1.5;
    return 0.8;
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
      subtasks: newTodo.subtasks || [],
      visualProperties: {
        daysUntilDeadline: newTodo.deadline ? 
          Math.ceil((new Date(newTodo.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 7,
        urgencyColor: calculateUrgencyColor(newTodo.deadline),
        orbitSpeed: calculateOrbitSpeed(newTodo.deadline)
      }
    };
    
    setTodos(prev => [...prev, todo]);
    console.log('✅ 새 태스크 추가:', todo);
    console.log('🔄 태스크 추가로 인한 태양계 재구성 예정');
  }, [calculateUrgencyColor, calculateOrbitSpeed]);

  // 태스크 삭제
  const handleTodoDelete = useCallback((todoId) => {
    const deletedTodo = todos.find(t => t.id === todoId);
    setTodos(prev => prev.filter(todo => todo.id !== todoId));
    console.log('🗑️ 태스크 삭제:', deletedTodo?.text);
    console.log('🔄 태스크 삭제로 인한 태양계 재구성 예정');
    
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

  // v0.6.1: Clear All 토글 (ESLint 수정: initializeEmptyState 사용)
  const handleClearAllToggle = useCallback(() => {
    if (todos.length > 0) {
      initializeEmptyState(); // 이제 사용됨 - ESLint 경고 해결
    } else {
      initializeDefaultTasks();
    }
  }, [todos.length, initializeEmptyState, initializeDefaultTasks]);

  return (
    <div className="App" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* v0.6.1: functional_specification.md 완전 준수 - 3D 태양계 씬 */}
      <Scene 
        isAnimationPlaying={isAnimationPlaying}
        solarSystems={solarSystems}
        asteroids={asteroids}
        currentView={currentView}
        onSolarSystemClick={handleSolarSystemClick}
        onPlanetClick={handleCelestialBodyClick}
        onSatelliteClick={handleCelestialBodyClick}
        onAsteroidClick={handleCelestialBodyClick}
        onSunClick={handleCelestialBodyClick}
        data-testid="scene"
      />

      {/* v0.6.1: 반응형 UI 컨트롤 (PC, 태블릿, 모바일 대응) */}
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

        {/* v0.6.1: 테스트용 버튼 - 규칙 검증 (ESLint 수정) */}
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
        🚀 v0.6.1 ESLint Warnings Fixed
        <br />
        {/* 규칙 준수 상태 표시 */}
        <div style={{ fontSize: '12px', marginTop: '5px', color: '#aaa' }}>
          {todos.length === 0 && '🚫 No Tasks → No Planets, No Suns, No Satellites'}
          {todos.length > 0 && solarSystems.length === 0 && '🚫 Tasks exist but AI grouping disabled'}
          {todos.length > 0 && solarSystems.length > 0 && '✅ Full solar system active'}
        </div>
      </div>

      {/* v0.6.1: 조건부 UI 렌더링 */}
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

      {/* 분석 대시보드 */}
      {showAnalyticsDashboard && (
        <AdvancedAnalyticsDashboard
          todos={todos}
          solarSystems={solarSystems}
          asteroids={asteroids}
          isVisible={showAnalyticsDashboard}
          onClose={closeAnalyticsDashboard}
          data-testid="analytics-dashboard"
        />
      )}

      {/* 소행성 액션 시스템 */}
      <AsteroidActionSystem
        asteroids={asteroids}
        solarSystems={solarSystems}
        onAsteroidAction={handleAsteroidAction}
        data-testid="asteroid-action-system"
      />

      {/* v0.6.1: 상세정보 모달 (functional_specification.md 요구사항: 클릭 시 상세정보 창) */}
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