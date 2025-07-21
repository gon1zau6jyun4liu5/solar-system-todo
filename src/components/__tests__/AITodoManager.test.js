import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AITodoManager from '../AITodoManager';

// Mock the AI classifier
jest.mock('../../utils/aiClassifier', () => ({
  classifyTodoWithAI: jest.fn((text) => ({
    originalText: text,
    category: 'work',
    priority: 'medium',
    hierarchyType: 'satellite',
    estimatedDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    solarSystemId: 'work-satellite-system',
    visualProperties: {
      sizeMultiplier: 1.0,
      brightness: 1.5,
      rotationSpeed: 0.005,
      urgencyColor: '#44ff44',
      daysUntilDeadline: 7
    },
    confidence: 75,
    aiSuggestions: ['Test suggestion']
  }))
}));

// localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// window.confirm mock
global.confirm = jest.fn(() => true);

describe('AITodoManager', () => {
  const mockOnTodoDataChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders AI-powered todo manager with version indicator', () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    expect(screen.getByText('🤖 AI-Powered Solar System Mission Control v0.3.0')).toBeInTheDocument();
  });

  test('displays AI insights panel when todos exist', async () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    // Wait for initial todos to load
    await waitFor(() => {
      expect(screen.getByText('🧠 AI Insights')).toBeInTheDocument();
    });
  });

  test('shows enhanced statistics with urgency and systems count', async () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Total:/)).toBeInTheDocument();
      expect(screen.getByText(/Urgent:/)).toBeInTheDocument();
      expect(screen.getByText(/Systems:/)).toBeInTheDocument();
    });
  });

  test('displays hierarchy filters for sun, planet, satellite', async () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    await waitFor(() => {
      expect(screen.getByText(/☀️ Suns/)).toBeInTheDocument();
      expect(screen.getByText(/🪐 Planets/)).toBeInTheDocument();
      expect(screen.getByText(/🛰️ Satellites/)).toBeInTheDocument();
    });
  });

  test('shows category filter dropdown', () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
    
    // Check if category options exist
    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.click(categorySelect);
    
    expect(screen.getByText('💼 Work')).toBeInTheDocument();
    expect(screen.getByText('🏠 Personal')).toBeInTheDocument();
    expect(screen.getByText('📚 Education')).toBeInTheDocument();
    expect(screen.getByText('💰 Finance')).toBeInTheDocument();
    expect(screen.getByText('🏡 Home')).toBeInTheDocument();
    expect(screen.getByText('⚕️ Health')).toBeInTheDocument();
  });

  test('opens AI-enhanced todo form when clicking "AI Smart Mission" button', () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    const addButton = screen.getByText('🤖 + AI Smart Mission');
    fireEvent.click(addButton);
    
    expect(screen.getByText('🚀 Create AI-Enhanced Mission')).toBeInTheDocument();
  });

  test('calls onTodoDataChange when todos are loaded', async () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    await waitFor(() => {
      expect(mockOnTodoDataChange).toHaveBeenCalled();
    });
  });

  test('filters todos by hierarchy type correctly', async () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    // Wait for todos to load
    await waitFor(() => {
      const sunFilter = screen.getByText(/☀️ Suns/);
      fireEvent.click(sunFilter);
      
      // Should show only sun-type todos (based on initial data)
      expect(sunFilter).toHaveClass('active');
    });
  });

  test('filters todos by category correctly', async () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    await waitFor(() => {
      const categorySelect = screen.getByDisplayValue('All Categories');
      fireEvent.change(categorySelect, { target: { value: 'work' } });
      
      expect(categorySelect.value).toBe('work');
    });
  });

  test('saves todos to localStorage with AI classification key', async () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ai-solar-system-todos',
        expect.any(String)
      );
    });
  });

  test('loads todos from localStorage if available', () => {
    const savedTodos = JSON.stringify([
      {
        id: 1,
        text: 'Test AI todo',
        category: 'work',
        hierarchyType: 'satellite',
        priority: 'high',
        completed: false,
        visualProperties: {
          daysUntilDeadline: 3,
          rotationSpeed: 0.01,
          sizeMultiplier: 1.5,
          brightness: 2.0,
          urgencyColor: '#ff4444'
        }
      }
    ]);
    localStorageMock.getItem.mockReturnValue(savedTodos);

    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    expect(screen.getByText('Test AI todo')).toBeInTheDocument();
  });

  test('generates AI insights correctly', async () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    await waitFor(() => {
      const insightsPanel = screen.getByText('🧠 AI Insights');
      expect(insightsPanel).toBeInTheDocument();
      
      // Should show productivity trend
      expect(screen.getByText(/completed.*%.*tasks this week/i)).toBeInTheDocument();
    });
  });

  test('handles todo completion with visual property updates', async () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    await waitFor(() => {
      // Find a todo checkbox and click it
      const checkboxes = screen.getAllByLabelText(/Mark as/);
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
        
        // Should update localStorage after state change
        expect(localStorageMock.setItem).toHaveBeenCalled();
      }
    });
  });

  test('shows urgent filter with count', async () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    await waitFor(() => {
      const urgentFilter = screen.getByText(/Urgent/);
      expect(urgentFilter).toBeInTheDocument();
      expect(urgentFilter).toHaveClass('urgent');
    });
  });

  test('displays correct AI insights for different scenarios', async () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    await waitFor(() => {
      // Check for various insight types
      const insights = screen.getAllByText(/📈|⚠️|⚖️/);
      expect(insights.length).toBeGreaterThan(0);
    });
  });
});

describe('AITodoManager AI Integration', () => {
  const mockOnTodoDataChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('creates initial todos with AI classification', async () => {
    const { classifyTodoWithAI } = require('../../utils/aiClassifier');
    
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    await waitFor(() => {
      // Should call AI classifier for initial todos
      expect(classifyTodoWithAI).toHaveBeenCalled();
      expect(mockOnTodoDataChange).toHaveBeenCalled();
    });
  });

  test('re-classifies todos when text is updated', async () => {
    const { classifyTodoWithAI } = require('../../utils/aiClassifier');
    classifyTodoWithAI.mockClear();
    
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    await waitFor(() => {
      // Find and click edit button
      const editButtons = screen.getAllByLabelText('Edit todo');
      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]);
        
        // Should open form for editing
        expect(screen.getByText('🛠️ Update Mission')).toBeInTheDocument();
      }
    });
  });

  test('maintains AI classification data structure', async () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    await waitFor(() => {
      const callArgs = mockOnTodoDataChange.mock.calls;
      if (callArgs.length > 0) {
        const todos = callArgs[callArgs.length - 1][0];
        
        // Check that todos have AI-specific properties
        todos.forEach(todo => {
          expect(todo).toHaveProperty('category');
          expect(todo).toHaveProperty('hierarchyType');
          expect(todo).toHaveProperty('visualProperties');
          expect(todo).toHaveProperty('solarSystemId');
          expect(todo).toHaveProperty('estimatedDeadline');
        });
      }
    });
  });

  test('generates different solar system IDs for different categories', async () => {
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    await waitFor(() => {
      const callArgs = mockOnTodoDataChange.mock.calls;
      if (callArgs.length > 0) {
        const todos = callArgs[callArgs.length - 1][0];
        const systemIds = new Set(todos.map(t => t.solarSystemId));
        
        // Should have multiple solar systems for different categories
        expect(systemIds.size).toBeGreaterThan(1);
      }
    });
  });
});

describe('AITodoManager Error Handling', () => {
  const mockOnTodoDataChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('handles AI classification errors gracefully', async () => {
    const { classifyTodoWithAI } = require('../../utils/aiClassifier');
    classifyTodoWithAI.mockImplementation(() => {
      throw new Error('AI classification failed');
    });
    
    // Should not crash when AI fails
    expect(() => {
      render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    }).not.toThrow();
  });

  test('handles corrupted localStorage data', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    
    expect(() => {
      render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    }).not.toThrow();
  });

  test('handles missing AI properties in saved todos', () => {
    const incompleteTodos = JSON.stringify([
      {
        id: 1,
        text: 'Incomplete todo',
        completed: false
        // Missing AI properties
      }
    ]);
    localStorageMock.getItem.mockReturnValue(incompleteTodos);
    
    expect(() => {
      render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    }).not.toThrow();
  });
});

describe('AITodoManager Performance', () => {
  const mockOnTodoDataChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders within reasonable time', () => {
    const startTime = performance.now();
    
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(200); // Should render within 200ms
  });

  test('handles large number of todos efficiently', async () => {
    // Create large todo dataset
    const largeTodoSet = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      text: `Todo item ${i + 1}`,
      category: ['work', 'personal', 'education'][i % 3],
      hierarchyType: ['sun', 'planet', 'satellite'][i % 3],
      priority: ['low', 'medium', 'high'][i % 3],
      completed: i % 5 === 0,
      visualProperties: {
        daysUntilDeadline: Math.floor(Math.random() * 30),
        rotationSpeed: 0.005 + Math.random() * 0.01,
        sizeMultiplier: 0.7 + Math.random() * 0.8,
        brightness: 1.0 + Math.random() * 1.0,
        urgencyColor: '#44ff44'
      },
      createdAt: new Date(),
      solarSystemId: `system-${i % 10}`
    }));

    localStorageMock.getItem.mockReturnValue(JSON.stringify(largeTodoSet));
    
    const startTime = performance.now();
    
    render(<AITodoManager onTodoDataChange={mockOnTodoDataChange} />);
    
    await waitFor(() => {
      expect(screen.getByText('🧠 AI Insights')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(1000); // Should handle 100 todos within 1 second
  });
});