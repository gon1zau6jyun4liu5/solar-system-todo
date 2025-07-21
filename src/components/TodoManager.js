import React, { useState, useEffect } from 'react';
import TodoList from './TodoList';
import TodoForm from './TodoForm';
import './TodoManager.css';

// 임의의 Todo 데이터 (우주/태양계 테마)
const initialTodos = [
  {
    id: 1,
    text: '태양의 표면 온도 조사하기',
    category: 'sun',
    completed: false,
    createdAt: new Date('2025-07-20'),
    priority: 'high'
  },
  {
    id: 2,
    text: '지구의 자전축 기울기 23.5도 확인',
    category: 'earth',
    completed: true,
    createdAt: new Date('2025-07-19'),
    priority: 'medium'
  },
  {
    id: 3,
    text: '화성 탐사 로버 데이터 분석',
    category: 'mars',
    completed: false,
    createdAt: new Date('2025-07-21'),
    priority: 'high'
  },
  {
    id: 4,
    text: '목성의 대적점 관측 일지 작성',
    category: 'jupiter',
    completed: false,
    createdAt: new Date('2025-07-18'),
    priority: 'low'
  },
  {
    id: 5,
    text: '토성 고리의 구성 물질 연구',
    category: 'saturn',
    completed: true,
    createdAt: new Date('2025-07-17'),
    priority: 'medium'
  },
  {
    id: 6,
    text: '혜성 궤도 계산 프로그램 완성하기',
    category: 'general',
    completed: false,
    createdAt: new Date('2025-07-21'),
    priority: 'high'
  }
];

const TodoManager = () => {
  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, completed, pending

  // 로컬스토리지에서 데이터 로드
  useEffect(() => {
    const savedTodos = localStorage.getItem('solar-system-todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    } else {
      setTodos(initialTodos);
      localStorage.setItem('solar-system-todos', JSON.stringify(initialTodos));
    }
  }, []);

  // 로컬스토리지에 데이터 저장
  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem('solar-system-todos', JSON.stringify(todos));
    }
  }, [todos]);

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
    switch (filter) {
      case 'completed':
        return todo.completed;
      case 'pending':
        return !todo.completed;
      default:
        return true;
    }
  });

  // 통계 계산
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length
  };

  return (
    <div className="todo-manager">
      <div className="todo-header">
        <h2>🚀 Solar System Mission Control</h2>
        <div className="todo-stats">
          <span>Total: {stats.total}</span>
          <span>Completed: {stats.completed}</span>
          <span>Pending: {stats.pending}</span>
        </div>
      </div>

      <div className="todo-controls">
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
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