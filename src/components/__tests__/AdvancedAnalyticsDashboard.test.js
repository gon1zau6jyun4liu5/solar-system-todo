import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvancedAnalyticsDashboard from '../AdvancedAnalyticsDashboard';

// Mock Three.js and React Three Fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="3d-canvas">{children}</div>,
  useFrame: () => {},
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Text: ({ children, ...props }) => <div data-testid="3d-text" {...props}>{children}</div>
}));

// Mock Three.js
jest.mock('three', () => ({
  __esModule: true,
  default: {},
  BoxGeometry: jest.fn(),
  MeshStandardMaterial: jest.fn(),
  GridHelper: jest.fn(),
}));

describe('AdvancedAnalyticsDashboard', () => {
  const mockOnClose = jest.fn();
  
  const sampleTodos = [
    {
      id: 1,
      text: 'Test todo 1',
      category: 'work',
      priority: 'high',
      completed: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    },
    {
      id: 2,
      text: 'Test todo 2',
      category: 'personal',
      priority: 'medium',
      completed: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: 3,
      text: 'Test todo 3',
      category: 'education',
      priority: 'low',
      completed: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    },
    {
      id: 4,
      text: 'Urgent todo',
      category: 'work',
      priority: 'high',
      completed: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now (urgent)
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard when visible', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('📊 Advanced Analytics Dashboard v0.4.3')).toBeInTheDocument();
  });

  test('does not render when not visible', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('📊 Advanced Analytics Dashboard v0.4.3')).not.toBeInTheDocument();
  });

  test('displays correct basic metrics', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('4')).toBeInTheDocument(); // Total tasks
    expect(screen.getByText('1 completed')).toBeInTheDocument(); // Completed tasks
    expect(screen.getByText('3')).toBeInTheDocument(); // Pending tasks
    expect(screen.getByText('25.0%')).toBeInTheDocument(); // Completion rate
  });

  test('calculates urgent tasks correctly', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Should show 1 urgent task (the one with deadline <= 3 days)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('need attention')).toBeInTheDocument();
  });

  test('displays time range selector with all options', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const timeRangeSelector = screen.getByDisplayValue('Past Week');
    expect(timeRangeSelector).toBeInTheDocument();

    // Check all options are present
    fireEvent.click(timeRangeSelector);
    expect(screen.getByText('Past Week')).toBeInTheDocument();
    expect(screen.getByText('Past Month')).toBeInTheDocument();
    expect(screen.getByText('Past Quarter')).toBeInTheDocument();
    expect(screen.getByText('Past Year')).toBeInTheDocument();
  });

  test('changes time range when selector is changed', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const timeRangeSelector = screen.getByDisplayValue('Past Week');
    fireEvent.change(timeRangeSelector, { target: { value: 'month' } });

    expect(timeRangeSelector.value).toBe('month');
  });

  test('shows all metric tabs', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('📈 Overview')).toBeInTheDocument();
    expect(screen.getByText('🎯 Productivity')).toBeInTheDocument();
    expect(screen.getByText('📊 Trends')).toBeInTheDocument();
    expect(screen.getByText('🧠 AI Insights')).toBeInTheDocument();
  });

  test('switches between metric tabs correctly', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Start with overview (default)
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();

    // Switch to productivity
    fireEvent.click(screen.getByText('🎯 Productivity'));
    expect(screen.getByText('Productivity Score')).toBeInTheDocument();
    expect(screen.getByText('Priority Distribution')).toBeInTheDocument();

    // Switch to trends
    fireEvent.click(screen.getByText('📊 Trends'));
    expect(screen.getByText('Performance Trends')).toBeInTheDocument();
    expect(screen.getByText('Avg Tasks/Day')).toBeInTheDocument();

    // Switch to insights
    fireEvent.click(screen.getByText('🧠 AI Insights'));
    expect(screen.getByText('🤖 AI-Powered Insights')).toBeInTheDocument();
  });

  test('displays productivity score', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('🎯 Productivity'));
    
    // Should show a numeric productivity score
    const scoreElements = screen.getAllByText(/\d+/);
    expect(scoreElements.length).toBeGreaterThan(0);
  });

  test('shows priority distribution bars', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('🎯 Productivity'));
    
    expect(screen.getByText('High Priority')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority')).toBeInTheDocument();
    expect(screen.getByText('Low Priority')).toBeInTheDocument();
  });

  test('displays AI insights', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('🧠 AI Insights'));
    
    expect(screen.getByText(/Your productivity is/)).toBeInTheDocument();
    expect(screen.getByText(/You complete most tasks/)).toBeInTheDocument();
  });

  test('shows urgent task warning in insights when urgent tasks exist', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('🧠 AI Insights'));
    
    expect(screen.getByText(/urgent task.*require immediate attention/)).toBeInTheDocument();
  });

  test('renders 3D visualization canvas', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId('3d-canvas')).toBeInTheDocument();
  });

  test('displays animation toggle', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const animationToggle = screen.getByLabelText('Animation');
    expect(animationToggle).toBeInTheDocument();
    expect(animationToggle).toBeChecked(); // Default is enabled
  });

  test('toggles animation when checkbox is clicked', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const animationToggle = screen.getByLabelText('Animation');
    fireEvent.click(animationToggle);
    
    expect(animationToggle).not.toBeChecked();
  });

  test('displays category legend', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Category Distribution')).toBeInTheDocument();
    
    // Should show categories from the sample todos
    expect(screen.getByText(/work:/)).toBeInTheDocument();
    expect(screen.getByText(/personal:/)).toBeInTheDocument();
    expect(screen.getByText(/education:/)).toBeInTheDocument();
  });

  test('displays footer statistics', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Data Range:')).toBeInTheDocument();
    expect(screen.getByText('Last Updated:')).toBeInTheDocument();
    expect(screen.getByText('Version:')).toBeInTheDocument();
    expect(screen.getByText('v0.4.3')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('handles empty todos array gracefully', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={[]}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument(); // Total tasks
    expect(screen.getByText('0 completed')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument(); // Completion rate
  });

  test('calculates metrics correctly for different time ranges', () => {
    // Add todos with different creation dates
    const todosWithVariedDates = [
      ...sampleTodos,
      {
        id: 5,
        text: 'Old todo',
        category: 'work',
        priority: 'high',
        completed: true,
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
      }
    ];

    render(
      <AdvancedAnalyticsDashboard
        todos={todosWithVariedDates}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Week range should not include the 40-day-old todo
    expect(screen.getByText('4')).toBeInTheDocument(); // Still 4 tasks in week range

    // Change to month range
    const timeRangeSelector = screen.getByDisplayValue('Past Week');
    fireEvent.change(timeRangeSelector, { target: { value: 'month' } });

    // Should now include the 40-day-old todo
    expect(screen.getByText('5')).toBeInTheDocument(); // Now 5 tasks in month range
  });

  test('shows correct most productive category', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={sampleTodos}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('📊 Trends'));
    
    // Work category has 2 todos, should be most productive
    expect(screen.getByText('work')).toBeInTheDocument();
  });

  test('handles todos without deadlines', () => {
    const todosWithoutDeadlines = [
      {
        id: 1,
        text: 'Todo without deadline',
        category: 'work',
        priority: 'high',
        completed: false,
        createdAt: new Date(),
      }
    ];

    render(
      <AdvancedAnalyticsDashboard
        todos={todosWithoutDeadlines}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Should not crash and should show 0 urgent tasks
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('need attention')).toBeInTheDocument();
  });
});

describe('AdvancedAnalyticsDashboard Analytics Calculations', () => {
  test('calculates completion rate correctly', () => {
    const todos = [
      { id: 1, completed: true, createdAt: new Date() },
      { id: 2, completed: true, createdAt: new Date() },
      { id: 3, completed: false, createdAt: new Date() },
      { id: 4, completed: false, createdAt: new Date() },
    ];

    render(
      <AdvancedAnalyticsDashboard
        todos={todos}
        isVisible={true}
        onClose={() => {}}
      />
    );

    // 2 out of 4 completed = 50%
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  test('calculates productivity score correctly', () => {
    const highProductivityTodos = [
      { id: 1, completed: true, createdAt: new Date(), priority: 'high', deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
      { id: 2, completed: true, createdAt: new Date(), priority: 'high', deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
      { id: 3, completed: true, createdAt: new Date(), priority: 'high', deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
    ];

    render(
      <AdvancedAnalyticsDashboard
        todos={highProductivityTodos}
        isVisible={true}
        onClose={() => {}}
      />
    );

    fireEvent.click(screen.getByText('🎯 Productivity'));
    
    // Should show a high productivity score (>= 70)
    const scoreElements = screen.getAllByText(/\d+/);
    const scores = scoreElements.map(el => parseInt(el.textContent));
    const productivityScore = Math.max(...scores);
    expect(productivityScore).toBeGreaterThanOrEqual(70);
  });

  test('identifies urgent tasks correctly', () => {
    const todosWithUrgentDeadlines = [
      {
        id: 1,
        completed: false,
        createdAt: new Date(),
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days (urgent)
        category: 'work',
        priority: 'high'
      },
      {
        id: 2,
        completed: false,
        createdAt: new Date(),
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days (not urgent)
        category: 'work',
        priority: 'high'
      },
      {
        id: 3,
        completed: true, // Completed tasks should not be urgent
        createdAt: new Date(),
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        category: 'work',
        priority: 'high'
      }
    ];

    render(
      <AdvancedAnalyticsDashboard
        todos={todosWithUrgentDeadlines}
        isVisible={true}
        onClose={() => {}}
      />
    );

    // Should show 1 urgent task (only the incomplete one with <= 3 days deadline)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('need attention')).toBeInTheDocument();
  });
});

describe('AdvancedAnalyticsDashboard Performance', () => {
  test('renders efficiently with large dataset', () => {
    const largeTodoSet = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      text: `Todo ${i + 1}`,
      category: ['work', 'personal', 'education'][i % 3],
      priority: ['high', 'medium', 'low'][i % 3],
      completed: i % 4 === 0, // 25% completion rate
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      deadline: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000) : undefined
    }));

    const startTime = performance.now();
    
    render(
      <AdvancedAnalyticsDashboard
        todos={largeTodoSet}
        isVisible={true}
        onClose={() => {}}
      />
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(500); // Should render within 500ms
    expect(screen.getByText('100')).toBeInTheDocument(); // Total tasks
  });
});

describe('AdvancedAnalyticsDashboard Accessibility', () => {
  test('has proper ARIA labels and roles', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={[]}
        isVisible={true}
        onClose={() => {}}
      />
    );

    const animationToggle = screen.getByLabelText('Animation');
    expect(animationToggle).toHaveAttribute('type', 'checkbox');
  });

  test('supports keyboard navigation', () => {
    render(
      <AdvancedAnalyticsDashboard
        todos={[]}
        isVisible={true}
        onClose={() => {}}
      />
    );

    const firstTab = screen.getByText('📈 Overview');
    firstTab.focus();
    expect(document.activeElement).toBe(firstTab);
  });
});
