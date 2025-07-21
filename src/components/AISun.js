import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Enhanced Sun component with AI-based visual properties
 * - Size based on priority and importance
 * - Rotation speed based on deadline proximity
 * - Color and brightness based on urgency
 */
const AISun = ({ 
  solarSystemData, 
  position = [0, 0, 0],
  onClick,
  isSelected = false 
}) => {
  const meshRef = useRef();
  const glowRef = useRef();

  // Calculate visual properties from AI classification
  const visualProps = useMemo(() => {
    if (!solarSystemData?.todos?.length) return {
      size: 2,
      brightness: 1.5,
      rotationSpeed: 0.005,
      color: '#ffaa00'
    };

    // Aggregate properties from all todos in this solar system
    const todos = solarSystemData.todos;
    const avgPriority = todos.reduce((sum, todo) => {
      const priorityValue = { high: 3, medium: 2, low: 1 }[todo.priority];
      return sum + priorityValue;
    }, 0) / todos.length;

    const minDaysUntilDeadline = Math.min(
      ...todos.map(todo => todo.visualProperties?.daysUntilDeadline || 10)
    );

    // Size calculation (1.5 - 4.0 range)
    const size = 1.5 + (avgPriority / 3) * 2.5;
    
    // Brightness calculation (1.0 - 3.0 range)
    const brightness = 1.0 + (avgPriority / 3) * 2.0;
    
    // Rotation speed (faster when deadline approaches)
    const rotationSpeed = Math.max(0.002, 0.03 / Math.max(1, minDaysUntilDeadline));
    
    // Color based on urgency
    const color = minDaysUntilDeadline <= 3 ? '#ff3333' : 
                  minDaysUntilDeadline <= 7 ? '#ff8800' : '#ffdd00';

    return { size, brightness, rotationSpeed, color };
  }, [solarSystemData]);

  // Rotation animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += visualProps.rotationSpeed;
      
      // Add slight wobble for urgency
      if (visualProps.rotationSpeed > 0.01) {
        meshRef.current.rotation.x = Math.sin(Date.now() * 0.01) * 0.1;
      }
    }
    
    // Glow animation
    if (glowRef.current && visualProps.brightness > 2) {
      const pulseFactor = 1 + Math.sin(Date.now() * 0.005) * 0.2;
      glowRef.current.scale.setScalar(pulseFactor);
    }
  });

  // Enhanced material with more realistic sun properties
  const sunMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: visualProps.color,
    emissive: visualProps.color,
    emissiveIntensity: visualProps.brightness,
    roughness: 0.5,
    metalness: 0.1
  }), [visualProps.color, visualProps.brightness]);

  // Glow effect material
  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: visualProps.color,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide
  }), [visualProps.color]);

  return (
    <group position={position}>
      {/* Main sun body */}
      <mesh 
        ref={meshRef}
        material={sunMaterial}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[visualProps.size, 32, 32]} />
      </mesh>

      {/* Glow effect */}
      <mesh 
        ref={glowRef}
        material={glowMaterial}
        scale={1.2}
      >
        <sphereGeometry args={[visualProps.size, 16, 16]} />
      </mesh>

      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <ringGeometry args={[visualProps.size * 1.5, visualProps.size * 1.7, 32]} />
          <meshBasicMaterial 
            color="#00aaff" 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Tooltip/Info display */}
      {solarSystemData && (
        <group position={[0, visualProps.size + 1, 0]}>
          {/* System name label */}
          <mesh>
            <planeGeometry args={[3, 0.5]} />
            <meshBasicMaterial 
              color="#000000" 
              transparent 
              opacity={0.7} 
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default AISun;