import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

// v0.8.0: functional_specification.md 정확한 구현 - 다중 태양계 시스템
// "그룹명이 2개 이상이면 태양도 2개 이상입니다. 태양계도 2개 이상이 됩니다."

// 헬퍼 함수
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [255, 215, 0];
};

// 태양 컴포넌트 (태스크 그룹명)
function Sun({ sunData, systemPosition, isAnimationPlaying, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && isAnimationPlaying) {
      // 태양 자전
      meshRef.current.rotation.y += 0.01;
      
      // 맥동 효과
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  if (!sunData) return null;

  return (
    <group position={systemPosition}>
      {/* 태양 본체 */}
      <mesh 
        ref={meshRef} 
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick('sun', sunData);
        }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial 
          color={sunData.theme?.color || "#FFD700"}
          emissive={sunData.theme?.color || "#FFA500"}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* 태양 후광 효과 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial 
          color={sunData.theme?.color || "#FFD700"}
          transparent
          opacity={0.2}
        />
      </mesh>
      
      {/* 태양 키워드 표시 */}
      <Html position={[0, 6, 0]} center>
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
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          ☀️ {sunData.name}
          <br />
          <div style={{ fontSize: '0.7em', marginTop: '4px' }}>
            {sunData.keywords && sunData.keywords.slice(0, 3).join(', ')}
          </div>
          <div style={{ fontSize: '0.6em', marginTop: '2px' }}>
            {sunData.totalTasks}개 태스크
          </div>
        </div>
      </Html>
    </group>
  );
}

// 행성 컴포넌트 (태스크)
function Planet({ planetData, systemPosition, isAnimationPlaying, onClick }) {
  const orbitRef = useRef();
  const meshRef = useRef();
  
  useFrame((state) => {
    if (orbitRef.current && isAnimationPlaying) {
      // 태양 주위 공전
      orbitRef.current.rotation.y += planetData.orbitSpeed * 0.01;
    }
    
    if (meshRef.current && isAnimationPlaying) {
      // 행성 자전
      meshRef.current.rotation.y += 0.05;
    }
  });

  return (
    <group position={systemPosition}>
      <group ref={orbitRef} rotation={[0, planetData.initialAngle || 0, 0]}>
        {/* 궤도선 표시 */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planetData.orbitRadius - 0.1, planetData.orbitRadius + 0.1, 64]} />
          <meshBasicMaterial 
            color={planetData.color} 
            transparent 
            opacity={0.3} 
          />
        </mesh>
        
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
          />
        </mesh>
        
        {/* 행성 키워드 표시 */}
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
            whiteSpace: 'nowrap'
          }}>
            🪐 {planetData.name.length > 15 ? planetData.name.substring(0, 15) + '...' : planetData.name}
            <br />
            <div style={{ fontSize: '0.6em', marginTop: '2px' }}>
              {planetData.keywords && planetData.keywords.slice(0, 2).join(', ')}
            </div>
          </div>
        </Html>
        
        {/* 위성들 렌더링 (서브태스크가 있을 때만) */}
        {planetData.satellites && planetData.satellites.map((satellite, index) => (
          <Satellite 
            key={satellite.id}
            satelliteData={satellite}
            planetRadius={planetData.orbitRadius}
            isAnimationPlaying={isAnimationPlaying}
            onClick={onClick}
          />
        ))}
      </group>
    </group>
  );
}

// 위성 컴포넌트 (서브태스크)
function Satellite({ satelliteData, planetRadius, isAnimationPlaying, onClick }) {
  const orbitRef = useRef();
  const meshRef = useRef();
  
  useFrame((state) => {
    if (orbitRef.current && isAnimationPlaying) {
      // 행성 주위 공전
      orbitRef.current.rotation.y += satelliteData.orbitSpeed * 0.02;
    }
    
    if (meshRef.current && isAnimationPlaying) {
      // 위성 자전
      meshRef.current.rotation.x += 0.1;
    }
  });

  return (
    <group ref={orbitRef} position={[planetRadius, 0, 0]} rotation={[0, satelliteData.initialAngle || 0, 0]}>
      {/* 위성 궤도선 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[satelliteData.orbitRadius - 0.05, satelliteData.orbitRadius + 0.05, 32]} />
        <meshBasicMaterial 
          color={satelliteData.color} 
          transparent 
          opacity={0.2} 
        />
      </mesh>
      
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
        />
      </mesh>
      
      {/* 위성 키워드 표시 */}
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
          whiteSpace: 'nowrap'
        }}>
          🛰️ {satelliteData.name.length > 10 ? satelliteData.name.substring(0, 10) + '...' : satelliteData.name}
          <br />
          <div style={{ fontSize: '0.5em' }}>
            {satelliteData.keywords && satelliteData.keywords.slice(0, 1).join(', ')}
          </div>
        </div>
      </Html>
    </group>
  );
}

// 소행성 컴포넌트 (AI 액션 제안)
function Asteroid({ asteroidData, isAnimationPlaying, onClick }) {
  const meshRef = useRef();
  const [position, setPosition] = React.useState(asteroidData.position);
  
  useFrame((state) => {
    if (meshRef.current && isAnimationPlaying) {
      // 불규칙한 회전
      meshRef.current.rotation.x += 0.03;
      meshRef.current.rotation.z += 0.02;
      
      // 맥동 효과
      const scale = 0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      meshRef.current.scale.setScalar(scale);
      
      // 목표 방향으로 이동 (간단한 구현)
      if (asteroidData.targetPosition) {
        const direction = new THREE.Vector3()
          .subVectors(
            new THREE.Vector3(...asteroidData.targetPosition),
            new THREE.Vector3(...position)
          )
          .normalize()
          .multiplyScalar(asteroidData.speed * 0.1);
        
        setPosition(prev => [
          prev[0] + direction.x,
          prev[1] + direction.y,
          prev[2] + direction.z
        ]);
      }
    }
  });

  // 시간 경과에 따른 색상 변화
  const timeLeft = Math.max(0, (asteroidData.timeLimit - Date.now()) / 1000);
  const urgencyColor = timeLeft > 30 ? '#FFC107' : timeLeft > 10 ? '#FF9800' : '#F44336';

  return (
    <group>
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
        />
      </mesh>
      
      {/* 소행성 트레일 효과 */}
      <mesh position={position}>
        <sphereGeometry args={[1.2, 8, 6]} />
        <meshBasicMaterial 
          color={urgencyColor}
          transparent
          opacity={0.2}
        />
      </mesh>
      
      {/* 소행성 키워드 및 액션 표시 */}
      <Html position={[position[0], position[1] + 2, position[2]]} center>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: urgencyColor,
          padding: '5px 10px',
          borderRadius: '10px',
          fontSize: '0.7em',
          border: `1px solid ${urgencyColor}`,
          whiteSpace: 'nowrap',
          textAlign: 'center'
        }}>
          ☄️ {asteroidData.suggestion?.action || 'AI Action'}
          <br />
          <div style={{ fontSize: '0.6em', marginTop: '2px' }}>
            {asteroidData.keywords && asteroidData.keywords.slice(0, 2).join(', ')}
          </div>
          <div style={{ fontSize: '0.5em', marginTop: '2px' }}>
            ⏱️ {Math.ceil(timeLeft)}초 남음
          </div>
        </div>
      </Html>
    </group>
  );
}

// 카메라 컨트롤러
function CameraController({ solarSystems, currentView }) {
  const { camera } = useThree();
  
  useEffect(() => {
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
        // 특정 태양계 집중 (향후 구현)
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
  }, [camera, solarSystems, currentView]);

  return null;
}

// 메인 Scene 컴포넌트
const Scene = ({ 
  isAnimationPlaying = true,
  solarSystems = [], // v0.8.0: 다중 태양계 시스템
  asteroids = [],
  currentView = 'all',
  onSolarSystemClick,
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
        <CameraController solarSystems={solarSystems} currentView={currentView} />
        
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
        
        {/* v0.8.0: 다중 태양계 렌더링 */}
        {solarSystems && solarSystems.length > 0 ? (
          solarSystems.map((system) => (
            <group key={system.id}>
              {/* 태양 (태스크 그룹명) */}
              <Sun 
                sunData={system.sun}
                systemPosition={system.position}
                isAnimationPlaying={isAnimationPlaying}
                onClick={onSunClick}
              />
              
              {/* 행성들 (태스크들) */}
              {system.planets && system.planets.map((planet) => (
                <Planet
                  key={planet.id}
                  planetData={planet}
                  systemPosition={system.position}
                  isAnimationPlaying={isAnimationPlaying}
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
            </div>
          </Html>
        )}
        
        {/* 소행성들 (AI 액션 제안) */}
        {asteroids && asteroids.map((asteroid) => (
          <Asteroid
            key={asteroid.id}
            asteroidData={asteroid}
            isAnimationPlaying={isAnimationPlaying}
            onClick={onAsteroidClick}
          />
        ))}
        
      </Suspense>
    </Canvas>
  );
};

export default Scene;