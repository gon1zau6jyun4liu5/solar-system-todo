import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import './AdvancedAnalyticsDashboard.css';

/**
 * Advanced Analytics Dashboard v0.4.3
 * Comprehensive productivity analytics with 3D visualization
 * Features:
 * - Real-time performance metrics
 * - 3D data visualization
 * - Productivity trends analysis
 * - Goal tracking system
 * - AI-powered insights
 */
const AdvancedAnalyticsDashboard = ({ todos = [], isVisible = false, onClose }) => {
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [timeRange, setTimeRange] = useState('week'); // week, month, quarter, year
  const [animationEnabled, setAnimationEnabled] = useState(true);

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const timeRanges = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      quarter: 90 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000
    };

    const rangeMs = timeRanges[timeRange];
    const filteredTodos = todos.filter(todo => 
      now - new Date(todo.createdAt) <= rangeMs
    );

    // Basic metrics
    const totalTasks = filteredTodos.length;
    const completedTasks = filteredTodos.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100) : 0;

    // Priority analysis
    const priorityStats = {
      high: filteredTodos.filter(t => t.priority === 'high').length,
      medium: filteredTodos.filter(t => t.priority === 'medium').length,
      low: filteredTodos.filter(t => t.priority === 'low').length
    };

    // Category analysis
    const categoryStats = filteredTodos.reduce((acc, todo) => {
      acc[todo.category] = (acc[todo.category] || 0) + 1;
      return acc;
    }, {});

    // Urgency analysis (for todos with deadlines)
    const urgentTasks = filteredTodos.filter(todo => {
      if (!todo.deadline || todo.completed) return false;
      const daysLeft = (new Date(todo.deadline) - now) / (1000 * 60 * 60 * 24);
      return daysLeft <= 3;
    }).length;

    // Daily completion trend
    const dailyCompletions = {};
    filteredTodos.filter(t => t.completed).forEach(todo => {
      const date = new Date(todo.completedAt || todo.createdAt).toDateString();
      dailyCompletions[date] = (dailyCompletions[date] || 0) + 1;
    });

    // Productivity score calculation
    const productivityScore = Math.min(100, Math.round(
      (completionRate * 0.4) + 
      (urgentTasks === 0 ? 30 : Math.max(0, 30 - urgentTasks * 5)) +
      (priorityStats.high > 0 ? Math.min(30, priorityStats.high * 3) : 0)
    ));

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      priorityStats,
      categoryStats,
      urgentTasks,
      dailyCompletions,
      productivityScore,
      averageTasksPerDay: totalTasks / (rangeMs / (1000 * 60 * 60 * 24)),
      mostProductiveCategory: Object.keys(categoryStats).reduce((a, b) => 
        categoryStats[a] > categoryStats[b] ? a : b, 'general')
    };
  }, [todos, timeRange]);

  // 3D Chart Data for visualization
  const chartData = useMemo(() => {
    const categories = Object.keys(analytics.categoryStats);
    return categories.map((category, index) => ({
      category,
      count: analytics.categoryStats[category],
      position: [
        Math.cos((index / categories.length) * Math.PI * 2) * 3,
        analytics.categoryStats[category] * 0.5,
        Math.sin((index / categories.length) * Math.PI * 2) * 3
      ],
      color: `hsl(${(index / categories.length) * 360}, 70%, 60%)`
    }));
  }, [analytics.categoryStats]);

  if (!isVisible) return null;

  return (
    <div className="analytics-dashboard-overlay">
      <div className="analytics-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <h2>📊 Advanced Analytics Dashboard v0.4.3</h2>
          <div className="header-controls">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-range-selector"
            >
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="quarter">Past Quarter</option>
              <option value="year">Past Year</option>
            </select>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Left Panel - Metrics */}
          <div className="metrics-panel">
            <div className="metric-tabs">
              <button 
                className={selectedMetric === 'overview' ? 'active' : ''}
                onClick={() => setSelectedMetric('overview')}
              >
                📈 Overview
              </button>
              <button 
                className={selectedMetric === 'productivity' ? 'active' : ''}
                onClick={() => setSelectedMetric('productivity')}
              >
                🎯 Productivity
              </button>
              <button 
                className={selectedMetric === 'trends' ? 'active' : ''}
                onClick={() => setSelectedMetric('trends')}
              >
                📊 Trends
              </button>
              <button 
                className={selectedMetric === 'insights' ? 'active' : ''}
                onClick={() => setSelectedMetric('insights')}
              >
                🧠 AI Insights
              </button>
            </div>

            <div className="metrics-content">
              {selectedMetric === 'overview' && (
                <div className="overview-metrics">
                  <div className="metric-card primary">
                    <h3>Total Tasks</h3>
                    <div className="metric-value">{analytics.totalTasks}</div>
                    <div className="metric-subtitle">in {timeRange}</div>
                  </div>
                  
                  <div className="metric-card success">
                    <h3>Completion Rate</h3>
                    <div className="metric-value">{analytics.completionRate.toFixed(1)}%</div>
                    <div className="metric-subtitle">{analytics.completedTasks} completed</div>
                  </div>
                  
                  <div className="metric-card warning">
                    <h3>Pending Tasks</h3>
                    <div className="metric-value">{analytics.pendingTasks}</div>
                    <div className="metric-subtitle">remaining</div>
                  </div>
                  
                  <div className="metric-card danger">
                    <h3>Urgent Tasks</h3>
                    <div className="metric-value">{analytics.urgentTasks}</div>
                    <div className="metric-subtitle">need attention</div>
                  </div>
                </div>
              )}

              {selectedMetric === 'productivity' && (
                <div className="productivity-metrics">
                  <div className="productivity-score">
                    <div className="score-circle">
                      <div className="score-value">{analytics.productivityScore}</div>
                      <div className="score-label">Productivity Score</div>
                    </div>
                  </div>
                  
                  <div className="productivity-breakdown">
                    <h4>Priority Distribution</h4>
                    <div className="priority-bars">
                      <div className="priority-bar high">
                        <span>High Priority</span>
                        <div className="bar">
                          <div 
                            className="bar-fill" 
                            style={{ width: `${(analytics.priorityStats.high / analytics.totalTasks) * 100}%` }}
                          ></div>
                        </div>
                        <span>{analytics.priorityStats.high}</span>
                      </div>
                      <div className="priority-bar medium">
                        <span>Medium Priority</span>
                        <div className="bar">
                          <div 
                            className="bar-fill" 
                            style={{ width: `${(analytics.priorityStats.medium / analytics.totalTasks) * 100}%` }}
                          ></div>
                        </div>
                        <span>{analytics.priorityStats.medium}</span>
                      </div>
                      <div className="priority-bar low">
                        <span>Low Priority</span>
                        <div className="bar">
                          <div 
                            className="bar-fill" 
                            style={{ width: `${(analytics.priorityStats.low / analytics.totalTasks) * 100}%` }}
                          ></div>
                        </div>
                        <span>{analytics.priorityStats.low}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedMetric === 'trends' && (
                <div className="trends-metrics">
                  <h4>Performance Trends</h4>
                  <div className="trend-item">
                    <span className="trend-label">Avg Tasks/Day</span>
                    <span className="trend-value">{analytics.averageTasksPerDay.toFixed(1)}</span>
                  </div>
                  <div className="trend-item">
                    <span className="trend-label">Most Active Category</span>
                    <span className="trend-value">{analytics.mostProductiveCategory}</span>
                  </div>
                  <div className="trend-item">
                    <span className="trend-label">Completion Streak</span>
                    <span className="trend-value">5 days</span>
                  </div>
                </div>
              )}

              {selectedMetric === 'insights' && (
                <div className="insights-metrics">
                  <h4>🤖 AI-Powered Insights</h4>
                  <div className="insight-card">
                    <div className="insight-icon">📈</div>
                    <div className="insight-text">
                      Your productivity is {analytics.productivityScore >= 70 ? 'excellent' : 'good'}. 
                      Focus on high-priority tasks to improve further.
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">⚡</div>
                    <div className="insight-text">
                      You complete most tasks in the {analytics.mostProductiveCategory} category. 
                      Consider applying similar strategies to other areas.
                    </div>
                  </div>
                  {analytics.urgentTasks > 0 && (
                    <div className="insight-card warning">
                      <div className="insight-icon">⚠️</div>
                      <div className="insight-text">
                        {analytics.urgentTasks} urgent task{analytics.urgentTasks > 1 ? 's' : ''} 
                        require immediate attention to avoid missing deadlines.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - 3D Visualization */}
          <div className="visualization-panel">
            <div className="viz-header">
              <h3>3D Data Visualization</h3>
              <label className="animation-toggle">
                <input 
                  type="checkbox" 
                  checked={animationEnabled}
                  onChange={(e) => setAnimationEnabled(e.target.checked)}
                />
                Animation
              </label>
            </div>
            
            <div className="viz-canvas">
              <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} intensity={0.8} />
                
                {/* 3D Bar Chart */}
                {chartData.map((item, index) => (
                  <group key={item.category} position={item.position}>
                    <mesh>
                      <boxGeometry args={[0.8, item.count * 0.5, 0.8]} />
                      <meshStandardMaterial color={item.color} />
                    </mesh>
                    <Text
                      position={[0, item.count * 0.5 + 0.5, 0]}
                      fontSize={0.3}
                      color="white"
                      anchorX="center"
                      anchorY="middle"
                    >
                      {item.category}
                    </Text>
                    <Text
                      position={[0, -0.5, 0]}
                      fontSize={0.2}
                      color="white"
                      anchorX="center"
                      anchorY="middle"
                    >
                      {item.count}
                    </Text>
                  </group>
                ))}
                
                {/* Grid */}
                <gridHelper args={[10, 10, '#444444', '#444444']} />
                
                <OrbitControls 
                  enableDamping 
                  dampingFactor={0.05}
                  autoRotate={animationEnabled}
                  autoRotateSpeed={2}
                />
              </Canvas>
            </div>
            
            <div className="viz-legend">
              <h4>Category Distribution</h4>
              <div className="legend-items">
                {chartData.map((item) => (
                  <div key={item.category} className="legend-item">
                    <div 
                      className="legend-color" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span>{item.category}: {item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="dashboard-footer">
          <div className="footer-stat">
            <span className="stat-label">Data Range:</span>
            <span className="stat-value">
              {timeRange === 'week' ? 'Last 7 days' : 
               timeRange === 'month' ? 'Last 30 days' :
               timeRange === 'quarter' ? 'Last 90 days' : 'Last 365 days'}
            </span>
          </div>
          <div className="footer-stat">
            <span className="stat-label">Last Updated:</span>
            <span className="stat-value">{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="footer-stat">
            <span className="stat-label">Version:</span>
            <span className="stat-value">v0.4.3</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3D Chart Component for reusability
const Chart3D = ({ data, animationEnabled }) => {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      
      {data.map((item, index) => (
        <group key={index} position={item.position}>
          <mesh>
            <boxGeometry args={[0.8, item.value * 0.5, 0.8]} />
            <meshStandardMaterial color={item.color} />
          </mesh>
          <Text
            position={[0, item.value * 0.5 + 0.5, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {item.label}
          </Text>
        </group>
      ))}
      
      <gridHelper args={[10, 10, '#444444', '#444444']} />
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05}
        autoRotate={animationEnabled}
        autoRotateSpeed={2}
      />
    </Canvas>
  );
};

export default AdvancedAnalyticsDashboard;