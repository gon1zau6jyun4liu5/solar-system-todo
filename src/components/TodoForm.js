import React, { useState, useEffect } from 'react';

const TodoForm = ({ todo, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    text: '',
    category: 'general',
    priority: 'medium'
  });

  const categories = [
    { value: 'general', label: '🚀 General Mission' },
    { value: 'sun', label: '☀️ Solar Research' },
    { value: 'earth', label: '🌍 Earth Studies' },
    { value: 'mars', label: '🔴 Mars Exploration' },
    { value: 'jupiter', label: '🪐 Jupiter Investigation' },
    { value: 'saturn', label: '🪐 Saturn Analysis' },
    { value: 'venus', label: '💛 Venus Research' },
    { value: 'mercury', label: '🌑 Mercury Study' },
    { value: 'uranus', label: '🔵 Uranus Research' },
    { value: 'neptune', label: '🔷 Neptune Analysis' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  useEffect(() => {
    if (todo) {
      setFormData({
        text: todo.text,
        category: todo.category,
        priority: todo.priority
      });
    }
  }, [todo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.text.trim()) {
      onSubmit(formData);
      setFormData({ text: '', category: 'general', priority: 'medium' });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="todo-form-overlay">
      <form className="todo-form" onSubmit={handleSubmit}>
        <h3>{todo ? '🛠️ Update Mission' : '🚀 Create New Mission'}</h3>
        
        <div className="form-group">
          <label htmlFor="text">Mission Description</label>
          <input
            type="text"
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            placeholder="Enter your space mission..."
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Mission Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
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
          >
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {todo ? 'Update Mission' : 'Launch Mission'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TodoForm;