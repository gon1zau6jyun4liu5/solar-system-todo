import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

const Planet = ({ 
  name, 
  size, 
  color, 
  orbitRadius, 
  orbitSpeed, 
  pendingTasks, 
  isClickable = true, 
  onClick,
  onCelestialClick
}) => {
  const planetRef = useRef();
  const orbitRef = useRef();

  // 궤도 운동 애니메이션
  useFrame((state) => {
    if (planetRef.current) {
      const time = state.clock.getElapsedTime();
      const angle = time * orbitSpeed;
      planetRef.current.position.x = Math.cos(angle) * orbitRadius;
      planetRef.current.position.z = Math.sin(angle) * orbitRadius;
      
      // 행성 자전
      planetRef.current.rotation.y += 0.01;
    }
  });

  // 궤도 선 생성
  const orbitPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push([
        Math.cos(angle) * orbitRadius,
        0,
        Math.sin(angle) * orbitRadius
      ]);
    }
    return points;
  }, [orbitRadius]);

  const handleClick = (event) => {
    event.stopPropagation();
    if (isClickable && onClick) {
      onClick(name);
    }
  };

  const handleCelestialClick = (event) => {
    event.stopPropagation();
    if (onCelestialClick) {
      onCelestialClick(event);
    }
  };

  return (
    <group>
      {/* 궤도 선 */}
      <line ref={orbitRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={orbitPoints.length}
            array={new Float32Array(orbitPoints.flat())}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#444444" transparent opacity={0.3} />
      </line>

      {/* 행성 */}
      <mesh
        ref={planetRef}
        onClick={handleCelestialClick}
        position={[orbitRadius, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (isClickable && pendingTasks > 0) {
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial 
          color={color}
          emissive={isClickable && pendingTasks > 0 ? color : '#000000'}
          emissiveIntensity={isClickable && pendingTasks > 0 ? 0.2 : 0}
        />
        
        {/* 태스크 수 표시 (pending tasks가 있을 때만) */}
        {pendingTasks > 0 && (
          <Text
            position={[0, size + 0.5, 0]}
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            onClick={handleClick}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'default';
            }}
          >
            {pendingTasks}
          </Text>
        )}

        {/* 클릭 가능한 행성의 링 효과 */}
        {isClickable && pendingTasks > 0 && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 1.2, size * 1.3, 32]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.4}
              side={2}
            />
          </mesh>
        )}
      </mesh>
    </group>
  );
};

export default Planet;