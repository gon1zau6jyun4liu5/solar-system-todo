import React, { useState } from 'react';

const SpeedControl = ({ animationSpeed, onSpeedChange }) => {
  const [isVisible, setIsVisible] = useState(true);

  const speedPresets = [
    { label: '0.1x', value: 0.1 },
    { label: '0.5x', value: 0.5 },
    { label: '1x', value: 1.0 },
    { label: '2x', value: 2.0 },
    { label: '5x', value: 5.0 }
  ];

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    onSpeedChange(newSpeed);
  };

  const handlePresetClick = (speed) => {
    onSpeedChange(speed);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible) {
    return (
      <div className="speed-control-minimized" onClick={toggleVisibility}>
        <span>⚡ {animationSpeed.toFixed(1)}x</span>
      </div>
    );
  }

  return (
    <div className="speed-control">
      <div className="speed-control-header">
        <h4>⚡ Animation Speed</h4>
        <button className="minimize-btn" onClick={toggleVisibility}>
          ➖
        </button>
      </div>
      
      <div className="speed-slider-container">
        <input
          type="range"
          min="0.1"
          max="10.0"
          step="0.1"
          value={animationSpeed}
          onChange={handleSpeedChange}
          className="speed-slider"
        />
        <div className="speed-display">
          {animationSpeed.toFixed(1)}x Speed
        </div>
      </div>

      <div className="speed-presets">
        {speedPresets.map((preset) => (
          <button
            key={preset.value}
            className={`speed-preset ${animationSpeed === preset.value ? 'active' : ''}`}
            onClick={() => handlePresetClick(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="speed-info">
        <p>Control celestial movement speed</p>
      </div>
    </div>
  );
};

export default SpeedControl;