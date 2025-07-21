import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Enhanced AI Sun component v0.3.1
 * - Animation control support
 * - Progress percentage display
 * - Auto-generated suns for solar systems
 * - Enhanced visual effects
 */
const AISun = ({ 
  solarSystemData, 
  position = [0, 0, 0],
  onClick,
  isSelected = false,
  isAnimationPlaying = true,
  progressPercentage = null
}) => {
  const meshRef = useRef();
  const glowRef = useRef();
  const coronaRef = useRef();

  // Calculate visual properties from AI classification
  const visualProps = useMemo(() => {
    if (!solarSystemData?.todos?.length) return {
      size: 2.5,
      brightness: 2.0,
      rotationSpeed: 0.005,
      color: '#ffdd00'
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

    // Size calculation (2.0 - 5.0 range)
    const size = 2.0 + (avgPriority / 3) * 3.0;
    
    // Brightness calculation (1.5 - 4.0 range)
    const brightness = 1.5 + (avgPriority / 3) * 2.5;
    
    // Rotation speed (faster when deadline approaches)
    const baseSpeed = 0.005;
    const rotationSpeed = isAnimationPlaying ? 
      Math.max(0.002, baseSpeed + (0.02 / Math.max(1, minDaysUntilDeadline))) : 0;
    
    // Color based on urgency and system health
    const completionRate = todos.filter(t => t.completed).length / todos.length;
    let color;
    if (minDaysUntilDeadline <= 2) {
      color = '#ff3333'; // Critical red
    } else if (minDaysUntilDeadline <= 5) {
      color = '#ff8800'; // Warning orange
    } else if (completionRate > 0.7) {
      color = '#44ff44'; // Healthy green
    } else {
      color = '#ffdd00'; // Normal yellow
    }

    return { size, brightness, rotationSpeed, color, completionRate };
  }, [solarSystemData, isAnimationPlaying]);

  // Rotation animation with variable speed
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += visualProps.rotationSpeed;
      
      // Add slight wobble for urgency
      if (visualProps.rotationSpeed > 0.01) {
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 1.5) * 0.1;
      }
    }
    
    // Glow animation
    if (glowRef.current && visualProps.brightness > 2.5) {
      const pulseFactor = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
      glowRef.current.scale.setScalar(pulseFactor);
    }

    // Corona animation
    if (coronaRef.current && isAnimationPlaying) {
      coronaRef.current.rotation.y -= visualProps.rotationSpeed * 0.3;
      coronaRef.current.rotation.z += visualProps.rotationSpeed * 0.2;
    }
  });

  // Enhanced material with more realistic sun properties
  const sunMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: visualProps.color,
    emissive: visualProps.color,
    emissiveIntensity: visualProps.brightness,
    roughness: 0.9,
    metalness: 0.1
  }), [visualProps.color, visualProps.brightness]);

  // Glow effect material
  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: visualProps.color,
    transparent: true,
    opacity: 0.4,
    side: THREE.BackSide
  }), [visualProps.color]);

  // Corona effect material
  const coronaMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: visualProps.color,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
  }), [visualProps.color]);

  // Progress display color
  const progressColor = progressPercentage !== null ? 
    (progressPercentage > 50 ? '#44ff44' : 
     progressPercentage > 25 ? '#ffaa00' : '#ff4444') : '#ffffff';

  return (
    <group position={position}>
      {/* Corona effect */}
      <mesh 
        ref={coronaRef}
        material={coronaMaterial}
        scale={1.8}
      >
        <sphereGeometry args={[visualProps.size, 16, 16]} />
      </mesh>

      {/* Outer glow effect */}
      <mesh 
        ref={glowRef}
        material={glowMaterial}
        scale={1.4}
      >
        <sphereGeometry args={[visualProps.size, 16, 16]} />
      </mesh>

      {/* Main sun body */}
      <mesh 
        ref={meshRef}
        material={sunMaterial}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
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

      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <ringGeometry args={[visualProps.size * 1.6, visualProps.size * 1.8, 32]} />
          <meshBasicMaterial 
            color="#00aaff" 
            transparent 
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* System completion indicator rings */}
      {visualProps.completionRate > 0 && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[
              visualProps.size * 1.2, 
              visualProps.size * 1.3, 
              Math.max(8, Math.floor(visualProps.completionRate * 32))
            ]} />
            <meshBasicMaterial 
              color="#44ff44" 
              transparent 
              opacity={visualProps.completionRate}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      {/* Progress percentage display */}
      {progressPercentage !== null && (
        <group position={[0, visualProps.size + 1.5, 0]}>
          <Text
            fontSize={0.6}
            color={progressColor}
            anchorX="center"
            anchorY="middle"
            outlineColor="#000000"
            outlineWidth={0.1}
          >
            {Math.round(progressPercentage)}%
          </Text>
        </group>
      )}

      {/* System info display */}
      {solarSystemData && (
        <group position={[0, visualProps.size + 2.5, 0]}>
          <Text
            fontSize={0.4}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineColor="#000000"
            outlineWidth={0.05}
          >
            {solarSystemData.category.toUpperCase()} SYSTEM
          </Text>
          <Text
            fontSize={0.3}
            color="#cccccc"
            anchorX="center"
            anchorY="middle"
            position={[0, -0.6, 0]}
            outlineColor="#000000"
            outlineWidth={0.05}
          >
            {solarSystemData.totalTodos} todos
          </Text>
        </group>
      )}

      {/* Solar flare effects for high urgency */}
      {visualProps.rotationSpeed > 0.015 && (
        <>
          {[...Array(6)].map((_, i) => (
            <mesh 
              key={i} 
              rotation={[0, 0, (i * Math.PI * 2) / 6]}
              position={[visualProps.size * 1.1, 0, 0]}
            >
              <coneGeometry args={[0.2, visualProps.size * 0.8, 4]} />
              <meshBasicMaterial 
                color={visualProps.color} 
                transparent 
                opacity={0.6}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Ambient light source */}
      <pointLight
        intensity={visualProps.brightness * 0.5}
        color={visualProps.color}
        distance={50}
        decay={2}
      />
    </group>
  );
};

export default AISun;