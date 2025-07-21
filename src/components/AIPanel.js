import React, { useState } from 'react';
import './AIPanel.css';

const AIPanel = ({ onAnimationToggle, isAnimationPlaying }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  if (!isPanelOpen) {
    return (
      <div className="ai-panel-minimized">
        <button className="panel-toggle-btn" onClick={togglePanel}>
          🤖 Show AI Panel
        </button>
      </div>
    );
  }

  return (
    <div className="ai-panel">
      <div className="panel-header">
        <h3>🤖 AI-Powered Todo Universe</h3>
        <button className="panel-close-btn" onClick={togglePanel}>
          ✕
        </button>
      </div>
      
      <div className="panel-content">
        <div className="how-it-works">
          <h4>How it works:</h4>
          <ul>
            <li>🌟 Create todos and watch them orbit like planets</li>
            <li>🚀 High priority tasks become bright suns</li>
            <li>🌍 Completed tasks form stable planetary systems</li>
            <li>🌌 Multiple solar systems represent different projects</li>
          </ul>
        </div>
        
        <div className="animation-controls">
          <h4>Animation Controls:</h4>
          <button 
            className={`control-btn ${isAnimationPlaying ? 'playing' : 'paused'}`}
            onClick={onAnimationToggle}
          >
            {isAnimationPlaying ? '⏸️ Pause' : '▶️ Play'} Solar System
          </button>
        </div>
        
        <div className="universe-stats">
          <h4>Universe Status:</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">☀️</span>
              <span className="stat-label">Active Suns: 3</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🌍</span>
              <span className="stat-label">Planets: 8</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🌌</span>
              <span className="stat-label">Solar Systems: 2</span>
            </div>
          </div>
        </div>
        
        <div className="navigation-help">
          <h4>Navigation:</h4>
          <p>• Drag to explore different solar systems</p>
          <p>• Scroll to zoom in/out</p>
          <p>• Right-click + drag to rotate view</p>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;