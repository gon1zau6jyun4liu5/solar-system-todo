import React, { useState } from 'react';
import './App.css';
import Scene from './components/Scene';
import AIPanel from './components/AIPanel';
import AITodoManager from './components/AITodoManager';
import EnhancedMissionControl from './components/EnhancedMissionControl';
import AdvancedAnalyticsDashboard from './components/AdvancedAnalyticsDashboard';

function App() {
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
  const [todos, setTodos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [useEnhancedUI, setUseEnhancedUI] = useState(true);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);

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

  const toggleAnalyticsDashboard = () => {
    setShowAnalyticsDashboard(prev => !prev);
  };

  const closeAnalyticsDashboard = () => {
    setShowAnalyticsDashboard(false);
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

      {/* Analytics Dashboard Toggle */}
      <button 
        className="analytics-toggle"
        onClick={toggleAnalyticsDashboard}
        title="Open Advanced Analytics Dashboard"
      >
        📊 Analytics
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

      {/* Advanced Analytics Dashboard */}
      <AdvancedAnalyticsDashboard
        todos={todos}
        isVisible={showAnalyticsDashboard}
        onClose={closeAnalyticsDashboard}
      />
      
      {/* 버전 정보 표시 */}
      <div className="version-info">
        Advanced Solar System Todo v0.4.3
      </div>

      {/* Feature showcase badge */}
      <div className="feature-badge">
        🚀 NEW: Advanced Analytics Dashboard
      </div>
    </div>
  );
}

export default App;