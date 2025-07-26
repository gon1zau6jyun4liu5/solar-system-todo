import React, { useState, useEffect, useCallback } from 'react';
import Scene from './components/Scene';
import AITodoManager from './components/AITodoManager';
import AdvancedAnalyticsDashboard from './components/AdvancedAnalyticsDashboard';
import TaskDetailModal from './components/TaskDetailModal';
import dataManager from './utils/dataManager'; // v0.8.5: 데이터 영속성 매니저
import './App.css';

// 유틸리티 함수들
const generateId = () => Math.random().toString(36).substr(2, 9);

// v0.8.9: 키워드 네모 박스 완전 제거
// ULTIMATE FIX: functional_specification.md 100% 준수
// "키워드는 따로 표시되는 것이 아니라 태양계, 행성, 위성의 표면을 시계방향으로 달려가는 식으로 표시됩니다"

function App() {
  // 기본 상태 관리
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [showOrbits, setShowOrbits] = useState(true);
  const [todos, setTodos] = useState([]);
  const [useEnhancedUI, setUseEnhancedUI] = useState(true);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [aiGroupingActive, setAiGroupingActive] = useState(true);
  const [currentView, setCurrentView] = useState('all');
  const [focusedSystemId, setFocusedSystemId] = useState(null);
  
  // v0.8.0: 다중 태양계 시스템
  const [solarSystems, setSolarSystems] = useState([]);
  const [asteroids, setAsteroids] = useState([]);
  
  // 상세정보 모달 상태
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  // v0.8.5: 데이터 로딩 상태
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // v0.8.9: 키워드 정제 함수 (의존성 배열 안정화를 위해 앞으로 이동)
  const filterKeywords = useCallback((keywords) => {
    const excludeWords = [
      '태양계', '행성', '위성', '소행성', '태양', '태스크', '할일',
      'planet', 'satellite', 'sun', 'solar', 'system', 'task', 'todo',
      'project', 'work', 'personal', 'health', 'study', 'general',
      '프로젝트', '작업', '개인', '건강', '학습', '일반', '업무'
    ];
    return keywords.filter(keyword => 
      keyword && 
      keyword.length > 0 && 
      !excludeWords.includes(keyword.toLowerCase()) &&
      keyword.length <= 6
    ).slice(0, 3); // 최대 3개로 제한
  }, []);

  // v0.8.5: 태스크를 LocalStorage에 저장
  const saveTodosToStorage = useCallback((updatedTodos) => {
    try {
      dataManager.saveAllTodos(updatedTodos);
      console.log('💾 v0.8.9: 태스크 저장 완료:', updatedTodos.length, '개');
    } catch (error) {
      console.error('❌ v0.8.9: 태스크 저장 실패:', error);
    }
  }, []);

  // 기본 태스크 데이터 (의존성을 위해 앞으로 이동)
  const initializeDefaultTasks = useCallback(() => {
    const defaultTasks = [
      {
        id: 'task-1',
        text: '이메일 답장 보내기',
        category: 'work',
        priority: 'high',
        completed: false,
        createdAt: Date.now(),
        startDate: new Date(),
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        keywords: filterKeywords(['이메일', '답장', '커뮤니케이션']),
        subtasks: [
          { 
            id: 'subtask-1-1', 
            text: '중요 메일 분류', 
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            keywords: filterKeywords(['분류', '우선순위'])
          },
          { 
            id: 'subtask-1-2', 
            text: '회신 내용 작성', 
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            keywords: filterKeywords(['작성', '내용'])
          }
        ]
      },
      {
        id: 'task-2',
        text: '프레젠테이션 준비',
        category: 'work',
        priority: 'medium',
        completed: false,
        createdAt: Date.now(),
        startDate: new Date(),
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        keywords: filterKeywords(['발표', '자료', '준비']),
        subtasks: []
      },
      {
        id: 'task-3',
        text: '주간 계획 수립',
        category: 'personal',
        priority: 'medium',
        completed: false,
        createdAt: Date.now(),
        startDate: new Date(),
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        keywords: filterKeywords(['계획', '스케줄', '목표']),
        subtasks: [
          {
            id: 'subtask-3-1',
            text: '우선순위 정리',
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            keywords: filterKeywords(['우선순위', '정리'])
          }
        ]
      },
      {
        id: 'task-4',
        text: '독서 시간 확보',
        category: 'health',
        priority: 'low',
        completed: false,
        createdAt: Date.now(),
        startDate: new Date(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        keywords: filterKeywords(['독서', '자기계발', '학습']),
        subtasks: [
          {
            id: 'subtask-4-1',
            text: '책 선정하기',
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            keywords: filterKeywords(['선정', '도서'])
          },
          {
            id: 'subtask-4-2',
            text: '시간표 만들기',
            completed: false,
            startDate: new Date(),
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            keywords: filterKeywords(['시간표', '계획'])
          }
        ]
      }
    ];

    setTodos(defaultTasks);
    saveTodosToStorage(defaultTasks);
    
    console.log('🌟 v0.8.9: 기본 태스크 초기화 완료 및 저장');
  }, [filterKeywords, saveTodosToStorage]);

  // v0.8.5: 설정 로드 및 저장
  const loadSettingsFromStorage = useCallback(() => {
    try {
      const settings = dataManager.loadSettings();
      setUseEnhancedUI(settings.useEnhancedUI);
      setShowAnalyticsDashboard(settings.showAnalyticsDashboard);
      setAiGroupingActive(settings.aiGroupingActive);
      setIsAnimationPlaying(settings.isAnimationPlaying);
      setAnimationSpeed(settings.animationSpeed || 1.0);
      setShowOrbits(settings.showOrbits !== false);
      setCurrentView(settings.currentView);
      setFocusedSystemId(settings.focusedSystemId || null);
      console.log('⚙️ v0.8.9: 설정 로드 완료');
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
        animationSpeed,
        showOrbits,
        currentView,
        focusedSystemId
      };
      dataManager.saveSettings(settings);
      console.log('⚙️ v0.8.9: 설정 저장 완료');
    } catch (error) {
      console.error('❌ 설정 저장 실패:', error);
    }
  }, [useEnhancedUI, showAnalyticsDashboard, aiGroupingActive, isAnimationPlaying, animationSpeed, showOrbits, currentView, focusedSystemId]);

  // v0.8.5: 태스크 데이터 로드
  const loadTodosFromStorage = useCallback(async () => {
    try {
      setIsDataLoading(true);
      console.log('📋 v0.8.9: 저장된 태스크 로드 시작...');
      
      const storedTodos = dataManager.getAllTodos();
      
      if (storedTodos && storedTodos.length > 0) {
        setTodos(storedTodos);
        console.log('✅ v0.8.9: 저장된 태스크 로드 완료:', storedTodos.length, '개');
      } else {
        console.log('📋 v0.8.9: 저장된 태스크 없음 - 기본 태스크 생성');
        initializeDefaultTasks();
      }
      
      setDataLoaded(true);
    } catch (error) {
      console.error('❌ v0.8.9: 태스크 로드 실패:', error);
      initializeDefaultTasks();
    } finally {
      setIsDataLoading(false);
    }
  }, [initializeDefaultTasks]);

  // 빈 상태 초기화
  const initializeEmptyState = useCallback(() => {
    const emptyTodos = [];
    setTodos(emptyTodos);
    setSolarSystems([]);
    setAsteroids([]);
    setFocusedSystemId(null);
    
    saveTodosToStorage(emptyTodos);
    
    console.log('🚫 v0.8.9: 태스크 없음 - 모든 태양계 시스템 제거 및 저장');
  }, [saveTodosToStorage]);

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

  // AI 기반 태스크 그룹핑
  const groupTasksByAI = useCallback((taskList) => {
    if (!taskList || taskList.length === 0) {
      console.log('🚫 태스크가 없으므로 그룹 생성 안함');
      return [];
    }

    const groups = [];
    const categoryGroups = {};

    taskList.forEach(task => {
      const category = task.category || 'general';
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(task);
    });

    Object.entries(categoryGroups).forEach(([category, tasks]) => {
      if (tasks.length > 0) {
        const sunNames = {
          work: '업무',
          personal: '개인', 
          health: '건강',
          study: '학습',
          general: '일반'
        };

        const groupKeywords = filterKeywords([...new Set(tasks.flatMap(task => task.keywords || []))]);

        groups.push({
          sunName: sunNames[category] || '미분류',
          category: category,
          tasks: tasks,
          keywords: groupKeywords,
          theme: getCategoryTheme(category),
          priority: Math.max(...tasks.map(t => getPriorityValue(t.priority)))
        });

        console.log(`☀️ 태양 생성: ${sunNames[category]} (태스크 ${tasks.length}개)`);
      }
    });

    console.log(`🌌 AI 그룹핑 결과: ${groups.length}개의 태양계 그룹`);
    return groups;
  }, [getCategoryTheme, getPriorityValue, filterKeywords]);

  // 태양계 위치 계산
  const calculateSystemPosition = useCallback((index, totalSystems) => {
    if (totalSystems === 1) return [0, 0, 0];
    
    const radius = Math.max(80, totalSystems * 25);
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
    
    if (daysLeft <= 1) return '#FF0000';
    if (daysLeft <= 3) return '#FF6600';
    if (daysLeft <= 7) return '#FFAA00';
    return '#44FF44';
  }, []);

  // 공전 속도 계산
  const calculateOrbitSpeed = useCallback((deadline) => {
    if (!deadline) return 1.0 * animationSpeed;
    
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    let baseSpeed = 0.8;
    if (daysLeft <= 1) baseSpeed = 3.0;
    else if (daysLeft <= 3) baseSpeed = 2.0;
    else if (daysLeft <= 7) baseSpeed = 1.5;
    
    return baseSpeed * animationSpeed;
  }, [animationSpeed]);

  // 행성 위치 계산
  const calculatePlanetOrbit = useCallback((index, totalPlanets) => {
    const baseRadius = 15;
    const radiusIncrement = 8;
    
    return {
      orbitRadius: baseRadius + (index * radiusIncrement),
      orbitSpeed: 1.0 + (Math.random() * 0.5),
      initialAngle: (index / totalPlanets) * Math.PI * 2
    };
  }, []);

  // 위성 위치 계산
  const calculateSatelliteOrbit = useCallback((index, totalSatellites) => {
    const baseRadius = 3;
    const radiusIncrement = 1.5;
    
    return {
      orbitRadius: baseRadius + (index * radiusIncrement),
      orbitSpeed: 2.0 + (Math.random() * 1.0),
      initialAngle: (index / totalSatellites) * Math.PI * 2
    };
  }, []);

  // v0.8.5: 소행성 생성 (패널 없음)
  const generateAsteroids = useCallback((systems) => {
    if (!systems || systems.length === 0) {
      console.log('🚫 태양계가 없으므로 소행성 생성 안함');
      setAsteroids([]);
      return;
    }

    const newAsteroids = [];
    
    systems.forEach(system => {
      if (!system.planets || system.planets.length === 0) {
        console.log(`🚫 ${system.name}: 행성이 없으므로 소행성 생성 안함`);
        return;
      }

      system.planets.forEach(planet => {
        if (Math.random() < 0.3) {
          const asteroid = {
            id: `asteroid-${generateId()}`,
            targetType: 'planet',
            targetId: planet.id,
            targetSystemId: system.id,
            targetPosition: planet.position || [0, 0, 0],
            keywords: filterKeywords(['액션', '제안', ...planet.keywords.slice(0, 2)]),
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
            speed: (0.5 + Math.random() * 0.5) * animationSpeed,
            timeLimit: Date.now() + (30 + Math.random() * 60) * 1000,
            color: calculateUrgencyColor(planet.task.deadline),
            startDate: planet.task.startDate,
            deadline: planet.task.deadline
          };
          
          newAsteroids.push(asteroid);
          console.log(`☄️ 소행성 생성: ${planet.task.text}를 향해 돌진 (패널 없음)`);
        }

        if (planet.satellites && planet.satellites.length > 0) {
          planet.satellites.forEach(satellite => {
            if (Math.random() < 0.2) {
              const asteroid = {
                id: `asteroid-${generateId()}`,
                targetType: 'satellite',
                targetId: satellite.id,
                targetPlanetId: planet.id,
                targetSystemId: system.id,
                targetPosition: satellite.position || [0, 0, 0],
                keywords: filterKeywords(['서브액션', '알림', ...satellite.keywords.slice(0, 2)]),
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
                speed: (0.8 + Math.random() * 0.7) * animationSpeed,
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
    
    console.log('☄️ v0.8.9: 생성된 소행성 (패널 없음):', newAsteroids.length, '개');
    setAsteroids(newAsteroids);
  }, [calculateUrgencyColor, animationSpeed, filterKeywords]);

  // 천체 클릭 핸들러
  const handleCelestialBodyClick = useCallback((type, data) => {
    console.log(`🖱️ ${type} 클릭:`, data);
    
    if (data) {
      setSelectedTask({...data, type: type});
      setShowTaskDetail(true);
    }
  }, []);

  // 포커싱 기능
  const handleSolarSystemFocus = useCallback((systemId) => {
    if (focusedSystemId === systemId) {
      setFocusedSystemId(null);
      console.log('🔍 포커스 해제: 모든 태양계 표시');
    } else {
      setFocusedSystemId(systemId);
      console.log('🔍 태양계 포커스:', systemId);
    }
  }, [focusedSystemId]);

  // v0.8.5: 다중 태양계 생성
  const updateSolarSystems = useCallback(async () => {
    console.log('🔄 v0.8.9: 다중 태양계 업데이트 시작');
    console.log('📋 현재 태스크 수:', todos.length);

    if (!aiGroupingActive || todos.length === 0) {
      console.log('🚫 태스크가 없으므로 모든 태양계 제거');
      setSolarSystems([]);
      setAsteroids([]);
      setFocusedSystemId(null);
      return;
    }

    try {
      const taskGroups = groupTasksByAI(todos);
      
      if (taskGroups.length === 0) {
        console.log('🚫 태스크 그룹이 없으므로 태양계 없음');
        setSolarSystems([]);
        setAsteroids([]);
        setFocusedSystemId(null);
        return;
      }

      const newSolarSystems = taskGroups.map((group, index) => {
        const position = calculateSystemPosition(index, taskGroups.length);

        const planets = group.tasks.map((task, planetIndex) => {
          const orbitInfo = calculatePlanetOrbit(planetIndex, group.tasks.length);
          
          const satellites = task.subtasks && task.subtasks.length > 0 
            ? task.subtasks.map((subtask, satIndex) => {
                const satOrbitInfo = calculateSatelliteOrbit(satIndex, task.subtasks.length);
                
                console.log(`  🛰️ 위성 생성: ${subtask.text} (부모: ${task.text})`);
                
                return {
                  id: `satellite-${subtask.id}`,
                  name: subtask.text,
                  keywords: filterKeywords(subtask.keywords || []),
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
            keywords: filterKeywords(task.keywords || []),
            task: task,
            completed: task.completed,
            orbitRadius: orbitInfo.orbitRadius,
            orbitSpeed: calculateOrbitSpeed(task.deadline) * orbitInfo.orbitSpeed,
            initialAngle: orbitInfo.initialAngle,
            color: calculateUrgencyColor(task.deadline),
            startDate: task.startDate,
            deadline: task.deadline,
            satellites: satellites,
            onClick: () => handleCelestialBodyClick('planet', task)
          };
        });

        const solarSystem = {
          id: `system-${generateId()}`,
          name: group.sunName,
          position: position,
          
          sun: {
            id: `sun-${generateId()}`,
            name: group.sunName,
            keywords: group.keywords,
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
          
          planets: planets,
          theme: group.theme,
          priority: group.priority
        };

        console.log(`☀️ 태양계 생성: ${group.sunName} (행성 ${planets.length}개)`);
        return solarSystem;
      });

      console.log('🌌 v0.8.9: 생성된 태양계 시스템:', newSolarSystems.length, '개');
      newSolarSystems.forEach((system, index) => {
        console.log(`  ${index + 1}. ${system.name} - ${system.planets.length}개 행성`);
      });
      
      setSolarSystems(newSolarSystems);
      
      if (focusedSystemId && !newSolarSystems.find(s => s.id === focusedSystemId)) {
        setFocusedSystemId(null);
        console.log('🔍 포커스된 태양계가 없어져서 포커스 해제');
      }
      
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

  // v0.8.5: 앱 초기화
  useEffect(() => {
    console.log('🚀 v0.8.9: 앱 초기화 시작...');
    
    const initializeApp = async () => {
      loadSettingsFromStorage();
      await loadTodosFromStorage();
      console.log('✅ v0.8.9: 앱 초기화 완료');
    };
    
    initializeApp();
  }, [loadSettingsFromStorage, loadTodosFromStorage]);

  // v0.8.5: 설정 변경 시 자동 저장
  useEffect(() => {
    if (dataLoaded) {
      saveSettingsToStorage();
    }
  }, [useEnhancedUI, showAnalyticsDashboard, aiGroupingActive, isAnimationPlaying, animationSpeed, showOrbits, currentView, focusedSystemId, dataLoaded, saveSettingsToStorage]);

  // v0.8.5: 태스크 변경 시 태양계 재생성 및 저장
  useEffect(() => {
    if (!dataLoaded || isDataLoading) return;

    const debounceTimer = setTimeout(() => {
      updateSolarSystems();
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [todos.length, updateSolarSystems, dataLoaded, isDataLoading]);

  // 애니메이션 토글
  const toggleAnimation = useCallback(() => {
    setIsAnimationPlaying(prev => !prev);
  }, []);

  // 속도 설정 기능
  const handleSpeedChange = useCallback((newSpeed) => {
    setAnimationSpeed(Math.max(0.1, Math.min(5.0, newSpeed)));
    console.log('⚡ 애니메이션 속도 변경:', newSpeed);
  }, []);

  // 궤도 표시 토글
  const toggleOrbits = useCallback(() => {
    setShowOrbits(prev => !prev);
    console.log('🌀 궤도 표시 토글:', !showOrbits);
  }, [showOrbits]);

  // v0.8.5: 태스크 업데이트 (완전한 CRUD 지원)
  const handleTodoUpdate = useCallback((todoId, updates) => {
    setTodos(prev => {
      const updatedTodos = prev.map(todo => {
        if (todo.id === todoId) {
          const updated = { ...todo, ...updates };
          if (updates.keywords) {
            updated.keywords = filterKeywords(updates.keywords);
          }
          return updated;
        }
        return todo;
      });
      
      saveTodosToStorage(updatedTodos);
      console.log('✅ v0.8.9: 태스크 업데이트 및 저장:', todoId);
      
      return updatedTodos;
    });
  }, [saveTodosToStorage, filterKeywords]);

  // v0.8.5: 태스크 삭제 (영속성 보장)
  const handleTodoDelete = useCallback((todoId) => {
    setTodos(prev => {
      const deletedTodo = prev.find(t => t.id === todoId);
      const updatedTodos = prev.filter(todo => todo.id !== todoId);
      
      saveTodosToStorage(updatedTodos);
      console.log('🗑️ v0.8.9: 태스크 삭제 및 저장:', deletedTodo?.text);
      
      if (updatedTodos.length === 0) {
        console.log('🚫 마지막 태스크 삭제 - 모든 태양계 제거 예정');
        setFocusedSystemId(null);
      }
      
      return updatedTodos;
    });
  }, [saveTodosToStorage]);

  // v0.8.5: 서브태스크 추가
  const handleAddSubtask = useCallback((taskId, subtaskData) => {
    setTodos(prev => {
      const updatedTodos = prev.map(todo => {
        if (todo.id === taskId) {
          const newSubtask = {
            id: generateId(),
            ...subtaskData,
            createdAt: Date.now()
          };
          
          return {
            ...todo,
            subtasks: [...(todo.subtasks || []), newSubtask]
          };
        }
        return todo;
      });
      
      saveTodosToStorage(updatedTodos);
      console.log('✅ v0.8.9: 서브태스크 추가 및 저장:', subtaskData.text);
      
      return updatedTodos;
    });
  }, [saveTodosToStorage]);

  // v0.8.5: 소행성 충돌 처리
  const handleAsteroidCollision = useCallback((asteroidId, remove = false) => {
    if (remove) {
      // 완전 제거
      setAsteroids(prev => prev.filter(a => a.id !== asteroidId));
      console.log('💥 소행성 완전 제거:', asteroidId);
    } else {
      // 폭발 시작만 처리 (Scene.js에서 처리)
      console.log('💥 소행성 폭발 시작:', asteroidId);
    }
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

  // Clear All 토글
  const handleClearAllToggle = useCallback(() => {
    if (todos.length > 0) {
      initializeEmptyState();
    } else {
      initializeDefaultTasks();
    }
  }, [todos.length, initializeEmptyState, initializeDefaultTasks]);

  // v0.8.9: 로딩 중일 때 표시할 컴포넌트
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
          <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Solar Todo v0.8.9</div>
          <div style={{ fontSize: '1rem', opacity: 0.7 }}>키워드 네모 박스 완전 제거 로딩중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="App" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* v0.8.5: functional_specification.md 완전 준수 - 메인 메뉴를 왼쪽 수직으로 배치 */}
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
          🌌<br/>SOLAR<br/>TODO<br/>v0.8.9
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

        {/* 궤도 표시 토글 */}
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

        {/* 속도 설정 슬라이더 */}
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

      {/* v0.8.9: 3D 씬 - 메인 메뉴를 고려한 레이아웃 */}
      <div style={{ marginLeft: '80px', width: 'calc(100vw - 80px)', height: '100vh' }}>
        <Scene 
          isAnimationPlaying={isAnimationPlaying}
          animationSpeed={animationSpeed}
          showOrbits={showOrbits}
          solarSystems={solarSystems}
          asteroids={asteroids}
          currentView={currentView}
          focusedSystemId={focusedSystemId}
          onSolarSystemClick={handleSolarSystemClick}
          onSolarSystemFocus={handleSolarSystemFocus}
          onPlanetClick={handleCelestialBodyClick}
          onSatelliteClick={handleCelestialBodyClick}
          onAsteroidClick={handleCelestialBodyClick}
          onSunClick={handleCelestialBodyClick}
          onAsteroidCollision={handleAsteroidCollision} // v0.8.5: 소행성 충돌 콜백
          data-testid="scene"
        />
      </div>

      {/* 시스템 상태 표시 - v0.8.9 업데이트 */}
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
        💾 v0.8.9 Surface Keywords - Speed: {animationSpeed.toFixed(1)}x | Orbits: {showOrbits ? 'ON' : 'OFF'}
        <br />
        {/* 규칙 준수 상태 표시 */}
        <div style={{ fontSize: '12px', marginTop: '5px', color: '#aaa' }}>
          {todos.length === 0 && '🚫 No Tasks → No Planets, No Suns, No Satellites'}
          {todos.length > 0 && !aiGroupingActive && '🚫 Tasks exist but AI grouping disabled'}
          {todos.length > 0 && solarSystems.length === 0 && aiGroupingActive && '🔄 Processing...'}
          {todos.length > 0 && solarSystems.length > 0 && `✅ ${solarSystems.length} solar system${solarSystems.length > 1 ? 's' : ''} active | 💾 Auto-Save ON | 🎯 Surface Running | 📦 No Box | ⚙️ v0.8.9 Complete`}
        </div>
      </div>

      {/* v0.8.5: CRITICAL CHANGE - Enhanced Mission Control 제거 */}
      {/* functional_specification.md: "Enhanced Mission Control 메뉴도 패널도 필요 없어요" */}
      <div style={{ marginLeft: '80px' }}>
        <AITodoManager
          onTodoDataChange={setTodos}
          todos={todos}
          data-testid="ai-todo-manager"
        />
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

      {/* v0.8.5: 팝업 창 최상위 위치 - functional_specification.md 준수 + 완전한 CRUD */}
      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isVisible={showTaskDetail}
          onClose={closeTaskDetail}
          onUpdate={handleTodoUpdate} // v0.8.5: 완전한 업데이트 기능
          onDelete={handleTodoDelete} // v0.8.5: 삭제 기능
          onAddSubtask={handleAddSubtask} // v0.8.5: 서브태스크 추가 기능
          data-testid="task-detail-modal"
        />
      )}
    </div>
  );
}

export default App;