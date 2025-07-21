import React from 'react';
import Sun from './Sun';
import Planet from './Planet';

const SolarSystem = ({ todos, selectedCategory, onPlanetClick }) => {
  // 행성 데이터 정의
  const planets = [
    {
      name: 'mercury',
      displayName: '수성',
      size: 0.3,
      color: '#8C7853',
      orbitRadius: 4,
      orbitSpeed: 0.8,
    },
    {
      name: 'venus',
      displayName: '금성',
      size: 0.4,
      color: '#FFC649',
      orbitRadius: 6,
      orbitSpeed: 0.6,
    },
    {
      name: 'earth',
      displayName: '지구',
      size: 0.45,
      color: '#6B93D6',
      orbitRadius: 8,
      orbitSpeed: 0.5,
    },
    {
      name: 'mars',
      displayName: '화성',
      size: 0.35,
      color: '#CD5C5C',
      orbitRadius: 10,
      orbitSpeed: 0.4,
    },
    {
      name: 'jupiter',
      displayName: '목성',
      size: 0.8,
      color: '#D8CA9D',
      orbitRadius: 14,
      orbitSpeed: 0.2,
    },
    {
      name: 'saturn',
      displayName: '토성',
      size: 0.7,
      color: '#FAD5A5',
      orbitRadius: 18,
      orbitSpeed: 0.15,
    },
    {
      name: 'uranus',
      displayName: '천왕성',
      size: 0.5,
      color: '#4FD0E3',
      orbitRadius: 22,
      orbitSpeed: 0.1,
    },
    {
      name: 'neptune',
      displayName: '해왕성',
      size: 0.5,
      color: '#4B70DD',
      orbitRadius: 26,
      orbitSpeed: 0.08,
    }
  ];

  // 각 행성별 pending 태스크 수 계산
  const getPendingTasksForPlanet = (planetName) => {
    return todos.filter(todo => 
      todo.category === planetName && !todo.completed
    ).length;
  };

  // 행성이 클릭 가능한지 확인 (pending tasks가 있는 경우만)
  const isPlanetClickable = (planetName) => {
    return getPendingTasksForPlanet(planetName) > 0;
  };

  return (
    <group>
      {/* 태양 */}
      <Sun />
      
      {/* 행성들 */}
      {planets.map(planet => (
        <Planet
          key={planet.name}
          name={planet.name}
          size={planet.size}
          color={planet.color}
          orbitRadius={planet.orbitRadius}
          orbitSpeed={planet.orbitSpeed}
          pendingTasks={getPendingTasksForPlanet(planet.name)}
          isClickable={isPlanetClickable(planet.name)}
          onClick={onPlanetClick}
        />
      ))}
    </group>
  );
};

export default SolarSystem;