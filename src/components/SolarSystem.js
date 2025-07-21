import React from 'react';
import Planet from './Planet';

const SolarSystem = ({ position, isAnimationPlaying, systemName }) => {
  // 태양계별 행성 데이터
  const getPlanetsData = () => {
    if (systemName === 'main') {
      return [
        // 태양
        { name: 'sun', position: [0, 0, 0], size: 2, color: '#ffff00', orbitRadius: 0, orbitSpeed: 0 },
        // 내행성들
        { name: 'mercury', position: [3, 0, 0], size: 0.4, color: '#8c7853', orbitRadius: 3, orbitSpeed: 0.04 },
        { name: 'venus', position: [4.5, 0, 0], size: 0.6, color: '#ffa500', orbitRadius: 4.5, orbitSpeed: 0.03 },
        { name: 'earth', position: [6, 0, 0], size: 0.7, color: '#6b93d6', orbitRadius: 6, orbitSpeed: 0.025 },
        { name: 'mars', position: [8, 0, 0], size: 0.5, color: '#cd5c5c', orbitRadius: 8, orbitSpeed: 0.02 },
        // 외행성들
        { name: 'jupiter', position: [12, 0, 0], size: 1.5, color: '#d8ca9d', orbitRadius: 12, orbitSpeed: 0.015 },
        { name: 'saturn', position: [16, 0, 0], size: 1.2, color: '#fab27b', orbitRadius: 16, orbitSpeed: 0.01 },
        { name: 'uranus', position: [20, 0, 0], size: 0.9, color: '#4fd0e4', orbitRadius: 20, orbitSpeed: 0.008 },
        { name: 'neptune', position: [24, 0, 0], size: 0.9, color: '#4b70dd', orbitRadius: 24, orbitSpeed: 0.006 },
      ];
    } else if (systemName === 'binary') {
      return [
        // 쌍성계 - 두 개의 태양
        { name: 'sun', position: [-2, 0, 0], size: 1.8, color: '#ff8c00', orbitRadius: 2, orbitSpeed: 0.01 },
        { name: 'sun', position: [2, 0, 0], size: 1.5, color: '#ff4500', orbitRadius: 2, orbitSpeed: -0.01 },
        // 이 쌍성을 도는 행성들
        { name: 'planet1', position: [8, 0, 0], size: 0.8, color: '#9370db', orbitRadius: 8, orbitSpeed: 0.02 },
        { name: 'planet2', position: [12, 0, 0], size: 1.0, color: '#20b2aa', orbitRadius: 12, orbitSpeed: 0.015 },
      ];
    } else if (systemName === 'distant') {
      return [
        // 멀리 있는 다른 태양계
        { name: 'sun', position: [0, 0, 0], size: 1.5, color: '#ff6347', orbitRadius: 0, orbitSpeed: 0 },
        { name: 'planet1', position: [4, 0, 0], size: 0.6, color: '#dda0dd', orbitRadius: 4, orbitSpeed: 0.03 },
        { name: 'planet2', position: [7, 0, 0], size: 0.8, color: '#98fb98', orbitRadius: 7, orbitSpeed: 0.02 },
        { name: 'planet3', position: [10, 0, 0], size: 0.5, color: '#f0e68c', orbitRadius: 10, orbitSpeed: 0.015 },
      ];
    }
    return [];
  };

  const planets = getPlanetsData();

  return (
    <group position={position}>
      {planets.map((planet, index) => (
        <Planet
          key={`${systemName}-${planet.name}-${index}`}
          position={planet.position}
          size={planet.size}
          color={planet.color}
          orbitRadius={planet.orbitRadius}
          orbitSpeed={planet.orbitSpeed}
          isAnimationPlaying={isAnimationPlaying}
          name={planet.name}
        />
      ))}
      
      {/* 궤도 선 표시 (선택사항) */}
      {planets.filter(p => p.orbitRadius > 0).map((planet, index) => (
        <mesh key={`orbit-${systemName}-${index}`} rotation={[-Math.PI / 2, 0, 0]} position={[position[0], 0, position[2]]}>
          <ringGeometry args={[planet.orbitRadius - 0.02, planet.orbitRadius + 0.02, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
        </mesh>
      ))}
    </group>
  );
};

export default SolarSystem;