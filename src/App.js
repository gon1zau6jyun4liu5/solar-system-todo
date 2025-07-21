import React from 'react';
import './App.css';
import Scene from './components/Scene';
import TodoManager from './components/TodoManager';

function App() {
  return (
    <div className="App">
      <Scene />
      <TodoManager />
    </div>
  );
}

export default App;