import React, { useState, useEffect } from 'react';
import TodoList from './TodoList';
import TodoForm from './TodoForm';
import { classifyTodoWithAI } from '../utils/aiClassifier';
import './TodoManager.css';

// Enhanced initial todos with AI classification
const createInitialTodos = () => {
  const initialTodoTexts = [
    { text: '완료하기 어려운 프로젝트 목표 달성하기', type: 'sun' },
    { text: '매주 팀 미팅 진행하기', type: 'planet' },
    { text: '이메일 답장 보내기', type: 'satellite' },
    { text: '건강한 생활습관 만들기', type: 'sun' },
    { text: '운동 루틴 개발하기', type: 'planet' },
    { text: '아침에 물 마시기', type: 'satellite' },
    { text: '새로운 스킬 학습하기', type: 'sun' },
    { text: 'React 고급 과정 수강하기', type: 'planet' },
    { text: '오늘의 강의 노트 정리하기', type: 'satellite' },
    { text: '가계부 관리하기', type: 'planet' },
    { text: '이번 달 지출 정리하기', type: 'satellite' }
  ];

  return initialTodoTexts.map((item, index) => {
    const classified = classifyTodoWithAI(item.text);
    return {
      id: index + 1,
      text: item.text,
      ...classified,
      hierarchyType: item.type, // Override AI classification for demo
      completed: Math.random() > 0.7, // 30% chance of being completed
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last week
    };
  });
};

const AITodoManager = ({ onTodoDataChange }) => {
  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, completed, pending, category
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [aiInsights, setAiInsights] = useState({});

  // Load data from localStorage or initialize with AI-classified demos
  useEffect(() => {
    const savedTodos = localStorage.getItem('ai-solar-system-todos');
    if (savedTodos) {
      const parsed = JSON.parse(savedTodos);
      setTodos(parsed);
    } else {
      const initialTodos = createInitialTodos();
      setTodos(initialTodos);
      localStorage.setItem('ai-solar-system-todos', JSON.stringify(initialTodos));
    }
  }, []);

  // Save to localStorage whenever todos change
  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem('ai-solar-system-todos', JSON.stringify(todos));
      // Notify parent component of todo data changes for 3D visualization
      onTodoDataChange?.(todos);
    }
  }, [todos, onTodoDataChange]);

  // Generate AI insights about todo patterns
  useEffect(() => {
    if (todos.length > 0) {
      const insights = generateAIInsights(todos);
      setAiInsights(insights);
    }
  }, [todos]);

  // Add new todo with AI classification
  const addTodo = (todoData) => {
    const classified = classifyTodoWithAI(todoData.text, {
      forcedCategory: todoData.category !== 'ai-auto' ? todoData.category : undefined,
      forcedPriority: todoData.priority !== 'ai-auto' ? todoData.priority : undefined
    });

    const newTodo = {
      id: Date.now(),
      text: todoData.text,
      ...classified,
      // Override AI classification if user specifically chose options
      category: todoData.category !== 'ai-auto' ? todoData.category : classified.category,
      priority: todoData.priority !== 'ai-auto' ? todoData.priority : classified.priority,
      hierarchyType: todoData.hierarchyType !== 'ai-auto' ? todoData.hierarchyType : classified.hierarchyType,
      completed: false,
      createdAt: new Date()
    };

    setTodos(prev => [...prev, newTodo]);
    setShowForm(false);
  };

  // Update todo with AI re-classification if text changed
  const updateTodo = (id, updates) => {
    let updatedData = { ...updates };
    
    // If text changed, re-classify with AI
    if (updates.text) {
      const originalTodo = todos.find(t => t.id === id);
      if (originalTodo && originalTodo.text !== updates.text) {
        const reclassified = classifyTodoWithAI(updates.text);
        updatedData = {
          ...updatedData,
          ...reclassified,
          // Keep user overrides
          category: updates.category !== 'ai-auto' ? updates.category : reclassified.category,
          priority: updates.priority !== 'ai-auto' ? updates.priority : reclassified.priority,
          hierarchyType: updates.hierarchyType !== 'ai-auto' ? updates.hierarchyType : reclassified.hierarchyType
        };
      }
    }

    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...updatedData } : todo
    ));
    setEditingTodo(null);
    setShowForm(false);
  };

  // Delete todo
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // Toggle completion status
  const toggleComplete = (id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { 
        ...todo, 
        completed: !todo.completed,
        // Update visual properties based on completion
        visualProperties: {
          ...todo.visualProperties,
          rotationSpeed: !todo.completed ? todo.visualProperties.rotationSpeed * 0.3 : todo.visualProperties.rotationSpeed / 0.3
        }
      } : todo
    ));
  };

  // Start editing
  const startEdit = (todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  // Cancel form
  const cancelForm = () => {
    setEditingTodo(null);
    setShowForm(false);
  };

  // Filter todos
  const filteredTodos = todos.filter(todo => {
    // Category filter
    if (selectedCategory !== 'all' && todo.category !== selectedCategory) {
      return false;
    }

    // Status filter
    switch (filter) {
      case 'completed':
        return todo.completed;
      case 'pending':
        return !todo.completed;
      case 'urgent':
        return todo.visualProperties.daysUntilDeadline <= 3;
      case 'sun':
        return todo.hierarchyType === 'sun';
      case 'planet':
        return todo.hierarchyType === 'planet';
      case 'satellite':
        return todo.hierarchyType === 'satellite';
      default:
        return true;
    }
  });

  // Calculate enhanced statistics
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    urgent: todos.filter(t => t.visualProperties.daysUntilDeadline <= 3 && !t.completed).length,
    suns: todos.filter(t => t.hierarchyType === 'sun').length,
    planets: todos.filter(t => t.hierarchyType === 'planet').length,
    satellites: todos.filter(t => t.hierarchyType === 'satellite').length,
    categories: [...new Set(todos.map(t => t.category))].length
  };

  return (
    <div className="ai-todo-manager">
      <div className="todo-header">
        <h2>🤖 AI-Powered Solar System Mission Control v0.3.0</h2>
        <div className="ai-stats">
          <div className="stat-group">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-group">
            <span className="stat-label">Completed:</span>
            <span className="stat-value">{stats.completed}</span>
          </div>
          <div className="stat-group">
            <span className="stat-label">Urgent:</span>
            <span className="stat-value urgent">{stats.urgent}</span>
          </div>
          <div className="stat-group">
            <span className="stat-label">Systems:</span>
            <span className="stat-value">{stats.categories}</span>
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      {Object.keys(aiInsights).length > 0 && (
        <div className="ai-insights">
          <h3>🧠 AI Insights</h3>
          <div className="insights-content">
            {aiInsights.productivityTrend && (
              <div className="insight-item">
                📈 {aiInsights.productivityTrend}
              </div>
            )}
            {aiInsights.urgentRecommendation && (
              <div className="insight-item urgent">
                ⚠️ {aiInsights.urgentRecommendation}
              </div>
            )}
            {aiInsights.categoryBalance && (
              <div className="insight-item">
                ⚖️ {aiInsights.categoryBalance}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="todo-controls">
        <div className="filter-section">
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All ({stats.total})
            </button>
            <button 
              className={filter === 'pending' ? 'active' : ''}
              onClick={() => setFilter('pending')}
            >
              Pending ({stats.pending})
            </button>
            <button 
              className={filter === 'completed' ? 'active' : ''}
              onClick={() => setFilter('completed')}
            >
              Completed ({stats.completed})
            </button>
            <button 
              className={`${filter === 'urgent' ? 'active' : ''} urgent`}
              onClick={() => setFilter('urgent')}
            >
              Urgent ({stats.urgent})
            </button>
          </div>

          <div className="hierarchy-filters">
            <button 
              className={filter === 'sun' ? 'active sun-filter' : ''}
              onClick={() => setFilter('sun')}
            >
              ☀️ Suns ({stats.suns})
            </button>
            <button 
              className={filter === 'planet' ? 'active planet-filter' : ''}
              onClick={() => setFilter('planet')}
            >
              🪐 Planets ({stats.planets})
            </button>
            <button 
              className={filter === 'satellite' ? 'active satellite-filter' : ''}
              onClick={() => setFilter('satellite')}
            >
              🛰️ Satellites ({stats.satellites})
            </button>
          </div>

          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            <option value="all">All Categories</option>
            <option value="work">💼 Work</option>
            <option value="personal">🏠 Personal</option>
            <option value="education">📚 Education</option>
            <option value="finance">💰 Finance</option>
            <option value="home">🏡 Home</option>
            <option value="health">⚕️ Health</option>
          </select>
        </div>
        
        <button 
          className="add-todo-btn ai-enhanced"
          onClick={() => setShowForm(true)}
          disabled={showForm}
        >
          🤖 + AI Smart Mission
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
          aiMode={true}
        />
      )}

      <TodoList
        todos={filteredTodos}
        onToggleComplete={toggleComplete}
        onEdit={startEdit}
        onDelete={deleteTodo}
        aiMode={true}
      />
    </div>
  );
};

// Generate AI insights about todo patterns
function generateAIInsights(todos) {
  const insights = {};
  const now = new Date();
  
  // Analyze productivity trends
  const recentTodos = todos.filter(t => (now - new Date(t.createdAt)) < 7 * 24 * 60 * 60 * 1000);
  const completedRecent = recentTodos.filter(t => t.completed);
  
  if (recentTodos.length > 0) {
    const completionRate = (completedRecent.length / recentTodos.length) * 100;
    insights.productivityTrend = `You've completed ${completionRate.toFixed(0)}% of tasks this week`;
  }

  // Check for urgent items
  const urgentTodos = todos.filter(t => t.visualProperties.daysUntilDeadline <= 3 && !t.completed);
  if (urgentTodos.length > 0) {
    insights.urgentRecommendation = `${urgentTodos.length} task${urgentTodos.length > 1 ? 's' : ''} need immediate attention`;
  }

  // Analyze category balance
  const categories = {};
  todos.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + 1;
  });
  
  const maxCategory = Object.keys(categories).reduce((a, b) => 
    categories[a] > categories[b] ? a : b
  );
  
  insights.categoryBalance = `Most tasks are in ${maxCategory} category (${categories[maxCategory]} tasks)`;

  return insights;
}

export default AITodoManager;