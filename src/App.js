import React, { useState } from 'react';
import './App.css';
import AIPanel from './components/AIPanel';
import AITodoManager from './components/AITodoManager';
import MultiSolarSystemScene from './components/MultiSolarSystemScene';

function App() {
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
  const [todoData, setTodoData] = useState([]);
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [focusedCelestialBody, setFocusedCelestialBody] = useState(null);

  // Animation control handler
  const handleAnimationToggle = () => {
    setIsAnimationPlaying(!isAnimationPlaying);
  };

  // Todo data change handler from AITodoManager
  const handleTodoDataChange = (newTodoData) => {
    setTodoData(newTodoData);
  };

  // Celestial body click handler (from 3D scene)
  const handleCelestialBodyClick = (todoData) => {
    setSelectedTodoId(todoData.id);
    setFocusedCelestialBody({
      type: todoData.hierarchyType,
      id: todoData.id,
      position: todoData.position || [0, 0, 0]
    });
  };

  // Task click handler (from todo panel)
  const handleTaskClick = (todoItem) => {
    setSelectedTodoId(todoItem.id);
    setFocusedCelestialBody({
      type: todoItem.hierarchyType,
      id: todoItem.id,
      position: null // Will be calculated in 3D scene
    });
  };

  return (
    <div className="App">
      {/* 3D Multi Solar System Scene */}
      <MultiSolarSystemScene 
        todoData={todoData}
        selectedTodoId={selectedTodoId}
        focusedCelestialBody={focusedCelestialBody}
        isAnimationPlaying={isAnimationPlaying}
        onCelestialBodyClick={handleCelestialBodyClick}
      />
      
      {/* AI Control Panel */}
      <AIPanel 
        onAnimationToggle={handleAnimationToggle}
        isAnimationPlaying={isAnimationPlaying}
      />
      
      {/* AI-Powered Todo Manager */}
      <AITodoManager 
        onTodoDataChange={handleTodoDataChange}
        selectedTodoId={selectedTodoId}
        onTaskClick={handleTaskClick}
      />
      
      {/* Version Display */}
      <div className="version-info">
        Solar System Todo v0.4.0
      </div>
    </div>
  );
}

export default App;