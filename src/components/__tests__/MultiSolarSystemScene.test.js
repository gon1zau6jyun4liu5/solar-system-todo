import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MultiSolarSystemScene from '../MultiSolarSystemScene';

// Mock Three.js and React Three Fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: jest.fn(),
  useThree: jest.fn(() => ({
    camera: { 
      position: { 
        clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
        set: jest.fn(),
        lerpVectors: jest.fn() 
      } 
    },
    controls: { 
      target: { 
        clone: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
        lerpVectors: jest.fn() 
      },
      update: jest.fn() 
    }
  }))
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: ({ children, ...props }) => (
    <div data-testid="orbit-controls" {...props}>
      {children}
    </div>
  )
}));

// Mock Three.js classes
jest.mock('three', () => ({
  ...jest.requireActual('three'),
  Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
    x, y, z,
    set: jest.fn(),
    add: jest.fn(),
    clone: jest.fn(),
    setScalar: jest.fn()
  })),
  BackSide: 2,
  DoubleSide: 2,
  MeshStandardMaterial: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  LineBasicMaterial: jest.fn(),
  BufferGeometry: jest.fn().mockImplementation(() => ({
    setFromPoints: jest.fn()
  }))
}));

// Mock AI components
jest.mock('../AISun', () => {
  const AISun = React.forwardRef(({ solarSystemData, position, onClick, isSelected, isAnimationPlaying }, ref) => (
    <div 
      data-testid={`ai-sun-${solarSystemData?.id || 'default'}`}
      data-position={JSON.stringify(position)}
      data-selected={isSelected}
      data-animation-playing={isAnimationPlaying}
      onClick={onClick}
      ref={ref}
    >
      AI Sun - {solarSystemData?.todos?.length || 0} todos
    </div>
  ));
  AISun.displayName = 'AISun';
  return AISun;
});

jest.mock('../AIPlanet', () => {
  const AIPlanet = React.forwardRef(({ 
    todoData, 
    sunPosition, 
    orbitRadius, 
    orbitSpeed, 
    onClick, 
    isSelected, 
    isAnimationPlaying 
  }, ref) => (
    <div 
      data-testid={`ai-planet-${todoData.id}`}
      data-sun-position={JSON.stringify(sunPosition)}
      data-orbit-radius={orbitRadius}
      data-orbit-speed={orbitSpeed}
      data-selected={isSelected}
      data-animation-playing={isAnimationPlaying}
      onClick={() => onClick(todoData)}
      ref={ref}
    >
      AI Planet - {todoData.text}
    </div>
  ));
  AIPlanet.displayName = 'AIPlanet';
  return AIPlanet;
});

jest.mock('../AISatellite', () => {
  const AISatellite = React.forwardRef(({ 
    todoData, 
    planetPosition, 
    orbitRadius, 
    orbitSpeed, 
    onClick, 
    isSelected, 
    isAnimationPlaying 
  }, ref) => (
    <div 
      data-testid={`ai-satellite-${todoData.id}`}
      data-planet-position={JSON.stringify(planetPosition)}
      data-orbit-radius={orbitRadius}
      data-orbit-speed={orbitSpeed}
      data-selected={isSelected}
      data-animation-playing={isAnimationPlaying}
      onClick={() => onClick(todoData)}
      ref={ref}
    >
      AI Satellite - {todoData.text}
    </div>
  ));
  AISatellite.displayName = 'AISatellite';
  return AISatellite;
});

describe('MultiSolarSystemScene v0.4.0', () => {
  const mockOnCelestialBodyClick = jest.fn();

  const sampleTodoData = [
    {
      id: 1,
      text: 'Major goal',
      hierarchyType: 'sun',
      category: 'work',
      solarSystemId: 'work-sun-system',
      priority: 'high',
      visualProperties: { 
        daysUntilDeadline: 5,
        rotationSpeed: 0.01,
        sizeMultiplier: 1.5,
        brightness: 2.0,
        urgencyColor: '#ff4444'
      }
    },
    {
      id: 2,
      text: 'Project task',
      hierarchyType: 'planet',
      category: 'work',
      solarSystemId: 'work-planet-system',
      priority: 'medium',
      visualProperties: { 
        daysUntilDeadline: 10,
        rotationSpeed: 0.005,
        sizeMultiplier: 1.0,
        brightness: 1.5,
        urgencyColor: '#ffaa00'
      }
    },
    {
      id: 3,
      text: 'Small task',
      hierarchyType: 'satellite',
      category: 'personal',
      solarSystemId: 'personal-satellite-system',
      priority: 'low',
      visualProperties: { 
        daysUntilDeadline: 15,
        rotationSpeed: 0.002,
        sizeMultiplier: 0.8,
        brightness: 1.0,
        urgencyColor: '#44aa44'
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Canvas and basic scene structure', () => {
    render(
      <MultiSolarSystemScene 
        todoData={[]}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });

  test('creates multiple solar systems from todo data', () => {
    render(
      <MultiSolarSystemScene 
        todoData={sampleTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    // Should create systems based on solarSystemId
    expect(screen.getByTestId('ai-sun-work-sun-system')).toBeInTheDocument();
    expect(screen.getByTestId('ai-planet-2')).toBeInTheDocument();
    expect(screen.getByTestId('ai-satellite-3')).toBeInTheDocument();
  });

  test('groups todos by hierarchy type correctly', () => {
    render(
      <MultiSolarSystemScene 
        todoData={sampleTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    // Check sun component
    const sunComponent = screen.getByTestId('ai-sun-work-sun-system');
    expect(sunComponent).toHaveTextContent('1 todos'); // Sun type todo
    
    // Check planet component
    const planetComponent = screen.getByTestId('ai-planet-2');
    expect(planetComponent).toHaveTextContent('Project task');
    
    // Check satellite component
    const satelliteComponent = screen.getByTestId('ai-satellite-3');
    expect(satelliteComponent).toHaveTextContent('Small task');
  });

  test('passes animation state to celestial bodies', () => {
    render(
      <MultiSolarSystemScene 
        todoData={sampleTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
        isAnimationPlaying={false}
      />
    );
    
    // All celestial bodies should receive animation state
    expect(screen.getByTestId('ai-sun-work-sun-system')).toHaveAttribute('data-animation-playing', 'false');
    expect(screen.getByTestId('ai-planet-2')).toHaveAttribute('data-animation-playing', 'false');
    expect(screen.getByTestId('ai-satellite-3')).toHaveAttribute('data-animation-playing', 'false');
  });

  test('handles celestial body selection correctly', () => {
    render(
      <MultiSolarSystemScene 
        todoData={sampleTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
        selectedTodoId={2}
      />
    );
    
    // Only the selected todo should be marked as selected
    expect(screen.getByTestId('ai-sun-work-sun-system')).toHaveAttribute('data-selected', 'false');
    expect(screen.getByTestId('ai-planet-2')).toHaveAttribute('data-selected', 'true');
    expect(screen.getByTestId('ai-satellite-3')).toHaveAttribute('data-selected', 'false');
  });

  test('calls onCelestialBodyClick when celestial body is clicked', () => {
    render(
      <MultiSolarSystemScene 
        todoData={sampleTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    const planetComponent = screen.getByTestId('ai-planet-2');
    fireEvent.click(planetComponent);
    
    expect(mockOnCelestialBodyClick).toHaveBeenCalledWith(sampleTodoData[1]);
  });

  test('calculates correct orbital parameters for planets', () => {
    render(
      <MultiSolarSystemScene 
        todoData={sampleTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    const planetComponent = screen.getByTestId('ai-planet-2');
    
    // Check orbital parameters
    expect(planetComponent).toHaveAttribute('data-orbit-radius', '12'); // Base radius for first planet
    expect(planetComponent).toHaveAttribute('data-sun-position', '[0,0,0]');
    
    // Orbit speed should be calculated based on index
    const orbitSpeed = parseFloat(planetComponent.getAttribute('data-orbit-speed'));
    expect(orbitSpeed).toBeLessThanOrEqual(0.008); // Base speed or slower
  });

  test('calculates correct orbital parameters for satellites', () => {
    const todoDataWithPlanet = [
      ...sampleTodoData,
      {
        id: 4,
        text: 'Another satellite',
        hierarchyType: 'satellite',
        category: 'work',
        solarSystemId: 'work-planet-system', // Same system as planet
        priority: 'medium',
        visualProperties: { 
          daysUntilDeadline: 8,
          rotationSpeed: 0.008,
          sizeMultiplier: 0.9,
          brightness: 1.2,
          urgencyColor: '#ffaa00'
        }
      }
    ];

    render(
      <MultiSolarSystemScene 
        todoData={todoDataWithPlanet}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    const satelliteComponent = screen.getByTestId('ai-satellite-4');
    
    // Satellite should orbit around planet position
    const planetPosition = JSON.parse(satelliteComponent.getAttribute('data-planet-position'));
    expect(planetPosition).toBeDefined();
    
    // Should have appropriate orbit radius for satellite
    const orbitRadius = parseFloat(satelliteComponent.getAttribute('data-orbit-radius'));
    expect(orbitRadius).toBeGreaterThan(2); // Minimum satellite orbit radius
    expect(orbitRadius).toBeLessThan(5); // Maximum reasonable satellite orbit radius
  });

  test('handles empty todo data gracefully', () => {
    render(
      <MultiSolarSystemScene 
        todoData={[]}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    // Should still render Canvas and controls
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
    
    // Should not crash or show errors
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  test('positions multiple solar systems correctly', () => {
    const multiSystemData = [
      {
        id: 1,
        text: 'Work sun',
        hierarchyType: 'sun',
        solarSystemId: 'work-system',
        category: 'work',
        priority: 'high',
        visualProperties: { daysUntilDeadline: 5, rotationSpeed: 0.01 }
      },
      {
        id: 2,
        text: 'Personal sun',
        hierarchyType: 'sun',
        solarSystemId: 'personal-system',
        category: 'personal',
        priority: 'medium',
        visualProperties: { daysUntilDeadline: 10, rotationSpeed: 0.005 }
      }
    ];

    render(
      <MultiSolarSystemScene 
        todoData={multiSystemData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    // Should render both systems
    expect(screen.getByTestId('ai-sun-work-system')).toBeInTheDocument();
    expect(screen.getByTestId('ai-sun-personal-system')).toBeInTheDocument();
    
    // Systems should have different positions (not overlapping)
    const workSystem = screen.getByTestId('ai-sun-work-system');
    const personalSystem = screen.getByTestId('ai-sun-personal-system');
    
    const workPosition = JSON.parse(workSystem.getAttribute('data-position'));
    const personalPosition = JSON.parse(personalSystem.getAttribute('data-position'));
    
    // Positions should be different
    expect(workPosition).not.toEqual(personalPosition);
  });

  test('handles focused celestial body correctly', () => {
    const focusedBody = {
      type: 'planet',
      id: 2,
      position: [10, 5, 15]
    };

    render(
      <MultiSolarSystemScene 
        todoData={sampleTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
        focusedCelestialBody={focusedBody}
      />
    );
    
    // Scene should render correctly with focused body
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    
    // The focused planet should still be rendered
    expect(screen.getByTestId('ai-planet-2')).toBeInTheDocument();
  });

  test('creates default sun when no sun-type todos exist', () => {
    const dataWithoutSun = sampleTodoData.filter(todo => todo.hierarchyType !== 'sun');

    render(
      <MultiSolarSystemScene 
        todoData={dataWithoutSun}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    // Should create a default sun for the system
    expect(screen.getByTestId('ai-sun-work-planet-system')).toBeInTheDocument();
  });

  test('handles satellites orbiting sun when no planets exist', () => {
    const satelliteOnlyData = [
      {
        id: 1,
        text: 'Orphan satellite',
        hierarchyType: 'satellite',
        category: 'work',
        solarSystemId: 'work-satellite-system',
        priority: 'low',
        visualProperties: { 
          daysUntilDeadline: 20,
          rotationSpeed: 0.001,
          sizeMultiplier: 0.7,
          brightness: 0.8,
          urgencyColor: '#44aa44'
        }
      }
    ];

    render(
      <MultiSolarSystemScene 
        todoData={satelliteOnlyData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    const satelliteComponent = screen.getByTestId('ai-satellite-1');
    
    // Should orbit around sun position [0,0,0] when no planets exist
    const planetPosition = JSON.parse(satelliteComponent.getAttribute('data-planet-position'));
    expect(planetPosition).toEqual([0, 0, 0]);
  });

  test('maintains orbital relationships within systems', () => {
    render(
      <MultiSolarSystemScene 
        todoData={sampleTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    // Sun should be at center of its system
    const sunComponent = screen.getByTestId('ai-sun-work-sun-system');
    const sunPosition = JSON.parse(sunComponent.getAttribute('data-position'));
    expect(sunPosition).toEqual([0, 0, 0]);
    
    // Planet should orbit around sun
    const planetComponent = screen.getByTestId('ai-planet-2');
    const planetSunPosition = JSON.parse(planetComponent.getAttribute('data-sun-position'));
    expect(planetSunPosition).toEqual([0, 0, 0]);
  });
});

describe('MultiSolarSystemScene Performance', () => {
  const mockOnCelestialBodyClick = jest.fn();

  test('handles large number of todos efficiently', () => {
    const largeTodoData = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      text: `Todo ${i + 1}`,
      hierarchyType: ['sun', 'planet', 'satellite'][i % 3],
      category: ['work', 'personal', 'education'][i % 3],
      solarSystemId: `system-${Math.floor(i / 10)}`,
      priority: ['low', 'medium', 'high'][i % 3],
      visualProperties: {
        daysUntilDeadline: Math.floor(Math.random() * 30),
        rotationSpeed: 0.001 + Math.random() * 0.01,
        sizeMultiplier: 0.5 + Math.random() * 1.0,
        brightness: 1.0 + Math.random() * 1.0,
        urgencyColor: '#44aa44'
      }
    }));

    const startTime = performance.now();
    
    render(
      <MultiSolarSystemScene 
        todoData={largeTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within reasonable time (1 second)
    expect(renderTime).toBeLessThan(1000);
    
    // Should still render the canvas
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  test('renders without memory leaks', () => {
    const { unmount } = render(
      <MultiSolarSystemScene 
        todoData={sampleTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    // Should unmount without errors
    expect(() => unmount()).not.toThrow();
  });
});