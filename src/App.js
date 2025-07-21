import React, { useState } from 'react';
import './App.css';
import MultiSolarSystemScene from './components/MultiSolarSystemScene';
import AITodoManager from './components/AITodoManager';

function App() {
  const [todoData, setTodoData] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [view3D, setView3D] = useState(true);

  const handleTodoDataChange = (todos) => {
    setTodoData(todos);
  };

  const handleCelestialBodyClick = (todo) => {
    setSelectedTodo(todo);
    console.log('Selected celestial body:', todo);
  };

  const toggleView = () => {
    setView3D(!view3D);
  };

  return (
    <div className="App">
      {/* Version indicator */}
      <div className="version-indicator">
        🚀 Solar System Todo v0.3.0 - AI Multi-System
      </div>

      {/* View toggle button */}
      <div className="view-controls">
        <button 
          className={`view-toggle ${view3D ? 'active' : ''}`}
          onClick={toggleView}
        >
          {view3D ? '🌌 3D View' : '📋 List View'}
        </button>
        
        {selectedTodo && (
          <div className="selected-todo-info">
            <span className="selected-label">Selected:</span>
            <span className="selected-text">{selectedTodo.text}</span>
            <button 
              className="clear-selection"
              onClick={() => setSelectedTodo(null)}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="app-content">
        {view3D && (
          <div className="scene-container">
            <MultiSolarSystemScene
              todoData={todoData}
              onCelestialBodyClick={handleCelestialBodyClick}
              selectedTodoId={selectedTodo?.id}
            />
          </div>
        )}

        <div className={`todo-container ${view3D ? 'with-3d' : 'full-width'}`}>
          <AITodoManager 
            onTodoDataChange={handleTodoDataChange}
          />
        </div>
      </div>

      {/* AI Status indicator */}
      {todoData.length > 0 && (
        <div className="ai-status">
          <div className="system-stats">
            <span>🌌 {new Set(todoData.map(t => t.solarSystemId)).size} Solar Systems</span>
            <span>☀️ {todoData.filter(t => t.hierarchyType === 'sun').length} Suns</span>
            <span>🪐 {todoData.filter(t => t.hierarchyType === 'planet').length} Planets</span>
            <span>🛰️ {todoData.filter(t => t.hierarchyType === 'satellite').length} Satellites</span>
          </div>
        </div>
      )}

      {/* Help tooltip */}
      <div className="help-tooltip">
        <div className="help-content">
          <h4>🤖 AI-Powered Todo Universe</h4>
          <p><strong>How it works:</strong></p>
          <ul>
            <li>🌟 <strong>Smart Classification:</strong> AI analyzes your text and suggests category, priority, and deadline</li>
            <li>☀️ <strong>Suns:</strong> Major life goals and long-term objectives</li>
            <li>🪐 <strong>Planets:</strong> Projects and medium-term initiatives</li>
            <li>🛰️ <strong>Satellites:</strong> Daily tasks and quick actions</li>
            <li>🔴 <strong>Urgency:</strong> Closer deadlines = faster rotation and brighter colors</li>
            <li>🎯 <strong>Priority:</strong> Higher priority = larger size and more visual effects</li>
          </ul>
          <p><em>Click on celestial bodies in 3D view to select them!</em></p>
        </div>
      </div>
    </div>
  );
}

export default App;