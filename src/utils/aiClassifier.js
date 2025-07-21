/**
 * AI-powered Todo Classification System
 * Analyzes todo content and automatically determines:
 * - Group/Category
 * - Priority
 * - Estimated deadline
 * - Todo type (sun/planet/satellite)
 */

// AI Classification Engine
export class AITodoClassifier {
  constructor() {
    this.categories = {
      'work': {
        keywords: ['meeting', 'project', 'deadline', 'report', 'presentation', 'email', 'call', 'task', 'review', 'analysis'],
        defaultPriority: 'high',
        estimatedDays: 7
      },
      'personal': {
        keywords: ['workout', 'exercise', 'health', 'doctor', 'appointment', 'family', 'friend', 'hobby', 'book', 'movie'],
        defaultPriority: 'medium',
        estimatedDays: 14
      },
      'education': {
        keywords: ['study', 'learn', 'course', 'exam', 'homework', 'research', 'paper', 'lecture', 'tutorial', 'certification'],
        defaultPriority: 'high',
        estimatedDays: 10
      },
      'finance': {
        keywords: ['budget', 'payment', 'bill', 'tax', 'investment', 'savings', 'bank', 'insurance', 'loan', 'expense'],
        defaultPriority: 'high',
        estimatedDays: 3
      },
      'home': {
        keywords: ['clean', 'repair', 'maintenance', 'garden', 'cooking', 'laundry', 'organize', 'decoration', 'furniture'],
        defaultPriority: 'medium',
        estimatedDays: 5
      },
      'health': {
        keywords: ['medical', 'checkup', 'medicine', 'therapy', 'diet', 'nutrition', 'mental', 'wellness', 'fitness'],
        defaultPriority: 'high',
        estimatedDays: 7
      }
    };

    this.urgencyPatterns = [
      { pattern: /(urgent|asap|immediately|critical|emergency)/i, priority: 'high', dayReduction: 2 },
      { pattern: /(soon|quickly|fast|rush)/i, priority: 'high', dayReduction: 1 },
      { pattern: /(later|eventually|someday|when possible)/i, priority: 'low', dayAddition: 7 },
      { pattern: /(important|significant|crucial|vital)/i, priority: 'high', dayReduction: 1 },
      { pattern: /(minor|small|simple|easy)/i, priority: 'low', dayAddition: 3 }
    ];

    this.hierarchyPatterns = [
      { pattern: /(goal|objective|mission|vision|strategy)/i, type: 'sun' },
      { pattern: /(project|initiative|plan|campaign|program)/i, type: 'planet' },
      { pattern: /(task|action|step|item|todo)/i, type: 'satellite' }
    ];
  }

  /**
   * Main classification method
   * @param {string} todoText - The todo description
   * @param {Object} options - Additional classification options
   * @returns {Object} Classification results
   */
  classifyTodo(todoText, options = {}) {
    const text = todoText.toLowerCase();
    
    // Determine category/group
    const category = this.determineCategory(text);
    
    // Determine priority
    const priority = this.determinePriority(text, category);
    
    // Determine hierarchy type
    const hierarchyType = this.determineHierarchyType(text);
    
    // Estimate deadline
    const estimatedDeadline = this.estimateDeadline(text, category, priority);
    
    // Generate solar system group ID
    const solarSystemId = this.generateSolarSystemId(category, hierarchyType);

    // Calculate visual properties
    const visualProperties = this.calculateVisualProperties(priority, estimatedDeadline);

    return {
      originalText: todoText,
      category,
      priority,
      hierarchyType,
      estimatedDeadline,
      solarSystemId,
      visualProperties,
      confidence: this.calculateConfidence(text, category),
      aiSuggestions: this.generateSuggestions(text, category, priority)
    };
  }

  /**
   * Determine the main category of the todo
   */
  determineCategory(text) {
    let bestMatch = { category: 'personal', score: 0 };
    
    for (const [category, config] of Object.entries(this.categories)) {
      let score = 0;
      config.keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          score += 1;
        }
      });
      
      if (score > bestMatch.score) {
        bestMatch = { category, score };
      }
    }
    
    return bestMatch.category;
  }

  /**
   * Determine priority based on text analysis
   */
  determinePriority(text, category) {
    const basePriority = this.categories[category].defaultPriority;
    
    for (const pattern of this.urgencyPatterns) {
      if (pattern.pattern.test(text)) {
        return pattern.priority;
      }
    }
    
    return basePriority;
  }

  /**
   * Determine hierarchy type (sun/planet/satellite)
   */
  determineHierarchyType(text) {
    for (const pattern of this.hierarchyPatterns) {
      if (pattern.pattern.test(text)) {
        return pattern.type;
      }
    }
    
    // Default to satellite for regular tasks
    return 'satellite';
  }

  /**
   * Estimate deadline based on various factors
   */
  estimateDeadline(text, category, priority) {
    let baseDays = this.categories[category].estimatedDays;
    
    // Adjust based on urgency patterns
    for (const pattern of this.urgencyPatterns) {
      if (pattern.pattern.test(text)) {
        if (pattern.dayReduction) {
          baseDays = Math.max(1, baseDays - pattern.dayReduction);
        }
        if (pattern.dayAddition) {
          baseDays += pattern.dayAddition;
        }
        break;
      }
    }
    
    // Priority adjustments
    if (priority === 'high') {
      baseDays = Math.max(1, Math.floor(baseDays * 0.7));
    } else if (priority === 'low') {
      baseDays = Math.floor(baseDays * 1.5);
    }
    
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + baseDays);
    
    return deadline;
  }

  /**
   * Generate unique solar system ID
   */
  generateSolarSystemId(category, hierarchyType) {
    return `${category}-${hierarchyType}-system`;
  }

  /**
   * Calculate visual properties based on priority and deadline
   */
  calculateVisualProperties(priority, deadline) {
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    // Size calculation (priority-based)
    const sizeMultiplier = {
      'high': 1.5,
      'medium': 1.0,
      'low': 0.7
    }[priority];

    // Brightness calculation (priority-based)
    const brightness = {
      'high': 2.0,
      'medium': 1.5,
      'low': 1.0
    }[priority];

    // Rotation speed (deadline-based)
    const rotationSpeed = Math.max(0.001, 0.02 / Math.max(1, daysUntilDeadline));

    // Color based on urgency
    const urgencyColor = daysUntilDeadline <= 3 ? '#ff4444' : 
                        daysUntilDeadline <= 7 ? '#ffaa00' : '#44ff44';

    return {
      sizeMultiplier,
      brightness,
      rotationSpeed,
      urgencyColor,
      daysUntilDeadline
    };
  }

  /**
   * Calculate confidence score of the classification
   */
  calculateConfidence(text, category) {
    const keywords = this.categories[category].keywords;
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    return Math.min(100, (matches / keywords.length) * 100 + 30);
  }

  /**
   * Generate AI suggestions for improvement
   */
  generateSuggestions(text, category, priority) {
    const suggestions = [];
    
    if (text.length < 10) {
      suggestions.push("Consider adding more details to your todo for better classification");
    }
    
    if (priority === 'high' && !/(deadline|due|by)/i.test(text)) {
      suggestions.push("Consider adding a specific deadline for this high-priority task");
    }
    
    if (category === 'personal' && text.length > 50) {
      suggestions.push("This might be better broken down into smaller, actionable tasks");
    }
    
    return suggestions;
  }
}

// Export singleton instance
export const aiClassifier = new AITodoClassifier();

// Helper function for easy classification
export const classifyTodoWithAI = (todoText, options = {}) => {
  return aiClassifier.classifyTodo(todoText, options);
};