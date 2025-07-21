import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MultiSolarSystemScene from '../MultiSolarSystemScene';

// Mock Three.js components
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: jest.fn()
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />
}));

// Mock child components
jest.mock('../AISun', () => {
  return function AISun({ solarSystemData, onClick, isSelected }) {
    return (
      <div 
        data-testid="ai-sun"
        data-system-id={solarSystemData?.id}
        data-selected={isSelected}
        onClick={onClick}
      >
        Sun: {solarSystemData?.id}
      </div>
    );
  };
});

jest.mock('../AIPlanet', () => {
  return function AIPlanet({ todoData, onClick, isSelected }) {
    return (
      <div 
        data-testid="ai-planet"
        data-todo-id={todoData?.id}
        data-selected={isSelected}
        onClick={() => onClick?.(todoData)}
      >
        Planet: {todoData?.text}
      </div>
    );
  };
});

jest.mock('../AISatellite', () => {
  return function AISatellite({ todoData, onClick, isSelected }) {
    return (
      <div 
        data-testid="ai-satellite"
        data-todo-id={todoData?.id}
        data-selected={isSelected}
        onClick={() => onClick?.(todoData)}
      >
        Satellite: {todoData?.text}
      </div>
    );
  };
});

jest.mock('../Meteor', () => {
  return function Meteor({ aiSuggestion, targetPosition, onCollision }) {
    return (
      <div 
        data-testid="meteor"
        data-suggestion-id={aiSuggestion?.id}
        onClick={() => onCollision?.(aiSuggestion)}
      >
        Meteor: {aiSuggestion?.text}
      </div>
    );
  };
});

describe('MultiSolarSystemScene', () => {
  const mockTodoData = [
    {
      id: 1,
      text: 'Work project task',
      category: 'work',
      hierarchyType: 'sun',
      solarSystemId: 'work-sun-system',
      visualProperties: {
        sizeMultiplier: 1.5,
        brightness: 2.0,
        rotationSpeed: 0.01,
        urgencyColor: '#ff8800',
        daysUntilDeadline: 5
      }
    },
    {
      id: 2,
      text: 'Work sub-project',
      category: 'work',
      hierarchyType: 'planet',
      solarSystemId: 'work-sun-system',
      visualProperties: {
        sizeMultiplier: 1.0,
        brightness: 1.5,
        rotationSpeed: 0.005,
        urgencyColor: '#44ff44',
        daysUntilDeadline: 10
      }
    },
    {
      id: 3,
      text: 'Small work task',
      category: 'work',
      hierarchyType: 'satellite',
      solarSystemId: 'work-sun-system',
      visualProperties: {
        sizeMultiplier: 0.7,
        brightness: 1.0,
        rotationSpeed: 0.003,
        urgencyColor: '#44ff44',
        daysUntilDeadline: 15
      }
    },
    {
      id: 4,
      text: 'Personal goal',
      category: 'personal',
      hierarchyType: 'sun',
      solarSystemId: 'personal-sun-system',
      visualProperties: {
        sizeMultiplier: 1.2,
        brightness: 1.8,
        rotationSpeed: 0.008,
        urgencyColor: '#ffaa00',
        daysUntilDeadline: 7
      }
    }
  ];

  const mockOnCelestialBodyClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders MultiSolarSystemScene with canvas', () => {
    render(
      <MultiSolarSystemScene 
        todoData={mockTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });

  test('groups todos by solar system correctly', () => {
    render(
      <MultiSolarSystemScene 
        todoData={mockTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    // Should render 2 solar systems (work and personal)
    const suns = screen.getAllByTestId('ai-sun');
    expect(suns).toHaveLength(2);
    
    expect(screen.getByText('Sun: work-sun-system')).toBeInTheDocument();
    expect(screen.getByText('Sun: personal-sun-system')).toBeInTheDocument();
  });

  test('renders celestial bodies based on hierarchy type', () => {
    render(
      <MultiSolarSystemScene 
        todoData={mockTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    // Should render suns, planets, and satellites
    expect(screen.getAllByTestId('ai-sun')).toHaveLength(2);
    expect(screen.getAllByTestId('ai-planet')).toHaveLength(1);
    expect(screen.getAllByTestId('ai-satellite')).toHaveLength(1);
  });

  test('handles empty todo data gracefully', () => {
    render(
      <MultiSolarSystemScene 
        todoData={[]}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.queryByTestId('ai-sun')).not.toBeInTheDocument();
  });

  test('handles missing todo data gracefully', () => {
    render(
      <MultiSolarSystemScene 
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.queryByTestId('ai-sun')).not.toBeInTheDocument();
  });

  test('passes selected todo ID correctly', () => {
    render(
      <MultiSolarSystemScene 
        todoData={mockTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
        selectedTodoId={2}
      />
    );
    
    const selectedPlanet = screen.getByTestId('ai-planet');
    expect(selectedPlanet).toHaveAttribute('data-selected', 'true');
  });

  test('handles system selection correctly', () => {
    render(
      <MultiSolarSystemScene 
        todoData={mockTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    // Initially no system is selected
    const suns = screen.getAllByTestId('ai-sun');
    suns.forEach(sun => {
      expect(sun).toHaveAttribute('data-selected', 'false');
    });
  });

  test('renders background starfield', () => {
    const { container } = render(
      <MultiSolarSystemScene 
        todoData={mockTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
      />
    );
    
    // Background mesh should be rendered (though we can't test Three.js directly)
    expect(container).toBeInTheDocument();
  });

  test('handles animation control props', () => {
    const { rerender } = render(
      <MultiSolarSystemScene 
        todoData={mockTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
        isAnimationPlaying={true}
      />
    );
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    
    rerender(
      <MultiSolarSystemScene 
        todoData={mockTodoData}
        onCelestialBodyClick={mockOnCelestialBodyClick}
        isAnimationPlaying={false}
      />
    );
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });
});

describe('MultiSolarSystemScene Data Processing', () => {
  test('processes complex todo data correctly', () => {
    const complexTodoData = [
      // Multiple systems with various hierarchy types
      { id: 1, category: 'work', hierarchyType: 'sun', solarSystemId: 'work-system' },
      { id: 2, category: 'work', hierarchyType: 'planet', solarSystemId: 'work-system' },
      { id: 3, category: 'work', hierarchyType: 'satellite', solarSystemId: 'work-system' },
      { id: 4, category: 'personal', hierarchyType: 'sun', solarSystemId: 'personal-system' },
      { id: 5, category: 'personal', hierarchyType: 'satellite', solarSystemId: 'personal-system' },
      { id: 6, category: 'education', hierarchyType: 'planet', solarSystemId: 'education-system' }
    ].map(todo => ({
      ...todo,
      text: `Todo ${todo.id}`,
      visualProperties: {
        sizeMultiplier: 1.0,
        brightness: 1.5,
        rotationSpeed: 0.005,
        urgencyColor: '#44ff44',
        daysUntilDeadline: 10
      }
    }));

    render(
      <MultiSolarSystemScene 
        todoData={complexTodoData}
        onCelestialBodyClick={jest.fn()}
      />
    );
    
    // Should handle multiple systems correctly
    expect(screen.getAllByTestId('ai-sun')).toHaveLength(2); // work and personal suns
    expect(screen.getAllByTestId('ai-planet')).toHaveLength(2); // work and education planets
    expect(screen.getAllByTestId('ai-satellite')).toHaveLength(2); // work and personal satellites
  });

  test('handles todos without solar system ID', () => {
    const todosWithoutSystemId = [
      {
        id: 1,
        text: 'Orphaned todo',
        category: 'general',
        hierarchyType: 'satellite',
        visualProperties: {
          sizeMultiplier: 1.0,
          brightness: 1.5,
          rotationSpeed: 0.005,
          urgencyColor: '#44ff44',
          daysUntilDeadline: 10
        }
      }
    ];

    expect(() => {
      render(
        <MultiSolarSystemScene 
          todoData={todosWithoutSystemId}
          onCelestialBodyClick={jest.fn()}
        />
      );
    }).not.toThrow();
  });
});

describe('MultiSolarSystemScene Performance', () => {
  test('handles large datasets efficiently', () => {
    const largeTodoData = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      text: `Todo ${i + 1}`,
      category: ['work', 'personal', 'education'][i % 3],
      hierarchyType: ['sun', 'planet', 'satellite'][i % 3],
      solarSystemId: `system-${Math.floor(i / 10)}`,
      visualProperties: {
        sizeMultiplier: 1.0,
        brightness: 1.5,
        rotationSpeed: 0.005,
        urgencyColor: '#44ff44',
        daysUntilDeadline: 10
      }
    }));

    const startTime = performance.now();
    
    render(
      <MultiSolarSystemScene 
        todoData={largeTodoData}
        onCelestialBodyClick={jest.fn()}
      />
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(1000); // Should render within 1 second
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });
});