import React, { useState } from 'react';
import './App.css';
import Scene from './components/Scene';
import TodoManager from './components/TodoManager';

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [todos, setTodos] = useState([]);

  // Todo 목록이 변경될 때 업데이트
  const handleTodosChange = (newTodos) => {
    setTodos(newTodos);
  };

  // 행성 클릭 핸들러
  const handlePlanetClick = (planetName) => {
    setSelectedCategory(planetName);
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="App">
      <Scene 
        todos={todos}
        selectedCategory={selectedCategory}
        onPlanetClick={handlePlanetClick}
      />
      <TodoManager 
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onTodosChange={handleTodosChange}
      />
    </div>
  );
}

export default App;