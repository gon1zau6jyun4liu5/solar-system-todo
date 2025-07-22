import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CelestialPopup from '../CelestialPopup';

describe('CelestialPopup', () => {
  const mockOnClose = jest.fn();
  
  const sampleTodo = {
    id: 1,
    text: 'Test celestial body todo',
    category: 'mars',
    completed: false,
    createdAt: new Date('2025-07-21'),
    priority: 'high',
    deadline: new Date('2025-07-25'),
    hierarchyType: 'planet',
    solarSystemId: 'mars-planet-system',
    visualProperties: {
      sizeMultiplier: 1.5,
      rotationSpeed: 0.008,
      brightness: 2.0,
      daysUntilDeadline: 4
    },
    aiSuggestions: ['Test suggestion 1', 'Test suggestion 2']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders popup with todo information', () => {
    render(<CelestialPopup todo={sampleTodo} onClose={mockOnClose} />);
    
    expect(screen.getByText('Test celestial body todo')).toBeInTheDocument();
    expect(screen.getByText('HIGH Priority')).toBeInTheDocument();
    expect(screen.getByText('Category: mars')).toBeInTheDocument();
  });

  test('displays urgency information for todos with deadlines', () => {
    render(<CelestialPopup todo={sampleTodo} onClose={mockOnClose} />);
    
    expect(screen.getByText('⏰ Deadline Information')).toBeInTheDocument();
    expect(screen.getByText(/Due Date:/)).toBeInTheDocument();
  });

  test('shows celestial classification information', () => {
    render(<CelestialPopup todo={sampleTodo} onClose={mockOnClose} />);
    
    expect(screen.getByText('🌌 Celestial Classification')).toBeInTheDocument();
    expect(screen.getByText('🪐 Planet (Project)')).toBeInTheDocument();
    expect(screen.getByText('mars-planet-system')).toBeInTheDocument();
  });

  test('displays visual properties when available', () => {
    render(<CelestialPopup todo={sampleTodo} onClose={mockOnClose} />);
    
    expect(screen.getByText('Size Multiplier: 1.50')).toBeInTheDocument();
    expect(screen.getByText('Rotation Speed: 0.0080')).toBeInTheDocument();
    expect(screen.getByText('Brightness: 2.00')).toBeInTheDocument();
  });

  test('shows AI suggestions when available', () => {
    render(<CelestialPopup todo={sampleTodo} onClose={mockOnClose} />);
    
    expect(screen.getByText('🤖 AI Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Test suggestion 1')).toBeInTheDocument();
    expect(screen.getByText('Test suggestion 2')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(<CelestialPopup todo={sampleTodo} onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when overlay is clicked', () => {
    render(<CelestialPopup todo={sampleTodo} onClose={mockOnClose} />);
    
    const overlay = document.querySelector('.celestial-popup-overlay');
    fireEvent.click(overlay);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('does not call onClose when popup content is clicked', () => {
    render(<CelestialPopup todo={sampleTodo} onClose={mockOnClose} />);
    
    const popup = document.querySelector('.celestial-popup');
    fireEvent.click(popup);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('handles todos without deadline', () => {
    const todoWithoutDeadline = { ...sampleTodo, deadline: null };
    render(<CelestialPopup todo={todoWithoutDeadline} onClose={mockOnClose} />);
    
    expect(screen.queryByText('⏰ Deadline Information')).not.toBeInTheDocument();
  });

  test('handles completed todos correctly', () => {
    const completedTodo = { ...sampleTodo, completed: true };
    render(<CelestialPopup todo={completedTodo} onClose={mockOnClose} />);
    
    expect(screen.getByText('✅ Completed')).toBeInTheDocument();
  });

  test('handles todos without AI suggestions', () => {
    const todoWithoutSuggestions = { ...sampleTodo, aiSuggestions: [] };
    render(<CelestialPopup todo={todoWithoutSuggestions} onClose={mockOnClose} />);
    
    expect(screen.queryByText('🤖 AI Suggestions')).not.toBeInTheDocument();
  });

  test('displays correct priority colors', () => {
    const { rerender } = render(<CelestialPopup todo={sampleTodo} onClose={mockOnClose} />);
    
    let priorityElement = screen.getByText('HIGH Priority');
    expect(priorityElement.closest('span')).toHaveStyle('border: 1px solid #ff4444');
    
    const mediumTodo = { ...sampleTodo, priority: 'medium' };
    rerender(<CelestialPopup todo={mediumTodo} onClose={mockOnClose} />);
    
    priorityElement = screen.getByText('MEDIUM Priority');
    expect(priorityElement.closest('span')).toHaveStyle('border: 1px solid #ffaa00');
  });

  test('shows overdue status correctly', () => {
    const overdueTodo = {
      ...sampleTodo,
      deadline: new Date('2025-07-20'), // Past date
      createdAt: new Date('2025-07-18')
    };
    
    render(<CelestialPopup todo={overdueTodo} onClose={mockOnClose} />);
    
    expect(screen.getByText('OVERDUE')).toBeInTheDocument();
  });

  test('returns null when no todo is provided', () => {
    const { container } = render(<CelestialPopup todo={null} onClose={mockOnClose} />);
    
    expect(container.firstChild).toBeNull();
  });

  test('handles todos with different hierarchy types', () => {
    const sunTodo = { ...sampleTodo, hierarchyType: 'sun' };
    const { rerender } = render(<CelestialPopup todo={sunTodo} onClose={mockOnClose} />);
    
    expect(screen.getByText('☀️ Sun (Major Goal)')).toBeInTheDocument();
    
    const satelliteTodo = { ...sampleTodo, hierarchyType: 'satellite' };
    rerender(<CelestialPopup todo={satelliteTodo} onClose={mockOnClose} />);
    
    expect(screen.getByText('🛰️ Satellite (Task)')).toBeInTheDocument();
  });

  test('displays correct category icons', () => {
    const earthTodo = { ...sampleTodo, category: 'earth' };
    render(<CelestialPopup todo={earthTodo} onClose={mockOnClose} />);
    
    expect(screen.getByText(/🌍.*Test celestial body todo/)).toBeInTheDocument();
  });
});