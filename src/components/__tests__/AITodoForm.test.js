import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AITodoForm from '../AITodoForm';

// Mock the AI classifier
jest.mock('../../utils/aiClassifier', () => ({
  classifyTodoWithAI: jest.fn((text) => ({
    originalText: text,
    category: 'work',
    priority: 'high',
    hierarchyType: 'planet',
    estimatedDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    solarSystemId: 'work-planet-system',
    visualProperties: {
      sizeMultiplier: 1.3,
      brightness: 2.0,
      rotationSpeed: 0.008,
      urgencyColor: '#ff8800',
      daysUntilDeadline: 5
    },
    confidence: 85,
    aiSuggestions: [
      'Consider adding a specific deadline for this high-priority task',
      'This task seems well-defined'
    ]
  }))
}));

describe('AITodoForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders create form with AI enhancement indicators', () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    expect(screen.getByText('🚀 Create AI-Enhanced Mission')).toBeInTheDocument();
    expect(screen.getByText('v0.3.0')).toBeInTheDocument();
  });

  test('renders edit form when todo is provided', () => {
    const todo = {
      text: 'Test todo for editing',
      category: 'work',
      priority: 'high',
      hierarchyType: 'planet'
    };
    
    render(
      <AITodoForm 
        todo={todo}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    expect(screen.getByText('🛠️ Update Mission')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test todo for editing')).toBeInTheDocument();
  });

  test('displays AI auto-select options by default', () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    expect(screen.getByDisplayValue('🤖 Let AI Decide')).toBeInTheDocument();
    expect(screen.getAllByText('🤖 Let AI Decide')).toHaveLength(3); // For category, priority, and hierarchy
  });

  test('shows all category options including AI auto', () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const categorySelect = screen.getByLabelText('Mission Category');
    expect(categorySelect).toBeInTheDocument();
    
    // Check for all category options
    expect(screen.getByText('🤖 Let AI Decide')).toBeInTheDocument();
    expect(screen.getByText('💼 Work')).toBeInTheDocument();
    expect(screen.getByText('🏠 Personal')).toBeInTheDocument();
    expect(screen.getByText('📚 Education')).toBeInTheDocument();
    expect(screen.getByText('💰 Finance')).toBeInTheDocument();
    expect(screen.getByText('🏡 Home')).toBeInTheDocument();
    expect(screen.getByText('⚕️ Health')).toBeInTheDocument();
  });

  test('shows all priority options including AI auto', () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    expect(screen.getByText('🟢 Low Priority')).toBeInTheDocument();
    expect(screen.getByText('🟡 Medium Priority')).toBeInTheDocument();
    expect(screen.getByText('🔴 High Priority')).toBeInTheDocument();
  });

  test('shows all hierarchy type options', () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    expect(screen.getByText('☀️ Sun (Major Goal)')).toBeInTheDocument();
    expect(screen.getByText('🪐 Planet (Project)')).toBeInTheDocument();
    expect(screen.getByText('🛰️ Satellite (Task)')).toBeInTheDocument();
  });

  test('displays AI preview when text is entered', async () => {
    const { classifyTodoWithAI } = require('../../utils/aiClassifier');
    
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const textArea = screen.getByLabelText('Mission Description');
    fireEvent.change(textArea, { target: { value: 'Complete important project' } });
    
    await waitFor(() => {
      expect(classifyTodoWithAI).toHaveBeenCalledWith('Complete important project');
      expect(screen.getByText('🤖 AI Analysis')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('shows AI predictions with correct values', async () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const textArea = screen.getByLabelText('Mission Description');
    fireEvent.change(textArea, { target: { value: 'Important work task' } });
    
    await waitFor(() => {
      expect(screen.getByText('🤖 AI Analysis')).toBeInTheDocument();
      expect(screen.getByText('💼 work')).toBeInTheDocument();
      expect(screen.getByText('HIGH')).toBeInTheDocument();
      expect(screen.getByText('🪐 planet')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });

  test('displays confidence bar correctly', async () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const textArea = screen.getByLabelText('Mission Description');
    fireEvent.change(textArea, { target: { value: 'Test task' } });
    
    await waitFor(() => {
      const confidenceBar = screen.getByText('85%');
      expect(confidenceBar).toBeInTheDocument();
      
      const confidenceFill = document.querySelector('.confidence-fill');
      expect(confidenceFill).toHaveStyle('width: 85%');
    });
  });

  test('shows AI suggestions when available', async () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const textArea = screen.getByLabelText('Mission Description');
    fireEvent.change(textArea, { target: { value: 'Important task' } });
    
    await waitFor(() => {
      expect(screen.getByText('💡 Suggestions:')).toBeInTheDocument();
      expect(screen.getByText('Consider adding a specific deadline for this high-priority task')).toBeInTheDocument();
      expect(screen.getByText('This task seems well-defined')).toBeInTheDocument();
    });
  });

  test('allows applying individual AI suggestions', async () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const textArea = screen.getByLabelText('Mission Description');
    fireEvent.change(textArea, { target: { value: 'Test task' } });
    
    await waitFor(() => {
      const applyButtons = screen.getAllByText('Apply');
      expect(applyButtons.length).toBeGreaterThan(0);
      
      // Click first apply button (category)
      fireEvent.click(applyButtons[0]);
      
      // Should update the category select
      expect(screen.getByDisplayValue('work')).toBeInTheDocument();
    });
  });

  test('allows applying all AI suggestions at once', async () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const textArea = screen.getByLabelText('Mission Description');
    fireEvent.change(textArea, { target: { value: 'Test task' } });
    
    await waitFor(() => {
      const applyAllButton = screen.getByText('🚀 Apply All AI Suggestions');
      fireEvent.click(applyAllButton);
      
      // Should update all selects
      expect(screen.getByDisplayValue('work')).toBeInTheDocument();
      expect(screen.getByDisplayValue('high')).toBeInTheDocument();
      expect(screen.getByDisplayValue('planet')).toBeInTheDocument();
    });
  });

  test('shows character and word count', () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const textArea = screen.getByLabelText('Mission Description');
    fireEvent.change(textArea, { target: { value: 'Test task description' } });
    
    expect(screen.getByText('Characters: 19')).toBeInTheDocument();
    expect(screen.getByText('Words: 3')).toBeInTheDocument();
  });

  test('shows AI processing indicator while analyzing', async () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const textArea = screen.getByLabelText('Mission Description');
    fireEvent.change(textArea, { target: { value: 'Test' } });
    
    // Should show processing indicator briefly
    expect(screen.getByText('AI analyzing your mission...')).toBeInTheDocument();
  });

  test('can toggle AI insights visibility', () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const toggleCheckbox = screen.getByLabelText('Show AI Insights & Suggestions');
    expect(toggleCheckbox).toBeChecked();
    
    fireEvent.click(toggleCheckbox);
    expect(toggleCheckbox).not.toBeChecked();
  });

  test('submits form with correct data including AI fields', async () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const textArea = screen.getByLabelText('Mission Description');
    fireEvent.change(textArea, { target: { value: 'New task' } });
    
    const categorySelect = screen.getByLabelText('Mission Category');
    fireEvent.change(categorySelect, { target: { value: 'work' } });
    
    const submitButton = screen.getByText('🌟 Launch AI Mission');
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      text: 'New task',
      category: 'work',
      priority: 'ai-auto',
      hierarchyType: 'ai-auto'
    });
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('prevents submission with empty text', () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const submitButton = screen.getByText('🌟 Launch AI Mission');
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('applies ai-auto-select class to AI-controlled fields', () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const categorySelect = screen.getByLabelText('Mission Category');
    const prioritySelect = screen.getByLabelText('Priority Level');
    const hierarchySelect = screen.getByLabelText('Celestial Body Type');
    
    expect(categorySelect).toHaveClass('ai-auto-select');
    expect(prioritySelect).toHaveClass('ai-auto-select');
    expect(hierarchySelect).toHaveClass('ai-auto-select');
  });

  test('works in non-AI mode', () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={false}
      />
    );
    
    // Should still render form but without AI features
    expect(screen.getByLabelText('Mission Description')).toBeInTheDocument();
    expect(screen.queryByText('🤖 AI Analysis')).not.toBeInTheDocument();
  });
});

describe('AITodoForm Edge Cases', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles AI classification errors gracefully', async () => {
    const { classifyTodoWithAI } = require('../../utils/aiClassifier');
    classifyTodoWithAI.mockImplementation(() => {
      throw new Error('AI classification failed');
    });
    
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const textArea = screen.getByLabelText('Mission Description');
    
    // Should not crash when AI fails
    expect(() => {
      fireEvent.change(textArea, { target: { value: 'Test task' } });
    }).not.toThrow();
    
    // Should not show AI preview when error occurs
    await waitFor(() => {
      expect(screen.queryByText('🤖 AI Analysis')).not.toBeInTheDocument();
    });
  });

  test('handles very long text input', async () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const longText = 'A'.repeat(1000);
    const textArea = screen.getByLabelText('Mission Description');
    fireEvent.change(textArea, { target: { value: longText } });
    
    expect(screen.getByText('Characters: 1000')).toBeInTheDocument();
    expect(screen.getByText('Words: 1')).toBeInTheDocument();
  });

  test('handles rapid text changes correctly (debouncing)', async () => {
    const { classifyTodoWithAI } = require('../../utils/aiClassifier');
    
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const textArea = screen.getByLabelText('Mission Description');
    
    // Rapidly change text multiple times
    fireEvent.change(textArea, { target: { value: 'T' } });
    fireEvent.change(textArea, { target: { value: 'Te' } });
    fireEvent.change(textArea, { target: { value: 'Tes' } });
    fireEvent.change(textArea, { target: { value: 'Test' } });
    
    // Should debounce and only call AI once after delay
    await waitFor(() => {
      expect(classifyTodoWithAI).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });
  });

  test('clears AI preview when text becomes too short', async () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const textArea = screen.getByLabelText('Mission Description');
    
    // First add longer text
    fireEvent.change(textArea, { target: { value: 'Long enough text' } });
    
    await waitFor(() => {
      expect(screen.getByText('🤖 AI Analysis')).toBeInTheDocument();
    });
    
    // Then make it too short
    fireEvent.change(textArea, { target: { value: 'Hi' } });
    
    await waitFor(() => {
      expect(screen.queryByText('🤖 AI Analysis')).not.toBeInTheDocument();
    });
  });

  test('maintains form state when AI toggle is changed', async () => {
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const textArea = screen.getByLabelText('Mission Description');
    fireEvent.change(textArea, { target: { value: 'Test task' } });
    
    const categorySelect = screen.getByLabelText('Mission Category');
    fireEvent.change(categorySelect, { target: { value: 'work' } });
    
    const toggleCheckbox = screen.getByLabelText('Show AI Insights & Suggestions');
    fireEvent.click(toggleCheckbox);
    
    // Form values should be preserved
    expect(textArea.value).toBe('Test task');
    expect(categorySelect.value).toBe('work');
  });
});

describe('AITodoForm Performance', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders quickly even with AI mode enabled', () => {
    const startTime = performance.now();
    
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(50); // Should render within 50ms
  });

  test('handles frequent updates efficiently', async () => {
    const { classifyTodoWithAI } = require('../../utils/aiClassifier');
    
    render(
      <AITodoForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiMode={true}
      />
    );
    
    const textArea = screen.getByLabelText('Mission Description');
    
    // Simulate fast typing
    const text = 'Fast typing test';
    for (let i = 1; i <= text.length; i++) {
      fireEvent.change(textArea, { target: { value: text.substring(0, i) } });
    }
    
    // Should debounce and not overwhelm the AI classifier
    await waitFor(() => {
      expect(classifyTodoWithAI).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });
  });
});