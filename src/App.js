import React, { useState } from 'react';
import './App.css';
import Scene from './components/Scene';
import AIPanel from './components/AIPanel';
import AITodoManager from './components/AITodoManager';

function App() {
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);

  const handleAnimationToggle = () => {
    setIsAnimationPlaying(prev => !prev);
  };

  return (
    <div className="App">
      <Scene isAnimationPlaying={isAnimationPlaying} />
      <AIPanel 
        onAnimationToggle={handleAnimationToggle}
        isAnimationPlaying={isAnimationPlaying}
      />
      <AITodoManager />
      
      {/* 버전 정보 표시 */}
      <div className="version-info">
        AI-Powered Solar System Todo v0.4.1
      </div>
    </div>
  );
}

export default App;