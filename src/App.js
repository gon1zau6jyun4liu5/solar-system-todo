import React, { useState } from 'react';
import './App.css';
import Scene from './components/Scene';
import TodoManager from './components/TodoManager';
import AIPanel from './components/AIPanel';

function App() {
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);

  const handleAnimationToggle = () => {
    setIsAnimationPlaying(!isAnimationPlaying);
  };

  return (
    <div className="App">
      {/* 버전 정보 표시 */}
      <div className="version-info">
        Solar System Todo v0.3.0
      </div>
      
      {/* AI 패널 */}
      <AIPanel 
        onAnimationToggle={handleAnimationToggle}
        isAnimationPlaying={isAnimationPlaying}
      />
      
      {/* 3D Scene */}
      <Scene isAnimationPlaying={isAnimationPlaying} />
      
      {/* Todo Manager */}
      <TodoManager />
    </div>
  );
}

export default App;