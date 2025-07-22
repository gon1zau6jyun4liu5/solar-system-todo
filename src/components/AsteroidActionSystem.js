import React, { useState, useEffect } from 'react';
import './AsteroidActionSystem.css';

const AsteroidActionSystem = ({ asteroids, solarSystems, onAsteroidAction }) => {
  const [visibleAsteroids, setVisibleAsteroids] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // 소행성 가시성 및 알림 관리
  useEffect(() => {
    if (!asteroids || asteroids.length === 0) {
      setVisibleAsteroids([]);
      return;
    }

    // 활성 소행성들만 필터링
    const activeAsteroids = asteroids.filter(asteroid => {
      const timeLeft = asteroid.timeLimit - Date.now();
      return timeLeft > 0;
    });

    setVisibleAsteroids(activeAsteroids);

    // 긴급한 소행성들에 대한 알림 생성
    const urgentAsteroids = activeAsteroids.filter(asteroid => {
      const timeLeft = (asteroid.timeLimit - Date.now()) / 1000;
      return timeLeft <= 15 && timeLeft > 0; // 15초 이하 남았을 때
    });

    if (urgentAsteroids.length > 0) {
      urgentAsteroids.forEach(asteroid => {
        showNotification(asteroid);
      });
    }
  }, [asteroids]);

  // 알림 표시 함수
  const showNotification = (asteroid) => {
    const notification = {
      id: `notif-${asteroid.id}`,
      asteroid,
      timestamp: Date.now()
    };

    setNotifications(prev => {
      // 중복 알림 방지
      if (prev.some(n => n.asteroid.id === asteroid.id)) {
        return prev;
      }
      return [...prev, notification];
    });

    // 자동 제거 (5초 후)
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // 소행성 액션 처리
  const handleAsteroidAction = (asteroidId, action) => {
    const asteroid = visibleAsteroids.find(a => a.id === asteroidId);
    if (!asteroid) return;

    // 부모 컴포넌트로 액션 전달
    if (onAsteroidAction) {
      onAsteroidAction(asteroidId, action);
    }

    // 처리된 소행성 알림 제거
    setNotifications(prev => prev.filter(n => n.asteroid.id !== asteroidId));

    // 액션 결과 피드백
    showActionFeedback(asteroid, action);
  };

  // 액션 결과 피드백 표시
  const showActionFeedback = (asteroid, action) => {
    const feedback = {
      id: `feedback-${Date.now()}`,
      message: action === 'accept' 
        ? `✅ "${asteroid.suggestion.action}" 제안을 수락했습니다` 
        : `❌ "${asteroid.suggestion.action}" 제안을 거부했습니다`,
      type: action,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, feedback]);

    // 피드백 자동 제거 (3초 후)
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== feedback.id));
    }, 3000);
  };

  // 소행성과 연결된 태스크 정보 가져오기
  const getTaskInfo = (asteroidId) => {
    const asteroid = visibleAsteroids.find(a => a.id === asteroidId);
    if (!asteroid) return null;

    const system = solarSystems.find(s => s.id === asteroid.targetSystemId);
    if (!system) return null;

    const planet = system.planets.find(p => p.id === asteroid.targetPlanetId);
    return planet ? planet.task : null;
  };

  // 시간 포맷팅
  const formatTimeLeft = (timeLimit) => {
    const timeLeft = Math.max(0, Math.ceil((timeLimit - Date.now()) / 1000));
    
    if (timeLeft > 60) {
      return `${Math.ceil(timeLeft / 60)}분 ${timeLeft % 60}초`;
    }
    return `${timeLeft}초`;
  };

  // 긴급도에 따른 스타일 결정
  const getUrgencyStyle = (timeLimit) => {
    const timeLeft = (timeLimit - Date.now()) / 1000;
    
    if (timeLeft <= 10) {
      return {
        borderColor: '#f44336',
        glowColor: '#f44336',
        priority: 'critical'
      };
    } else if (timeLeft <= 30) {
      return {
        borderColor: '#ff9800',
        glowColor: '#ff9800',
        priority: 'high'
      };
    } else {
      return {
        borderColor: '#ffc107',
        glowColor: '#ffc107',
        priority: 'medium'
      };
    }
  };

  if (visibleAsteroids.length === 0) {
    return null;
  }

  return (
    <>
      {/* 소행성 액션 패널 */}
      <div className="asteroid-action-panel">
        <div className="panel-header">
          <h3>☄️ 소행성 액션 제안</h3>
          <span className="asteroid-count">{visibleAsteroids.length}</span>
        </div>
        
        <div className="asteroid-list">
          {visibleAsteroids.map(asteroid => {
            const taskInfo = getTaskInfo(asteroid.id);
            const urgencyStyle = getUrgencyStyle(asteroid.timeLimit);
            const timeLeft = formatTimeLeft(asteroid.timeLimit);
            
            return (
              <div 
                key={asteroid.id} 
                className={`asteroid-item priority-${urgencyStyle.priority}`}
                style={{ 
                  borderColor: urgencyStyle.borderColor,
                  boxShadow: `0 0 10px ${urgencyStyle.glowColor}40`
                }}
              >
                <div className="asteroid-header">
                  <h4>💡 {asteroid.suggestion.action}</h4>
                  <span 
                    className="time-remaining"
                    style={{ color: urgencyStyle.borderColor }}
                  >
                    ⏱️ {timeLeft}
                  </span>
                </div>
                
                <div className="asteroid-details">
                  <p className="suggestion-description">
                    {asteroid.suggestion.description}
                  </p>
                  
                  {taskInfo && (
                    <div className="task-info">
                      <span className="task-name">🎯 {taskInfo.text}</span>
                      <div className="impact-indicator">
                        <span>영향도: </span>
                        {'★'.repeat(asteroid.suggestion.impact)}
                        {'☆'.repeat(3 - asteroid.suggestion.impact)}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="asteroid-actions">
                  <button 
                    className="asteroid-action-btn accept"
                    onClick={() => handleAsteroidAction(asteroid.id, 'accept')}
                  >
                    ✅ 수락
                  </button>
                  <button 
                    className="asteroid-action-btn reject"
                    onClick={() => handleAsteroidAction(asteroid.id, 'reject')}
                  >
                    ❌ 거부
                  </button>
                </div>
                
                {/* 진행률 표시 */}
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.max(0, Math.min(100, ((asteroid.timeLimit - Date.now()) / (90 * 1000)) * 100))}%`,
                      backgroundColor: urgencyStyle.borderColor
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 통계 정보 */}
        <div className="panel-footer">
          <div className="stats">
            <span>🔥 긴급: {visibleAsteroids.filter(a => getUrgencyStyle(a.timeLimit).priority === 'critical').length}</span>
            <span>⚡ 높음: {visibleAsteroids.filter(a => getUrgencyStyle(a.timeLimit).priority === 'high').length}</span>
            <span>⚠️ 보통: {visibleAsteroids.filter(a => getUrgencyStyle(a.timeLimit).priority === 'medium').length}</span>
          </div>
        </div>
      </div>

      {/* 알림 시스템 */}
      <div className="asteroid-notifications">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification ${notification.type || 'warning'}`}
          >
            {notification.message || (
              <>
                <div className="notification-icon">⚠️</div>
                <div className="notification-content">
                  <strong>긴급 액션 필요!</strong>
                  <p>"{notification.asteroid.suggestion.action}" - {formatTimeLeft(notification.asteroid.timeLimit)} 남음</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 소행성 상태 모니터 */}
      <div className="asteroid-monitor">
        <div className="monitor-item">
          <span className="monitor-label">활성 소행성:</span>
          <span className="monitor-value">{visibleAsteroids.length}</span>
        </div>
        <div className="monitor-item">
          <span className="monitor-label">총 제안:</span>
          <span className="monitor-value">
            {visibleAsteroids.reduce((sum, a) => sum + a.suggestion.impact, 0)}
          </span>
        </div>
        <div className="monitor-item critical">
          <span className="monitor-label">긴급:</span>
          <span className="monitor-value">
            {visibleAsteroids.filter(a => {
              const timeLeft = (a.timeLimit - Date.now()) / 1000;
              return timeLeft <= 15;
            }).length}
          </span>
        </div>
      </div>
    </>
  );
};

export default AsteroidActionSystem;