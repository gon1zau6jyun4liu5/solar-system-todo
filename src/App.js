import React, { useState } from 'react';
import './App.css';
import Scene from './components/Scene';
import AIPanel from './components/AIPanel';
import AITodoManager from './components/AITodoManager';
import EnhancedMissionControl from './components/EnhancedMissionControl';

function App() {
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
  const [todos, setTodos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [useEnhancedUI, setUseEnhancedUI] = useState(true);

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

  const handleTodoAdd = () => {
    // This would open the todo form
    console.log('Add new todo');
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

  return (
    <div className="App">
      <Scene isAnimationPlaying={isAnimationPlaying} />
      
      <AIPanel 
        onAnimationToggle={handleAnimationToggle}
        isAnimationPlaying={isAnimationPlaying}
      />
      
      {/* UI Mode Toggle */}
      <button 
        className="ui-mode-toggle"
        onClick={toggleUIMode}
        title={`Switch to ${useEnhancedUI ? 'Classic' : 'Enhanced'} UI`}
      >
        {useEnhancedUI ? '🎨' : '🚀'} {useEnhancedUI ? 'Enhanced' : 'Classic'}
      </button>

      {/* Conditional UI Rendering */}
      {useEnhancedUI ? (
        <EnhancedMissionControl
          todos={todos}
          onTodoUpdate={handleTodoUpdate}
          onTodoAdd={handleTodoAdd}
          onTodoDelete={handleTodoDelete}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      ) : (
        <AITodoManager 
          onTodoDataChange={handleTodoDataChange}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}
      
      {/* 버전 정보 표시 */}
      <div className="version-info">
        Enhanced Solar System Todo v0.4.2
      </div>

      {/* Feature showcase badge */}
      <div className="feature-badge">
        ✨ NEW: Enhanced UI/UX
      </div>
    </div>
  );
}

export default App;