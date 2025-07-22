import React, { useState, useCallback } from 'react';
import './App.css';
import Scene from './components/Scene';
import TodoManager from './components/TodoManager';
import CelestialPopup from './components/CelestialPopup';
import SpeedControl from './components/SpeedControl';
import './components/CelestialPopup.css';
import './components/SpeedControl.css';

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [todos, setTodos] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);

  // Todo 목록이 변경될 때 업데이트
  const handleTodosChange = useCallback((newTodos) => {
    setTodos(newTodos);
  }, []);

  // 행성 클릭 핸들러
  const handlePlanetClick = useCallback((planetName) => {
    setSelectedCategory(planetName);
  }, []);

  // 카테고리 변경 핸들러
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  // 천체 클릭 핸들러 (팝업 표시)
  const handleCelestialClick = useCallback((todo) => {
    setSelectedTodo(todo);
  }, []);

  // 팝업 닫기 핸들러
  const handleClosePopup = useCallback(() => {
    setSelectedTodo(null);
  }, []);

  // 사이드바 토글 핸들러
  const handleSidebarToggle = useCallback(() => {
    setSidebarVisible(prev => !prev);
  }, []);

  // 애니메이션 속도 변경 핸들러
  const handleSpeedChange = useCallback((newSpeed) => {
    setAnimationSpeed(newSpeed);
  }, []);

  return (
    <div className="App">
      {/* 3D 장면 */}
      <Scene 
        todos={todos}
        selectedCategory={selectedCategory}
        onPlanetClick={handlePlanetClick}
        onCelestialClick={handleCelestialClick}
        animationSpeed={animationSpeed}
      />
      
      {/* 사이드바 토글 버튼 */}
      <button 
        className={`sidebar-toggle ${sidebarVisible ? 'active' : ''}`}
        onClick={handleSidebarToggle}
        aria-label={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
      >
        {sidebarVisible ? '📋 Hide Panel' : '📋 Show Panel'}
      </button>

      {/* Todo 관리 사이드바 */}
      <TodoManager 
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onTodosChange={handleTodosChange}
        isVisible={sidebarVisible}
      />

      {/* 천체 정보 팝업 */}
      {selectedTodo && (
        <CelestialPopup
          todo={selectedTodo}
          onClose={handleClosePopup}
        />
      )}

      {/* 애니메이션 속도 조절 */}
      <SpeedControl
        animationSpeed={animationSpeed}
        onSpeedChange={handleSpeedChange}
      />

      {/* 버전 정보 */}
      <div className="version-info">
        Solar System Todo v0.4.0
      </div>
    </div>
  );
}

export default App;