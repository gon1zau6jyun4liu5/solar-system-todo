import React, { useState } from 'react';
import './App.css';
import MultiSolarSystemScene from './components/MultiSolarSystemScene';
import AITodoManager from './components/AITodoManager';
import AIPanel from './components/AIPanel';

function App() {
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [todoData, setTodoData] = useState([]);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);

  // Handle todo data changes from AITodoManager
  const handleTodoDataChange = (newTodoData) => {
    setTodoData(newTodoData);
  };

  // Handle celestial body clicks in 3D scene
  const handleCelestialBodyClick = (clickedTodo) => {
    setSelectedTodoId(clickedTodo.id);
    console.log('Clicked celestial body:', clickedTodo);
  };

  // Handle animation toggle
  const handleAnimationToggle = () => {
    setIsAnimationPlaying(!isAnimationPlaying);
  };

  return (
    <div className="App">
      {/* AI Control Panel */}
      <AIPanel 
        onAnimationToggle={handleAnimationToggle}
        isAnimationPlaying={isAnimationPlaying}
      />
      
      {/* 3D Solar System Scene */}
      <MultiSolarSystemScene 
        todoData={todoData}
        onCelestialBodyClick={handleCelestialBodyClick}
        selectedTodoId={selectedTodoId}
        isAnimationPlaying={isAnimationPlaying}
      />
      
      {/* AI Todo Manager */}
      <AITodoManager 
        onTodoDataChange={handleTodoDataChange}
      />
      
      {/* Version Info */}
      <div className="version-info">
        Solar System Todo v0.3.1
      </div>
    </div>
  );
}

export default App;