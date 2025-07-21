import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Meteor component for AI action suggestions
 * - Appears when AI suggests urgent actions
 * - Moves toward target planet/satellite
 * - Collision effect if not handled in time
 */
const Meteor = ({ 
  targetPosition = [0, 0, 0],
  aiSuggestion = null,
  onCollision = null,
  onInteraction = null,
  isAnimationPlaying = true 
}) => {
  const meshRef = useRef();
  const trailRef = useRef();
  const [position, setPosition] = useState([
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 50 + 25,
    (Math.random() - 0.5) * 100
  ]);
  const [hasCollided, setHasCollided] = useState(false);
  const [lifespan, setLifespan] = useState(30); // 30 seconds to reach target

  // Calculate direction and speed toward target
  const meteorProps = useMemo(() => {
    const direction = new THREE.Vector3(
      targetPosition[0] - position[0],
      targetPosition[1] - position[1],
      targetPosition[2] - position[2]
    ).normalize();
    
    const distance = Math.sqrt(
      Math.pow(targetPosition[0] - position[0], 2) +
      Math.pow(targetPosition[1] - position[1], 2) +
      Math.pow(targetPosition[2] - position[2], 2)
    );
    
    const speed = distance / lifespan; // Reach target in lifespan seconds
    
    return {
      direction,
      speed,
      distance,
      size: 0.3 + Math.random() * 0.2,
      rotationSpeed: 0.1 + Math.random() * 0.1
    };
  }, [position, targetPosition, lifespan]);

  // Animation loop
  useFrame((state, delta) => {
    if (!meshRef.current || !isAnimationPlaying || hasCollided) return;

    // Move toward target
    const moveDistance = meteorProps.speed * delta;
    meshRef.current.position.x += meteorProps.direction.x * moveDistance;
    meshRef.current.position.y += meteorProps.direction.y * moveDistance;
    meshRef.current.position.z += meteorProps.direction.z * moveDistance;

    // Rotation animation
    meshRef.current.rotation.x += meteorProps.rotationSpeed * delta;
    meshRef.current.rotation.y += meteorProps.rotationSpeed * delta * 0.7;
    meshRef.current.rotation.z += meteorProps.rotationSpeed * delta * 0.3;

    // Check collision with target
    const currentDistance = meshRef.current.position.distanceTo(
      new THREE.Vector3(...targetPosition)
    );

    if (currentDistance < 1.0) {
      setHasCollided(true);
      onCollision?.(aiSuggestion);
    }

    // Update trail effect
    if (trailRef.current) {
      const trailOpacity = Math.max(0, 0.8 - (30 - lifespan) / 30);
      trailRef.current.material.opacity = trailOpacity;
    }

    // Countdown lifespan
    setLifespan(prev => Math.max(0, prev - delta));
  });

  // Remove meteor if lifespan expires
  useEffect(() => {
    if (lifespan <= 0 && !hasCollided) {
      onCollision?.(aiSuggestion);
    }
  }, [lifespan, hasCollided, aiSuggestion, onCollision]);

  // Meteor material with glowing effect
  const meteorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ff6600',
    emissive: '#ff3300',
    emissiveIntensity: 0.8,
    roughness: 0.7,
    metalness: 0.3
  }), []);

  // Trail material
  const trailMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ffaa00',
    transparent: true,
    opacity: 0.6,
    side: THREE.BackSide
  }), []);

  if (hasCollided) {
    // Explosion effect
    return (
      <group position={targetPosition}>
        {/* Explosion particles */}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          ]}>
            <sphereGeometry args={[0.1, 4, 4]} />
            <meshBasicMaterial color="#ff3300" transparent opacity={0.8} />
          </mesh>
        ))}
        
        {/* Shockwave */}
        <mesh>
          <ringGeometry args={[0.5, 2, 16]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      {/* Main meteor body */}
      <mesh 
        ref={meshRef}
        position={position}
        material={meteorMaterial}
        onClick={(e) => {
          e.stopPropagation();
          onInteraction?.(aiSuggestion);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[meteorProps.size, 8, 8]} />
      </mesh>

      {/* Glowing trail */}
      <mesh 
        ref={trailRef}
        position={[
          position[0] - meteorProps.direction.x * 2,
          position[1] - meteorProps.direction.y * 2,
          position[2] - meteorProps.direction.z * 2
        ]}
        material={trailMaterial}
      >
        <sphereGeometry args={[meteorProps.size * 1.5, 6, 6]} />
      </mesh>

      {/* Warning indicator */}
      <group position={[
        position[0],
        position[1] + meteorProps.size + 0.5,
        position[2]
      ]}>
        <mesh>
          <planeGeometry args={[1.5, 0.3]} />
          <meshBasicMaterial 
            color="#ff0000" 
            transparent 
            opacity={0.8} 
          />
        </mesh>
      </group>

      {/* Countdown timer */}
      <group position={[
        position[0],
        position[1] - meteorProps.size - 0.5,
        position[2]
      ]}>
        <mesh>
          <planeGeometry args={[1, 0.2]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.7} 
          />
        </mesh>
      </group>
    </group>
  );
};

export default Meteor;