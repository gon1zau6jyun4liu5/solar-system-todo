import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// 개별 태양계 컴포넌트
function SolarSystem({ system, position, onSystemClick, onPlanetClick, currentView, asteroids }) {
  const groupRef = useRef();
  const { camera } = useThree();
  
  // 태양계 전체 회전
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  const isActive = currentView === 'all' || currentView === `system-${system.id}`;

  // 태양계 포커스 효과
  useEffect(() => {
    if (currentView === `system-${system.id}` && groupRef.current) {
      // 카메라를 해당 태양계로 부드럽게 이동
      const targetPosition = new THREE.Vector3(...position).add(new THREE.Vector3(0, 20, 50));
      
      // 간단한 카메라 애니메이션 (실제로는 더 복잡한 Tween 라이브러리 사용 권장)
      const animate = () => {
        camera.position.lerp(targetPosition, 0.05);
        if (camera.position.distanceTo(targetPosition) > 0.1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    }
  }, [currentView, system.id, position, camera]);

  return (
    <group 
      ref={groupRef} 
      position={position}
      visible={isActive}
      onClick={() => onSystemClick && onSystemClick(system.id)}
    >
      {/* 태양 */}
      <Sun 
        system={system} 
        onClick={() => onSystemClick && onSystemClick(system.id)}
      />
      
      {/* 행성들 */}
      {system.planets.map((planet, index) => (
        <Planet
          key={planet.id}
          planet={planet}
          orbitRadius={8 + index * 4}
          orbitSpeed={0.01 - index * 0.002}
          onClick={() => onPlanetClick && onPlanetClick(planet.id)}
        />
      ))}
      
      {/* 이 태양계에 속한 소행성들 */}
      {asteroids
        .filter(asteroid => asteroid.targetSystemId === system.id)
        .map(asteroid => (
          <Asteroid
            key={asteroid.id}
            asteroid={asteroid}
            system={system}
          />
        ))
      }
      
      {/* 태양계 이름 표시 */}
      <Html position={[0, 12, 0]} center>
        <div className="solar-system-label">
          <h3 style={{ 
            color: system.theme.color, 
            margin: 0, 
            fontSize: '1.2em',
            textShadow: '0 0 10px currentColor'
          }}>
            {system.name.toUpperCase()}
          </h3>
          <p style={{ 
            color: '#ffffff', 
            margin: '5px 0 0 0', 
            fontSize: '0.8em',
            opacity: 0.8
          }}>
            {system.planets.length} 태스크
          </p>
        </div>
      </Html>
    </group>
  );
}

// 태양 컴포넌트
function Sun({ system, onClick }) {
  const meshRef = useRef();
  const { theme } = system;
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      // 맥동 효과
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} onClick={onClick} position={[0, 0, 0]}>
      <sphereGeometry args={[3, 32, 16]} />
      <meshStandardMaterial 
        color={theme.color}
        emissive={theme.color}
        emissiveIntensity={0.5}
      />
      {/* 태양 효과 - 외곽 글로우 */}
      <mesh>
        <sphereGeometry args={[3.5, 32, 16]} />
        <meshBasicMaterial 
          color={theme.color}
          transparent
          opacity={0.3}
        />
      </mesh>
    </mesh>
  );
}

// 행성 컴포넌트
function Planet({ planet, orbitRadius, orbitSpeed, onClick }) {
  const meshRef = useRef();
  const orbitRef = useRef();
  
  useFrame((state) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y += orbitSpeed;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  // 태스크 상태에 따른 색상
  const getColorByStatus = (task) => {
    if (!task) return '#888888';
    if (task.completed) return '#4CAF50';
    if (task.urgent) return '#F44336';
    if (task.deadline) {
      const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 1) return '#FF5722';
      if (daysLeft <= 7) return '#FF9800';
    }
    return '#2196F3';
  };

  const planetColor = getColorByStatus(planet.task);

  return (
    <group ref={orbitRef}>
      <group position={[orbitRadius, 0, 0]}>
        <mesh 
          ref={meshRef} 
          onClick={onClick}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'default'}
        >
          <sphereGeometry args={[1, 16, 8]} />
          <meshStandardMaterial color={planetColor} />
        </mesh>
        
        {/* 위성들 */}
        {planet.satellites && planet.satellites.map((satellite, index) => (
          <Satellite
            key={satellite.id}
            satellite={satellite}
            orbitRadius={2 + index * 0.5}
            orbitSpeed={0.05 + index * 0.01}
          />
        ))}
        
        {/* 행성 이름 표시 */}
        <Html position={[0, 2, 0]} center>
          <div className="planet-label">
            <span style={{ 
              color: planetColor, 
              fontSize: '0.8em',
              fontWeight: 'bold',
              textShadow: '0 0 5px rgba(0,0,0,0.8)'
            }}>
              {planet.name}
            </span>
          </div>
        </Html>
      </group>
      
      {/* 궤도 표시 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.1, orbitRadius + 0.1, 64]} />
        <meshBasicMaterial 
          color={planetColor} 
          transparent 
          opacity={0.2} 
        />
      </mesh>
    </group>
  );
}

// 위성 컴포넌트 (서브태스크)
function Satellite({ satellite, orbitRadius, orbitSpeed }) {
  const meshRef = useRef();
  const orbitRef = useRef();
  
  useFrame(() => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y += orbitSpeed;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.05;
    }
  });

  const satelliteColor = satellite.subtask?.completed ? '#4CAF50' : '#FFC107';

  return (
    <group ref={orbitRef}>
      <mesh ref={meshRef} position={[orbitRadius, 0, 0]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color={satelliteColor} />
      </mesh>
      
      {/* 위성 궤도 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.05, orbitRadius + 0.05, 32]} />
        <meshBasicMaterial 
          color={satelliteColor} 
          transparent 
          opacity={0.1} 
        />
      </mesh>
    </group>
  );
}

// 소행성 컴포넌트 (AI 액션 제안)
function Asteroid({ asteroid, system }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // 불규칙한 회전
      meshRef.current.rotation.x += 0.03;
      meshRef.current.rotation.z += 0.02;
      
      // 맥동 효과
      const scale = 0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      meshRef.current.scale.setScalar(scale);
      
      // 목표 행성 방향으로 이동 (간단한 구현)
      const targetPlanet = system.planets.find(p => p.id === asteroid.targetPlanetId);
      if (targetPlanet) {
        // 실제 구현에서는 더 복잡한 물리 계산 필요
        const direction = Math.sin(state.clock.elapsedTime * 0.5) * 2;
        meshRef.current.position.x = asteroid.position[0] + direction;
        meshRef.current.position.z = asteroid.position[2] + direction;
      }
    }
  });

  // 시간 경과에 따른 색상 변화
  const timeLeft = Math.max(0, (asteroid.timeLimit - Date.now()) / 1000);
  const urgencyColor = timeLeft > 30 ? '#FFC107' : timeLeft > 10 ? '#FF9800' : '#F44336';

  return (
    <group>
      <mesh 
        ref={meshRef} 
        position={asteroid.position}
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
      <mesh position={asteroid.position}>
        <sphereGeometry args={[1.2, 8, 6]} />
        <meshBasicMaterial 
          color={urgencyColor}
          transparent
          opacity={0.2}
        />
      </mesh>
      
      {/* 액션 제안 표시 */}
      <Html position={[asteroid.position[0], asteroid.position[1] + 2, asteroid.position[2]]} center>
        <div className="asteroid-tooltip">
          <div style={{ 
            background: 'rgba(0,0,0,0.8)', 
            color: urgencyColor,
            padding: '5px 10px',
            borderRadius: '10px',
            fontSize: '0.7em',
            border: `1px solid ${urgencyColor}`,
            whiteSpace: 'nowrap'
          }}>
            💡 {asteroid.suggestion.action}
            <br />
            ⏱️ {Math.ceil(timeLeft)}초 남음
          </div>
        </div>
      </Html>
    </group>
  );
}

// 메인 DynamicSolarSystemManager 컴포넌트
const DynamicSolarSystemManager = ({ 
  solarSystems, 
  asteroids, 
  currentView, 
  onSolarSystemClick, 
  onPlanetClick,
  onAsteroidClick,
  isAnimationPlaying 
}) => {
  // 시스템 포지션 최적화
  const systemPositions = useMemo(() => {
    return solarSystems.map((system, index) => {
      if (solarSystems.length === 1) return [0, 0, 0];
      
      const radius = Math.max(60, solarSystems.length * 20);
      const angle = (index / solarSystems.length) * Math.PI * 2;
      
      return [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ];
    });
  }, [solarSystems]);

  // 카메라 설정
  const CameraController = () => {
    const { camera } = useThree();
    
    useEffect(() => {
      if (currentView === 'all') {
        // 전체 뷰
        camera.position.set(0, 100, 100);
      }
    }, [currentView, camera]);

    return null;
  };

  if (solarSystems.length === 0) {
    return (
      <Html center>
        <div style={{ 
          color: '#ffffff',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.7)',
          padding: '20px',
          borderRadius: '10px'
        }}>
          <h3>🤖 AI 분석 중...</h3>
          <p>태스크를 추가하면 AI가 자동으로 태양계를 생성합니다</p>
        </div>
      </Html>
    );
  }

  return (
    <group>
      <CameraController />
      
      {/* 다중 태양계 렌더링 */}
      {solarSystems.map((system, index) => (
        <SolarSystem
          key={system.id}
          system={system}
          position={systemPositions[index]}
          onSystemClick={onSolarSystemClick}
          onPlanetClick={onPlanetClick}
          currentView={currentView}
          asteroids={asteroids}
        />
      ))}
      
      {/* 전역 조명 */}
      <ambientLight intensity={0.3} />
      <pointLight position={[100, 100, 100]} intensity={1} />
      <pointLight position={[-100, -100, -100]} intensity={0.5} />
      
      {/* 우주 배경 */}
      <mesh>
        <sphereGeometry args={[500, 32, 16]} />
        <meshBasicMaterial 
          color="#000011"
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* 별 효과 */}
      <Stars />
    </group>
  );
};

// 별 효과 컴포넌트
function Stars() {
  const starsRef = useRef();
  
  const starPositions = useMemo(() => {
    const positions = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
    }
    return positions;
  }, []);

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={starPositions}
          itemSize={3}
          count={1000}
        />
      </bufferGeometry>
      <pointsMaterial size={2} color="#ffffff" />
    </points>
  );
}

export default DynamicSolarSystemManager;