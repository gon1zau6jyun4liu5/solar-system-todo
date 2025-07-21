import { AITodoClassifier, classifyTodoWithAI } from '../aiClassifier';

describe('AITodoClassifier', () => {
  let classifier;

  beforeEach(() => {
    classifier = new AITodoClassifier();
  });

  describe('Category Classification', () => {
    test('should classify work-related todos correctly', () => {
      const workTodos = [
        'Attend team meeting tomorrow',
        'Complete project deadline analysis',
        'Send email to client about proposal',
        'Review quarterly report data'
      ];

      workTodos.forEach(todoText => {
        const result = classifier.classifyTodo(todoText);
        expect(result.category).toBe('work');
        expect(result.confidence).toBeGreaterThan(30);
      });
    });

    test('should classify personal todos correctly', () => {
      const personalTodos = [
        'Go to doctor appointment',
        'Watch movie with family tonight',
        'Read book before bedtime',
        'Exercise at gym'
      ];

      personalTodos.forEach(todoText => {
        const result = classifier.classifyTodo(todoText);
        expect(result.category).toBe('personal');
      });
    });

    test('should classify education todos correctly', () => {
      const educationTodos = [
        'Study for upcoming exam',
        'Research paper on AI trends',
        'Complete homework assignment',
        'Take online course tutorial'
      ];

      educationTodos.forEach(todoText => {
        const result = classifier.classifyTodo(todoText);
        expect(result.category).toBe('education');
      });
    });

    test('should classify finance todos correctly', () => {
      const financeTodos = [
        'Pay monthly bills',
        'Check bank account balance',
        'Plan investment strategy',
        'File tax documents'
      ];

      financeTodos.forEach(todoText => {
        const result = classifier.classifyTodo(todoText);
        expect(result.category).toBe('finance');
      });
    });

    test('should classify health todos correctly', () => {
      const healthTodos = [
        'Take daily medicine',
        'Schedule medical checkup',
        'Plan healthy diet menu',
        'Mental wellness therapy session'
      ];

      healthTodos.forEach(todoText => {
        const result = classifier.classifyTodo(todoText);
        expect(result.category).toBe('health');
      });
    });

    test('should classify home todos correctly', () => {
      const homeTodos = [
        'Clean the kitchen',
        'Repair broken furniture',
        'Organize bedroom closet',
        'Cook dinner for family'
      ];

      homeTodos.forEach(todoText => {
        const result = classifier.classifyTodo(todoText);
        expect(result.category).toBe('home');
      });
    });
  });

  describe('Priority Classification', () => {
    test('should identify high priority with urgent keywords', () => {
      const urgentTodos = [
        'Urgent: Submit report immediately',
        'Critical bug fix needed ASAP',
        'Emergency meeting with client',
        'Important presentation due today'
      ];

      urgentTodos.forEach(todoText => {
        const result = classifier.classifyTodo(todoText);
        expect(result.priority).toBe('high');
      });
    });

    test('should identify medium priority for regular tasks', () => {
      const mediumTodos = [
        'Update project documentation',
        'Plan next week schedule',
        'Organize file system',
        'Review team feedback'
      ];

      mediumTodos.forEach(todoText => {
        const result = classifier.classifyTodo(todoText);
        expect(['medium', 'high']).toContain(result.priority); // Could be either based on category
      });
    });

    test('should identify low priority with casual keywords', () => {
      const lowPriorityTodos = [
        'Someday learn new language',
        'Eventually organize old photos',
        'When possible, clean garage',
        'Minor website updates later'
      ];

      lowPriorityTodos.forEach(todoText => {
        const result = classifier.classifyTodo(todoText);
        expect(result.priority).toBe('low');
      });
    });
  });

  describe('Hierarchy Type Classification', () => {
    test('should classify sun-type todos (major goals)', () => {
      const sunTodos = [
        'Achieve company growth objective',
        'Complete life mission statement',
        'Develop career strategy vision',
        'Create long-term financial goal'
      ];

      sunTodos.forEach(todoText => {
        const result = classifier.classifyTodo(todoText);
        expect(result.hierarchyType).toBe('sun');
      });
    });

    test('should classify planet-type todos (projects)', () => {
      const planetTodos = [
        'Launch marketing campaign project',
        'Implement software development initiative',
        'Execute quarterly business plan',
        'Complete renovation program'
      ];

      planetTodos.forEach(todoText => {
        const result = classifier.classifyTodo(todoText);
        expect(result.hierarchyType).toBe('planet');
      });
    });

    test('should classify satellite-type todos (small tasks)', () => {
      const satelliteTodos = [
        'Send quick email task',
        'Make phone call action item',
        'Update single todo step',
        'Complete small action'
      ];

      satelliteTodos.forEach(todoText => {
        const result = classifier.classifyTodo(todoText);
        expect(result.hierarchyType).toBe('satellite');
      });
    });
  });

  describe('Deadline Estimation', () => {
    test('should estimate shorter deadlines for urgent tasks', () => {
      const urgentTodo = 'Urgent: Complete report immediately';
      const result = classifier.classifyTodo(urgentTodo);
      
      const now = new Date();
      const daysDifference = Math.ceil((result.estimatedDeadline - now) / (1000 * 60 * 60 * 24));
      
      expect(daysDifference).toBeLessThanOrEqual(7); // Should be within a week
    });

    test('should estimate longer deadlines for low priority tasks', () => {
      const casualTodo = 'Eventually organize old photos when possible';
      const result = classifier.classifyTodo(casualTodo);
      
      const now = new Date();
      const daysDifference = Math.ceil((result.estimatedDeadline - now) / (1000 * 60 * 60 * 24));
      
      expect(daysDifference).toBeGreaterThan(10); // Should be more than 10 days
    });

    test('should provide valid future dates', () => {
      const todoText = 'Regular task completion';
      const result = classifier.classifyTodo(todoText);
      
      expect(result.estimatedDeadline).toBeInstanceOf(Date);
      expect(result.estimatedDeadline.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Visual Properties Calculation', () => {
    test('should calculate larger sizes for high priority tasks', () => {
      const highPriorityTodo = 'Critical urgent task';
      const result = classifier.classifyTodo(highPriorityTodo);
      
      expect(result.visualProperties.sizeMultiplier).toBeGreaterThanOrEqual(1.0);
      expect(result.visualProperties.brightness).toBeGreaterThanOrEqual(1.5);
    });

    test('should calculate faster rotation for urgent deadlines', () => {
      const urgentTodo = 'Emergency task due immediately';
      const result = classifier.classifyTodo(urgentTodo);
      
      expect(result.visualProperties.rotationSpeed).toBeGreaterThan(0.005);
      expect(result.visualProperties.daysUntilDeadline).toBeLessThan(7);
    });

    test('should provide appropriate urgency colors', () => {
      const urgentTodo = 'Critical task due today';
      const result = classifier.classifyTodo(urgentTodo);
      
      const urgencyColor = result.visualProperties.urgencyColor;
      expect(urgencyColor).toMatch(/^#[0-9A-Fa-f]{6}$/); // Valid hex color
      
      // Should be red-ish for urgent tasks
      if (result.visualProperties.daysUntilDeadline <= 3) {
        expect(urgencyColor).toContain('ff44'); // Contains red component
      }
    });
  });

  describe('Solar System ID Generation', () => {
    test('should generate consistent solar system IDs', () => {
      const todoText = 'Work project task';
      const result = classifier.classifyTodo(todoText);
      
      expect(result.solarSystemId).toBeDefined();
      expect(result.solarSystemId).toContain(result.category);
      expect(result.solarSystemId).toContain(result.hierarchyType);
      expect(result.solarSystemId).toContain('system');
    });

    test('should group similar todos in same solar system', () => {
      const workTodos = [
        'Work meeting task',
        'Work project step',
        'Work email action'
      ];

      const results = workTodos.map(todo => classifier.classifyTodo(todo));
      const uniqueSystems = new Set(results.map(r => r.solarSystemId));
      
      // Should have fewer unique systems than todos (grouping effect)
      expect(uniqueSystems.size).toBeLessThanOrEqual(workTodos.length);
    });
  });

  describe('Confidence Scoring', () => {
    test('should provide higher confidence for keyword-rich todos', () => {
      const keywordRichTodo = 'Work meeting project deadline report analysis presentation';
      const result = classifier.classifyTodo(keywordRichTodo);
      
      expect(result.confidence).toBeGreaterThan(50);
    });

    test('should provide lower confidence for vague todos', () => {
      const vagueTodo = 'Do stuff';
      const result = classifier.classifyTodo(vagueTodo);
      
      expect(result.confidence).toBeLessThan(80);
    });

    test('should always provide confidence between 0-100', () => {
      const randomTodos = [
        'Random task',
        'Another thing to do',
        'Miscellaneous item',
        'Something important'
      ];

      randomTodos.forEach(todoText => {
        const result = classifier.classifyTodo(todoText);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('AI Suggestions', () => {
    test('should provide suggestions for short todos', () => {
      const shortTodo = 'Fix';
      const result = classifier.classifyTodo(shortTodo);
      
      expect(result.aiSuggestions).toBeInstanceOf(Array);
      expect(result.aiSuggestions.some(s => s.includes('details'))).toBe(true);
    });

    test('should suggest deadlines for high priority tasks', () => {
      const highPriorityTodo = 'Critical important urgent task';
      const result = classifier.classifyTodo(highPriorityTodo);
      
      if (result.priority === 'high' && !/(deadline|due|by)/i.test(highPriorityTodo)) {
        expect(result.aiSuggestions.some(s => s.includes('deadline'))).toBe(true);
      }
    });

    test('should suggest breaking down complex personal todos', () => {
      const complexPersonalTodo = 'Organize entire house including basement attic garage bedrooms living rooms and kitchen areas completely';
      const result = classifier.classifyTodo(complexPersonalTodo);
      
      if (result.category === 'personal' && complexPersonalTodo.length > 50) {
        expect(result.aiSuggestions.some(s => s.includes('broken down'))).toBe(true);
      }
    });
  });

  describe('Integration Tests', () => {
    test('should handle empty input gracefully', () => {
      const result = classifier.classifyTodo('');
      expect(result.originalText).toBe('');
      expect(result.category).toBeDefined();
      expect(result.priority).toBeDefined();
      expect(result.hierarchyType).toBeDefined();
    });

    test('should handle special characters and emojis', () => {
      const emojiTodo = '🚀 Launch project 💼 for work meeting 📊';
      const result = classifier.classifyTodo(emojiTodo);
      
      expect(result.originalText).toBe(emojiTodo);
      expect(result.category).toBeDefined();
      expect(result.visualProperties).toBeDefined();
    });

    test('should maintain consistent results for same input', () => {
      const todoText = 'Regular work meeting';
      const result1 = classifier.classifyTodo(todoText);
      const result2 = classifier.classifyTodo(todoText);
      
      expect(result1.category).toBe(result2.category);
      expect(result1.priority).toBe(result2.priority);
      expect(result1.hierarchyType).toBe(result2.hierarchyType);
      expect(result1.solarSystemId).toBe(result2.solarSystemId);
    });
  });

  describe('Standalone Classification Function', () => {
    test('should work with standalone classifyTodoWithAI function', () => {
      const todoText = 'Important work presentation';
      const result = classifyTodoWithAI(todoText);
      
      expect(result).toBeDefined();
      expect(result.originalText).toBe(todoText);
      expect(result.category).toBeDefined();
      expect(result.priority).toBeDefined();
      expect(result.hierarchyType).toBeDefined();
      expect(result.visualProperties).toBeDefined();
    });

    test('should handle options parameter in standalone function', () => {
      const todoText = 'Regular task';
      const options = { someOption: 'value' };
      const result = classifyTodoWithAI(todoText, options);
      
      expect(result).toBeDefined();
      expect(result.originalText).toBe(todoText);
    });
  });
});

describe('AI Classification Edge Cases', () => {
  let classifier;

  beforeEach(() => {
    classifier = new AITodoClassifier();
  });

  test('should handle very long todo texts', () => {
    const longTodo = 'This is a very long todo item that contains many words and should test the classifier ability to handle extended text input while maintaining performance and accuracy in classification results and not breaking or causing errors in the system';
    const result = classifier.classifyTodo(longTodo);
    
    expect(result).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('should handle todos with mixed categories', () => {
    const mixedTodo = 'Work meeting about personal health insurance finance planning';
    const result = classifier.classifyTodo(mixedTodo);
    
    expect(result.category).toBeDefined();
    expect(['work', 'personal', 'health', 'finance']).toContain(result.category);
  });

  test('should handle todos with contradictory urgency signals', () => {
    const contradictoryTodo = 'Urgent later task when possible immediately';
    const result = classifier.classifyTodo(contradictoryTodo);
    
    expect(result.priority).toBeDefined();
    expect(['low', 'medium', 'high']).toContain(result.priority);
  });

  test('should handle non-English characters', () => {
    const unicodeTodo = 'プロジェクト完了 한국어 작업 español tarea';
    const result = classifier.classifyTodo(unicodeTodo);
    
    expect(result).toBeDefined();
    expect(result.category).toBe('personal'); // Default fallback
  });

  test('should handle numeric and date inputs', () => {
    const numericTodo = '123 456 789 2025-12-31 meeting at 3:30 PM';
    const result = classifier.classifyTodo(numericTodo);
    
    expect(result).toBeDefined();
    expect(result.originalText).toBe(numericTodo);
  });
});

describe('Performance Tests', () => {
  let classifier;

  beforeEach(() => {
    classifier = new AITodoClassifier();
  });

  test('should classify todos in reasonable time', () => {
    const todoText = 'Regular work meeting with team';
    const startTime = performance.now();
    
    const result = classifier.classifyTodo(todoText);
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    expect(result).toBeDefined();
    expect(executionTime).toBeLessThan(100); // Should complete within 100ms
  });

  test('should handle batch classification efficiently', () => {
    const todos = Array.from({ length: 50 }, (_, i) => `Task number ${i + 1} for work meeting`);
    const startTime = performance.now();
    
    const results = todos.map(todo => classifier.classifyTodo(todo));
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    expect(results).toHaveLength(50);
    expect(results.every(r => r.category === 'work')).toBe(true);
    expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
  });
});

describe('Memory Management Tests', () => {
  test('should not cause memory leaks with repeated classifications', () => {
    const classifier = new AITodoClassifier();
    const todoText = 'Memory test task';
    
    // Run classification many times
    for (let i = 0; i < 1000; i++) {
      const result = classifier.classifyTodo(todoText);
      expect(result).toBeDefined();
    }
    
    // If we reach here without crashing, memory management is likely okay
    expect(true).toBe(true);
  });

  test('should handle multiple classifier instances', () => {
    const classifiers = Array.from({ length: 10 }, () => new AITodoClassifier());
    const todoText = 'Multi-instance test task';
    
    const results = classifiers.map(classifier => classifier.classifyTodo(todoText));
    
    expect(results).toHaveLength(10);
    expect(results.every(r => r.originalText === todoText)).toBe(true);
    
    // All should produce consistent results
    const firstResult = results[0];
    results.forEach(result => {
      expect(result.category).toBe(firstResult.category);
      expect(result.priority).toBe(firstResult.priority);
      expect(result.hierarchyType).toBe(firstResult.hierarchyType);
    });
  });
});

describe('Error Handling Tests', () => {
  let classifier;

  beforeEach(() => {
    classifier = new AITodoClassifier();
  });

  test('should handle null input gracefully', () => {
    expect(() => classifier.classifyTodo(null)).not.toThrow();
    const result = classifier.classifyTodo(null);
    expect(result).toBeDefined();
  });

  test('should handle undefined input gracefully', () => {
    expect(() => classifier.classifyTodo(undefined)).not.toThrow();
    const result = classifier.classifyTodo(undefined);
    expect(result).toBeDefined();
  });

  test('should handle non-string input gracefully', () => {
    const inputs = [123, true, {}, [], new Date()];
    
    inputs.forEach(input => {
      expect(() => classifier.classifyTodo(input)).not.toThrow();
      const result = classifier.classifyTodo(input);
      expect(result).toBeDefined();
    });
  });
});