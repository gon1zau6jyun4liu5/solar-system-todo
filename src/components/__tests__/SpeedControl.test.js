import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpeedControl from '../SpeedControl';

describe('SpeedControl', () => {
  const mockOnSpeedChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders speed control with default values', () => {
    render(<SpeedControl animationSpeed={1.0} onSpeedChange={mockOnSpeedChange} />);
    
    expect(screen.getByText('⚡ Animation Speed')).toBeInTheDocument();
    expect(screen.getByText('1.0x Speed')).toBeInTheDocument();
  });

  test('displays correct speed value', () => {
    render(<SpeedControl animationSpeed={2.5} onSpeedChange={mockOnSpeedChange} />);
    
    expect(screen.getByText('2.5x Speed')).toBeInTheDocument();
  });

  test('renders all speed preset buttons', () => {
    render(<SpeedControl animationSpeed={1.0} onSpeedChange={mockOnSpeedChange} />);
    
    expect(screen.getByText('0.1x')).toBeInTheDocument();
    expect(screen.getByText('0.5x')).toBeInTheDocument();
    expect(screen.getByText('1x')).toBeInTheDocument();
    expect(screen.getByText('2x')).toBeInTheDocument();
    expect(screen.getByText('5x')).toBeInTheDocument();
  });

  test('highlights active preset button', () => {
    render(<SpeedControl animationSpeed={2.0} onSpeedChange={mockOnSpeedChange} />);
    
    const activeButton = screen.getByText('2x');
    expect(activeButton).toHaveClass('active');
  });

  test('calls onSpeedChange when slider is moved', () => {
    render(<SpeedControl animationSpeed={1.0} onSpeedChange={mockOnSpeedChange} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '3.5' } });
    
    expect(mockOnSpeedChange).toHaveBeenCalledWith(3.5);
  });

  test('calls onSpeedChange when preset button is clicked', () => {
    render(<SpeedControl animationSpeed={1.0} onSpeedChange={mockOnSpeedChange} />);
    
    const preset5x = screen.getByText('5x');
    fireEvent.click(preset5x);
    
    expect(mockOnSpeedChange).toHaveBeenCalledWith(5.0);
  });

  test('minimizes when minimize button is clicked', () => {
    render(<SpeedControl animationSpeed={1.0} onSpeedChange={mockOnSpeedChange} />);
    
    const minimizeButton = screen.getByText('➖');
    fireEvent.click(minimizeButton);
    
    expect(screen.queryByText('⚡ Animation Speed')).not.toBeInTheDocument();
    expect(screen.getByText('⚡ 1.0x')).toBeInTheDocument();
  });

  test('expands when minimized control is clicked', () => {
    render(<SpeedControl animationSpeed={1.0} onSpeedChange={mockOnSpeedChange} />);
    
    // First minimize
    const minimizeButton = screen.getByText('➖');
    fireEvent.click(minimizeButton);
    
    // Then expand
    const minimizedControl = screen.getByText('⚡ 1.0x');
    fireEvent.click(minimizedControl);
    
    expect(screen.getByText('⚡ Animation Speed')).toBeInTheDocument();
  });

  test('displays info text correctly', () => {
    render(<SpeedControl animationSpeed={1.0} onSpeedChange={mockOnSpeedChange} />);
    
    expect(screen.getByText('Control celestial movement speed')).toBeInTheDocument();
  });

  test('slider has correct min, max, and step attributes', () => {
    render(<SpeedControl animationSpeed={1.0} onSpeedChange={mockOnSpeedChange} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '0.1');
    expect(slider).toHaveAttribute('max', '10.0');
    expect(slider).toHaveAttribute('step', '0.1');
  });

  test('handles edge case speed values correctly', () => {
    const { rerender } = render(
      <SpeedControl animationSpeed={0.1} onSpeedChange={mockOnSpeedChange} />
    );
    
    expect(screen.getByText('0.1x Speed')).toBeInTheDocument();
    
    rerender(<SpeedControl animationSpeed={10.0} onSpeedChange={mockOnSpeedChange} />);
    expect(screen.getByText('10.0x Speed')).toBeInTheDocument();
  });

  test('handles decimal speed values correctly', () => {
    render(<SpeedControl animationSpeed={1.7} onSpeedChange={mockOnSpeedChange} />);
    
    expect(screen.getByText('1.7x Speed')).toBeInTheDocument();
  });

  test('does not highlight any preset for non-preset values', () => {
    render(<SpeedControl animationSpeed={3.7} onSpeedChange={mockOnSpeedChange} />);
    
    const presetButtons = screen.getAllByText(/x$/);
    presetButtons.forEach(button => {
      expect(button).not.toHaveClass('active');
    });
  });

  test('maintains slider value when speed changes', () => {
    const { rerender } = render(
      <SpeedControl animationSpeed={2.5} onSpeedChange={mockOnSpeedChange} />
    );
    
    const slider = screen.getByRole('slider');
    expect(slider.value).toBe('2.5');
    
    rerender(<SpeedControl animationSpeed={4.2} onSpeedChange={mockOnSpeedChange} />);
    expect(slider.value).toBe('4.2');
  });
});