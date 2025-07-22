import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Scene from './components/Scene';
import AITodoManager from './components/AITodoManager';
import EnhancedMissionControl from './components/EnhancedMissionControl';
import AdvancedAnalyticsDashboard from './components/AdvancedAnalyticsDashboard';
import DynamicSolarSystemManager from './components/DynamicSolarSystemManager';
import AsteroidActionSystem from './components/AsteroidActionSystem';

// AI 그룹핑 엔진 - 태스크 자동 분석 및 분류
const AIEngine = {
  // 태스크 내용 분석
  analyzeTasks: async (tasks) => {
    // 키워드 기반 분석 (실제로는 ML/NLP 사용)
    const analysis = tasks.map(task => {
      const keywords = task.text.toLowerCase().split(' ');
      const category = categorizeTask(keywords);
      const priority = calculatePriority(task);
      const context = extractContext(task);
      
      return {
        taskId: task.id,
        category,
        priority,
        context,
        keywords,
        complexity: calculateComplexity(task)
      };
    });
    
    return analysis;
  },

  // AI 기반 그룹 생성
  createGroups: async (analysis) => {
    const groups = new Map();
    
    // 유사성 기반 그룹핑
    analysis.forEach(task => {
      const groupKey = findOrCreateGroup(task, groups);
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          id: generateId(),
          name: groupKey,
          tasks: [],
          theme: getGroupTheme(groupKey),
          priority: 0
        });
      }
      
      const group = groups.get(groupKey);
      group.tasks.push(task);
      group.priority = Math.max(group.priority, task.priority);
    });
    
    return Array.from(groups.values());
  }
};

// 헬퍼 함수들
const categorizeTask = (keywords) => {
  const categories = {
    work: ['프로젝트', '업무', '회의', '개발', '디자인', '기획'],
    personal: ['장보기', '운동', '독서', '취미', '여행', '건강'],
    study: ['공부', '학습', '강의', '시험', '과제', '연구'],
    social: ['만남', '약속', '파티', '생일', '친구', '가족']
  };
  
  for (const [category, categoryKeywords] of Object.entries(categories)) {
    if (keywords.some(keyword => categoryKeywords.includes(keyword))) {
      return category;
    }
  }
  
  return 'general';
};

const calculatePriority = (task) => {
  const urgentWords = ['긴급', '급함', '중요', '데드라인', '마감'];
  const text = task.text.toLowerCase();
  let priority = 1;
  
  urgentWords.forEach(word => {
    if (text.includes(word)) priority += 2;
  });
  
  if (task.deadline) {
    const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 1) priority += 3;
    else if (daysLeft <= 7) priority += 2;
    else if (daysLeft <= 30) priority += 1;
  }
  
  return Math.min(priority, 5);
};

const extractContext = (task) => {
  // 태스크의 컨텍스트 추출 (시간, 장소, 관련 인물 등)
  return {
    timeContext: extractTimeContext(task.text),
    locationContext: extractLocationContext(task.text),
    peopleContext: extractPeopleContext(task.text)
  };
};

const calculateComplexity = (task) => {
  const complexityFactors = [
    task.text.length > 50 ? 1 : 0,
    task.subtasks?.length > 0 ? task.subtasks.length * 0.5 : 0,
    task.description?.length > 100 ? 1 : 0
  ];
  
  return complexityFactors.reduce((sum, factor) => sum + factor, 1);
};

const findOrCreateGroup = (task, groups) => {
  // 기존 그룹들과의 유사도 계산
  let bestMatch = task.category;
  let maxSimilarity = 0.6; // 임계값
  
  for (const [groupKey, group] of groups) {
    const similarity = calculateSimilarity(task, group);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      bestMatch = groupKey;
    }
  }
  
  return bestMatch;
};

const calculateSimilarity = (task, group) => {
  // 키워드, 카테고리, 컨텍스트 기반 유사도 계산
  const keywordSimilarity = calculateKeywordSimilarity(task.keywords, group.tasks);
  const categorySimilarity = task.category === group.name ? 0.5 : 0;
  const contextSimilarity = calculateContextSimilarity(task.context, group.tasks);
  
  return (keywordSimilarity + categorySimilarity + contextSimilarity) / 3;
};

const calculateKeywordSimilarity = (keywords, groupTasks) => {
  if (!groupTasks.length) return 0;
  
  const groupKeywords = groupTasks.flatMap(t => t.keywords);
  const commonKeywords = keywords.filter(k => groupKeywords.includes(k));
  
  return commonKeywords.length / Math.max(keywords.length, groupKeywords.length);
};

const calculateContextSimilarity = (context, groupTasks) => {
  // 컨텍스트 유사도 계산 로직
  return 0.3; // 단순화된 값
};

const getGroupTheme = (groupName) => {
  const themes = {
    work: { color: '#4CAF50', texture: 'corporate' },
    personal: { color: '#2196F3', texture: 'casual' },
    study: { color: '#FF9800', texture: 'academic' },
    social: { color: '#E91E63', texture: 'social' }
  };
  
  return themes[groupName] || { color: '#9C27B0', texture: 'default' };
};

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 헬퍼 함수들 (단순화된 구현)
const extractTimeContext = (text) => text.includes('오늘') || text.includes('내일') ? 'immediate' : 'later';
const extractLocationContext = (text) => text.includes('사무실') || text.includes('집') ? 'specific' : 'any';
const extractPeopleContext = (text) => text.includes('팀') || text.includes('회의') ? 'collaborative' : 'individual';

// 메인 App 컴포넌트
function App() {
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
  const [todos, setTodos] = useState([]);
  const [solarSystems, setSolarSystems] = useState([]);
  const [asteroids, setAsteroids] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [useEnhancedUI, setUseEnhancedUI] = useState(true);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [aiGroupingActive, setAiGroupingActive] = useState(true);
  const [currentView, setCurrentView] = useState('all'); // 'all', 'system-{id}'

  // v0.5.5 수정: 기본 태스크 데이터 추가 (태양계를 3개 표시하기 위해)
  const initializeDefaultTasks = () => {
    const defaultTasks = [
      {
        id: 'task-1',
        text: '프로젝트 기획서 작성',
        category: 'work',
        priority: 'high',
        completed: false,
        createdAt: Date.now(),
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
        subtasks: [
          { id: 'subtask-1-1', text: '요구사항 분석', completed: false },
          { id: 'subtask-1-2', text: '기술 스택 선정', completed: false }
        ],
        visualProperties: { daysUntilDeadline: 3 }
      },
      {
        id: 'task-2',
        text: '장보기 목록 작성',
        category: 'personal',
        priority: 'medium',
        completed: false,
        createdAt: Date.now(),
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1일 후
        subtasks: [],
        visualProperties: { daysUntilDeadline: 1 }
      },
      {
        id: 'task-3',
        text: 'React 강의 수강하기',
        category: 'study',
        priority: 'medium',
        completed: false,
        createdAt: Date.now(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
        subtasks: [
          { id: 'subtask-3-1', text: 'Hook 개념 익히기', completed: false },
          { id: 'subtask-3-2', text: '프로젝트 실습', completed: false },
          { id: 'subtask-3-3', text: '복습 노트 정리', completed: false }
        ],
        visualProperties: { daysUntilDeadline: 7 }
      },
      {
        id: 'task-4',
        text: '친구와 카페 약속',
        category: 'social',
        priority: 'low',
        completed: false,
        createdAt: Date.now(),
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
        subtasks: [],
        visualProperties: { daysUntilDeadline: 5 }
      },
      {
        id: 'task-5',
        text: '업무 회의 준비',
        category: 'work',
        priority: 'high',
        completed: false,
        createdAt: Date.now(),
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2일 후
        subtasks: [
          { id: 'subtask-5-1', text: '발표 자료 준비', completed: false }
        ],
        visualProperties: { daysUntilDeadline: 2 }
      },
      {
        id: 'task-6',
        text: '운동하기',
        category: 'personal',
        priority: 'medium',
        completed: false,
        createdAt: Date.now(),
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1일 후
        subtasks: [],
        visualProperties: { daysUntilDeadline: 1 }
      }
    ];

    setTodos(defaultTasks);
    console.log('🎯 v0.5.5: 기본 태스크 데이터 로드 완료 (UI 레이아웃 수정)');
  };

  // v0.5.5 수정: AI 그룹핑 및 태양계 생성 (태스크가 있을 때만, 서브태스크 고려)
  const updateSolarSystems = useCallback(async () => {
    // 🔧 BUG FIX: 태스크가 없거나 AI 그룹핑이 비활성화되면 태양계 제거
    if (!aiGroupingActive || todos.length === 0) {
      setSolarSystems([]);
      setAsteroids([]);
      console.log('🌌 태양계 시스템 정리: 태스크 없음 또는 AI 비활성화');
      return;
    }

    try {
      console.log('🤖 AI 분석 시작:', todos.length, '개 태스크');
      const analysis = await AIEngine.analyzeTasks(todos);
      const groups = await AIEngine.createGroups(analysis);
      
      // v0.5.5 수정: 다중 태양계 생성 (서브태스크를 위성으로 표현)
      const newSolarSystems = groups.map((group, index) => ({
        id: group.id,
        name: group.name,
        position: calculateSystemPosition(index, groups.length),
        sun: {
          id: `sun-${group.id}`,
          name: group.name,
          theme: group.theme,
          tasks: group.tasks
        },
        planets: group.tasks.map(task => {
          const fullTask = todos.find(t => t.id === task.taskId);
          return {
            id: task.taskId,
            name: extractTaskKeyword(task),
            task: fullTask,
            // v0.5.5: 서브태스크가 있을 때만 위성 생성
            satellites: fullTask?.subtasks?.length > 0 ? getSatellitesForTask(task.taskId, todos) : []
          };
        }).filter(planet => planet.task), // 유효한 태스크가 있는 행성만 포함
        theme: group.theme,
        priority: group.priority
      }));

      console.log('🌌 v0.5.5: 생성된 태양계:', newSolarSystems.length, '개 (UI 레이아웃 수정 완료)');
      setSolarSystems(newSolarSystems);
      
      // 소행성 시스템 업데이트
      generateAsteroids(newSolarSystems);
      
    } catch (error) {
      console.error('AI 그룹핑 오류:', error);
    }
  }, [todos, aiGroupingActive]);

  // 태양계 위치 계산
  const calculateSystemPosition = (index, totalSystems) => {
    if (totalSystems === 1) return [0, 0, 0];
    
    const radius = Math.max(50, totalSystems * 15);
    const angle = (index / totalSystems) * Math.PI * 2;
    
    return [
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ];
  };

  // 태스크에서 키워드 추출
  const extractTaskKeyword = (task) => {
    const words = task.keywords || [];
    return words.find(word => word.length > 2) || 'Task';
  };

  // v0.5.5 수정: 위성(서브태스크) 가져오기 - 서브태스크가 있을 때만
  const getSatellitesForTask = (taskId, todoList) => {
    const task = todoList.find(t => t.id === taskId);
    if (!task?.subtasks?.length) return [];
    
    return task.subtasks.map(subtask => ({
      id: subtask.id,
      name: subtask.text.substring(0, 10) + '...',
      subtask: subtask,
      completed: subtask.completed
    }));
  };

  // 소행성 생성 (AI 액션 제안)
  const generateAsteroids = (systems) => {
    const newAsteroids = [];
    
    systems.forEach(system => {
      system.planets.forEach(planet => {
        // 랜덤하게 액션 제안 생성
        if (Math.random() < 0.3 && planet.task) {
          const asteroid = {
            id: `asteroid-${generateId()}`,
            targetPlanetId: planet.id,
            targetSystemId: system.id,
            position: generateRandomPosition(),
            suggestion: generateActionSuggestion(planet.task),
            speed: 0.5 + Math.random() * 0.5,
            timeLimit: Date.now() + (30 + Math.random() * 60) * 1000 // 30-90초
          };
          
          newAsteroids.push(asteroid);
        }
      });
    });
    
    setAsteroids(newAsteroids);
  };

  // 액션 제안 생성
  const generateActionSuggestion = (task) => {
    const suggestions = [
      '진행 상황 공유하기',
      '우선순위 재검토',
      '관련 자료 검토',
      '협업자와 소통',
      '중간 점검 실시',
      '다음 단계 계획'
    ];
    
    return {
      action: suggestions[Math.floor(Math.random() * suggestions.length)],
      description: `"${task.text}" 태스크에 대한 제안`,
      impact: Math.floor(Math.random() * 3) + 1
    };
  };

  // 랜덤 위치 생성
  const generateRandomPosition = () => {
    const radius = 100 + Math.random() * 50;
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 20;
    
    return [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ];
  };

  // v0.5.5: 초기 로드 시 기본 태스크 설정 (서브태스크 포함)
  useEffect(() => {
    if (todos.length === 0) {
      initializeDefaultTasks();
    }
  }, []);

  // 태스크 변경 시 AI 재분석
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updateSolarSystems();
    }, 1000); // 1초 디바운스

    return () => clearTimeout(debounceTimer);
  }, [updateSolarSystems]);

  // 소행성 이동 및 충돌 처리
  useEffect(() => {
    if (!asteroids.length) return;

    const interval = setInterval(() => {
      setAsteroids(prev => {
        return prev.map(asteroid => {
          // 시간 초과 체크
          if (Date.now() > asteroid.timeLimit) {
            // 충돌 효과 트리거
            console.log('💥 소행성 충돌:', asteroid.suggestion.action);
            return null; // 제거 마킹
          }
          
          // 위치 업데이트 (목표 행성 방향으로 이동)
          const targetSystem = solarSystems.find(s => s.id === asteroid.targetSystemId);
          const targetPlanet = targetSystem?.planets.find(p => p.id === asteroid.targetPlanetId);
          
          if (targetPlanet) {
            // 간단한 이동 로직 (실제로는 더 복잡한 물리 계산 필요)
            const newPosition = [...asteroid.position];
            newPosition[0] += (Math.random() - 0.5) * asteroid.speed;
            newPosition[2] += (Math.random() - 0.5) * asteroid.speed;
            
            return {
              ...asteroid,
              position: newPosition
            };
          }
          
          return asteroid;
        }).filter(Boolean); // null 제거
      });
    }, 100); // 100ms마다 업데이트

    return () => clearInterval(interval);
  }, [asteroids, solarSystems]);

  // 이벤트 핸들러들
  const handleAnimationToggle = () => {
    setIsAnimationPlaying(prev => !prev);
  };

  const handleTodoDataChange = (newTodos) => {
    setTodos(newTodos);
  };

  const handleTodoUpdate = (todoId, updates) => {
    setTodos(prev => prev.map(todo => 
      todo.id === todoId ? { ...todo, ...updates } : todo
    ));
  };

  const handleTodoAdd = (newTodo = {}) => {
    const todo = {
      id: generateId(),
      text: newTodo.text || 'New Task',
      category: newTodo.category || 'general',
      priority: newTodo.priority || 'medium', // v0.5.5: 기본 priority 설정
      completed: false,
      createdAt: Date.now(),
      deadline: newTodo.deadline,
      subtasks: newTodo.subtasks || [],
      visualProperties: {
        daysUntilDeadline: newTodo.deadline ? 
          Math.ceil((new Date(newTodo.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 30
      }
    };
    
    setTodos(prev => [...prev, todo]);
    console.log('✅ 새 태스크 추가:', todo);
  };

  const handleTodoDelete = (todoId) => {
    setTodos(prev => prev.filter(todo => todo.id !== todoId));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const toggleUIMode = () => {
    setUseEnhancedUI(prev => !prev);
  };

  const toggleAnalyticsDashboard = () => {
    setShowAnalyticsDashboard(prev => !prev);
  };

  const closeAnalyticsDashboard = () => {
    setShowAnalyticsDashboard(false);
  };

  const toggleAIGrouping = () => {
    setAiGroupingActive(prev => {
      const newState = !prev;
      if (!newState) {
        setSolarSystems([]);
        setAsteroids([]);
      }
      return newState;
    });
  };

  const handleSolarSystemClick = (systemId) => {
    setCurrentView(currentView === `system-${systemId}` ? 'all' : `system-${systemId}`);
  };

  const handleAsteroidAction = (asteroidId, action) => {
    if (action === 'accept') {
      // 제안 수락
      console.log('✅ 소행성 제안 수락:', asteroidId);
      setAsteroids(prev => prev.filter(a => a.id !== asteroidId));
    } else if (action === 'reject') {
      // 제안 거부
      console.log('❌ 소행성 제안 거부:', asteroidId);
      setAsteroids(prev => prev.filter(a => a.id !== asteroidId));
    }
  };

  return (
    <div className="App">
      {/* 3D 씬 - 다중 태양계 렌더링 */}
      <Scene 
        isAnimationPlaying={isAnimationPlaying}
        solarSystems={solarSystems}
        asteroids={asteroids}
        currentView={currentView}
        onSolarSystemClick={handleSolarSystemClick}
        onAsteroidClick={(asteroidId) => console.log('소행성 클릭:', asteroidId)}
        data-testid="scene"
      />

      {/* 🔧 v0.5.5 수정: UI 모드 토글 버튼 (z-index 수정) */}
      <button 
        className="ui-mode-toggle"
        onClick={toggleUIMode}
        title={`Switch to ${useEnhancedUI ? 'Classic' : 'Enhanced'} UI`}
        data-testid="ui-mode-toggle"
      >
        {useEnhancedUI ? '🎨' : '🚀'} {useEnhancedUI ? 'Enhanced' : 'Classic'}
      </button>

      {/* 🔧 v0.5.5 수정: 분석 대시보드 토글 (z-index 수정) */}
      <button 
        className="analytics-toggle"
        onClick={toggleAnalyticsDashboard}
        title="Open Advanced Analytics Dashboard"
        data-testid="analytics-toggle"
      >
        📊 Analytics
      </button>

      {/* 🔧 v0.5.5 수정: AI 그룹핑 상태 표시 (z-index 수정) */}
      <button
        className="ai-grouping-toggle"
        onClick={toggleAIGrouping}
        title={`AI 그룹핑 ${aiGroupingActive ? '비활성화' : '활성화'}`}
        data-testid="ai-grouping-toggle"
      >
        🤖 AI {aiGroupingActive ? 'ON' : 'OFF'}
      </button>

      {/* 🔧 v0.5.5 수정: 애니메이션 토글 (z-index 수정) */}
      <button
        className="animation-toggle"
        onClick={handleAnimationToggle}
        title={`Animation ${isAnimationPlaying ? 'Pause' : 'Play'}`}
        data-testid="animation-toggle"
      >
        {isAnimationPlaying ? '⏸️ Pause' : '▶️ Play'} Solar System
      </button>

      {/* 조건부 UI 렌더링 */}
      {useEnhancedUI ? (
        <EnhancedMissionControl
          todos={todos}
          solarSystems={solarSystems}
          asteroids={asteroids}
          onTodoUpdate={handleTodoUpdate}
          onTodoAdd={handleTodoAdd}
          onTodoDelete={handleTodoDelete}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          onAsteroidAction={handleAsteroidAction}
          currentView={currentView}
          data-testid="enhanced-mission-control"
        />
      ) : (
        <AITodoManager 
          onTodoDataChange={handleTodoDataChange}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          aiGroupingActive={aiGroupingActive}
          data-testid="ai-todo-manager"
        />
      )}

      {/* 고급 분석 대시보드 */}
      <AdvancedAnalyticsDashboard
        todos={todos}
        solarSystems={solarSystems}
        asteroids={asteroids}
        isVisible={showAnalyticsDashboard}
        onClose={closeAnalyticsDashboard}
        data-testid="analytics-dashboard"
      />

      {/* 소행성 액션 시스템 */}
      <AsteroidActionSystem
        asteroids={asteroids}
        solarSystems={solarSystems}
        onAsteroidAction={handleAsteroidAction}
        data-testid="asteroid-action-system"
      />

      {/* 🔧 v0.5.5 수정: 시스템 상태 표시만 유지 (z-index 수정) */}
      <div className="system-status" data-testid="system-status">
        🌌 {solarSystems.length} Systems | ☄️ {asteroids.length} Asteroids
      </div>
    </div>
  );
}

export default App;