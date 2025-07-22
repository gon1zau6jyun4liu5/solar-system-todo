import React, { useState, useEffect, useMemo } from 'react';
import './EnhancedMissionControl.css';

/**
 * Enhanced Mission Control Panel v0.4.2
 * Advanced UI/UX for todo management with improved accessibility,
 * drag & drop support, and enhanced visual feedback
 */
const EnhancedMissionControl = ({ 
  todos, 
  onTodoUpdate, 
  onTodoAdd, 
  onTodoDelete,
  selectedCategory,
  onCategoryChange 
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'timeline'
  const [sortBy, setSortBy] = useState('priority'); // 'priority', 'deadline', 'category', 'created'
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'urgent', 'today', 'week'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTodos, setSelectedTodos] = useState(new Set());
  const [draggedTodo, setDraggedTodo] = useState(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Enhanced filtering and sorting
  const processedTodos = useMemo(() => {
    let filtered = todos.filter(todo => {
      // Text search
      if (searchQuery && !todo.text.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (selectedCategory && todo.category !== selectedCategory) {
        return false;
      }
      
      // Filter mode
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const oneWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      switch (filterMode) {
        case 'urgent':
          return todo.visualProperties?.daysUntilDeadline <= 3 && !todo.completed;
        case 'today':
          return todo.deadline && new Date(todo.deadline) <= today && !todo.completed;
        case 'week':
          return todo.deadline && new Date(todo.deadline) <= oneWeek && !todo.completed;
        default:
          return true;
      }
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    return filtered;
  }, [todos, searchQuery, selectedCategory, filterMode, sortBy]);

  // Statistics calculation
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      pending: todos.filter(t => !t.completed).length,
      urgent: todos.filter(t => 
        t.visualProperties?.daysUntilDeadline <= 3 && !t.completed
      ).length,
      overdue: todos.filter(t => 
        t.deadline && new Date(t.deadline) < now && !t.completed
      ).length,
      completionRate: todos.length > 0 ? 
        Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0
    };
  }, [todos]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            onTodoAdd();
            break;
          case 'f':
            e.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
          case 'a':
            e.preventDefault();
            if (selectedTodos.size === processedTodos.length) {
              setSelectedTodos(new Set());
            } else {
              setSelectedTodos(new Set(processedTodos.map(t => t.id)));
            }
            break;
          case '?':
            e.preventDefault();
            setShowKeyboardHelp(!showKeyboardHelp);
            break;
        }
      }
      
      if (e.key === 'Escape') {
        setSelectedTodos(new Set());
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTodos, processedTodos, showKeyboardHelp, onTodoAdd]);

  // Drag and drop handlers
  const handleDragStart = (e, todo) => {
    setDraggedTodo(todo);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetTodo) => {
    e.preventDefault();
    if (draggedTodo && draggedTodo.id !== targetTodo.id) {
      // Reorder logic would go here
      console.log(`Moving ${draggedTodo.text} to position of ${targetTodo.text}`);
    }
    setDraggedTodo(null);
  };

  // Bulk operations
  const handleBulkOperation = (operation) => {
    const selectedTodosList = processedTodos.filter(t => selectedTodos.has(t.id));
    
    switch (operation) {
      case 'complete':
        selectedTodosList.forEach(todo => {
          if (!todo.completed) {
            onTodoUpdate(todo.id, { completed: true });
          }
        });
        break;
      case 'delete':
        if (window.confirm(`Delete ${selectedTodos.size} selected missions?`)) {
          selectedTodosList.forEach(todo => onTodoDelete(todo.id));
        }
        break;
      case 'high-priority':
        selectedTodosList.forEach(todo => {
          onTodoUpdate(todo.id, { priority: 'high' });
        });
        break;
    }
    
    setSelectedTodos(new Set());
  };

  const toggleTodoSelection = (todoId) => {
    const newSelection = new Set(selectedTodos);
    if (newSelection.has(todoId)) {
      newSelection.delete(todoId);
    } else {
      newSelection.add(todoId);
    }
    setSelectedTodos(newSelection);
  };

  return (
    <div className="enhanced-mission-control">
      {/* Header with stats and controls */}
      <div className="mission-control-header">
        <div className="mission-stats">
          <h2>🚀 Enhanced Mission Control v0.4.2</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Missions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card urgent">
              <div className="stat-value">{stats.urgent}</div>
              <div className="stat-label">Urgent</div>
            </div>
            <div className="stat-card overdue">
              <div className="stat-value">{stats.overdue}</div>
              <div className="stat-label">Overdue</div>
            </div>
            <div className="stat-card completion">
              <div className="stat-value">{stats.completionRate}%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Enhanced search and filters */}
        <div className="control-toolbar">
          <div className="search-section">
            <input
              id="search-input"
              type="text"
              placeholder="🔍 Search missions... (Ctrl+F)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="enhanced-search"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="clear-search"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-controls">
            <select 
              value={filterMode} 
              onChange={(e) => setFilterMode(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Missions</option>
              <option value="urgent">🔥 Urgent Only</option>
              <option value="today">📅 Due Today</option>
              <option value="week">📆 This Week</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="priority">Sort by Priority</option>
              <option value="deadline">Sort by Deadline</option>
              <option value="category">Sort by Category</option>
              <option value="created">Sort by Created</option>
            </select>

            <div className="view-mode-buttons">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                ⊞
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                ☰
              </button>
              <button
                className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
                onClick={() => setViewMode('timeline')}
                title="Timeline View"
              >
                ⧖
              </button>
            </div>
          </div>
        </div>

        {/* Bulk actions toolbar */}
        {selectedTodos.size > 0 && (
          <div className="bulk-actions">
            <span className="selection-count">
              {selectedTodos.size} missions selected
            </span>
            <div className="bulk-buttons">
              <button 
                onClick={() => handleBulkOperation('complete')}
                className="bulk-btn complete"
              >
                ✓ Complete All
              </button>
              <button 
                onClick={() => handleBulkOperation('high-priority')}
                className="bulk-btn priority"
              >
                ⚡ Set High Priority
              </button>
              <button 
                onClick={() => handleBulkOperation('delete')}
                className="bulk-btn delete"
              >
                🗑️ Delete Selected
              </button>
              <button 
                onClick={() => setSelectedTodos(new Set())}
                className="bulk-btn cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mission grid/list/timeline */}
      <div className={`missions-container ${viewMode}-view`}>
        {processedTodos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌌</div>
            <h3>No missions found</h3>
            <p>
              {searchQuery ? 
                `No missions match "${searchQuery}"` : 
                'Create your first space mission!'
              }
            </p>
            <button 
              onClick={onTodoAdd}
              className="create-first-mission"
            >
              🚀 Create New Mission
            </button>
          </div>
        ) : (
          processedTodos.map(todo => (
            <EnhancedMissionCard
              key={todo.id}
              todo={todo}
              isSelected={selectedTodos.has(todo.id)}
              onSelect={() => toggleTodoSelection(todo.id)}
              onUpdate={onTodoUpdate}
              onDelete={onTodoDelete}
              onDragStart={(e) => handleDragStart(e, todo)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, todo)}
              viewMode={viewMode}
            />
          ))
        )}
      </div>

      {/* Keyboard shortcuts help */}
      {showKeyboardHelp && (
        <div className="keyboard-help-overlay">
          <div className="keyboard-help">
            <h3>⌨️ Keyboard Shortcuts</h3>
            <div className="shortcuts-grid">
              <div className="shortcut">
                <kbd>Ctrl+N</kbd>
                <span>New Mission</span>
              </div>
              <div className="shortcut">
                <kbd>Ctrl+F</kbd>
                <span>Search</span>
              </div>
              <div className="shortcut">
                <kbd>Ctrl+A</kbd>
                <span>Select All</span>
              </div>
              <div className="shortcut">
                <kbd>Esc</kbd>
                <span>Clear Selection</span>
              </div>
              <div className="shortcut">
                <kbd>Ctrl+?</kbd>
                <span>Show/Hide Help</span>
              </div>
            </div>
            <button 
              onClick={() => setShowKeyboardHelp(false)}
              className="close-help"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Quick action button */}
      <button 
        onClick={() => setShowKeyboardHelp(true)}
        className="help-toggle"
        title="Keyboard Shortcuts (Ctrl+?)"
      >
        ❓
      </button>
    </div>
  );
};

/**
 * Enhanced Mission Card Component
 * Individual todo item with enhanced interaction
 */
const EnhancedMissionCard = ({ 
  todo, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  viewMode 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleQuickEdit = () => {
    if (isEditing) {
      if (editText.trim() && editText !== todo.text) {
        onUpdate(todo.id, { text: editText.trim() });
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleQuickEdit();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  const urgencyLevel = todo.visualProperties?.daysUntilDeadline <= 1 ? 'critical' :
                       todo.visualProperties?.daysUntilDeadline <= 3 ? 'urgent' :
                       todo.visualProperties?.daysUntilDeadline <= 7 ? 'warning' : 'normal';

  return (
    <div 
      className={`enhanced-mission-card ${viewMode} ${urgencyLevel} ${todo.completed ? 'completed' : ''} ${isSelected ? 'selected' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Selection checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="mission-selector"
        aria-label={`Select mission: ${todo.text}`}
      />

      {/* Mission content */}
      <div className="mission-content">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleQuickEdit}
            onKeyDown={handleKeyDown}
            className="quick-edit-input"
            autoFocus
          />
        ) : (
          <div className="mission-text" onDoubleClick={handleQuickEdit}>
            <span className={`category-icon ${todo.category}`}>
              {getCategoryIcon(todo.category)}
            </span>
            <span className={todo.completed ? 'completed-text' : ''}>
              {todo.text}
            </span>
          </div>
        )}

        {/* Mission metadata */}
        <div className="mission-metadata">
          <span className={`priority-badge ${todo.priority}`}>
            {todo.priority.toUpperCase()}
          </span>
          
          {todo.deadline && (
            <span className={`deadline-badge ${urgencyLevel}`}>
              📅 {new Date(todo.deadline).toLocaleDateString()}
            </span>
          )}

          <span className="category-badge">
            {todo.category}
          </span>

          {todo.hierarchyType && (
            <span className="hierarchy-badge">
              {getHierarchyIcon(todo.hierarchyType)} {todo.hierarchyType}
            </span>
          )}
        </div>

        {/* Progress indicator for urgency */}
        {todo.deadline && !todo.completed && (
          <div className="urgency-progress">
            <div 
              className={`progress-bar ${urgencyLevel}`}
              style={{
                width: `${Math.max(0, Math.min(100, 
                  (todo.visualProperties?.daysUntilDeadline / 30) * 100
                ))}%`
              }}
            />
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mission-actions">
        <button
          onClick={() => onUpdate(todo.id, { completed: !todo.completed })}
          className={`quick-action ${todo.completed ? 'undo' : 'complete'}`}
          title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {todo.completed ? '↶' : '✓'}
        </button>
        
        <button
          onClick={handleQuickEdit}
          className="quick-action edit"
          title="Quick edit (double-click text)"
        >
          ✏️
        </button>
        
        <button
          onClick={() => {
            if (window.confirm('Delete this mission?')) {
              onDelete(todo.id);
            }
          }}
          className="quick-action delete"
          title="Delete mission"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

// Helper functions
const getCategoryIcon = (category) => {
  const icons = {
    work: '💼',
    personal: '🏠',
    education: '📚',
    finance: '💰',
    home: '🏡',
    health: '⚕️',
    sun: '☀️',
    mercury: '🌑',
    venus: '💛',
    earth: '🌍',
    mars: '🔴',
    jupiter: '🪐',
    saturn: '🪐',
    uranus: '🔵',
    neptune: '🔷'
  };
  return icons[category] || '🚀';
};

const getHierarchyIcon = (type) => {
  const icons = {
    sun: '☀️',
    planet: '🪐',
    satellite: '🛰️'
  };
  return icons[type] || '⭐';
};

export default EnhancedMissionControl;