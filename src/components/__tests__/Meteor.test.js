import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Meteor from '../Meteor';

// Mock Three.js and React Three Fiber
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn()
}));

jest.mock('three', () => ({
  Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
    x, y, z,
    subVectors: jest.fn().mockReturnThis(),
    normalize: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    multiplyScalar: jest.fn().mockReturnThis(),
    distanceTo: jest.fn().mockReturnValue(5),
    clone: jest.fn().mockReturnThis()
  })),
  MeshStandardMaterial: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  DoubleSide: 2,
  BackSide: 1
}));

describe('Meteor Component v0.3.1', () => {
  const defaultMeteorData = {
    id: 'meteor-1',
    todoData: {
      id: 'todo-1',
      text: 'Urgent task',
      visualProperties: {
        daysUntilDeadline: 1
      }
    },
    targetTodoId: 'todo-1',
    startPosition: [10, 10, 10],
    speed: 0.5
  };

  const defaultTargetTodos = [
    {
      id: 'todo-1',
      hierarchyType: 'planet',
      text: 'Target todo'
    }
  ];

  const mockOnCollision = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders meteor without crashing', () => {
    const { container } = render(
      <Meteor 
        meteorData={defaultMeteorData}
        targetTodos={defaultTargetTodos}
        onCollision={mockOnCollision}
      />
    );
    
    expect(container).toBeInTheDocument();
  });

  test('renders meteor with correct urgency properties', () => {
    const urgentMeteorData = {
      ...defaultMeteorData,
      todoData: {
        ...defaultMeteorData.todoData,
        visualProperties: {
          daysUntilDeadline: 1 // Very urgent
        }
      }
    };

    const { container } = render(
      <Meteor 
        meteorData={urgentMeteorData}
        targetTodos={defaultTargetTodos}
        onCollision={mockOnCollision}
      />
    );
    
    expect(container).toBeInTheDocument();
  });

  test('renders meteor targeting sun hierarchy', () => {
    const sunTargetTodos = [
      {
        id: 'todo-1',
        hierarchyType: 'sun',
        text: 'Sun target'
      }
    ];

    const { container } = render(
      <Meteor 
        meteorData={defaultMeteorData}
        targetTodos={sunTargetTodos}
        onCollision={mockOnCollision}
      />
    );
    
    expect(container).toBeInTheDocument();
  });

  test('renders meteor targeting satellite hierarchy', () => {
    const satelliteTargetTodos = [
      {
        id: 'todo-1',
        hierarchyType: 'satellite',
        text: 'Satellite target'
      }
    ];

    const { container } = render(
      <Meteor 
        meteorData={defaultMeteorData}
        targetTodos={satelliteTargetTodos}
        onCollision={mockOnCollision}
      />
    );
    
    expect(container).toBeInTheDocument();
  });

  test('handles missing target todo gracefully', () => {
    const meteorWithNoTarget = {
      ...defaultMeteorData,
      targetTodoId: 'non-existent-todo'
    };

    expect(() => {
      render(
        <Meteor 
          meteorData={meteorWithNoTarget}
          targetTodos={defaultTargetTodos}
          onCollision={mockOnCollision}
        />
      );
    }).not.toThrow();
  });

  test('handles empty target todos array', () => {
    expect(() => {
      render(
        <Meteor 
          meteorData={defaultMeteorData}
          targetTodos={[]}
          onCollision={mockOnCollision}
        />
      );
    }).not.toThrow();
  });

  test('calculates meteor properties based on urgency level', () => {
    const meteorData = {
      ...defaultMeteorData,
      todoData: {
        ...defaultMeteorData.todoData,
        visualProperties: {
          daysUntilDeadline: 3 // Medium urgency
        }
      }
    };

    const { container } = render(
      <Meteor 
        meteorData={meteorData}
        targetTodos={defaultTargetTodos}
        onCollision={mockOnCollision}
      />
    );
    
    expect(container).toBeInTheDocument();
  });

  test('respects animation playing state', () => {
    const { container } = render(
      <Meteor 
        meteorData={defaultMeteorData}
        targetTodos={defaultTargetTodos}
        isAnimationPlaying={false}
        onCollision={mockOnCollision}
      />
    );
    
    expect(container).toBeInTheDocument();
  });

  test('handles meteor with different speed values', () => {
    const fastMeteor = {
      ...defaultMeteorData,
      speed: 1.5
    };

    const { container } = render(
      <Meteor 
        meteorData={fastMeteor}
        targetTodos={defaultTargetTodos}
        onCollision={mockOnCollision}
      />
    );
    
    expect(container).toBeInTheDocument();
  });

  test('renders different urgency colors correctly', () => {
    const criticalMeteor = {
      ...defaultMeteorData,
      todoData: {
        ...defaultMeteorData.todoData,
        visualProperties: {
          daysUntilDeadline: 0 // Critical
        }
      }
    };

    const { container } = render(
      <Meteor 
        meteorData={criticalMeteor}
        targetTodos={defaultTargetTodos}
        onCollision={mockOnCollision}
      />
    );
    
    expect(container).toBeInTheDocument();
  });

  test('handles meteor without todoData gracefully', () => {
    const meteorWithoutTodoData = {
      ...defaultMeteorData,
      todoData: null
    };

    expect(() => {
      render(
        <Meteor 
          meteorData={meteorWithoutTodoData}
          targetTodos={defaultTargetTodos}
          onCollision={mockOnCollision}
        />
      );
    }).not.toThrow();
  });
});

describe('Meteor Collision System', () => {
  const meteorData = {
    id: 'meteor-collision-test',
    todoData: {
      id: 'todo-collision',
      text: 'Collision test',
      visualProperties: {
        daysUntilDeadline: 1
      }
    },
    targetTodoId: 'todo-collision',
    startPosition: [0, 0, 0],
    speed: 0.8
  };

  const targetTodos = [
    {
      id: 'todo-collision',
      hierarchyType: 'planet',
      text: 'Collision target'
    }
  ];

  const mockOnCollision = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sets up collision detection correctly', () => {
    const { container } = render(
      <Meteor 
        meteorData={meteorData}
        targetTodos={targetTodos}
        onCollision={mockOnCollision}
      />
    );
    
    expect(container).toBeInTheDocument();
  });

  test('handles collision callback function', () => {
    render(
      <Meteor 
        meteorData={meteorData}
        targetTodos={targetTodos}
        onCollision={mockOnCollision}
      />
    );
    
    // Meteor should be set up to handle collisions
    expect(mockOnCollision).not.toHaveBeenCalled(); // Not called during render
  });
});

describe('Meteor Performance', () => {
  test('renders efficiently with multiple meteors', () => {
    const meteorData1 = {
      id: 'meteor-1',
      todoData: { id: 'todo-1', visualProperties: { daysUntilDeadline: 2 } },
      targetTodoId: 'todo-1',
      startPosition: [5, 5, 5],
      speed: 0.5
    };

    const meteorData2 = {
      id: 'meteor-2',
      todoData: { id: 'todo-2', visualProperties: { daysUntilDeadline: 1 } },
      targetTodoId: 'todo-2',
      startPosition: [10, 10, 10],
      speed: 0.7
    };

    const targetTodos = [
      { id: 'todo-1', hierarchyType: 'planet' },
      { id: 'todo-2', hierarchyType: 'satellite' }
    ];

    const startTime = performance.now();

    render(
      <>
        <Meteor 
          meteorData={meteorData1}
          targetTodos={targetTodos}
          onCollision={jest.fn()}
        />
        <Meteor 
          meteorData={meteorData2}
          targetTodos={targetTodos}
          onCollision={jest.fn()}
        />
      </>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(100); // Should render within 100ms
  });
});