import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Text } from '@react-three/drei';
import * as THREE from 'three';

// v0.8.11: ULTIMATE FIX - 키워드 표면 표시 + 소행성 폭발 이펙트
// functional_specification.md: "키워드는 따로 표시되는 것이 아니라 태양계, 행성, 위성의 표면을 시계방향으로 달려가는 식으로 표시됩니다"

// 헬퍼 함수
const hexToRgb = (hex) => {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [255, 215, 0];
};

// v0.8.11 ULTIMATE FIX: 완전한 표면 키워드 시스템 (네모 박스 없음)
// functional_specification.md 요구사항:
// 1. "키워드는 따로 표시되는 것이 아니라 태양계, 행성, 위성의 표면을 시계방향으로 달려가는 식으로 표시됩니다"
// 2. "키워드는 핵심 단어만 간결하게 표시됩니다"
// 3. 네모 박스 완전 제거
function SurfaceRunningKeywords({ keywords, radius, color, isAnimationPlaying, animationSpeed }) {
  const groupRef = useRef();
  
  useFrame(() => {
    if (groupRef.current && isAnimationPlaying) {
      // functional_specification.md: "시계방향으로 달려가는 식으로 표시"
      groupRef.current.rotation.y += 0.03 * animationSpeed;
    }
  });

  if (!keywords || keywords.length === 0) return null;

  // functional_specification.md: "키워드는 핵심 단어만 간결하게 표시됩니다. \"태양계\",\"행성\", \"위성\"이런 단어는 필요 없습니다"
  const filteredKeywords = keywords
    .filter(keyword => !['태양계', '행성', '위성', '소행성', '태스크', '할일', 'task', 'todo', 'project', 'work', 'personal', 'health', 'study', 'general', '프로젝트', '작업', '업무'].includes(keyword))
    .slice(0, 3);

  if (filteredKeywords.length === 0) return null;

  return (
    <group ref={groupRef}>
      {filteredKeywords.map((keyword, index) => {
        const angle = (index / Math.max(filteredKeywords.length, 1)) * Math.PI * 2;
        const x = Math.cos(angle) * (radius + 0.1); // 표면에서 약간 떨어짐
        const z = Math.sin(angle) * (radius + 0.1);
        
        return (
          <Text
            key={`${keyword}-${index}`}
            position={[x, 0, z]}
            rotation={[0, -angle + Math.PI/2, 0]}
            fontSize={radius * 0.2}
            color={color}
            anchorX="center"
            anchorY="middle"
            // v0.8.11 ULTIMATE FIX: 네모 박스 완전 제거
            outlineWidth={0}
            outlineColor="transparent"
            strokeWidth={0}
            strokeColor="transparent"
            fillOpacity={1}
            maxWidth={radius * 3}
            textAlign="center"
            // 3D 효과 제거로 깔끔하게
            bevelEnabled={false}
            bevelSize={0}
            bevelThickness={0}
            // 렌더링 순서 최상위
            renderOrder={2000}
            // 글자 두께 조정
            letterSpacing={0.02}
            lineHeight={1}
          >
            {keyword}
          </Text>
        );
      })}
    </group>
  );
}

// 궤도 컴포넌트 (리얼타임 궤도 표시)
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

// 태양 컴포넌트 (태스크 그룹명) - v0.8.11 표면 키워드만 표시
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
      {/* v0.8.11 태양 입체감 개선 */}
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
      
      {/* 태양 후광 효과 - 더 부드럽게 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial 
          color={sunData.theme?.color || "#FFD700"}
          transparent
          opacity={0.15 * opacity}
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
      
      {/* v0.8.11 ULTIMATE FIX: 태양 표면 시계방향 달려가는 키워드 (네모 박스 없음) */}
      <SurfaceRunningKeywords 
        keywords={sunData.keywords}
        radius={4} // 태양 반지름과 일치
        color="#FFFFFF" // 태양에서는 흰색 키워드로 가독성 확보
        isAnimationPlaying={isAnimationPlaying}
        animationSpeed={animationSpeed}
      />
    </group>
  );
}

// v0.8.11 행성 컴포넌트 - 표면 키워드만 표시 (정보 박스 제거)
function Planet({ planetData, systemPosition, isAnimationPlaying, animationSpeed, showOrbits, onClick, focusedSystemId, systemId }) {
  const orbitRef = useRef();
  const meshRef = useRef();
  
  // 포커스 상태 확인
  const isFocused = focusedSystemId === systemId;
  const shouldShow = !focusedSystemId || isFocused;

  // 종료일 기반 색상 및 공전 속도 계산
  const calculateDeadlineEffects = (deadline) => {
    if (!deadline) return { color: planetData.color, speedMultiplier: 1.0 };
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    let color = planetData.color;
    let speedMultiplier = 1.0;
    
    // functional_specification.md: "종료일이 가까워 질수록 색깔이 변합니다. 공전속도가 빨라집니다"
    if (daysLeft <= 1) {
      color = '#FF0000'; // 빨간색 (긴급)
      speedMultiplier = 3.0; // 매우 빠른 공전
    } else if (daysLeft <= 3) {
      color = '#FF6600'; // 주황색 (경고)
      speedMultiplier = 2.5; // 빠른 공전
    } else if (daysLeft <= 7) {
      color = '#FFAA00'; // 노란색 (주의)
      speedMultiplier = 1.8; // 약간 빠른 공전
    } else {
      color = '#44FF44'; // 초록색 (여유)
      speedMultiplier = 1.0; // 정상 공전
    }
    
    return { color, speedMultiplier };
  };

  const deadlineEffects = calculateDeadlineEffects(planetData.task?.deadline);
  
  useFrame((state) => {
    if (!shouldShow) return;
    
    if (orbitRef.current && isAnimationPlaying) {
      // 태양 주위 공전 (종료일 기반 속도 적용)
      orbitRef.current.rotation.y += planetData.orbitSpeed * 0.01 * animationSpeed * deadlineEffects.speedMultiplier;
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
        {/* 궤도 시각화 */}
        <OrbitVisualization 
          radius={planetData.orbitRadius}
          color={deadlineEffects.color} // 종료일 기반 색상
          showOrbits={showOrbits}
          isAnimationPlaying={isAnimationPlaying}
          animationSpeed={animationSpeed}
        />
        
        {/* v0.8.11 행성 입체감 개선 */}
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
            color={deadlineEffects.color} // 종료일 기반 색상
            emissive={planetData.completed ? '#004400' : '#000000'}
            emissiveIntensity={planetData.completed ? 0.3 : 0}
            roughness={0.7}
            metalness={0.3}
            transparent
            opacity={opacity}
          />
        </mesh>
        
        {/* v0.8.11 ULTIMATE FIX: 행성 표면 시계방향 달려가는 키워드 (네모 박스 없음) */}
        <group position={[planetData.orbitRadius, 0, 0]}>
          <SurfaceRunningKeywords 
            keywords={planetData.keywords}
            radius={1.5} // 행성 반지름과 일치
            color="#FFFFFF" // 흰색으로 가독성 확보
            isAnimationPlaying={isAnimationPlaying}
            animationSpeed={animationSpeed}
          />
        </group>
        
        {/* 위성들이 행성을 공전하도록 수정 */}
        {/* functional_specification.md: "서브 태스크는 부모 태스크를 공전합니다" */}
        {planetData.satellites && planetData.satellites.map((satellite, index) => (
          <Satellite 
            key={satellite.id}
            satelliteData={satellite}
            planetPosition={[planetData.orbitRadius, 0, 0]} // 행성 위치를 전달
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

// v0.8.11 위성 컴포넌트 - 표면 키워드만 표시 (정보 박스 제거)
function Satellite({ satelliteData, planetPosition, isAnimationPlaying, animationSpeed, showOrbits, onClick, focusedSystemId, systemId }) {
  const orbitRef = useRef();
  const meshRef = useRef();
  
  // 포커스 상태 확인
  const isFocused = focusedSystemId === systemId;
  const shouldShow = !focusedSystemId || isFocused;

  // 종료일 기반 색상 및 공전 속도 계산
  const calculateDeadlineEffects = (deadline) => {
    if (!deadline) return { color: satelliteData.color, speedMultiplier: 1.0 };
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    let color = satelliteData.color;
    let speedMultiplier = 1.0;
    
    // functional_specification.md: "종료일이 가까워 질수록 색깔이 변합니다. 공전속도가 빨라집니다"
    if (daysLeft <= 1) {
      color = '#FF0000'; // 빨간색 (긴급)
      speedMultiplier = 3.5; // 위성은 행성보다 더 빠름
    } else if (daysLeft <= 3) {
      color = '#FF6600'; // 주황색 (경고)
      speedMultiplier = 2.8;
    } else if (daysLeft <= 7) {
      color = '#FFAA00'; // 노란색 (주의)
      speedMultiplier = 2.0;
    } else {
      color = '#44FF44'; // 초록색 (여유)
      speedMultiplier = 1.2; // 위성은 기본적으로 행성보다 빠름
    }
    
    return { color, speedMultiplier };
  };

  const deadlineEffects = calculateDeadlineEffects(satelliteData.subtask?.deadline);
  
  useFrame((state) => {
    if (!shouldShow) return;
    
    if (orbitRef.current && isAnimationPlaying) {
      // functional_specification.md: "서브 태스크는 부모 태스크를 공전합니다"
      // 행성(부모 태스크) 주위 공전 (종료일 기반 속도 적용)
      orbitRef.current.rotation.y += satelliteData.orbitSpeed * 0.02 * animationSpeed * deadlineEffects.speedMultiplier;
    }
    
    if (meshRef.current && isAnimationPlaying) {
      // 위성 자전
      meshRef.current.rotation.x += 0.1 * animationSpeed;
    }
  });

  if (!shouldShow) return null;

  const opacity = focusedSystemId && !isFocused ? 0.3 : 1.0;

  return (
    // 행성 위치를 기준으로 공전하도록 수정
    <group ref={orbitRef} position={planetPosition} rotation={[0, satelliteData.initialAngle || 0, 0]}>
      {/* 위성 궤도 시각화 */}
      {showOrbits && (
        <OrbitVisualization 
          radius={satelliteData.orbitRadius}
          color={deadlineEffects.color} // 종료일 기반 색상
          showOrbits={showOrbits}
          isAnimationPlaying={isAnimationPlaying}
          animationSpeed={animationSpeed}
        />
      )}
      
      {/* v0.8.11 위성 입체감 개선 */}
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
          color={deadlineEffects.color} // 종료일 기반 색상
          emissive={satelliteData.completed ? '#004400' : '#000000'}
          emissiveIntensity={satelliteData.completed ? 0.3 : 0}
          roughness={0.8}
          metalness={0.2}
          transparent
          opacity={opacity}
        />
      </mesh>
      
      {/* v0.8.11 ULTIMATE FIX: 위성 표면 시계방향 달려가는 키워드 (네모 박스 없음) */}
      <group position={[satelliteData.orbitRadius, 0, 0]}>
        <SurfaceRunningKeywords 
          keywords={satelliteData.keywords}
          radius={0.5} // 위성 반지름과 일치
          color="#FFFFFF" // 흰색으로 가독성 확보
          isAnimationPlaying={isAnimationPlaying}
          animationSpeed={animationSpeed}
        />
      </group>
    </group>
  );
}

// v0.8.11 소행성 컴포넌트 - 향상된 폭발 이펙트 + 표면 키워드
function Asteroid({ asteroidData, isAnimationPlaying, animationSpeed, onClick, focusedSystemId, onCollision }) {
  const meshRef = useRef();
  const explosionRef = useRef();
  const [position, setPosition] = useState(asteroidData.position);
  const [isExploding, setIsExploding] = useState(false);
  const [explosionScale, setExplosionScale] = useState(0);
  const [explosionParticles, setExplosionParticles] = useState([]);
  
  // 포커스 상태에 따른 표시 여부
  const shouldShow = !focusedSystemId || focusedSystemId === asteroidData.targetSystemId;
  
  useFrame((state) => {
    if (!meshRef.current || !isAnimationPlaying || !shouldShow) return;

    if (!isExploding) {
      // 불규칙한 회전
      meshRef.current.rotation.x += 0.03 * animationSpeed;
      meshRef.current.rotation.z += 0.02 * animationSpeed;
      
      // 맥동 효과
      const scale = 0.8 + Math.sin(state.clock.elapsedTime * 4 * animationSpeed) * 0.2;
      meshRef.current.scale.setScalar(scale);
      
      // functional_specification.md: "소행성은 관련 행성, 위성을 향해 돌진하며"
      if (asteroidData.targetPosition) {
        const currentPos = new THREE.Vector3(...position);
        const targetPos = new THREE.Vector3(...asteroidData.targetPosition);
        const distance = currentPos.distanceTo(targetPos);
        
        // 충돌 거리 체크
        if (distance < 2.0) {
          // functional_specification.md: "주어진 시간이 다 되면 행성에 충돌해서 폭발과 함께 소멸 됩니다"
          setIsExploding(true);
          console.log('💥 소행성 충돌!', asteroidData.id);
          
          // 폭발 파티클 생성
          const particles = [];
          for (let i = 0; i < 15; i++) {
            particles.push({
              id: i,
              position: [...position],
              velocity: [
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
              ],
              color: ['#FF4500', '#FF6600', '#FFAA00', '#FF0000', '#FFD700'][i % 5],
              life: 1.0
            });
          }
          setExplosionParticles(particles);
          
          // 충돌 콜백 호출
          if (onCollision) {
            onCollision(asteroidData.id);
          }
          
          return;
        }
        
        // 목표 방향으로 이동
        const direction = new THREE.Vector3()
          .subVectors(targetPos, currentPos)
          .normalize()
          .multiplyScalar(asteroidData.speed * 0.1 * animationSpeed);
        
        setPosition(prev => [
          prev[0] + direction.x,
          prev[1] + direction.y,
          prev[2] + direction.z
        ]);
      }
      
      // 시간 제한 체크
      const timeLeft = Math.max(0, (asteroidData.timeLimit - Date.now()) / 1000);
      if (timeLeft <= 0) {
        setIsExploding(true);
        console.log('⏰ 소행성 시간 만료로 폭발!', asteroidData.id);
        
        // 폭발 파티클 생성
        const particles = [];
        for (let i = 0; i < 12; i++) {
          particles.push({
            id: i,
            position: [...position],
            velocity: [
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8
            ],
            color: ['#FF4500', '#FF6600', '#FFAA00', '#FF0000'][i % 4],
            life: 1.0
          });
        }
        setExplosionParticles(particles);
        
        if (onCollision) {
          onCollision(asteroidData.id);
        }
      }
    } else {
      // 폭발 애니메이션
      setExplosionScale(prev => {
        const newScale = prev + 0.15 * animationSpeed;
        if (newScale > 8) {
          // 폭발 완료 - 소행성 완전 제거
          setTimeout(() => {
            if (onCollision) {
              onCollision(asteroidData.id, true); // 완전 제거
            }
          }, 100);
        }
        return newScale;
      });
      
      // 폭발 파티클 업데이트
      setExplosionParticles(prev => 
        prev.map(particle => ({
          ...particle,
          position: [
            particle.position[0] + particle.velocity[0] * 0.02 * animationSpeed,
            particle.position[1] + particle.velocity[1] * 0.02 * animationSpeed,
            particle.position[2] + particle.velocity[2] * 0.02 * animationSpeed
          ],
          life: Math.max(0, particle.life - 0.03 * animationSpeed)
        })).filter(particle => particle.life > 0)
      );
      
      if (explosionRef.current) {
        explosionRef.current.scale.setScalar(explosionScale);
        explosionRef.current.material.opacity = Math.max(0, 1 - explosionScale / 8);
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
      {!isExploding ? (
        <>
          {/* v0.8.11 소행성 입체감 개선 */}
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
              roughness={0.9}
              metalness={0.1}
              transparent
              opacity={opacity}
            />
          </mesh>
          
          {/* v0.8.11 ULTIMATE FIX: 소행성 표면 시계방향 달려가는 키워드 (네모 박스 없음) */}
          <group position={position}>
            <SurfaceRunningKeywords 
              keywords={asteroidData.keywords}
              radius={0.8} // 소행성 반지름과 일치
              color="#FFFFFF" // 흰색으로 가독성 확보
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
        </>
      ) : (
        // v0.8.11 향상된 폭발 효과
        <>
          {/* 메인 폭발 구체 */}
          <mesh 
            ref={explosionRef}
            position={position}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial 
              color="#FF4500"
              transparent
              opacity={1}
            />
          </mesh>
          
          {/* 폭발 링 효과 */}
          {[1, 2, 3].map(ring => (
            <mesh 
              key={ring}
              position={position}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[explosionScale * ring * 0.5, explosionScale * ring * 0.7, 16]} />
              <meshBasicMaterial 
                color={ring === 1 ? "#FF0000" : ring === 2 ? "#FF6600" : "#FFAA00"}
                transparent
                opacity={Math.max(0, (1 - explosionScale / 8) * 0.7)}
              />
            </mesh>
          ))}
          
          {/* 동적 폭발 파티클들 */}
          {explosionParticles.map((particle) => (
            <mesh 
              key={particle.id}
              position={particle.position}
            >
              <sphereGeometry args={[0.15 * particle.life, 8, 8]} />
              <meshBasicMaterial 
                color={particle.color}
                transparent
                opacity={particle.life}
              />
            </mesh>
          ))}
          
          {/* 폭발 번개 효과 */}
          {explosionScale < 4 && [...Array(8)].map((_, i) => (
            <mesh 
              key={`lightning-${i}`}
              position={[
                position[0] + Math.cos(i * Math.PI / 4) * explosionScale * 2,
                position[1] + (Math.random() - 0.5) * explosionScale,
                position[2] + Math.sin(i * Math.PI / 4) * explosionScale * 2
              ]}
            >
              <cylinderGeometry args={[0.05, 0.05, explosionScale * 3, 3]} />
              <meshBasicMaterial 
                color="#FFFFFF"
                transparent
                opacity={Math.max(0, 1 - explosionScale / 4)}
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
  animationSpeed = 1.0,
  showOrbits = true,
  solarSystems = [],
  asteroids = [],
  currentView = 'all',
  focusedSystemId = null,
  onSolarSystemClick,
  onSolarSystemFocus,
  onPlanetClick,
  onSatelliteClick,
  onAsteroidClick,
  onSunClick,
  onAsteroidCollision,
  ...props
}) => {
  
  // 소행성 충돌 핸들러
  const handleAsteroidCollision = (asteroidId, remove = false) => {
    console.log('💥 소행성 충돌 처리:', asteroidId, remove ? '(완전 제거)' : '(폭발 시작)');
    if (onAsteroidCollision) {
      onAsteroidCollision(asteroidId, remove);
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
        
        {/* 조명 설정 - v0.8.11 표면 텍스트를 위한 조명 최적화 */}
        <ambientLight intensity={0.8} />
        <pointLight position={[0, 0, 0]} intensity={3} />
        <pointLight position={[100, 100, 100]} intensity={2} />
        <pointLight position={[-100, -100, -100]} intensity={1.5} />
        <directionalLight position={[50, 50, 50]} intensity={1.5} />
        <directionalLight position={[-50, -50, -50]} intensity={1} />
        
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
        
        {/* v0.8.11: 다중 태양계 렌더링 (표면 키워드만 표시) */}
        {solarSystems && solarSystems.length > 0 ? (
          solarSystems.map((system) => (
            <group key={system.id}>
              {/* 태양 (태스크 그룹명) - v0.8.11 표면 키워드만 표시 */}
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
              
              {/* 행성들 (태스크들) - v0.8.11 모든 개선사항 적용 */}
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
                🔧 v0.8.11 키워드 표면 표시 완성:<br />
                • 네모 박스 완전 제거<br />
                • 천체 표면에 직접 키워드 표시<br />
                • 시계방향 달려가기 애니메이션<br />
                • 소행성 폭발 이펙트 향상<br />
                • 속도: {animationSpeed?.toFixed(1)}x | 궤도: {showOrbits ? 'ON' : 'OFF'}
              </div>
            </div>
          </Html>
        )}
        
        {/* v0.8.11: 소행성들 - 향상된 폭발 이펙트 + 표면 키워드 */}
        {asteroids && asteroids.map((asteroid) => (
          <Asteroid
            key={asteroid.id}
            asteroidData={asteroid}
            isAnimationPlaying={isAnimationPlaying}
            animationSpeed={animationSpeed}
            focusedSystemId={focusedSystemId}
            onClick={onAsteroidClick}
            onCollision={handleAsteroidCollision}
          />
        ))}
        
      </Suspense>
    </Canvas>
  );
};

export default Scene;