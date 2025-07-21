import React from 'react';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const Planet = ({ position, size, color, orbitRadius, orbitSpeed, isAnimationPlaying, name }) => {
  const meshRef = useRef();
  const orbitRef = useRef(0);

  useFrame((state) => {
    if (meshRef.current && isAnimationPlaying) {
      // 행성 자전
      meshRef.current.rotation.y += 0.01;
      
      // 궤도 운동
      if (orbitRadius > 0) {
        orbitRef.current += orbitSpeed;
        const x = position[0] + Math.cos(orbitRef.current) * orbitRadius;
        const z = position[2] + Math.sin(orbitRef.current) * orbitRadius;
        meshRef.current.position.set(x, position[1], z);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 16]} />
      <meshStandardMaterial 
        color={color} 
        emissive={name === 'sun' ? color : '#000000'}
        emissiveIntensity={name === 'sun' ? 1.5 : 0}
      />
      {/* 행성 이름 표시 (나중에 구현) */}
    </mesh>
  );
};

export default Planet;