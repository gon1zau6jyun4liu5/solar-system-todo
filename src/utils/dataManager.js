/**
 * v0.8.4: 데이터 영속성 관리 시스템 - LocalStorage 기반
 * 
 * functional_specification.md 완전 준수:
 * - 태스크 생성, 수정, 삭제가 실제로 반영되고 유지됨
 * - 브라우저 새로고침 후에도 모든 데이터 보존
 * - 다중 태양계 시스템과 완전 호환
 */

// LocalStorage 키 상수
const STORAGE_KEYS = {
  TODOS: 'solar-todo-tasks',
  SETTINGS: 'solar-todo-settings',
  VERSION: 'solar-todo-version'
};

// 현재 데이터 버전
const DATA_VERSION = '0.8.4';

/**
 * 데이터 매니저 클래스
 * LocalStorage를 이용한 완전한 데이터 영속성 보장
 */
class DataManager {
  constructor() {
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
    this.initializeStorage();
  }

  /**
   * LocalStorage 사용 가능 여부 확인
   */
  checkLocalStorageAvailability() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('⚠️ LocalStorage 사용 불가:', error);
      return false;
    }
  }

  /**
   * 저장소 초기화
   */
  initializeStorage() {
    if (!this.isLocalStorageAvailable) {
      console.warn('⚠️ LocalStorage 사용 불가 - 메모리 저장소로 대체');
      this.memoryStorage = {
        todos: [],
        settings: {},
        version: DATA_VERSION
      };
      return;
    }

    // 버전 확인 및 마이그레이션
    const currentVersion = this.getVersion();
    if (currentVersion !== DATA_VERSION) {
      console.log(`🔄 데이터 버전 업그레이드: ${currentVersion} → ${DATA_VERSION}`);
      this.migrateData(currentVersion);
    }

    console.log('✅ v0.8.4: 데이터 영속성 시스템 초기화 완료');
  }

  /**
   * 데이터 마이그레이션
   */
  migrateData(fromVersion) {
    try {
      // 기존 데이터 백업
      const backup = {
        todos: this.getAllTodos(),
        timestamp: Date.now(),
        fromVersion: fromVersion
      };

      // 백업 저장
      this.setItem('backup-' + Date.now(), JSON.stringify(backup));
      
      // 버전 업데이트
      this.setVersion(DATA_VERSION);
      
      console.log('✅ 데이터 마이그레이션 완료:', fromVersion, '→', DATA_VERSION);
    } catch (error) {
      console.error('❌ 데이터 마이그레이션 실패:', error);
    }
  }

  /**
   * 버전 정보 관리
   */
  getVersion() {
    return this.getItem(STORAGE_KEYS.VERSION) || '0.0.0';
  }

  setVersion(version) {
    this.setItem(STORAGE_KEYS.VERSION, version);
  }

  /**
   * 저장소 읽기/쓰기 래퍼
   */
  getItem(key) {
    if (!this.isLocalStorageAvailable) {
      return this.memoryStorage[key];
    }
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('❌ LocalStorage 읽기 실패:', error);
      return null;
    }
  }

  setItem(key, value) {
    if (!this.isLocalStorageAvailable) {
      this.memoryStorage[key] = value;
      return;
    }
    
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('❌ LocalStorage 쓰기 실패:', error);
      // 저장소 공간 부족 시 오래된 백업 삭제
      this.cleanupOldBackups();
      try {
        localStorage.setItem(key, value);
      } catch (retryError) {
        console.error('❌ LocalStorage 재시도 실패:', retryError);
      }
    }
  }

  removeItem(key) {
    if (!this.isLocalStorageAvailable) {
      delete this.memoryStorage[key];
      return;
    }
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('❌ LocalStorage 삭제 실패:', error);
    }
  }

  /**
   * 오래된 백업 정리
   */
  cleanupOldBackups() {
    if (!this.isLocalStorageAvailable) return;

    try {
      const keys = Object.keys(localStorage);
      const backupKeys = keys.filter(key => key.startsWith('backup-'));
      
      // 최근 5개만 유지
      if (backupKeys.length > 5) {
        const sortedKeys = backupKeys.sort().slice(0, -5);
        sortedKeys.forEach(key => localStorage.removeItem(key));
        console.log('🧹 오래된 백업 정리:', sortedKeys.length, '개');
      }
    } catch (error) {
      console.error('❌ 백업 정리 실패:', error);
    }
  }

  /**
   * ===== 태스크 데이터 관리 =====
   */

  /**
   * 모든 태스크 조회
   */
  getAllTodos() {
    try {
      const todosJson = this.getItem(STORAGE_KEYS.TODOS);
      if (!todosJson) {
        console.log('📋 저장된 태스크 없음 - 빈 배열 반환');
        return [];
      }

      const todos = JSON.parse(todosJson);
      
      // 데이터 검증
      if (!Array.isArray(todos)) {
        console.warn('⚠️ 잘못된 태스크 데이터 형식 - 초기화');
        return [];
      }

      // 날짜 객체 복원
      const restoredTodos = todos.map(todo => ({
        ...todo,
        startDate: todo.startDate ? new Date(todo.startDate) : new Date(),
        deadline: todo.deadline ? new Date(todo.deadline) : new Date(),
        createdAt: todo.createdAt || Date.now(),
        subtasks: (todo.subtasks || []).map(subtask => ({
          ...subtask,
          startDate: subtask.startDate ? new Date(subtask.startDate) : new Date(),
          deadline: subtask.deadline ? new Date(subtask.deadline) : new Date()
        }))
      }));

      console.log('📋 태스크 로드 완료:', restoredTodos.length, '개');
      return restoredTodos;

    } catch (error) {
      console.error('❌ 태스크 로드 실패:', error);
      return [];
    }
  }

  /**
   * 모든 태스크 저장
   */
  saveAllTodos(todos) {
    try {
      if (!Array.isArray(todos)) {
        console.error('❌ 잘못된 태스크 데이터:', todos);
        return false;
      }

      // 데이터 검증 및 정리
      const validTodos = todos.filter(todo => todo && todo.id).map(todo => ({
        ...todo,
        // 필수 필드 보장
        id: todo.id,
        text: todo.text || 'Untitled Task',
        category: todo.category || 'general',
        priority: todo.priority || 'medium',
        completed: Boolean(todo.completed),
        createdAt: todo.createdAt || Date.now(),
        startDate: todo.startDate || new Date(),
        deadline: todo.deadline || new Date(),
        keywords: Array.isArray(todo.keywords) ? todo.keywords : [],
        subtasks: Array.isArray(todo.subtasks) ? todo.subtasks.map(subtask => ({
          ...subtask,
          id: subtask.id,
          text: subtask.text || 'Untitled Subtask',
          completed: Boolean(subtask.completed),
          startDate: subtask.startDate || new Date(),
          deadline: subtask.deadline || new Date(),
          keywords: Array.isArray(subtask.keywords) ? subtask.keywords : []
        })) : []
      }));

      this.setItem(STORAGE_KEYS.TODOS, JSON.stringify(validTodos));
      console.log('💾 태스크 저장 완료:', validTodos.length, '개');
      return true;

    } catch (error) {
      console.error('❌ 태스크 저장 실패:', error);
      return false;
    }
  }

  /**
   * 단일 태스크 추가
   */
  addTodo(newTodo) {
    try {
      const todos = this.getAllTodos();
      
      // 기본값 설정
      const todo = {
        id: newTodo.id || this.generateId(),
        text: newTodo.text || 'New Task',
        category: newTodo.category || 'general',
        priority: newTodo.priority || 'medium',
        completed: false,
        createdAt: Date.now(),
        startDate: newTodo.startDate || new Date(),
        deadline: newTodo.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        keywords: newTodo.keywords || [newTodo.text?.split(' ')[0] || 'Task'],
        subtasks: newTodo.subtasks || []
      };

      todos.push(todo);
      this.saveAllTodos(todos);
      
      console.log('✅ 태스크 추가:', todo.text);
      return todo;

    } catch (error) {
      console.error('❌ 태스크 추가 실패:', error);
      return null;
    }
  }

  /**
   * 단일 태스크 업데이트
   */
  updateTodo(todoId, updates) {
    try {
      const todos = this.getAllTodos();
      const todoIndex = todos.findIndex(todo => todo.id === todoId);
      
      if (todoIndex === -1) {
        console.warn('⚠️ 업데이트할 태스크를 찾을 수 없음:', todoId);
        return false;
      }

      // 기존 태스크에 업데이트 적용
      todos[todoIndex] = {
        ...todos[todoIndex],
        ...updates,
        id: todoId, // ID는 변경 불가
        updatedAt: Date.now() // 업데이트 시간 기록
      };

      this.saveAllTodos(todos);
      console.log('✅ 태스크 업데이트:', todos[todoIndex].text);
      return true;

    } catch (error) {
      console.error('❌ 태스크 업데이트 실패:', error);
      return false;
    }
  }

  /**
   * 단일 태스크 삭제
   */
  deleteTodo(todoId) {
    try {
      const todos = this.getAllTodos();
      const todoToDelete = todos.find(todo => todo.id === todoId);
      
      if (!todoToDelete) {
        console.warn('⚠️ 삭제할 태스크를 찾을 수 없음:', todoId);
        return false;
      }

      // 태스크 제거
      const updatedTodos = todos.filter(todo => todo.id !== todoId);
      this.saveAllTodos(updatedTodos);
      
      console.log('🗑️ 태스크 삭제:', todoToDelete.text);
      console.log('📊 남은 태스크:', updatedTodos.length, '개');
      
      return true;

    } catch (error) {
      console.error('❌ 태스크 삭제 실패:', error);
      return false;
    }
  }

  /**
   * 모든 태스크 삭제 (Clear All)
   */
  clearAllTodos() {
    try {
      this.saveAllTodos([]);
      console.log('🧹 모든 태스크 삭제 완료');
      return true;
    } catch (error) {
      console.error('❌ 전체 삭제 실패:', error);
      return false;
    }
  }

  /**
   * ===== 서브태스크 관리 =====
   */

  /**
   * 서브태스크 추가
   */
  addSubtask(todoId, newSubtask) {
    try {
      const todos = this.getAllTodos();
      const todoIndex = todos.findIndex(todo => todo.id === todoId);
      
      if (todoIndex === -1) {
        console.warn('⚠️ 부모 태스크를 찾을 수 없음:', todoId);
        return false;
      }

      const subtask = {
        id: newSubtask.id || this.generateId(),
        text: newSubtask.text || 'New Subtask',
        completed: false,
        startDate: newSubtask.startDate || new Date(),
        deadline: newSubtask.deadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        keywords: newSubtask.keywords || [newSubtask.text?.split(' ')[0] || 'Subtask']
      };

      if (!todos[todoIndex].subtasks) {
        todos[todoIndex].subtasks = [];
      }
      
      todos[todoIndex].subtasks.push(subtask);
      this.saveAllTodos(todos);
      
      console.log('✅ 서브태스크 추가:', subtask.text, '→', todos[todoIndex].text);
      return subtask;

    } catch (error) {
      console.error('❌ 서브태스크 추가 실패:', error);
      return null;
    }
  }

  /**
   * 서브태스크 업데이트
   */
  updateSubtask(todoId, subtaskId, updates) {
    try {
      const todos = this.getAllTodos();
      const todoIndex = todos.findIndex(todo => todo.id === todoId);
      
      if (todoIndex === -1) {
        console.warn('⚠️ 부모 태스크를 찾을 수 없음:', todoId);
        return false;
      }

      if (!todos[todoIndex].subtasks) {
        todos[todoIndex].subtasks = [];
      }

      const subtaskIndex = todos[todoIndex].subtasks.findIndex(subtask => subtask.id === subtaskId);
      
      if (subtaskIndex === -1) {
        console.warn('⚠️ 업데이트할 서브태스크를 찾을 수 없음:', subtaskId);
        return false;
      }

      // 서브태스크 업데이트
      todos[todoIndex].subtasks[subtaskIndex] = {
        ...todos[todoIndex].subtasks[subtaskIndex],
        ...updates,
        id: subtaskId, // ID는 변경 불가
        updatedAt: Date.now()
      };

      this.saveAllTodos(todos);
      console.log('✅ 서브태스크 업데이트:', todos[todoIndex].subtasks[subtaskIndex].text);
      return true;

    } catch (error) {
      console.error('❌ 서브태스크 업데이트 실패:', error);
      return false;
    }
  }

  /**
   * 서브태스크 삭제
   */
  deleteSubtask(todoId, subtaskId) {
    try {
      const todos = this.getAllTodos();
      const todoIndex = todos.findIndex(todo => todo.id === todoId);
      
      if (todoIndex === -1) {
        console.warn('⚠️ 부모 태스크를 찾을 수 없음:', todoId);
        return false;
      }

      if (!todos[todoIndex].subtasks) {
        console.warn('⚠️ 서브태스크가 존재하지 않음');
        return false;
      }

      const subtaskToDelete = todos[todoIndex].subtasks.find(subtask => subtask.id === subtaskId);
      
      if (!subtaskToDelete) {
        console.warn('⚠️ 삭제할 서브태스크를 찾을 수 없음:', subtaskId);
        return false;
      }

      // 서브태스크 제거
      todos[todoIndex].subtasks = todos[todoIndex].subtasks.filter(subtask => subtask.id !== subtaskId);
      this.saveAllTodos(todos);
      
      console.log('🗑️ 서브태스크 삭제:', subtaskToDelete.text);
      return true;

    } catch (error) {
      console.error('❌ 서브태스크 삭제 실패:', error);
      return false;
    }
  }

  /**
   * ===== 설정 관리 =====
   */

  /**
   * 설정 저장
   */
  saveSettings(settings) {
    try {
      this.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      console.log('⚙️ 설정 저장 완료');
      return true;
    } catch (error) {
      console.error('❌ 설정 저장 실패:', error);
      return false;
    }
  }

  /**
   * 설정 로드
   */
  loadSettings() {
    try {
      const settingsJson = this.getItem(STORAGE_KEYS.SETTINGS);
      if (!settingsJson) {
        return this.getDefaultSettings();
      }

      const settings = JSON.parse(settingsJson);
      return { ...this.getDefaultSettings(), ...settings };
    } catch (error) {
      console.error('❌ 설정 로드 실패:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * 기본 설정
   */
  getDefaultSettings() {
    return {
      useEnhancedUI: true,
      showAnalyticsDashboard: false,
      aiGroupingActive: true,
      isAnimationPlaying: true,
      currentView: 'all',
      version: DATA_VERSION
    };
  }

  /**
   * ===== 유틸리티 =====
   */

  /**
   * 고유 ID 생성
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 데이터 내보내기 (백업)
   */
  exportData() {
    try {
      const data = {
        todos: this.getAllTodos(),
        settings: this.loadSettings(),
        version: DATA_VERSION,
        exportDate: new Date().toISOString()
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('❌ 데이터 내보내기 실패:', error);
      return null;
    }
  }

  /**
   * 데이터 가져오기 (복원)
   */
  importData(dataJson) {
    try {
      const data = JSON.parse(dataJson);
      
      if (data.todos) {
        this.saveAllTodos(data.todos);
      }
      
      if (data.settings) {
        this.saveSettings(data.settings);
      }

      console.log('✅ 데이터 가져오기 완료');
      return true;
    } catch (error) {
      console.error('❌ 데이터 가져오기 실패:', error);
      return false;
    }
  }

  /**
   * 저장소 상태 확인
   */
  getStorageInfo() {
    const info = {
      isAvailable: this.isLocalStorageAvailable,
      version: this.getVersion(),
      todoCount: this.getAllTodos().length
    };

    if (this.isLocalStorageAvailable) {
      try {
        const keys = Object.keys(localStorage);
        const solarTodoKeys = keys.filter(key => key.startsWith('solar-todo'));
        
        info.keysCount = solarTodoKeys.length;
        info.estimatedSize = solarTodoKeys.reduce((size, key) => {
          return size + (localStorage.getItem(key)?.length || 0);
        }, 0);
      } catch (error) {
        info.error = error.message;
      }
    }

    return info;
  }
}

// 싱글톤 인스턴스 생성
const dataManager = new DataManager();

export default dataManager;

// Named exports for specific functions
export const {
  getAllTodos,
  saveAllTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  clearAllTodos,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  saveSettings,
  loadSettings,
  exportData,
  importData,
  getStorageInfo
} = dataManager;
