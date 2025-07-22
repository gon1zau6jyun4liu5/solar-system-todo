import React, { useMemo } from 'react';
import Sun from './Sun';
import Planet from './Planet';

const SolarSystem = ({ todos, selectedCategory, onPlanetClick, onCelestialClick, animationSpeed = 1.0 }) => {
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

  // 각 카테고리별 todo 분석 및 위성 할당
  const todoAnalysis = useMemo(() => {
    const analysis = {
      sun: { todos: [], pending: 0, completed: 0 },
      planets: {}
    };

    // 행성별 초기화
    planets.forEach(planet => {
      analysis.planets[planet.name] = {
        todos: [],
        pending: 0,
        completed: 0,
        satellites: []
      };
    });

    // Todo 분류
    todos.forEach(todo => {
      if (todo.category === 'sun' || todo.category === 'general') {
        analysis.sun.todos.push(todo);
        if (todo.completed) {
          analysis.sun.completed++;
        } else {
          analysis.sun.pending++;
        }
      } else if (analysis.planets[todo.category]) {
        analysis.planets[todo.category].todos.push(todo);
        if (todo.completed) {
          analysis.planets[todo.category].completed++;
        } else {
          analysis.planets[todo.category].pending++;
        }
      } else {
        // 위성으로 분류 - 행성이 있는 경우에만 위성으로 할당
        const availablePlanets = planets.filter(planet => 
          analysis.planets[planet.name].todos.length > 0 || 
          analysis.planets[planet.name].pending > 0
        );
        
        if (availablePlanets.length > 0) {
          // 가장 적은 위성을 가진 행성에 할당
          const targetPlanet = availablePlanets.reduce((min, planet) => 
            analysis.planets[planet.name].satellites.length < analysis.planets[min.name].satellites.length 
              ? planet : min
          );
          
          analysis.planets[targetPlanet.name].satellites.push(todo);
        } else {
          // 행성이 없으면 일반 카테고리로 배정
          analysis.sun.todos.push(todo);
          if (todo.completed) {
            analysis.sun.completed++;
          } else {
            analysis.sun.pending++;
          }
        }
      }
    });

    return analysis;
  }, [todos, planets]);

  // 각 행성별 pending 태스크 수 계산 (위성 포함)
  const getPendingTasksForPlanet = (planetName) => {
    const planetData = todoAnalysis.planets[planetName];
    const planetPending = planetData.pending;
    const satellitePending = planetData.satellites.filter(satellite => !satellite.completed).length;
    return planetPending + satellitePending;
  };

  // 행성이 클릭 가능한지 확인 (pending tasks가 있는 경우만)
  const isPlanetClickable = (planetName) => {
    return getPendingTasksForPlanet(planetName) > 0;
  };

  // 위성 렌더링 컴포넌트
  const SatelliteOrbit = ({ planet, satellites, planetData }) => {
    if (satellites.length === 0) return null;

    return (
      <group>
        {satellites.map((satellite, index) => {
          const orbitRadius = planet.size + 0.8 + (index * 0.3);
          const orbitSpeed = (planet.orbitSpeed * 3) + (index * 0.5);
          const initialAngle = (index * Math.PI * 2) / satellites.length;

          return (
            <mesh
              key={`satellite-${satellite.id}`}
              position={[
                Math.cos(initialAngle) * orbitRadius,
                0,
                Math.sin(initialAngle) * orbitRadius
              ]}
              onClick={(e) => {
                e.stopPropagation();
                onCelestialClick?.(satellite);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'default';
              }}
            >
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial 
                color={satellite.completed ? '#4caf50' : '#ffffff'}
                emissive={satellite.completed ? '#004400' : (satellite.priority === 'high' ? '#ff4444' : '#000000')}
                emissiveIntensity={satellite.completed ? 0.3 : (satellite.priority === 'high' ? 0.5 : 0)}
              />
              
              {/* 위성 궤도선 */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[orbitRadius - 0.02, orbitRadius + 0.02, 32]} />
                <meshBasicMaterial 
                  color="#ffffff" 
                  transparent 
                  opacity={0.2} 
                />
              </mesh>
            </mesh>
          );
        })}
      </group>
    );
  };

  return (
    <group>
      {/* 태양 */}
      <Sun 
        animationSpeed={animationSpeed}
        todos={todoAnalysis.sun.todos}
        onClick={(e) => {
          e.stopPropagation();
          if (todoAnalysis.sun.todos.length > 0) {
            onCelestialClick?.(todoAnalysis.sun.todos[0]);
          }
        }}
      />
      
      {/* 행성들 */}
      {planets.map(planet => {
        const planetData = todoAnalysis.planets[planet.name];
        const pendingTasks = getPendingTasksForPlanet(planet.name);
        const isClickable = isPlanetClickable(planet.name);

        return (
          <group key={planet.name}>
            <Planet
              name={planet.name}
              size={planet.size}
              color={planet.color}
              orbitRadius={planet.orbitRadius}
              orbitSpeed={planet.orbitSpeed * animationSpeed}
              pendingTasks={pendingTasks}
              isClickable={isClickable}
              onClick={(planetName) => {
                if (isClickable) {
                  onPlanetClick?.(planetName);
                }
              }}
              onCelestialClick={(e) => {
                e.stopPropagation();
                if (planetData.todos.length > 0) {
                  onCelestialClick?.(planetData.todos[0]);
                }
              }}
            />
            
            {/* 위성들 - 행성 주변에 렌더링 */}
            {planetData.satellites.length > 0 && (
              <SatelliteOrbit 
                planet={planet}
                satellites={planetData.satellites}
                planetData={planetData}
              />
            )}
          </group>
        );
      })}
    </group>
  );
};

export default SolarSystem;