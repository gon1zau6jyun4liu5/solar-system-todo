import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SolarSystem from '../SolarSystem';

// Mock Planet component
jest.mock('../Planet', () => {
  return function Planet({ name, pendingTasks, isClickable, onClick }) {
    return (
      <div 
        data-testid={`planet-${name}`}
        data-pending-tasks={pendingTasks}
        data-clickable={isClickable}
        onClick={() => onClick && onClick(name)}
      >
        {name} - {pendingTasks} tasks
      </div>
    );
  };
});

// Mock Sun component
jest.mock('../Sun', () => {
  return function Sun() {
    return <div data-testid="sun">Sun Component</div>;
  };
});

describe('SolarSystem Component', () => {
  const mockTodos = [
    {
      id: 1,
      category: 'earth',
      completed: false,
      text: 'Earth mission 1'
    },
    {
      id: 2,
      category: 'mars',
      completed: false,
      text: 'Mars mission 1'
    },
    {
      id: 3,
      category: 'earth',
      completed: true,
      text: 'Earth mission 2 (completed)'
    },
    {
      id: 4,
      category: 'jupiter',
      completed: false,
      text: 'Jupiter mission 1'
    }
  ];

  const mockOnPlanetClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders sun component', () => {
    render(
      <SolarSystem 
        todos={[]} 
        selectedCategory={null} 
        onPlanetClick={mockOnPlanetClick} 
      />
    );
    
    expect(screen.getByTestId('sun')).toBeInTheDocument();
  });

  test('renders all 8 planets', () => {
    render(
      <SolarSystem 
        todos={[]} 
        selectedCategory={null} 
        onPlanetClick={mockOnPlanetClick} 
      />
    );
    
    const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    planets.forEach(planet => {
      expect(screen.getByTestId(`planet-${planet}`)).toBeInTheDocument();
    });
  });

  test('calculates correct pending tasks for each planet', () => {
    render(
      <SolarSystem 
        todos={mockTodos} 
        selectedCategory={null} 
        onPlanetClick={mockOnPlanetClick} 
      />
    );
    
    expect(screen.getByText('earth - 1 tasks')).toBeInTheDocument(); // 1 pending out of 2
    expect(screen.getByText('mars - 1 tasks')).toBeInTheDocument(); // 1 pending
    expect(screen.getByText('jupiter - 1 tasks')).toBeInTheDocument(); // 1 pending
    expect(screen.getByText('mercury - 0 tasks')).toBeInTheDocument(); // no tasks
  });

  test('marks planets as clickable only when they have pending tasks', () => {
    render(
      <SolarSystem 
        todos={mockTodos} 
        selectedCategory={null} 
        onPlanetClick={mockOnPlanetClick} 
      />
    );
    
    // Planets with pending tasks should be clickable
    expect(screen.getByTestId('planet-earth')).toHaveAttribute('data-clickable', 'true');
    expect(screen.getByTestId('planet-mars')).toHaveAttribute('data-clickable', 'true');
    expect(screen.getByTestId('planet-jupiter')).toHaveAttribute('data-clickable', 'true');
    
    // Planets without pending tasks should not be clickable
    expect(screen.getByTestId('planet-mercury')).toHaveAttribute('data-clickable', 'false');
    expect(screen.getByTestId('planet-venus')).toHaveAttribute('data-clickable', 'false');
  });

  test('handles empty todos array', () => {
    render(
      <SolarSystem 
        todos={[]} 
        selectedCategory={null} 
        onPlanetClick={mockOnPlanetClick} 
      />
    );
    
    // All planets should have 0 tasks and be non-clickable
    const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    planets.forEach(planet => {
      expect(screen.getByText(`${planet} - 0 tasks`)).toBeInTheDocument();
      expect(screen.getByTestId(`planet-${planet}`)).toHaveAttribute('data-clickable', 'false');
    });
  });

  test('passes correct props to Planet components', () => {
    render(
      <SolarSystem 
        todos={mockTodos} 
        selectedCategory={null} 
        onPlanetClick={mockOnPlanetClick} 
      />
    );
    
    const earthPlanet = screen.getByTestId('planet-earth');
    expect(earthPlanet).toHaveAttribute('data-pending-tasks', '1');
    expect(earthPlanet).toHaveAttribute('data-clickable', 'true');
  });
});