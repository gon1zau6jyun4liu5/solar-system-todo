import React, { useState, useEffect } from 'react';
import { classifyTodoWithAI } from '../utils/aiClassifier';

const AITodoForm = ({ todo, onSubmit, onCancel, aiMode = true }) => {
  const [formData, setFormData] = useState({
    text: '',
    category: 'ai-auto',
    priority: 'ai-auto',
    hierarchyType: 'ai-auto'
  });
  
  const [aiPreview, setAiPreview] = useState(null);
  const [showAiInsights, setShowAiInsights] = useState(true);

  const categories = [
    { value: 'ai-auto', label: '🤖 Let AI Decide' },
    { value: 'work', label: '💼 Work' },
    { value: 'personal', label: '🏠 Personal' },
    { value: 'education', label: '📚 Education' },
    { value: 'finance', label: '💰 Finance' },
    { value: 'home', label: '🏡 Home' },
    { value: 'health', label: '⚕️ Health' }
  ];

  const priorities = [
    { value: 'ai-auto', label: '🤖 Let AI Decide' },
    { value: 'low', label: '🟢 Low Priority' },
    { value: 'medium', label: '🟡 Medium Priority' },
    { value: 'high', label: '🔴 High Priority' }
  ];

  const hierarchyTypes = [
    { value: 'ai-auto', label: '🤖 Let AI Decide' },
    { value: 'sun', label: '☀️ Sun (Major Goal)' },
    { value: 'planet', label: '🪐 Planet (Project)' },
    { value: 'satellite', label: '🛰️ Satellite (Task)' }
  ];

  // Load existing todo data
  useEffect(() => {
    if (todo) {
      setFormData({
        text: todo.text,
        category: todo.category || 'ai-auto',
        priority: todo.priority || 'ai-auto',
        hierarchyType: todo.hierarchyType || 'ai-auto'
      });
    }
  }, [todo]);

  // AI Preview Generation
  useEffect(() => {
    if (formData.text.length > 3 && aiMode) {
      const debounceTimer = setTimeout(() => {
        try {
          const classification = classifyTodoWithAI(formData.text);
          setAiPreview(classification);
        } catch (error) {
          console.error('AI classification error:', error);
          setAiPreview(null);
        }
      }, 500); // Debounce for 500ms

      return () => clearTimeout(debounceTimer);
    } else {
      setAiPreview(null);
    }
  }, [formData.text, aiMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.text.trim()) {
      onSubmit(formData);
      setFormData({ 
        text: '', 
        category: 'ai-auto', 
        priority: 'ai-auto', 
        hierarchyType: 'ai-auto' 
      });
      setAiPreview(null);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const applyAiSuggestion = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const getAiPreviewDisplay = () => {
    if (!aiPreview) return null;

    const categoryIcon = {
      'work': '💼',
      'personal': '🏠',
      'education': '📚',
      'finance': '💰',
      'home': '🏡',
      'health': '⚕️'
    }[aiPreview.category] || '🔧';

    const priorityColor = {
      'high': '#ff4444',
      'medium': '#ffaa00',
      'low': '#44aa44'
    }[aiPreview.priority];

    const hierarchyIcon = {
      'sun': '☀️',
      'planet': '🪐',
      'satellite': '🛰️'
    }[aiPreview.hierarchyType];

    return (
      <div className="ai-preview">
        <h4>🤖 AI Analysis</h4>
        
        <div className="ai-prediction-grid">
          <div className="ai-prediction-item">
            <span className="prediction-label">Category:</span>
            <span className="prediction-value">
              {categoryIcon} {aiPreview.category}
            </span>
            <button
              type="button"
              className="apply-suggestion"
              onClick={() => applyAiSuggestion('category', aiPreview.category)}
            >
              Apply
            </button>
          </div>

          <div className="ai-prediction-item">
            <span className="prediction-label">Priority:</span>
            <span className="prediction-value" style={{ color: priorityColor }}>
              {aiPreview.priority.toUpperCase()}
            </span>
            <button
              type="button"
              className="apply-suggestion"
              onClick={() => applyAiSuggestion('priority', aiPreview.priority)}
            >
              Apply
            </button>
          </div>

          <div className="ai-prediction-item">
            <span className="prediction-label">Type:</span>
            <span className="prediction-value">
              {hierarchyIcon} {aiPreview.hierarchyType}
            </span>
            <button
              type="button"
              className="apply-suggestion"
              onClick={() => applyAiSuggestion('hierarchyType', aiPreview.hierarchyType)}
            >
              Apply
            </button>
          </div>

          <div className="ai-prediction-item full-width">
            <span className="prediction-label">Deadline:</span>
            <span className="prediction-value">
              📅 {aiPreview.estimatedDeadline.toLocaleDateString()}
              ({aiPreview.visualProperties.daysUntilDeadline} days)
            </span>
          </div>

          <div className="ai-prediction-item full-width">
            <span className="prediction-label">Confidence:</span>
            <div className="confidence-bar">
              <div 
                className="confidence-fill"
                style={{ width: `${aiPreview.confidence}%` }}
              />
              <span className="confidence-text">{Math.round(aiPreview.confidence)}%</span>
            </div>
          </div>
        </div>

        {aiPreview.aiSuggestions.length > 0 && (
          <div className="ai-suggestions">
            <h5>💡 Suggestions:</h5>
            <ul>
              {aiPreview.aiSuggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="ai-actions">
          <button
            type="button"
            className="apply-all-suggestions"
            onClick={() => {
              setFormData({
                ...formData,
                category: aiPreview.category,
                priority: aiPreview.priority,
                hierarchyType: aiPreview.hierarchyType
              });
            }}
          >
            🚀 Apply All AI Suggestions
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="todo-form-overlay">
      <form className="ai-todo-form" onSubmit={handleSubmit}>
        <h3>
          {todo ? '🛠️ Update Mission' : '🚀 Create AI-Enhanced Mission'}
          <span className="version-tag">v0.3.0</span>
        </h3>
        
        <div className="form-group">
          <label htmlFor="text">Mission Description</label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            placeholder="Describe your mission... (AI will analyze and suggest optimal settings)"
            required
            autoFocus
            rows={3}
            className="ai-enhanced-input"
          />
          {formData.text.length > 0 && (
            <div className="input-stats">
              Characters: {formData.text.length} | 
              Words: {formData.text.split(' ').length}
            </div>
          )}
        </div>

        {/* AI Preview Panel */}
        {aiMode && showAiInsights && getAiPreviewDisplay()}

        <div className="form-sections">
          <div className="form-group">
            <label htmlFor="category">Mission Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={formData.category === 'ai-auto' ? 'ai-auto-select' : ''}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority Level</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={formData.priority === 'ai-auto' ? 'ai-auto-select' : ''}
            >
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="hierarchyType">Celestial Body Type</label>
            <select
              id="hierarchyType"
              name="hierarchyType"
              value={formData.hierarchyType}
              onChange={handleChange}
              className={formData.hierarchyType === 'ai-auto' ? 'ai-auto-select' : ''}
            >
              {hierarchyTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Insights Toggle */}
        {aiMode && (
          <div className="ai-toggle-section">
            <label className="ai-toggle">
              <input
                type="checkbox"
                checked={showAiInsights}
                onChange={(e) => setShowAiInsights(e.target.checked)}
              />
              Show AI Insights & Suggestions
            </label>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn ai-enhanced">
            {todo ? '🚀 Update Mission' : '🌟 Launch AI Mission'}
          </button>
        </div>

        {/* AI Processing Indicator */}
        {formData.text.length > 3 && !aiPreview && aiMode && (
          <div className="ai-processing">
            <div className="spinner"></div>
            <span>AI analyzing your mission...</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default AITodoForm;