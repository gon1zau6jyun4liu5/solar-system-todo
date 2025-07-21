import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Meteor Component - AI Action Suggestions v0.3.1
 * Represents urgent AI suggestions that rush toward relevant todos
 * - Appears when deadlines approach
 * - Targets specific todos/planets/satellites
 * - Collision effects when not handled in time
 * - Trail effects for visual impact
 */
const Meteor = ({
  meteorData,
  targetTodos = [],
  isAnimationPlaying = true,
  onCollision
}) => {
  const meshRef = useRef();
  const trailRef = useRef();
  const [isVisible, setIsVisible] = useState(true);
  const [hasCollided, setHasCollided] = useState(false);

  // Find target todo position
  const targetTodo = targetTodos.find(todo => todo.id === meteorData.targetTodoId);
  const targetPosition = useMemo(() => {
    if (!targetTodo) return [0, 0, 0];
    
    // Calculate approximate position based on todo hierarchy
    if (targetTodo.hierarchyType === 'sun') {
      return [0, 0, 0]; // Sun is at center
    } else if (targetTodo.hierarchyType === 'planet') {
      // Approximate planet orbit position
      const angle = Math.random() * Math.PI * 2;
      const radius = 12 + Math.random() * 16;
      return [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ];
    } else {
      // Satellite position
      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 8;
      return [
        Math.cos(angle) * radius,
        Math.random() * 4 - 2,
        Math.sin(angle) * radius
      ];
    }
  }, [targetTodo]);

  // Meteor properties
  const meteorProps = useMemo(() => {
    const urgencyLevel = meteorData.todoData?.visualProperties?.daysUntilDeadline || 5;
    
    return {
      size: 0.3 + (5 - urgencyLevel) * 0.1, // Larger for more urgent
      speed: meteorData.speed || (0.5 + (5 - urgencyLevel) * 0.2),
      color: urgencyLevel <= 1 ? '#ff0000' : 
             urgencyLevel <= 2 ? '#ff4400' : '#ffaa00',
      glowIntensity: Math.max(0.5, (5 - urgencyLevel) * 0.3)
    };
  }, [meteorData]);

  // Movement towards target
  const position = useRef(new THREE.Vector3(...meteorData.startPosition));
  const targetVec = useRef(new THREE.Vector3(...targetPosition));
  const direction = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!meshRef.current || !isAnimationPlaying || hasCollided) return;

    // Calculate direction to target
    direction.current.subVectors(targetVec.current, position.current).normalize();
    
    // Move towards target
    const moveDistance = meteorProps.speed * delta * 60; // 60fps normalized
    position.current.add(direction.current.multiplyScalar(moveDistance));
    
    // Update mesh position
    meshRef.current.position.copy(position.current);
    
    // Rotation for spinning effect
    meshRef.current.rotation.x += 0.1;
    meshRef.current.rotation.y += 0.15;
    meshRef.current.rotation.z += 0.05;
    
    // Check for collision (within 2 units of target)
    const distanceToTarget = position.current.distanceTo(targetVec.current);
    if (distanceToTarget < 2) {
      handleCollision();
    }
    
    // Check if meteor went too far (cleanup)
    if (distanceToTarget > 200) {
      setIsVisible(false);
    }
    
    // Update trail effect
    if (trailRef.current) {
      trailRef.current.lookAt(direction.current.clone().negate().add(position.current));
    }
  });

  const handleCollision = () => {
    if (!hasCollided) {
      setHasCollided(true);
      onCollision?.(meteorData.id, meteorData.targetTodoId);
      
      // Collision effect - meteor disappears with explosion effect
      setTimeout(() => {
        setIsVisible(false);
      }, 500);
    }
  };

  // Meteor material with glow
  const meteorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: meteorProps.color,
    emissive: meteorProps.color,
    emissiveIntensity: meteorProps.glowIntensity,
    roughness: 0.8,
    metalness: 0.3
  }), [meteorProps.color, meteorProps.glowIntensity]);

  // Trail material
  const trailMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: meteorProps.color,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  }), [meteorProps.color]);

  // Explosion effect on collision
  const explosionMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: hasCollided ? 0.8 : 0,
    side: THREE.DoubleSide
  }), [hasCollided]);

  if (!isVisible) return null;

  return (
    <group>
      {/* Main meteor body */}
      <mesh 
        ref={meshRef}
        material={meteorMaterial}
        position={meteorData.startPosition}
      >
        <sphereGeometry args={[meteorProps.size, 8, 8]} />
      </mesh>

      {/* Meteor trail */}
      <mesh 
        ref={trailRef}
        material={trailMaterial}
        position={meteorData.startPosition}
      >
        <coneGeometry args={[meteorProps.size * 0.5, meteorProps.size * 3, 6]} />
      </mesh>

      {/* Glow effect */}
      <mesh 
        position={meteorData.startPosition}
        material={new THREE.MeshBasicMaterial({
          color: meteorProps.color,
          transparent: true,
          opacity: 0.3,
          side: THREE.BackSide
        })}
      >
        <sphereGeometry args={[meteorProps.size * 1.5, 8, 8]} />
      </mesh>

      {/* Collision explosion effect */}
      {hasCollided && (
        <mesh material={explosionMaterial}>
          <sphereGeometry args={[meteorProps.size * 3, 16, 16]} />
        </mesh>
      )}

      {/* Particle trail points */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={20}
            array={new Float32Array(Array.from({ length: 60 }, () => 
              (Math.random() - 0.5) * meteorProps.size * 4
            ))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          color={meteorProps.color}
          size={0.1}
          transparent
          opacity={0.7}
        />
      </points>

      {/* Warning indicator for target */}
      <group position={targetPosition}>
        <mesh>
          <ringGeometry args={[1, 1.2, 16]} />
          <meshBasicMaterial 
            color="#ff0000"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
};

export default Meteor;