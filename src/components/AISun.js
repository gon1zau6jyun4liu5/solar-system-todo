import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Enhanced Sun component with AI-based visual properties and animation control
 * - Size based on priority and importance
 * - Rotation speed based on deadline proximity
 * - Color and brightness based on urgency
 * - Animation pause/play support
 * - Ref forwarding for camera tracking
 */
const AISun = forwardRef(({ 
  solarSystemData, 
  position = [0, 0, 0],
  onClick,
  isSelected = false,
  isAnimationPlaying = true
}, ref) => {
  const meshRef = useRef();
  const glowRef = useRef();
  const groupRef = useRef();

  // Expose position methods for camera tracking
  useImperativeHandle(ref, () => ({
    getWorldPosition: (target) => {
      if (groupRef.current) {
        return groupRef.current.getWorldPosition(target);
      }
      return target.set(...position);
    },
    position: position
  }));

  // Calculate visual properties from AI classification
  const visualProps = useMemo(() => {
    if (!solarSystemData?.todos?.length) return {
      size: 2.5,
      brightness: 1.8,
      rotationSpeed: 0.008,
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

    // Enhanced size calculation (2.0 - 5.0 range for better visibility)
    const size = 2.0 + (avgPriority / 3) * 3.0;
    
    // Enhanced brightness calculation (1.5 - 4.0 range)
    const brightness = 1.5 + (avgPriority / 3) * 2.5;
    
    // Rotation speed (faster when deadline approaches)
    const baseRotationSpeed = Math.max(0.003, 0.04 / Math.max(1, minDaysUntilDeadline));
    
    // Enhanced color based on urgency and system health
    let color = '#ffdd00'; // Default golden
    if (minDaysUntilDeadline <= 1) color = '#ff2222';
    else if (minDaysUntilDeadline <= 3) color = '#ff6600';
    else if (minDaysUntilDeadline <= 7) color = '#ff9900';

    return { 
      size, 
      brightness, 
      rotationSpeed: baseRotationSpeed, 
      color,
      urgencyLevel: minDaysUntilDeadline
    };
  }, [solarSystemData]);

  // Animation with pause/play control
  useFrame((state, delta) => {
    if (!isAnimationPlaying) return;

    if (meshRef.current) {
      meshRef.current.rotation.y += visualProps.rotationSpeed;
      
      // Add slight wobble for urgency (more pronounced)
      if (visualProps.urgencyLevel <= 3) {
        const urgencyIntensity = 1 - (visualProps.urgencyLevel / 3);
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.15 * urgencyIntensity;
        meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 1.5) * 0.1 * urgencyIntensity;
      }
    }
    
    // Enhanced glow animation
    if (glowRef.current) {
      const pulseFactor = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
      glowRef.current.scale.setScalar(pulseFactor);
      
      // Urgent pulsing
      if (visualProps.urgencyLevel <= 3) {
        const urgentPulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
        glowRef.current.scale.setScalar(pulseFactor * urgentPulse);
      }
    }
  });

  // Enhanced material with more realistic sun properties
  const sunMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: visualProps.color,
    emissive: visualProps.color,
    emissiveIntensity: visualProps.brightness,
    roughness: 0.3,
    metalness: 0.0
  }), [visualProps.color, visualProps.brightness]);

  // Enhanced glow effect material
  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: visualProps.color,
    transparent: true,
    opacity: 0.4,
    side: THREE.BackSide
  }), [visualProps.color]);

  // Corona effect material for very urgent suns
  const coronaMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide
  }), []);

  return (
    <group ref={groupRef} position={position}>
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
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[visualProps.size, 48, 48]} />
      </mesh>

      {/* Primary glow effect */}
      <mesh 
        ref={glowRef}
        material={glowMaterial}
        scale={1.3}
      >
        <sphereGeometry args={[visualProps.size, 24, 24]} />
      </mesh>

      {/* Corona effect for urgent suns */}
      {visualProps.urgencyLevel <= 3 && (
        <mesh material={coronaMaterial} scale={1.6}>
          <sphereGeometry args={[visualProps.size, 16, 16]} />
        </mesh>
      )}

      {/* Selection indicator with enhanced styling */}
      {isSelected && (
        <>
          <mesh>
            <ringGeometry args={[visualProps.size * 1.8, visualProps.size * 2.0, 64]} />
            <meshBasicMaterial 
              color="#00aaff" 
              transparent 
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[visualProps.size * 1.8, visualProps.size * 2.0, 64]} />
            <meshBasicMaterial 
              color="#00aaff" 
              transparent 
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      {/* System information display */}
      {solarSystemData && (
        <group position={[0, visualProps.size + 2, 0]}>
          {/* System name background */}
          <mesh>
            <planeGeometry args={[4, 0.8]} />
            <meshBasicMaterial 
              color="#000000" 
              transparent 
              opacity={0.8} 
            />
          </mesh>
          
          {/* System stats indicators */}
          <group position={[0, -1.5, 0]}>
            <mesh>
              <planeGeometry args={[6, 0.6]} />
              <meshBasicMaterial 
                color="#001122" 
                transparent 
                opacity={0.7} 
              />
            </mesh>
          </group>
        </group>
      )}

      {/* Light source from sun */}
      <pointLight 
        position={[0, 0, 0]}
        intensity={visualProps.brightness * 0.5}
        distance={50}
        color={visualProps.color}
        castShadow
      />
    </group>
  );
});

AISun.displayName = 'AISun';

export default AISun;