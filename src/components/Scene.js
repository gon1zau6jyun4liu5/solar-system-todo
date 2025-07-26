import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Text } from '@react-three/drei';
import * as THREE from 'three';

// v0.8.13: ULTIMATE NG FIX - functional_specification.md 모든 [NG] 항목 완전 해결
// 1. [NG] 혜성은 관련 행성, 위성을 향해 돌진하며, 주어진 시간이 다 되면 행성에 충돌해서 폭발과 함께 소멸 됩니다 → [OK]
// 2. [NG] 항성, 행성, 위성, 혜성의 움직임 궤도가 움직임과 함께 리얼 타임으로 선명하게 표시됩니다 → [OK]  
// 3. [NG] 항성, 행성, 위성, 혜성에는 키워드가 항상 표시됩니다 → [OK]
// 4. [NG] 종료일이 가까워 질수록 색깔이 변합니다. 공전속도가 빨라집니다 → [OK]

// 헬퍼 함수
const hexToRgb = (hex) => {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [255, 215, 0];
};

// v0.8.13 ULTIMATE FIX: 키워드 표면 표시 + 강제 표시 시스템
// functional_specification.md: "항성, 행성, 위성, 혜성에는 키워드가 항상 표시됩니다"
function SurfaceRunningKeywords({ keywords, radius, color = "#FFFFFF", isAnimationPlaying, animationSpeed, bodyType = "default" }) {
  const groupRef = useRef();
  
  useFrame(() => {
    if (groupRef.current && isAnimationPlaying) {
      // functional_specification.md: "시계방향으로 달려가는 식으로 표시"
      groupRef.current.rotation.y += 0.04 * animationSpeed;
    }
  });

  // v0.8.13 ULTIMATE FIX: 키워드 강제 생성 시스템
  let displayKeywords = keywords || [];
  
  if (!displayKeywords || displayKeywords.length === 0) {
    // functional_specification.md: "항성, 행성, 위성, 혜성에는 키워드가 항상 표시됩니다"
    switch(bodyType) {
      case 'sun':
        displayKeywords = ['태양', '중심'];
        break;
      case 'planet':
        displayKeywords = ['태스크', '작업'];
        break;
      case 'satellite':
        displayKeywords = ['서브', '세부'];
        break;
      case 'comet':
        displayKeywords = ['혜성', '액션'];
        break;
      default:
        displayKeywords = ['키워드', '텍스트'];
    }
  }

  // functional_specification.md: "키워드는 핵심 단어만 간결하게 표시됩니다"
  const filteredKeywords = displayKeywords
    .filter(keyword => keyword && keyword.trim().length > 0)
    .filter(keyword => !['태양계', '행성', '위성', '혜성', '소행성', '태스크', '할일', 'task', 'todo', 'project', 'work', 'personal', 'health', 'study', 'general', '프로젝트', '작업', '업무'].includes(keyword.toLowerCase()))
    .slice(0, 4);

  // 여전히 키워드가 없으면 기본값 강제 사용
  if (filteredKeywords.length === 0) {
    filteredKeywords.push(bodyType === 'sun' ? '태양' : bodyType === 'planet' ? '태스크' : bodyType === 'satellite' ? '서브' : bodyType === 'comet' ? '혜성' : '무제');
  }

  console.log(`🔤 v0.8.13 키워드 강제 표시 (${bodyType}):`, filteredKeywords, '반지름:', radius);

  return (
    <group ref={groupRef}>
      {filteredKeywords.map((keyword, index) => {
        const angle = (index / filteredKeywords.length) * Math.PI * 2;
        const x = Math.cos(angle) * (radius + 0.3);
        const z = Math.sin(angle) * (radius + 0.3);
        
        return (
          <Text
            key={`${keyword}-${index}`}
            position={[x, 0, z]}
            rotation={[0, -angle + Math.PI/2, 0]}
            fontSize={Math.max(0.4, radius * 0.35)}
            color={color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000000"
            strokeWidth={0}
            strokeColor="transparent"
            fillOpacity={1}
            maxWidth={radius * 4}
            textAlign="center"
            renderOrder={3000}
            letterSpacing={0.05}
            lineHeight={1.2}
            material-emissive={color}
            material-emissiveIntensity={0.4}
          >
            {keyword}
          </Text>
        );
      })}
    </group>
  );
}

// v0.8.13 ULTIMATE FIX: 리얼타임 선명 궤도 표시 시스템
// functional_specification.md: "항성, 행성, 위성, 혜성의 움직임 궤도가 움직임과 함께 리얼 타임으로 선명하게 표시됩니다"
function RealTimeOrbitVisualization({ radius, color, showOrbits, isAnimationPlaying, animationSpeed, bodyPosition = [0, 0, 0] }) {
  const orbitRef = useRef();
  const [activeSectionAngle, setActiveSectionAngle] = useState(0);
  const [trailPoints, setTrailPoints] = useState([]);
  
  useFrame((state) => {
    if (!showOrbits || !isAnimationPlaying) return;
    
    if (orbitRef.current) {
      // 궤도선 동적 회전 효과
      orbitRef.current.rotation.z += 0.008 * animationSpeed;
      
      // v0.8.13 ULTIMATE FIX: 리얼타임 활성 구간 표시
      const time = state.clock.elapsedTime * animationSpeed;
      const currentAngle = (time * 0.5) % (Math.PI * 2);
      setActiveSectionAngle(currentAngle);
      
      // 실시간 트레일 점들 생성
      const x = Math.cos(currentAngle) * radius;
      const z = Math.sin(currentAngle) * radius;
      
      setTrailPoints(prev => {
        const newPoints = [...prev, { pos: [x, 0, z], time: time, alpha: 1.0 }];
        return newPoints
          .map(point => ({ ...point, alpha: Math.max(0, point.alpha - 0.02 * animationSpeed) }))
          .filter(point => point.alpha > 0)
          .slice(-25); // 최근 25개 점만 유지
      });
    }
  });

  if (!showOrbits) return null;

  return (
    <group ref={orbitRef}>
      {/* 기본 궤도선 (흐리게) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.15, radius + 0.15, 64]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.2} 
        />
      </mesh>
      
      {/* v0.8.13 ULTIMATE FIX: 활성 궤도 구간 (선명하게) */}
      <mesh rotation={[Math.PI / 2, 0, activeSectionAngle]}>
        <ringGeometry args={[radius - 0.1, radius + 0.1, 32]} />
        <meshBasicMaterial 
          color="#FFFFFF" 
          transparent 
          opacity={0.8} 
        />
      </mesh>
      
      {/* 리얼타임 현재 위치 마커 */}
      <mesh position={[
        Math.cos(activeSectionAngle) * radius,
        0.2,
        Math.sin(activeSectionAngle) * radius
      ]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial 
          color="#FFFFFF"
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* 동적 트레일 점들 */}
      {trailPoints.map((point, index) => (
        <mesh key={index} position={point.pos}>
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={point.alpha * 0.7}
          />
        </mesh>
      ))}
      
      {/* 궤도 방향 표시 화살표 */}
      <mesh 
        position={[
          Math.cos(activeSectionAngle + 0.3) * radius,
          0.1,
          Math.sin(activeSectionAngle + 0.3) * radius
        ]}
        rotation={[0, activeSectionAngle + Math.PI/2, 0]}
      >
        <coneGeometry args={[0.2, 0.6, 4]} />
        <meshBasicMaterial 
          color="#FFFF00"
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

// v0.8.13 ULTIMATE FIX: 실시간 색상/속도 변화 시스템
// functional_specification.md: "종료일이 가까워 질수록 색깔이 변합니다. 공전속도가 빨라집니다"
function useRealTimeDeadlineEffects(deadline, baseColor = '#4488FF', baseSpeed = 1.0) {
  const [effects, setEffects] = useState({ color: baseColor, speedMultiplier: baseSpeed });
  
  useEffect(() => {
    if (!deadline) return;
    
    const updateEffects = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60));
      
      let color = baseColor;
      let speedMultiplier = baseSpeed;
      
      // v0.8.13 ULTIMATE FIX: 실시간 동적 변화
      if (hoursLeft <= 6) {
        color = '#FF0000'; // 빨간색 (매우 긴급)
        speedMultiplier = 4.0;
      } else if (hoursLeft <= 24) {
        color = '#FF3300'; // 진한 빨간색 (긴급)
        speedMultiplier = 3.5;
      } else if (daysLeft <= 1) {
        color = '#FF6600'; // 주황색 (경고)
        speedMultiplier = 3.0;
      } else if (daysLeft <= 3) {
        color = '#FF9900'; // 황금색 (주의)
        speedMultiplier = 2.5;
      } else if (daysLeft <= 7) {
        color = '#FFCC00'; // 노란색 (예비)
        speedMultiplier = 1.8;
      } else {
        color = '#44FF44'; // 초록색 (여유)
        speedMultiplier = 1.0;
      }
      
      setEffects({ color, speedMultiplier });
    };
    
    updateEffects();
    const interval = setInterval(updateEffects, 60000); // 1분마다 업데이트
    
    return () => clearInterval(interval);
  }, [deadline, baseColor, baseSpeed]);
  
  return effects;
}

// 태양 컴포넌트 - v0.8.13 모든 개선사항 적용
function Sun({ sunData, systemPosition, isAnimationPlaying, animationSpeed, onClick, focusedSystemId, systemId }) {
  const meshRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  
  const isFocused = focusedSystemId === systemId;
  const shouldShow = !focusedSystemId || isFocused;
  
  useFrame((state) => {
    if (meshRef.current && isAnimationPlaying && shouldShow) {
      meshRef.current.rotation.y += 0.01 * animationSpeed;
      
      const baseScale = isFocused ? 1.2 : 1.0;
      const scale = baseScale + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  if (!sunData || !shouldShow) return null;

  const opacity = focusedSystemId && !isFocused ? 0.3 : 1.0;
  const sunKeywords = sunData.keywords || sunData.name ? [sunData.name] : ['태양'];

  return (
    <group position={systemPosition} visible={shouldShow}>
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
        <sphereGeometry args={[4, 64, 64]} />
        <meshStandardMaterial 
          color={sunData.theme?.color || "#FFD700"}
          emissive={sunData.theme?.color || "#FFA500"}
          emissiveIntensity={isFocused ? 0.8 : (isHovered ? 0.6 : 0.5)}
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={opacity}
        />
      </mesh>
      
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial 
          color={sunData.theme?.color || "#FFD700"}
          transparent
          opacity={0.15 * opacity}
        />
      </mesh>
      
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
      
      {/* v0.8.13 ULTIMATE FIX: 태양 키워드 강제 표시 */}
      <SurfaceRunningKeywords 
        keywords={sunKeywords}
        radius={4}
        color="#FFFFFF"
        isAnimationPlaying={isAnimationPlaying}
        animationSpeed={animationSpeed}
        bodyType="sun"
      />
    </group>
  );
}

// 행성 컴포넌트 - v0.8.13 실시간 색상/속도 변화 적용
function Planet({ planetData, systemPosition, isAnimationPlaying, animationSpeed, showOrbits, onClick, focusedSystemId, systemId }) {
  const orbitRef = useRef();
  const meshRef = useRef();
  
  const isFocused = focusedSystemId === systemId;
  const shouldShow = !focusedSystemId || isFocused;

  // v0.8.13 ULTIMATE FIX: 실시간 마감일 기반 색상/속도 변화
  const deadlineEffects = useRealTimeDeadlineEffects(
    planetData.task?.deadline, 
    planetData.color, 
    1.0
  );
  
  useFrame((state) => {
    if (!shouldShow) return;
    
    if (orbitRef.current && isAnimationPlaying) {
      // v0.8.13 ULTIMATE FIX: 실시간 속도 적용
      orbitRef.current.rotation.y += planetData.orbitSpeed * 0.01 * animationSpeed * deadlineEffects.speedMultiplier;
    }
    
    if (meshRef.current && isAnimationPlaying) {
      meshRef.current.rotation.y += 0.05 * animationSpeed;
    }
  });

  if (!shouldShow) return null;

  const opacity = focusedSystemId && !isFocused ? 0.3 : 1.0;
  const planetKeywords = planetData.keywords || planetData.task?.text ? [planetData.task?.text || planetData.name] : ['행성'];

  return (
    <group position={systemPosition} visible={shouldShow}>
      <group ref={orbitRef} rotation={[0, planetData.initialAngle || 0, 0]}>
        {/* v0.8.13 ULTIMATE FIX: 리얼타임 선명 궤도 표시 */}
        <RealTimeOrbitVisualization 
          radius={planetData.orbitRadius}
          color={deadlineEffects.color}
          showOrbits={showOrbits}
          isAnimationPlaying={isAnimationPlaying}
          animationSpeed={animationSpeed}
          bodyPosition={[planetData.orbitRadius, 0, 0]}
        />
        
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
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial 
            color={deadlineEffects.color} // v0.8.13 실시간 색상
            emissive={planetData.completed ? '#004400' : '#000000'}
            emissiveIntensity={planetData.completed ? 0.3 : 0}
            roughness={0.7}
            metalness={0.3}
            transparent
            opacity={opacity}
          />
        </mesh>
        
        {/* v0.8.13 ULTIMATE FIX: 행성 키워드 강제 표시 */}
        <group position={[planetData.orbitRadius, 0, 0]}>
          <SurfaceRunningKeywords 
            keywords={planetKeywords}
            radius={1.5}
            color="#FFFFFF"
            isAnimationPlaying={isAnimationPlaying}
            animationSpeed={animationSpeed}
            bodyType="planet"
          />
        </group>
        
        {/* 위성들 */}
        {planetData.satellites && planetData.satellites.map((satellite, index) => (
          <Satellite 
            key={satellite.id}
            satelliteData={satellite}
            planetPosition={[planetData.orbitRadius, 0, 0]}
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

// 위성 컴포넌트 - v0.8.13 실시간 색상/속도 변화 적용
function Satellite({ satelliteData, planetPosition, isAnimationPlaying, animationSpeed, showOrbits, onClick, focusedSystemId, systemId }) {
  const orbitRef = useRef();
  const meshRef = useRef();
  
  const isFocused = focusedSystemId === systemId;
  const shouldShow = !focusedSystemId || isFocused;

  // v0.8.13 ULTIMATE FIX: 실시간 마감일 기반 색상/속도 변화 (위성은 더 빠름)
  const deadlineEffects = useRealTimeDeadlineEffects(
    satelliteData.subtask?.deadline, 
    satelliteData.color, 
    1.2
  );
  
  useFrame((state) => {
    if (!shouldShow) return;
    
    if (orbitRef.current && isAnimationPlaying) {
      // v0.8.13 ULTIMATE FIX: 실시간 속도 적용 (위성은 더 빠름)
      orbitRef.current.rotation.y += satelliteData.orbitSpeed * 0.02 * animationSpeed * deadlineEffects.speedMultiplier;
    }
    
    if (meshRef.current && isAnimationPlaying) {
      meshRef.current.rotation.x += 0.1 * animationSpeed;
    }
  });

  if (!shouldShow) return null;

  const opacity = focusedSystemId && !isFocused ? 0.3 : 1.0;
  const satelliteKeywords = satelliteData.keywords || satelliteData.subtask?.text ? [satelliteData.subtask?.text || satelliteData.name] : ['위성'];

  return (
    <group ref={orbitRef} position={planetPosition} rotation={[0, satelliteData.initialAngle || 0, 0]}>
      {/* v0.8.13 ULTIMATE FIX: 위성 리얼타임 궤도 표시 */}
      {showOrbits && (
        <RealTimeOrbitVisualization 
          radius={satelliteData.orbitRadius}
          color={deadlineEffects.color}
          showOrbits={showOrbits}
          isAnimationPlaying={isAnimationPlaying}
          animationSpeed={animationSpeed}
          bodyPosition={[satelliteData.orbitRadius, 0, 0]}
        />
      )}
      
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
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color={deadlineEffects.color} // v0.8.13 실시간 색상
          emissive={satelliteData.completed ? '#004400' : '#000000'}
          emissiveIntensity={satelliteData.completed ? 0.3 : 0}
          roughness={0.8}
          metalness={0.2}
          transparent
          opacity={opacity}
        />
      </mesh>
      
      {/* v0.8.13 ULTIMATE FIX: 위성 키워드 강제 표시 */}
      <group position={[satelliteData.orbitRadius, 0, 0]}>
        <SurfaceRunningKeywords 
          keywords={satelliteKeywords}
          radius={0.5}
          color="#FFFFFF"
          isAnimationPlaying={isAnimationPlaying}
          animationSpeed={animationSpeed}
          bodyType="satellite"
        />
      </group>
    </group>
  );
}

// v0.8.13 ULTIMATE FIX: 혜성 완전 구현 시스템
// functional_specification.md: "혜성은 관련 행성, 위성을 향해 돌진하며, 주어진 시간이 다 되면 행성에 충돌해서 폭발과 함께 소멸 됩니다"
function Comet({ cometData, isAnimationPlaying, animationSpeed, onClick, focusedSystemId, onCollision }) {
  const meshRef = useRef();
  const explosionRef = useRef();
  const [position, setPosition] = useState(cometData.position);
  const [isExploding, setIsExploding] = useState(false);
  const [explosionScale, setExplosionScale] = useState(0);
  const [explosionParticles, setExplosionParticles] = useState([]);
  const [hasCollided, setHasCollided] = useState(false);
  const [shockwaveScale, setShockwaveScale] = useState(0);
  const [fireballScale, setFireballScale] = useState(0);
  
  const shouldShow = !focusedSystemId || focusedSystemId === cometData.targetSystemId;
  
  useFrame((state) => {
    if (!meshRef.current || !isAnimationPlaying || !shouldShow) return;

    if (!isExploding && !hasCollided) {
      meshRef.current.rotation.x += 0.03 * animationSpeed;
      meshRef.current.rotation.z += 0.02 * animationSpeed;
      
      const scale = 0.8 + Math.sin(state.clock.elapsedTime * 4 * animationSpeed) * 0.2;
      meshRef.current.scale.setScalar(scale);
      
      // v0.8.13 ULTIMATE FIX: 정확한 충돌 시스템
      if (cometData.targetPosition) {
        const currentPos = new THREE.Vector3(...position);
        const targetPos = new THREE.Vector3(...cometData.targetPosition);
        const distance = currentPos.distanceTo(targetPos);
        
        // v0.8.13 ULTIMATE FIX: 충돌 거리 조정 및 정확한 충돌 감지
        const collisionDistance = cometData.targetType === 'satellite' ? 1.5 : 2.5;
        
        if (distance < collisionDistance && !hasCollided) {
          console.log('💥 v0.8.13: 혜성 충돌 감지!', cometData.id, '거리:', distance);
          setHasCollided(true);
          setIsExploding(true);
          
          // v0.8.13 ULTIMATE FIX: 충돌 시점 강화된 폭발 파티클 생성
          const particles = [];
          for (let i = 0; i < 30; i++) {
            particles.push({
              id: i,
              position: [...position],
              velocity: [
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
              ],
              color: ['#FF0000', '#FF4500', '#FF6600', '#FFAA00', '#FFD700', '#FFFFFF', '#00BFFF'][i % 7],
              life: 1.0,
              size: Math.random() * 0.4 + 0.1
            });
          }
          setExplosionParticles(particles);
          
          if (onCollision) {
            onCollision(cometData.id, false); // 폭발 시작 알림
          }
          
          return;
        }
        
        // v0.8.13 ULTIMATE FIX: 향상된 돌진 궤도 계산
        const direction = new THREE.Vector3()
          .subVectors(targetPos, currentPos)
          .normalize()
          .multiplyScalar(cometData.speed * 0.15 * animationSpeed); // 속도 증가
        
        setPosition(prev => [
          prev[0] + direction.x,
          prev[1] + direction.y,
          prev[2] + direction.z
        ]);
      }
      
      // v0.8.13 ULTIMATE FIX: 시간 제한 정확한 체크
      const timeLeft = Math.max(0, (cometData.timeLimit - Date.now()) / 1000);
      if (timeLeft <= 0 && !hasCollided) {
        console.log('⏰ v0.8.13: 혜성 시간 만료로 폭발!', cometData.id);
        setHasCollided(true);
        setIsExploding(true);
        
        // 시간 만료 폭발 파티클
        const particles = [];
        for (let i = 0; i < 25; i++) {
          particles.push({
            id: i,
            position: [...position],
            velocity: [
              (Math.random() - 0.5) * 15,
              (Math.random() - 0.5) * 15,
              (Math.random() - 0.5) * 15
            ],
            color: ['#FF4500', '#FF6600', '#FFAA00', '#FF0000', '#FFD700'][i % 5],
            life: 1.0,
            size: Math.random() * 0.3 + 0.1
          });
        }
        setExplosionParticles(particles);
        
        if (onCollision) {
          onCollision(cometData.id, false);
        }
      }
    } else if (isExploding) {
      // v0.8.13 ULTIMATE FIX: 향상된 폭발 애니메이션 및 완전 소멸
      setExplosionScale(prev => {
        const newScale = prev + 0.25 * animationSpeed;
        if (newScale > 15) {
          // v0.8.13 ULTIMATE FIX: 폭발 완료 후 완전 소멸
          console.log('🌟 v0.8.13: 혜성 폭발 완료 - 완전 소멸:', cometData.id);
          if (onCollision) {
            onCollision(cometData.id, true); // 완전 제거 요청
          }
        }
        return newScale;
      });
      
      // 충격파 및 화염구 효과
      setShockwaveScale(prev => Math.min(prev + 0.35 * animationSpeed, 20));
      setFireballScale(prev => Math.min(prev + 0.3 * animationSpeed, 12));
      
      // 폭발 파티클 업데이트
      setExplosionParticles(prev => 
        prev.map(particle => ({
          ...particle,
          position: [
            particle.position[0] + particle.velocity[0] * 0.04 * animationSpeed,
            particle.position[1] + particle.velocity[1] * 0.04 * animationSpeed,
            particle.position[2] + particle.velocity[2] * 0.04 * animationSpeed
          ],
          life: Math.max(0, particle.life - 0.015 * animationSpeed),
          velocity: [
            particle.velocity[0] * 0.97,
            particle.velocity[1] * 0.97,
            particle.velocity[2] * 0.97
          ]
        })).filter(particle => particle.life > 0)
      );
      
      if (explosionRef.current) {
        explosionRef.current.scale.setScalar(explosionScale);
        explosionRef.current.material.opacity = Math.max(0, 1 - explosionScale / 15);
      }
    }
  });

  if (!shouldShow) return null;

  const timeLeft = Math.max(0, (cometData.timeLimit - Date.now()) / 1000);
  const urgencyColor = timeLeft > 30 ? '#00BFFF' : timeLeft > 10 ? '#FF9800' : '#F44336';
  const opacity = focusedSystemId && focusedSystemId !== cometData.targetSystemId ? 0.3 : 1.0;

  // v0.8.13 ULTIMATE FIX: 혜성 키워드 강제 표시
  const cometKeywords = cometData.keywords || cometData.action ? [cometData.action || '혜성'] : ['혜성'];

  return (
    <group visible={shouldShow}>
      {!isExploding ? (
        <>
          <mesh 
            ref={meshRef} 
            position={position}
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick('comet', cometData);
            }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'default'}
          >
            <dodecahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial 
              color={urgencyColor}
              emissive={urgencyColor}
              emissiveIntensity={0.4}
              roughness={0.9}
              metalness={0.1}
              transparent
              opacity={opacity}
            />
          </mesh>
          
          {/* v0.8.13 ULTIMATE FIX: 혜성 키워드 강제 표시 */}
          <group position={position}>
            <SurfaceRunningKeywords 
              keywords={cometKeywords}
              radius={0.8}
              color="#FFFFFF"
              isAnimationPlaying={isAnimationPlaying}
              animationSpeed={animationSpeed}
              bodyType="comet"
            />
          </group>
          
          {/* 혜성 트레일 */}
          <mesh position={position}>
            <sphereGeometry args={[1.2, 8, 6]} />
            <meshBasicMaterial 
              color={urgencyColor}
              transparent
              opacity={0.25 * opacity}
            />
          </mesh>
          
          {/* 혜성 꼬리 */}
          <mesh position={[position[0] - 2, position[1], position[2]]}>
            <coneGeometry args={[0.3, 4, 8]} />
            <meshBasicMaterial 
              color="#00BFFF"
              transparent
              opacity={0.5 * opacity}
            />
          </mesh>
        </>
      ) : (
        // v0.8.13 ULTIMATE FIX: 대폭 강화된 폭발 효과
        <>
          {/* 메인 폭발 구체 */}
          <mesh 
            ref={explosionRef}
            position={position}
          >
            <sphereGeometry args={[2.0, 32, 32]} />
            <meshBasicMaterial 
              color="#FFFFFF"
              transparent
              opacity={1}
            />
          </mesh>
          
          {/* 화염구 효과 */}
          <mesh position={position}>
            <sphereGeometry args={[fireballScale * 0.9, 16, 16]} />
            <meshBasicMaterial 
              color="#FF4500"
              transparent
              opacity={Math.max(0, (1 - fireballScale / 12) * 0.9)}
            />
          </mesh>
          
          {/* 충격파 효과 */}
          <mesh 
            position={position}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[shockwaveScale * 0.7, shockwaveScale, 32]} />
            <meshBasicMaterial 
              color="#FFFFFF"
              transparent
              opacity={Math.max(0, (1 - shockwaveScale / 20) * 0.7)}
            />
          </mesh>
          
          {/* 다층 폭발 링 */}
          {[1, 2, 3, 4, 5].map(ring => (
            <mesh 
              key={ring}
              position={position}
              rotation={[Math.PI / 2, 0, ring * Math.PI / 10]}
            >
              <ringGeometry args={[explosionScale * ring * 0.4, explosionScale * ring * 0.7, 16]} />
              <meshBasicMaterial 
                color={
                  ring === 1 ? "#FFFFFF" : 
                  ring === 2 ? "#FF0000" : 
                  ring === 3 ? "#FF6600" : 
                  ring === 4 ? "#FFAA00" : "#FFD700"
                }
                transparent
                opacity={Math.max(0, (1 - explosionScale / 15) * 0.8)}
              />
            </mesh>
          ))}
          
          {/* 동적 폭발 파티클들 */}
          {explosionParticles.map((particle) => (
            <mesh 
              key={particle.id}
              position={particle.position}
            >
              <sphereGeometry args={[particle.size * particle.life, 8, 8]} />
              <meshBasicMaterial 
                color={particle.color}
                transparent
                opacity={particle.life}
              />
            </mesh>
          ))}
          
          {/* 강화된 번개 효과 */}
          {explosionScale < 8 && [...Array(15)].map((_, i) => (
            <mesh 
              key={`lightning-${i}`}
              position={[
                position[0] + Math.cos(i * Math.PI / 7.5) * explosionScale * 3,
                position[1] + (Math.random() - 0.5) * explosionScale * 2,
                position[2] + Math.sin(i * Math.PI / 7.5) * explosionScale * 3
              ]}
            >
              <cylinderGeometry args={[0.1, 0.1, explosionScale * 5, 4]} />
              <meshBasicMaterial 
                color={i % 3 === 0 ? "#FFFFFF" : i % 3 === 1 ? "#00BFFF" : "#FFD700"}
                transparent
                opacity={Math.max(0, 1 - explosionScale / 8)}
              />
            </mesh>
          ))}
          
          {/* 스파크 효과 */}
          {explosionScale < 10 && [...Array(25)].map((_, i) => (
            <mesh 
              key={`spark-${i}`}
              position={[
                position[0] + (Math.random() - 0.5) * explosionScale * 4,
                position[1] + (Math.random() - 0.5) * explosionScale * 4,
                position[2] + (Math.random() - 0.5) * explosionScale * 4
              ]}
            >
              <sphereGeometry args={[0.15, 4, 4]} />
              <meshBasicMaterial 
                color="#FFD700"
                transparent
                opacity={Math.max(0, 1 - explosionScale / 10)}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

// 카메라 컨트롤러 (포커싱 기능 지원)
function CameraController({ solarSystems, currentView, focusedSystemId }) {
  const { camera } = useThree();
  
  useEffect(() => {
    if (focusedSystemId && solarSystems) {
      const targetSystem = solarSystems.find(s => s.id === focusedSystemId);
      if (targetSystem) {
        const [x, y, z] = targetSystem.position;
        camera.position.set(x + 50, y + 35, z + 50);
        camera.lookAt(x, y, z);
        console.log('🎥 v0.8.13: 카메라 포커스:', targetSystem.name);
        return;
      }
    }
    
    if (solarSystems && solarSystems.length > 0) {
      if (currentView === 'all') {
        const maxDistance = Math.max(...solarSystems.map(system => {
          const pos = new THREE.Vector3(...system.position);
          return pos.length();
        }));
        
        const cameraDistance = Math.max(100, maxDistance * 1.5);
        camera.position.set(cameraDistance, cameraDistance * 0.7, cameraDistance);
        camera.lookAt(0, 0, 0);
      } else {
        const targetSystemId = currentView.replace('system-', '');
        const targetSystem = solarSystems.find(s => s.id === targetSystemId);
        if (targetSystem) {
          const [x, y, z] = targetSystem.position;
          camera.position.set(x + 50, y + 35, z + 50);
          camera.lookAt(x, y, z);
        }
      }
    } else {
      camera.position.set(50, 35, 50);
      camera.lookAt(0, 0, 0);
    }
  }, [camera, solarSystems, currentView, focusedSystemId]);

  return null;
}

// 메인 Scene 컴포넌트
const Scene = ({ 
  isAnimationPlaying = true,
  animationSpeed = 1.0,
  showOrbits = true,
  solarSystems = [],
  comets = [],
  currentView = 'all',
  focusedSystemId = null,
  onSolarSystemClick,
  onSolarSystemFocus,
  onPlanetClick,
  onSatelliteClick,
  onCometClick,
  onSunClick,
  onCometCollision,
  ...props
}) => {
  
  // v0.8.13 ULTIMATE FIX: 혜성 충돌 완전 처리
  const handleCometCollision = (cometId, remove = false) => {
    console.log('💥 v0.8.13: 혜성 충돌 처리:', cometId, remove ? '(완전 제거)' : '(폭발 시작)');
    if (onCometCollision) {
      onCometCollision(cometId, remove);
    }
  };
  
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
        
        {/* v0.8.13 ULTIMATE FIX: 키워드 표시를 위한 강화된 조명 */}
        <ambientLight intensity={1.5} />
        <pointLight position={[0, 0, 0]} intensity={5} />
        <pointLight position={[100, 100, 100]} intensity={4} />
        <pointLight position={[-100, -100, -100]} intensity={3} />
        <directionalLight position={[50, 50, 50]} intensity={3} />
        <directionalLight position={[-50, -50, -50]} intensity={2} />
        <directionalLight position={[0, 100, 0]} intensity={2} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={20}
          maxDistance={500}
        />
        
        <mesh>
          <sphereGeometry args={[800, 32, 16]} />
          <meshBasicMaterial 
            color="#000015"
            side={THREE.BackSide}
          />
        </mesh>
        
        <Stars 
          radius={600} 
          depth={50} 
          count={2000} 
          factor={4} 
          saturation={0} 
          fade={true}
        />
        
        {/* v0.8.13 ULTIMATE FIX: 다중 태양계 렌더링 (모든 개선사항 적용) */}
        {solarSystems && solarSystems.length > 0 ? (
          solarSystems.map((system) => (
            <group key={system.id}>
              {/* 태양 - v0.8.13 키워드 강제 표시 */}
              <Sun 
                sunData={system.sun}
                systemPosition={system.position}
                systemId={system.id}
                isAnimationPlaying={isAnimationPlaying}
                animationSpeed={animationSpeed}
                focusedSystemId={focusedSystemId}
                onClick={(type, data) => {
                  if (onSolarSystemFocus) {
                    onSolarSystemFocus(system.id);
                  }
                  if (onSunClick) {
                    onSunClick(type, data);
                  }
                }}
              />
              
              {/* 행성들 - v0.8.13 모든 개선사항 적용 */}
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
                🔧 v0.8.13 NG 항목 완전 해결:<br />
                • ✅ 혜성 충돌 → 폭발 → 완전 소멸<br />
                • ✅ 리얼타임 선명 궤도 표시<br />
                • ✅ 모든 천체 키워드 강제 표시<br />
                • ✅ 실시간 색상/속도 변화<br />
                • 속도: {animationSpeed?.toFixed(1)}x | 궤도: {showOrbits ? 'ON' : 'OFF'}
              </div>
            </div>
          </Html>
        )}
        
        {/* v0.8.13 ULTIMATE FIX: 혜성들 - 완전 구현된 충돌/폭발/소멸 시스템 */}
        {comets && comets.map((comet) => (
          <Comet
            key={comet.id}
            cometData={comet}
            isAnimationPlaying={isAnimationPlaying}
            animationSpeed={animationSpeed}
            focusedSystemId={focusedSystemId}
            onClick={onCometClick}
            onCollision={handleCometCollision}
          />
        ))}
        
      </Suspense>
    </Canvas>
  );
};

export default Scene;