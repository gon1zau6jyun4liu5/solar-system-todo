import React, { useState, useEffect } from 'react';
import TodoList from './TodoList';
import TodoForm from './TodoForm';
import './TodoManager.css';

// 초기 Todo 데이터 (데드라인 추가)
const initialTodos = [
  {
    id: 1,
    text: '태양의 표면 온도 조사하기',
    category: 'sun',
    completed: false,
    createdAt: new Date('2025-07-20'),
    priority: 'high',
    deadline: new Date('2025-07-25')
  },
  {
    id: 2,
    text: '지구의 자전축 기울기 23.5도 확인',
    category: 'earth',
    completed: true,
    createdAt: new Date('2025-07-19'),
    priority: 'medium',
    deadline: new Date('2025-07-22')
  },
  {
    id: 3,
    text: '화성 탐사 로버 데이터 분석',
    category: 'mars',
    completed: false,
    createdAt: new Date('2025-07-21'),
    priority: 'high',
    deadline: new Date('2025-07-23')
  },
  {
    id: 4,
    text: '목성의 대적점 관측 일지 작성',
    category: 'jupiter',
    completed: false,
    createdAt: new Date('2025-07-18'),
    priority: 'low',
    deadline: new Date('2025-07-30')
  },
  {
    id: 5,
    text: '토성 고리의 구성 물질 연구',
    category: 'saturn',
    completed: true,
    createdAt: new Date('2025-07-17'),
    priority: 'medium',
    deadline: new Date('2025-07-24')
  },
  {
    id: 6,
    text: '혜성 궤도 계산 프로그램 완성하기',
    category: 'general',
    completed: false,
    createdAt: new Date('2025-07-21'),
    priority: 'high',
    deadline: new Date('2025-07-22')
  }
];

const TodoManager = ({ selectedCategory, onCategoryChange, onTodosChange, isVisible = true }) => {
  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, completed, pending

  // 로컬스토리지에서 데이터 로드
  useEffect(() => {
    const savedTodos = localStorage.getItem('solar-system-todos');
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        deadline: todo.deadline ? new Date(todo.deadline) : null
      }));
      setTodos(parsedTodos);
    } else {
      setTodos(initialTodos);
      localStorage.setItem('solar-system-todos', JSON.stringify(initialTodos));
    }
  }, []);

  // 로컬스토리지에 데이터 저장 및 부모 컴포넌트에 알림
  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem('solar-system-todos', JSON.stringify(todos));
      if (onTodosChange) {
        onTodosChange(todos);
      }
    }
  }, [todos, onTodosChange]);

  // 선택된 카테고리가 변경되면 필터 업데이트
  useEffect(() => {
    if (selectedCategory) {
      setFilter('pending'); // 행성 클릭 시 pending만 표시
    } else {
      setFilter('all');
    }
  }, [selectedCategory]);

  // Todo 추가
  const addTodo = (todoData) => {
    const newTodo = {
      id: Date.now(),
      ...todoData,
      completed: false,
      createdAt: new Date()
    };
    setTodos(prev => [...prev, newTodo]);
    setShowForm(false);
  };

  // Todo 수정
  const updateTodo = (id, updates) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    ));
    setEditingTodo(null);
    setShowForm(false);
  };

  // Todo 삭제
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // Todo 완료 상태 토글
  const toggleComplete = (id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // 편집 시작
  const startEdit = (todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  // 폼 취소
  const cancelForm = () => {
    setEditingTodo(null);
    setShowForm(false);
  };

  // Todo 필터링
  const filteredTodos = todos.filter(todo => {
    // 카테고리 필터
    const categoryMatch = selectedCategory ? todo.category === selectedCategory : true;
    
    // 상태 필터
    let statusMatch;
    switch (filter) {
      case 'completed':
        statusMatch = todo.completed;
        break;
      case 'pending':
        statusMatch = !todo.completed;
        break;
      default:
        statusMatch = true;
    }
    
    return categoryMatch && statusMatch;
  });

  // 통계 계산
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length
  };

  // 선택된 카테고리 통계
  const categoryStats = selectedCategory ? {
    total: todos.filter(t => t.category === selectedCategory).length,
    completed: todos.filter(t => t.category === selectedCategory && t.completed).length,
    pending: todos.filter(t => t.category === selectedCategory && !t.completed).length
  } : null;

  return (
    <div className={`todo-manager ${!isVisible ? 'hidden' : ''}`}>
      <div className="todo-header">
        <h2>🚀 Solar System Mission Control</h2>
        <div className="version-display">v0.4.0</div>
        
        {selectedCategory && (
          <div className="category-header">
            <h3>📍 {selectedCategory.toUpperCase()} Missions</h3>
            <button 
              className="clear-category-btn"
              onClick={() => onCategoryChange && onCategoryChange(null)}
            >
              ✕ Show All
            </button>
          </div>
        )}
        
        <div className="todo-stats">
          {categoryStats ? (
            <>
              <span>Category Total: {categoryStats.total}</span>
              <span>Completed: {categoryStats.completed}</span>
              <span>Pending: {categoryStats.pending}</span>
            </>
          ) : (
            <>
              <span>Total: {stats.total}</span>
              <span>Completed: {stats.completed}</span>
              <span>Pending: {stats.pending}</span>
            </>
          )}
        </div>
      </div>

      <div className="todo-controls">
        <div className="filter-buttons">
          <button 
            className={filter === 'all' && !selectedCategory ? 'active' : ''}
            onClick={() => setFilter('all')}
            disabled={selectedCategory}
          >
            All Missions
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
        
        <button 
          className="add-todo-btn"
          onClick={() => setShowForm(true)}
          disabled={showForm}
        >
          + New Mission
        </button>
      </div>

      {showForm && (
        <TodoForm
          todo={editingTodo}
          onSubmit={editingTodo ? 
            (data) => updateTodo(editingTodo.id, data) : 
            addTodo
          }
          onCancel={cancelForm}
        />
      )}

      <TodoList
        todos={filteredTodos}
        onToggleComplete={toggleComplete}
        onEdit={startEdit}
        onDelete={deleteTodo}
      />
    </div>
  );
};

export default TodoManager;