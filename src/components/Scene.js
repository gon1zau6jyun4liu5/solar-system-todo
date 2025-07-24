import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Text } from '@react-three/drei';
import * as THREE from 'three';

// v0.8.4: functional_specification.md 완전 준수
// NEW: 속도 설정, 궤도 표시, 포커싱 기능, 동적 키워드

// 헬퍼 함수
const hexToRgb = (hex) => {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [255, 215, 0];
};

// NEW: 동적 키워드 컴포넌트 (표면을 시계방향으로 달려가는 효과)
function DynamicKeywords({ keywords, radius, color, isAnimationPlaying, animationSpeed }) {
  const groupRef = useRef();
  
  useFrame(() => {
    if (groupRef.current && isAnimationPlaying) {
      groupRef.current.rotation.y += 0.02 * animationSpeed;
    }
  });

  if (!keywords || keywords.length === 0) return null;

  return (
    <group ref={groupRef}>
      {keywords.slice(0, 3).map((keyword, index) => {
        const angle = (index / keywords.length) * Math.PI * 2;
        const x = Math.cos(angle) * (radius + 0.5);
        const z = Math.sin(angle) * (radius + 0.5);
        
        return (
          <Text
            key={`${keyword}-${index}`}
            position={[x, 0, z]}
            rotation={[0, -angle + Math.PI/2, 0]}
            fontSize={0.4}
            color={color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {keyword}
          </Text>
        );
      })}
    </group>
  );
}

// NEW: 궤도 컴포넌트 (리얼타임 궤도 표시)
function OrbitVisualization({ radius, color, showOrbits, isAnimationPlaying, animationSpeed }) {
  const orbitRef = useRef();
  const [trailPoints, setTrailPoints] = useState([]);
  
  useFrame((state) => {
    if (!showOrbits || !isAnimationPlaying) return;
    
    if (orbitRef.current) {
      // 궤도선 회전 효과
      orbitRef.current.rotation.z += 0.005 * animationSpeed;
      
      // 궤도 트레일 효과 (주변선만 선명하게)
      const time = state.clock.elapsedTime * animationSpeed;
      const angle = time * 0.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      setTrailPoints(prev => {
        const newPoints = [...prev, [x, 0, z]];
        return newPoints.slice(-20); // 최근 20개 점만 유지
      });
    }
  });

  if (!showOrbits) return null;

  return (
    <group ref={orbitRef}>
      {/* 기본 궤도선 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.1, radius + 0.1, 64]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.3} 
        />
      </mesh>
      
      {/* 활성 궤도 구간 (더 밝게) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.05, radius + 0.05, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.7} 
        />
      </mesh>
      
      {/* 트레일 점들 */}
      {trailPoints.map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.8 - (index / trailPoints.length) * 0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

// 태양 컴포넌트 (태스크 그룹명)
function Sun({ sunData, systemPosition, isAnimationPlaying, animationSpeed, onClick, focusedSystemId, systemId }) {
  const meshRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  
  // 포커스 상태 확인
  const isFocused = focusedSystemId === systemId;
  const shouldShow = !focusedSystemId || isFocused;
  
  useFrame((state) => {
    if (meshRef.current && isAnimationPlaying && shouldShow) {
      // 태양 자전
      meshRef.current.rotation.y += 0.01 * animationSpeed;
      
      // 맥동 효과
      const baseScale = isFocused ? 1.2 : 1.0;
      const scale = baseScale + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  if (!sunData || !shouldShow) return null;

  const opacity = focusedSystemId && !isFocused ? 0.3 : 1.0;

  return (
    <group position={systemPosition} visible={shouldShow}>
      {/* 태양 본체 */}
      <mesh 
        ref={meshRef} 
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick('sun', sunData);
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
          setIsHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
          setIsHovered(false);
        }}
      >
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial 
          color={sunData.theme?.color || "#FFD700"}
          emissive={sunData.theme?.color || "#FFA500"}
          emissiveIntensity={isFocused ? 0.8 : (isHovered ? 0.6 : 0.5)}
          transparent
          opacity={opacity}
        />
      </mesh>
      
      {/* 태양 후광 효과 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial 
          color={sunData.theme?.color || "#FFD700"}
          transparent
          opacity={0.2 * opacity}
        />
      </mesh>
      
      {/* 포커스 링 (포커스된 경우) */}
      {isFocused && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[7, 8, 32]} />
          <meshBasicMaterial 
            color="#FFFFFF"
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
      
      {/* NEW: 동적 키워드 (시계방향으로 달려가는 효과) */}
      <DynamicKeywords 
        keywords={sunData.keywords}
        radius={6}
        color={sunData.theme?.color || "#FFD700"}
        isAnimationPlaying={isAnimationPlaying}
        animationSpeed={animationSpeed}
      />
      
      {/* 태양 정보 표시 */}
      <Html position={[0, 8, 0]} center>
        <div style={{
          background: `rgba(${sunData.theme?.color ? 
            hexToRgb(sunData.theme.color).join(',') : '255, 215, 0'}, 0.9)`,
          color: 'black',
          padding: '8px 12px',
          borderRadius: '15px',
          fontSize: '0.9em',
          fontWeight: 'bold',
          textAlign: 'center',
          border: `2px solid ${sunData.theme?.color || '#FFA500'}`,
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          opacity: opacity,
          transform: isFocused ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.3s ease'
        }}>
          ☀️ {sunData.name}
          <br />
          <div style={{ fontSize: '0.6em', marginTop: '2px' }}>
            {sunData.totalTasks}개 태스크 {isFocused ? '(포커스됨)' : ''}
          </div>
        </div>
      </Html>
    </group>
  );
}

// 행성 컴포넌트 (태스크)
function Planet({ planetData, systemPosition, isAnimationPlaying, animationSpeed, showOrbits, onClick, focusedSystemId, systemId }) {
  const orbitRef = useRef();
  const meshRef = useRef();
  
  // 포커스 상태 확인
  const isFocused = focusedSystemId === systemId;
  const shouldShow = !focusedSystemId || isFocused;
  
  useFrame((state) => {
    if (!shouldShow) return;
    
    if (orbitRef.current && isAnimationPlaying) {
      // 태양 주위 공전
      orbitRef.current.rotation.y += planetData.orbitSpeed * 0.01 * animationSpeed;
    }
    
    if (meshRef.current && isAnimationPlaying) {
      // 행성 자전
      meshRef.current.rotation.y += 0.05 * animationSpeed;
    }
  });

  if (!shouldShow) return null;

  const opacity = focusedSystemId && !isFocused ? 0.3 : 1.0;

  return (
    <group position={systemPosition} visible={shouldShow}>
      <group ref={orbitRef} rotation={[0, planetData.initialAngle || 0, 0]}>
        {/* NEW: 궤도 시각화 */}
        <OrbitVisualization 
          radius={planetData.orbitRadius}
          color={planetData.color}
          showOrbits={showOrbits}
          isAnimationPlaying={isAnimationPlaying}
          animationSpeed={animationSpeed}
        />
        
        {/* 행성 본체 */}
        <mesh 
          ref={meshRef}
          position={[planetData.orbitRadius, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onClick && onClick('planet', planetData.task);
          }}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'default'}
        >
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshStandardMaterial 
            color={planetData.color}
            emissive={planetData.completed ? '#004400' : '#000000'}
            emissiveIntensity={planetData.completed ? 0.3 : 0}
            transparent
            opacity={opacity}
          />
        </mesh>
        
        {/* NEW: 동적 키워드 (행성 표면을 달려가는 효과) */}
        <group position={[planetData.orbitRadius, 0, 0]}>
          <DynamicKeywords 
            keywords={planetData.keywords}
            radius={2}
            color={planetData.color}
            isAnimationPlaying={isAnimationPlaying}
            animationSpeed={animationSpeed}
          />
        </group>
        
        {/* 행성 정보 표시 */}
        <Html position={[planetData.orbitRadius, 3, 0]} center>
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: planetData.color,
            padding: '6px 10px',
            borderRadius: '12px',
            fontSize: '0.8em',
            fontWeight: 'bold',
            textAlign: 'center',
            border: `1px solid ${planetData.color}`,
            whiteSpace: 'nowrap',
            opacity: opacity
          }}>
            🪐 {planetData.name.length > 15 ? planetData.name.substring(0, 15) + '...' : planetData.name}
          </div>
        </Html>
        
        {/* 위성들 렌더링 (서브태스크가 있을 때만) */}
        {planetData.satellites && planetData.satellites.map((satellite, index) => (
          <Satellite 
            key={satellite.id}
            satelliteData={satellite}
            planetRadius={planetData.orbitRadius}
            isAnimationPlaying={isAnimationPlaying}
            animationSpeed={animationSpeed}
            showOrbits={showOrbits}
            onClick={onClick}
            focusedSystemId={focusedSystemId}
            systemId={systemId}
          />
        ))}
      </group>
    </group>
  );
}

// 위성 컴포넌트 (서브태스크)
function Satellite({ satelliteData, planetRadius, isAnimationPlaying, animationSpeed, showOrbits, onClick, focusedSystemId, systemId }) {
  const orbitRef = useRef();
  const meshRef = useRef();
  
  // 포커스 상태 확인
  const isFocused = focusedSystemId === systemId;
  const shouldShow = !focusedSystemId || isFocused;
  
  useFrame((state) => {
    if (!shouldShow) return;
    
    if (orbitRef.current && isAnimationPlaying) {
      // 행성 주위 공전
      orbitRef.current.rotation.y += satelliteData.orbitSpeed * 0.02 * animationSpeed;
    }
    
    if (meshRef.current && isAnimationPlaying) {
      // 위성 자전
      meshRef.current.rotation.x += 0.1 * animationSpeed;
    }
  });

  if (!shouldShow) return null;

  const opacity = focusedSystemId && !isFocused ? 0.3 : 1.0;

  return (
    <group ref={orbitRef} position={[planetRadius, 0, 0]} rotation={[0, satelliteData.initialAngle || 0, 0]}>
      {/* NEW: 위성 궤도 시각화 */}
      {showOrbits && (
        <OrbitVisualization 
          radius={satelliteData.orbitRadius}
          color={satelliteData.color}
          showOrbits={showOrbits}
          isAnimationPlaying={isAnimationPlaying}
          animationSpeed={animationSpeed}
        />
      )}
      
      {/* 위성 본체 */}
      <mesh 
        ref={meshRef}
        position={[satelliteData.orbitRadius, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick('satellite', satelliteData.subtask);
        }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial 
          color={satelliteData.color}
          emissive={satelliteData.completed ? '#004400' : '#000000'}
          emissiveIntensity={satelliteData.completed ? 0.3 : 0}
          transparent
          opacity={opacity}
        />
      </mesh>
      
      {/* NEW: 동적 키워드 (위성 표면을 달려가는 효과) */}
      <group position={[satelliteData.orbitRadius, 0, 0]}>
        <DynamicKeywords 
          keywords={satelliteData.keywords}
          radius={0.8}
          color={satelliteData.color}
          isAnimationPlaying={isAnimationPlaying}
          animationSpeed={animationSpeed}
        />
      </group>
      
      {/* 위성 정보 표시 */}
      <Html position={[satelliteData.orbitRadius, 1.5, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          color: satelliteData.color,
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '0.6em',
          fontWeight: 'bold',
          textAlign: 'center',
          border: `1px solid ${satelliteData.color}`,
          whiteSpace: 'nowrap',
          opacity: opacity
        }}>
          🛰️ {satelliteData.name.length > 10 ? satelliteData.name.substring(0, 10) + '...' : satelliteData.name}
        </div>
      </Html>
    </group>
  );
}

// 소행성 컴포넌트 (AI 액션 제안)
function Asteroid({ asteroidData, isAnimationPlaying, animationSpeed, onClick, focusedSystemId }) {
  const meshRef = useRef();
  const [position, setPosition] = useState(asteroidData.position);
  
  // 포커스 상태에 따른 표시 여부
  const shouldShow = !focusedSystemId || focusedSystemId === asteroidData.targetSystemId;
  
  useFrame((state) => {
    if (meshRef.current && isAnimationPlaying && shouldShow) {
      // 불규칙한 회전
      meshRef.current.rotation.x += 0.03 * animationSpeed;
      meshRef.current.rotation.z += 0.02 * animationSpeed;
      
      // 맥동 효과
      const scale = 0.8 + Math.sin(state.clock.elapsedTime * 4 * animationSpeed) * 0.2;
      meshRef.current.scale.setScalar(scale);
      
      // 목표 방향으로 이동
      if (asteroidData.targetPosition) {
        const direction = new THREE.Vector3()
          .subVectors(
            new THREE.Vector3(...asteroidData.targetPosition),
            new THREE.Vector3(...position)
          )
          .normalize()
          .multiplyScalar(asteroidData.speed * 0.1 * animationSpeed);
        
        setPosition(prev => [
          prev[0] + direction.x,
          prev[1] + direction.y,
          prev[2] + direction.z
        ]);
      }
    }
  });

  if (!shouldShow) return null;

  // 시간 경과에 따른 색상 변화
  const timeLeft = Math.max(0, (asteroidData.timeLimit - Date.now()) / 1000);
  const urgencyColor = timeLeft > 30 ? '#FFC107' : timeLeft > 10 ? '#FF9800' : '#F44336';

  const opacity = focusedSystemId && focusedSystemId !== asteroidData.targetSystemId ? 0.3 : 1.0;

  return (
    <group visible={shouldShow}>
      <mesh 
        ref={meshRef} 
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick('asteroid', asteroidData);
        }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        {/* 불규칙한 소행성 형태 */}
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial 
          color={urgencyColor}
          emissive={urgencyColor}
          emissiveIntensity={0.3}
          roughness={0.8}
          transparent
          opacity={opacity}
        />
      </mesh>
      
      {/* NEW: 동적 키워드 (소행성 주변을 달려가는 효과) */}
      <group position={position}>
        <DynamicKeywords 
          keywords={asteroidData.keywords}
          radius={1.2}
          color={urgencyColor}
          isAnimationPlaying={isAnimationPlaying}
          animationSpeed={animationSpeed}
        />
      </group>
      
      {/* 소행성 트레일 효과 */}
      <mesh position={position}>
        <sphereGeometry args={[1.2, 8, 6]} />
        <meshBasicMaterial 
          color={urgencyColor}
          transparent
          opacity={0.2 * opacity}
        />
      </mesh>
      
      {/* 소행성 정보 표시 */}
      <Html position={[position[0], position[1] + 2, position[2]]} center>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: urgencyColor,
          padding: '5px 10px',
          borderRadius: '10px',
          fontSize: '0.7em',
          border: `1px solid ${urgencyColor}`,
          whiteSpace: 'nowrap',
          textAlign: 'center',
          opacity: opacity
        }}>
          ☄️ {asteroidData.suggestion?.action || 'AI Action'}
          <br />
          <div style={{ fontSize: '0.5em', marginTop: '2px' }}>
            ⏱️ {Math.ceil(timeLeft)}초 남음
          </div>
        </div>
      </Html>
    </group>
  );
}

// NEW: 카메라 컨트롤러 (포커싱 기능 지원)
function CameraController({ solarSystems, currentView, focusedSystemId }) {
  const { camera } = useThree();
  
  useEffect(() => {
    if (focusedSystemId && solarSystems) {
      // 포커스된 태양계로 카메라 이동
      const targetSystem = solarSystems.find(s => s.id === focusedSystemId);
      if (targetSystem) {
        const [x, y, z] = targetSystem.position;
        camera.position.set(x + 50, y + 35, z + 50);
        camera.lookAt(x, y, z);
        console.log('🎥 카메라 포커스:', targetSystem.name);
        return;
      }
    }
    
    if (solarSystems && solarSystems.length > 0) {
      if (currentView === 'all') {
        // 모든 태양계를 볼 수 있는 적절한 거리로 카메라 위치 조정
        const maxDistance = Math.max(...solarSystems.map(system => {
          const pos = new THREE.Vector3(...system.position);
          return pos.length();
        }));
        
        const cameraDistance = Math.max(100, maxDistance * 1.5);
        camera.position.set(cameraDistance, cameraDistance * 0.7, cameraDistance);
        camera.lookAt(0, 0, 0);
      } else {
        // 특정 태양계 집중
        const targetSystemId = currentView.replace('system-', '');
        const targetSystem = solarSystems.find(s => s.id === targetSystemId);
        if (targetSystem) {
          const [x, y, z] = targetSystem.position;
          camera.position.set(x + 50, y + 35, z + 50);
          camera.lookAt(x, y, z);
        }
      }
    } else {
      // 기본 위치
      camera.position.set(50, 35, 50);
      camera.lookAt(0, 0, 0);
    }
  }, [camera, solarSystems, currentView, focusedSystemId]);

  return null;
}

// 메인 Scene 컴포넌트
const Scene = ({ 
  isAnimationPlaying = true,
  animationSpeed = 1.0, // NEW: 속도 설정
  showOrbits = true, // NEW: 궤도 표시 여부
  solarSystems = [],
  asteroids = [],
  currentView = 'all',
  focusedSystemId = null, // NEW: 포커싱 기능
  onSolarSystemClick,
  onSolarSystemFocus, // NEW: 포커싱 핸들러
  onPlanetClick,
  onSatelliteClick,
  onAsteroidClick,
  onSunClick,
  ...props
}) => {
  
  return (
    <Canvas
      camera={{ position: [100, 70, 100], fov: 75 }}
      style={{ width: '100%', height: '100%' }}
      {...props}
    >
      <Suspense fallback={null}>
        <CameraController 
          solarSystems={solarSystems} 
          currentView={currentView} 
          focusedSystemId={focusedSystemId}
        />
        
        {/* 조명 설정 */}
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={2} />
        <pointLight position={[100, 100, 100]} intensity={0.8} />
        <pointLight position={[-100, -100, -100]} intensity={0.4} />
        
        {/* 카메라 컨트롤 */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={20}
          maxDistance={500}
        />
        
        {/* 우주 배경 */}
        <mesh>
          <sphereGeometry args={[800, 32, 16]} />
          <meshBasicMaterial 
            color="#000015"
            side={THREE.BackSide}
          />
        </mesh>
        
        {/* 별 효과 */}
        <Stars 
          radius={600} 
          depth={50} 
          count={2000} 
          factor={4} 
          saturation={0} 
          fade={true}
        />
        
        {/* v0.8.4: 다중 태양계 렌더링 (포커싱 지원) */}
        {solarSystems && solarSystems.length > 0 ? (
          solarSystems.map((system) => (
            <group key={system.id}>
              {/* 태양 (태스크 그룹명) - 포커싱 지원 */}
              <Sun 
                sunData={system.sun}
                systemPosition={system.position}
                systemId={system.id}
                isAnimationPlaying={isAnimationPlaying}
                animationSpeed={animationSpeed}
                focusedSystemId={focusedSystemId}
                onClick={(type, data) => {
                  // 태양 클릭 시 포커싱 토글
                  if (onSolarSystemFocus) {
                    onSolarSystemFocus(system.id);
                  }
                  if (onSunClick) {
                    onSunClick(type, data);
                  }
                }}
              />
              
              {/* 행성들 (태스크들) - 새로운 기능 지원 */}
              {system.planets && system.planets.map((planet) => (
                <Planet
                  key={planet.id}
                  planetData={planet}
                  systemPosition={system.position}
                  systemId={system.id}
                  isAnimationPlaying={isAnimationPlaying}
                  animationSpeed={animationSpeed}
                  showOrbits={showOrbits}
                  focusedSystemId={focusedSystemId}
                  onClick={onPlanetClick}
                />
              ))}
            </group>
          ))
        ) : (
          // 태스크가 없을 때 표시할 메시지
          <Html center>
            <div style={{
              color: '#ffffff',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.7)',
              padding: '20px',
              borderRadius: '10px',
              fontSize: '1.2em'
            }}>
              <h3>🌌 우주 대기 중...</h3>
              <p>태스크를 추가하면 AI가 태양계를 생성합니다</p>
              <div style={{ fontSize: '0.8em', marginTop: '10px', color: '#aaa' }}>
                💡 functional_specification.md 규칙:<br />
                태스크가 없으면 행성도 없고, 태양도 없습니다<br />
                그룹명이 2개 이상이면 태양계도 2개 이상이 됩니다
              </div>
              <div style={{ fontSize: '0.7em', marginTop: '10px', color: '#888' }}>
                🆕 v0.8.4 새로운 기능:<br />
                • 속도 설정: {animationSpeed.toFixed(1)}x<br />
                • 궤도 표시: {showOrbits ? 'ON' : 'OFF'}<br />
                • 동적 키워드: 천체 표면을 달려가는 효과<br />
                • 포커싱: 태양 클릭으로 해당 태양계만 표시
              </div>
            </div>
          </Html>
        )}
        
        {/* 소행성들 (AI 액션 제안) - 새로운 기능 지원 */}
        {asteroids && asteroids.map((asteroid) => (
          <Asteroid
            key={asteroid.id}
            asteroidData={asteroid}
            isAnimationPlaying={isAnimationPlaying}
            animationSpeed={animationSpeed}
            focusedSystemId={focusedSystemId}
            onClick={onAsteroidClick}
          />
        ))}
        
      </Suspense>
    </Canvas>
  );
};

export default Scene;
