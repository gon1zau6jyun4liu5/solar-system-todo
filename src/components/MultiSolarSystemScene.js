import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import AISun from './AISun';
import AIPlanet from './AIPlanet';
import AISatellite from './AISatellite';

/**
 * Multi Solar System Scene - Main 3D visualization component
 * Manages multiple solar systems representing different todo groups
 * Each system contains hierarchical celestial bodies (Sun > Planet > Satellite)
 */
const MultiSolarSystemScene = ({ 
  todoData = [], 
  onCelestialBodyClick,
  selectedTodoId = null 
}) => {
  const [selectedSystemId, setSelectedSystemId] = useState(null);

  // Process and group todos by solar system
  const solarSystems = useMemo(() => {
    // Group todos by solarSystemId
    const grouped = todoData.reduce((acc, todo) => {
      const systemId = todo.solarSystemId || 'general-satellite-system';
      if (!acc[systemId]) {
        acc[systemId] = {
          id: systemId,
          category: todo.category,
          todos: []
        };
      }
      acc[systemId].todos.push(todo);
      return acc;
    }, {});

    // Organize by hierarchy within each system
    const systems = Object.values(grouped).map(system => {
      const suns = system.todos.filter(todo => todo.hierarchyType === 'sun');
      const planets = system.todos.filter(todo => todo.hierarchyType === 'planet');
      const satellites = system.todos.filter(todo => todo.hierarchyType === 'satellite');

      return {
        ...system,
        suns,
        planets,
        satellites,
        totalTodos: system.todos.length
      };
    });

    return systems;
  }, [todoData]);

  // Calculate positions for multiple solar systems
  const systemPositions = useMemo(() => {
    const positions = [];
    const systemCount = solarSystems.length;
    const radius = Math.max(20, systemCount * 8); // Adjust spacing based on count
    
    solarSystems.forEach((system, index) => {
      const angle = (index / systemCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 10; // Random height variation
      
      positions.push({ 
        systemId: system.id, 
        position: [x, y, z] 
      });
    });
    
    return positions;
  }, [solarSystems]);

  const handleSystemClick = (systemId) => {
    setSelectedSystemId(systemId === selectedSystemId ? null : systemId);
  };

  const handleCelestialBodyClick = (todoData) => {
    onCelestialBodyClick?.(todoData);
  };

  return (
    <Canvas camera={{ position: [0, 40, 60], fov: 60 }}>
      {/* Enhanced lighting for multiple systems */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <pointLight position={[0, 20, 0]} intensity={0.3} color="#ffffff" />
      
      {/* Background starfield effect */}
      <mesh>
        <sphereGeometry args={[200, 32, 32]} />
        <meshBasicMaterial color="#000011" side={2} />
      </mesh>

      {/* Render each solar system */}
      {solarSystems.map((system, systemIndex) => {
        const systemPos = systemPositions.find(p => p.systemId === system.id);
        const position = systemPos ? systemPos.position : [0, 0, 0];
        const isSelected = selectedSystemId === system.id;

        return (
          <group key={system.id} position={position}>
            
            {/* Render Sun (main goal) */}
            {system.suns.length > 0 ? (
              system.suns.map((sun, sunIndex) => (
                <AISun
                  key={`sun-${sun.id}`}
                  solarSystemData={system}
                  position={[0, 0, 0]}
                  onClick={() => handleSystemClick(system.id)}
                  isSelected={isSelected}
                />
              ))
            ) : (
              // Default sun if no sun-type todos exist
              <AISun
                solarSystemData={system}
                position={[0, 0, 0]}
                onClick={() => handleSystemClick(system.id)}
                isSelected={isSelected}
              />
            )}

            {/* Render Planets */}
            {system.planets.map((planet, planetIndex) => (
              <AIPlanet
                key={`planet-${planet.id}`}
                todoData={planet}
                sunPosition={[0, 0, 0]}
                orbitRadius={8 + planetIndex * 3} // Increasing orbit radius
                orbitSpeed={0.01 - planetIndex * 0.002} // Outer planets slower
                initialAngle={planetIndex * (Math.PI * 2) / system.planets.length}
                onClick={handleCelestialBodyClick}
                isSelected={selectedTodoId === planet.id}
              />
            ))}

            {/* Render Satellites */}
            {system.satellites.map((satellite, satIndex) => {
              // Assign satellites to planets or sun if no planets exist
              const planetCount = system.planets.length;
              if (planetCount > 0) {
                const planetIndex = satIndex % planetCount;
                const planet = system.planets[planetIndex];
                const planetOrbitRadius = 8 + planetIndex * 3;
                
                // Calculate planet's approximate position for satellite orbit
                const planetAngle = planetIndex * (Math.PI * 2) / planetCount;
                const planetX = Math.cos(planetAngle) * planetOrbitRadius;
                const planetZ = Math.sin(planetAngle) * planetOrbitRadius;

                return (
                  <AISatellite
                    key={`satellite-${satellite.id}`}
                    todoData={satellite}
                    planetPosition={[planetX, 0, planetZ]}
                    orbitRadius={1.5 + (satIndex % 3) * 0.5}
                    orbitSpeed={0.03 + (satIndex % 5) * 0.01}
                    initialAngle={satIndex * 1.2}
                    onClick={handleCelestialBodyClick}
                    isSelected={selectedTodoId === satellite.id}
                  />
                );
              } else {
                // If no planets, satellites orbit the sun directly
                return (
                  <AISatellite
                    key={`satellite-${satellite.id}`}
                    todoData={satellite}
                    planetPosition={[0, 0, 0]}
                    orbitRadius={4 + satIndex * 0.8}
                    orbitSpeed={0.02 + satIndex * 0.005}
                    initialAngle={satIndex * 0.8}
                    onClick={handleCelestialBodyClick}
                    isSelected={selectedTodoId === satellite.id}
                  />
                );
              }
            })}

            {/* System boundary indicator */}
            {isSelected && (
              <mesh>
                <ringGeometry args={[15, 16, 64]} />
                <meshBasicMaterial 
                  color="#00aaff" 
                  transparent 
                  opacity={0.3}
                  side={2}
                />
              </mesh>
            )}

            {/* System info label */}
            <group position={[0, -8, 0]}>
              <mesh>
                <planeGeometry args={[6, 1]} />
                <meshBasicMaterial 
                  color="#000000" 
                  transparent 
                  opacity={0.7} 
                />
              </mesh>
            </group>

          </group>
        );
      })}

      {/* System connection lines */}
      {solarSystems.length > 1 && systemPositions.length > 1 && (
        <group>
          {systemPositions.map((pos1, i) => 
            systemPositions.slice(i + 1).map((pos2, j) => (
              <line key={`connection-${i}-${j}`}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([
                      ...pos1.position,
                      ...pos2.position
                    ])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#333333" transparent opacity={0.1} />
              </line>
            ))
          )}
        </group>
      )}

      {/* Camera controls */}
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={200}
      />

      {/* Debug information */}
      {process.env.NODE_ENV === 'development' && (
        <mesh position={[0, -20, 0]}>
          <planeGeometry args={[10, 2]} />
          <meshBasicMaterial color="#222222" transparent opacity={0.8} />
        </mesh>
      )}
    </Canvas>
  );
};

export default MultiSolarSystemScene;