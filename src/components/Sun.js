import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Sun = () => {
  const meshRef = useRef();

  // 매 프레임마다 호출되어 회전 애니메이션을 만듭니다.
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005; // y축 기준으로 회전
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={2} />
    </mesh>
  );
};

export default Sun;
