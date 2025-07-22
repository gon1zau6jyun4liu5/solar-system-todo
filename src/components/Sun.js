import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const Sun = ({ animationSpeed = 1.0, todos = [], onClick }) => {
  const meshRef = useRef();

  // 매 프레임마다 호출되어 회전 애니메이션을 만듭니다.
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005 * animationSpeed; // y축 기준으로 회전
    }
  });

  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
    }
  };

  // Todo 개수에 따른 태양 크기 및 밝기 조절
  const getVisualProperties = () => {
    const todoCount = todos.length;
    const pendingCount = todos.filter(todo => !todo.completed).length;
    
    // 기본 크기에서 todo 개수에 따라 조절
    const size = Math.max(1.5, Math.min(3.0, 2 + todoCount * 0.1));
    
    // pending todo가 많을수록 더 밝게
    const emissiveIntensity = Math.max(1.0, Math.min(3.0, 2 + pendingCount * 0.2));
    
    return { size, emissiveIntensity };
  };

  const { size, emissiveIntensity } = getVisualProperties();

  return (
    <mesh 
      ref={meshRef}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (todos.length > 0) {
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial 
        color="yellow" 
        emissive="yellow" 
        emissiveIntensity={emissiveIntensity} 
      />
    </mesh>
  );
};

export default Sun;