import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import AISun from './AISun';
import AIPlanet from './AIPlanet';
import AISatellite from './AISatellite';
import * as THREE from 'three';

/**
 * Camera Controller for focusing on celestial bodies
 */
const CameraController = ({ focusedCelestialBody, isAnimationPlaying }) => {
  const { camera, controls } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (focusedCelestialBody && isAnimationPlaying && controls) {
      isTransitioning.current = true;
      
      // Calculate target camera position based on celestial body type
      let cameraOffset = [10, 10, 10]; // Default offset
      
      switch (focusedCelestialBody.type) {
        case 'sun':
          cameraOffset = [15, 15, 15];
          break;
        case 'planet':
          cameraOffset = [8, 8, 8];
          break;
        case 'satellite':
          cameraOffset = [5, 5, 5];
          break;
      }
      
      // Set target positions
      targetLookAt.current.set(0, 0, 0); // Look at celestial body
      targetPosition.current.set(
        cameraOffset[0],
        cameraOffset[1],
        cameraOffset[2]
      );
      
      // Smooth transition
      const duration = 2000; // 2 seconds
      const startTime = Date.now();
      const startPosition = camera.position.clone();
      const startTarget = controls.target.clone();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        // Interpolate camera position
        camera.position.lerpVectors(startPosition, targetPosition.current, easeProgress);
        controls.target.lerpVectors(startTarget, targetLookAt.current, easeProgress);
        
        controls.update();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          isTransitioning.current = false;
        }
      };
      
      animate();
    }
  }, [focusedCelestialBody, camera, controls, isAnimationPlaying]);

  return null;
};

/**
 * Multi Solar System Scene - Main 3D visualization component
 * Manages multiple solar systems representing different todo groups
 * Each system contains hierarchical celestial bodies (Sun > Planet > Satellite)
 */
const MultiSolarSystemScene = ({ 
  todoData = [], 
  onCelestialBodyClick,
  selectedTodoId = null,
  focusedCelestialBody = null,
  isAnimationPlaying = true
}) => {
  const [selectedSystemId, setSelectedSystemId] = useState(null);
  const celestialBodyRefs = useRef(new Map()); // Store refs to celestial bodies

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
    const radius = Math.max(30, systemCount * 12); // Increased spacing
    
    solarSystems.forEach((system, index) => {
      const angle = (index / systemCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 15; // Random height variation
      
      positions.push({ 
        systemId: system.id, 
        position: [x, y, z] 
      });
    });
    
    return positions;
  }, [solarSystems]);

  // Update celestial body positions for focusing
  useEffect(() => {
    if (focusedCelestialBody) {
      // Find the celestial body and update focus position
      const bodyRef = celestialBodyRefs.current.get(focusedCelestialBody.id);
      if (bodyRef && bodyRef.current) {
        const position = bodyRef.current.getWorldPosition(new THREE.Vector3());
        // Update the focused celestial body position
        focusedCelestialBody.position = [position.x, position.y, position.z];
      }
    }
  }, [focusedCelestialBody, celestialBodyRefs]);

  const handleSystemClick = (systemId) => {
    setSelectedSystemId(systemId === selectedSystemId ? null : systemId);
  };

  const handleCelestialBodyClick = (todoData) => {
    onCelestialBodyClick?.(todoData);
  };

  // Store ref for celestial body
  const setCelestialBodyRef = (id, ref) => {
    celestialBodyRefs.current.set(id, ref);
  };

  return (
    <Canvas camera={{ position: [0, 50, 80], fov: 60 }}>
      {/* Camera controller for focusing */}
      <CameraController 
        focusedCelestialBody={focusedCelestialBody}
        isAnimationPlaying={isAnimationPlaying}
      />
      
      {/* Enhanced lighting for multiple systems */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[20, 20, 10]} intensity={0.6} castShadow />
      <pointLight position={[0, 30, 0]} intensity={0.4} color="#ffffff" />
      <spotLight 
        position={[50, 50, 50]} 
        angle={0.3} 
        penumbra={0.5} 
        intensity={0.5}
        castShadow
      />
      
      {/* Enhanced starfield background */}
      <mesh>
        <sphereGeometry args={[300, 64, 64]} />
        <meshBasicMaterial 
          color="#000011" 
          side={THREE.BackSide}
          transparent
          opacity={0.9}
        />
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
                  isAnimationPlaying={isAnimationPlaying}
                  ref={(ref) => setCelestialBodyRef(sun.id, ref)}
                />
              ))
            ) : (
              // Default sun if no sun-type todos exist
              <AISun
                solarSystemData={system}
                position={[0, 0, 0]}
                onClick={() => handleSystemClick(system.id)}
                isSelected={isSelected}
                isAnimationPlaying={isAnimationPlaying}
              />
            )}

            {/* Render Planets */}
            {system.planets.map((planet, planetIndex) => (
              <AIPlanet
                key={`planet-${planet.id}`}
                todoData={planet}
                sunPosition={[0, 0, 0]}
                orbitRadius={12 + planetIndex * 4} // Increased orbit radius
                orbitSpeed={0.008 - planetIndex * 0.002} // Slower base speed
                initialAngle={planetIndex * (Math.PI * 2) / system.planets.length}
                onClick={handleCelestialBodyClick}
                isSelected={selectedTodoId === planet.id}
                isAnimationPlaying={isAnimationPlaying}
                ref={(ref) => setCelestialBodyRef(planet.id, ref)}
              />
            ))}

            {/* Render Satellites */}
            {system.satellites.map((satellite, satIndex) => {
              // Assign satellites to planets or sun if no planets exist
              const planetCount = system.planets.length;
              if (planetCount > 0) {
                const planetIndex = satIndex % planetCount;
                const planet = system.planets[planetIndex];
                const planetOrbitRadius = 12 + planetIndex * 4;
                
                // Calculate planet's approximate position for satellite orbit
                const planetAngle = planetIndex * (Math.PI * 2) / planetCount;
                const planetX = Math.cos(planetAngle) * planetOrbitRadius;
                const planetZ = Math.sin(planetAngle) * planetOrbitRadius;

                return (
                  <AISatellite
                    key={`satellite-${satellite.id}`}
                    todoData={satellite}
                    planetPosition={[planetX, 0, planetZ]}
                    orbitRadius={2 + (satIndex % 3) * 0.7}
                    orbitSpeed={0.025 + (satIndex % 5) * 0.008}
                    initialAngle={satIndex * 1.5}
                    onClick={handleCelestialBodyClick}
                    isSelected={selectedTodoId === satellite.id}
                    isAnimationPlaying={isAnimationPlaying}
                    ref={(ref) => setCelestialBodyRef(satellite.id, ref)}
                  />
                );
              } else {
                // If no planets, satellites orbit the sun directly
                return (
                  <AISatellite
                    key={`satellite-${satellite.id}`}
                    todoData={satellite}
                    planetPosition={[0, 0, 0]}
                    orbitRadius={5 + satIndex * 1.2}
                    orbitSpeed={0.015 + satIndex * 0.005}
                    initialAngle={satIndex * 1.2}
                    onClick={handleCelestialBodyClick}
                    isSelected={selectedTodoId === satellite.id}
                    isAnimationPlaying={isAnimationPlaying}
                    ref={(ref) => setCelestialBodyRef(satellite.id, ref)}
                  />
                );
              }
            })}

            {/* System boundary indicator */}
            {isSelected && (
              <mesh>
                <ringGeometry args={[25, 27, 64]} />
                <meshBasicMaterial 
                  color="#00aaff" 
                  transparent 
                  opacity={0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* System info label */}
            <group position={[0, -12, 0]}>
              <mesh>
                <planeGeometry args={[8, 1.5]} />
                <meshBasicMaterial 
                  color="#000000" 
                  transparent 
                  opacity={0.8} 
                />
              </mesh>
            </group>

          </group>
        );
      })}

      {/* System connection lines for visualization */}
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
                <lineBasicMaterial color="#222222" transparent opacity={0.15} />
              </line>
            ))
          )}
        </group>
      )}

      {/* Enhanced camera controls */}
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05}
        minDistance={15}
        maxDistance={300}
        maxPolarAngle={Math.PI * 0.9}
        enablePan={true}
        panSpeed={1.2}
        rotateSpeed={0.8}
        zoomSpeed={1.2}
      />

      {/* Ambient particles for space effect */}
      <group>
        {Array.from({ length: 200 }, (_, i) => (
          <mesh key={i} position={[
            (Math.random() - 0.5) * 400,
            (Math.random() - 0.5) * 400,
            (Math.random() - 0.5) * 400
          ]}>
            <sphereGeometry args={[0.1, 4, 4]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={Math.random() * 0.8 + 0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Debug information in development */}
      {process.env.NODE_ENV === 'development' && (
        <mesh position={[0, -30, 0]}>
          <planeGeometry args={[15, 3]} />
          <meshBasicMaterial color="#333333" transparent opacity={0.8} />
        </mesh>
      )}
    </Canvas>
  );
};

export default MultiSolarSystemScene;