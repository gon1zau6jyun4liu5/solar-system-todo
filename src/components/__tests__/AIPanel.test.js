import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIPanel from '../AIPanel';

describe('AIPanel', () => {
  const mockOnAnimationToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders AIPanel with default open state', () => {
    render(
      <AIPanel 
        onAnimationToggle={mockOnAnimationToggle}
        isAnimationPlaying={true}
      />
    );
    
    expect(screen.getByText('🤖 AI-Powered Todo Universe')).toBeInTheDocument();
    expect(screen.getByText('How it works:')).toBeInTheDocument();
    expect(screen.getByText('Animation Controls:')).toBeInTheDocument();
  });

  test('shows correct animation control button text when playing', () => {
    render(
      <AIPanel 
        onAnimationToggle={mockOnAnimationToggle}
        isAnimationPlaying={true}
      />
    );
    
    expect(screen.getByText('⏸️ Pause Solar System')).toBeInTheDocument();
  });

  test('shows correct animation control button text when paused', () => {
    render(
      <AIPanel 
        onAnimationToggle={mockOnAnimationToggle}
        isAnimationPlaying={false}
      />
    );
    
    expect(screen.getByText('▶️ Play Solar System')).toBeInTheDocument();
  });

  test('calls onAnimationToggle when animation control button is clicked', () => {
    render(
      <AIPanel 
        onAnimationToggle={mockOnAnimationToggle}
        isAnimationPlaying={true}
      />
    );
    
    const animationButton = screen.getByText('⏸️ Pause Solar System');
    fireEvent.click(animationButton);
    
    expect(mockOnAnimationToggle).toHaveBeenCalledTimes(1);
  });

  test('closes panel when close button is clicked', () => {
    render(
      <AIPanel 
        onAnimationToggle={mockOnAnimationToggle}
        isAnimationPlaying={true}
      />
    );
    
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('🤖 AI-Powered Todo Universe')).not.toBeInTheDocument();
    expect(screen.getByText('🤖 Show AI Panel')).toBeInTheDocument();
  });

  test('reopens panel when show panel button is clicked', () => {
    render(
      <AIPanel 
        onAnimationToggle={mockOnAnimationToggle}
        isAnimationPlaying={true}
      />
    );
    
    // Close the panel first
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    // Then reopen it
    const showButton = screen.getByText('🤖 Show AI Panel');
    fireEvent.click(showButton);
    
    expect(screen.getByText('🤖 AI-Powered Todo Universe')).toBeInTheDocument();
    expect(screen.queryByText('🤖 Show AI Panel')).not.toBeInTheDocument();
  });

  test('displays universe statistics correctly', () => {
    render(
      <AIPanel 
        onAnimationToggle={mockOnAnimationToggle}
        isAnimationPlaying={true}
      />
    );
    
    expect(screen.getByText('Active Suns: 3')).toBeInTheDocument();
    expect(screen.getByText('Planets: 8')).toBeInTheDocument();
    expect(screen.getByText('Solar Systems: 2')).toBeInTheDocument();
  });

  test('displays navigation help correctly', () => {
    render(
      <AIPanel 
        onAnimationToggle={mockOnAnimationToggle}
        isAnimationPlaying={true}
      />
    );
    
    expect(screen.getByText('• Drag to explore different solar systems')).toBeInTheDocument();
    expect(screen.getByText('• Scroll to zoom in/out')).toBeInTheDocument();
    expect(screen.getByText('• Right-click + drag to rotate view')).toBeInTheDocument();
  });

  test('applies correct CSS classes based on animation state', () => {
    const { rerender } = render(
      <AIPanel 
        onAnimationToggle={mockOnAnimationToggle}
        isAnimationPlaying={true}
      />
    );
    
    const playingButton = screen.getByText('⏸️ Pause Solar System');
    expect(playingButton).toHaveClass('control-btn', 'playing');
    
    rerender(
      <AIPanel 
        onAnimationToggle={mockOnAnimationToggle}
        isAnimationPlaying={false}
      />
    );
    
    const pausedButton = screen.getByText('▶️ Play Solar System');
    expect(pausedButton).toHaveClass('control-btn', 'paused');
  });
});