import React, { useEffect } from 'react';
import './TaskDetailModal.css';

// v0.6.1: TaskDetailModal 컴포넌트 생성 (functional_specification.md 요구사항)
// "태양, 행성, 위성, 소행성을 클릭하면 창이 떠서 상세정보를 볼 수 있습니다"

const TaskDetailModal = ({ task, isVisible, onClose, onUpdate }) => {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    if (isVisible) {
      document.addEventListener('keydown', handleEsc, false);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc, false);
    };
  }, [isVisible, onClose]);

  // 모달이 보이지 않으면 렌더링하지 않음
  if (!isVisible || !task) {
    return null;
  }

  // 태스크 타입에 따른 아이콘 및 타이틀 결정
  const getTaskTypeInfo = (task) => {
    if (task.type === 'sun' || task.hierarchyType === 'sun') {
      return {
        icon: '☀️',
        title: 'Sun (Task Group)',
        description: 'AI가 생성한 태스크 그룹'
      };
    } else if (task.type === 'planet' || task.hierarchyType === 'planet') {
      return {
        icon: '🪐',
        title: 'Planet (Main Task)',
        description: '메인 태스크'
      };
    } else if (task.type === 'satellite' || task.hierarchyType === 'satellite') {
      return {
        icon: '🛰️',
        title: 'Satellite (Sub Task)',
        description: '서브 태스크'
      };
    } else if (task.type === 'asteroid') {
      return {
        icon: '☄️',
        title: 'Asteroid (Action)',
        description: 'AI가 생성한 액션 아이템'
      };
    } else {
      return {
        icon: '📋',
        title: 'Task',
        description: '일반 태스크'
      };
    }
  };

  const taskTypeInfo = getTaskTypeInfo(task);

  // 모달 배경 클릭 시 닫기
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="task-detail-modal-backdrop" onClick={handleBackdropClick}>
      <div className="task-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="task-type-icon">{taskTypeInfo.icon}</span>
            <div>
              <h2>{task.name || task.text}</h2>
              <p className="task-type-description">{taskTypeInfo.description}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 본문 */}
        <div className="modal-body">
          {/* 키워드 - functional_specification.md 요구사항: 키워드 항상 표시 */}
          <div className="modal-section">
            <h3>🏷️ Keywords</h3>
            <div className="keywords-display">
              {task.keywords && task.keywords.length > 0 ? (
                task.keywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag">
                    {keyword}
                  </span>
                ))
              ) : (
                <span className="no-keywords">No keywords available</span>
              )}
            </div>
          </div>

          {/* 상태 정보 */}
          <div className="modal-section">
            <h3>📊 Status</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">Progress:</span>
                <span className={`status-value ${task.completed ? 'completed' : 'in-progress'}`}>
                  {task.completed ? '✅ Completed' : '⏳ In Progress'}
                </span>
              </div>
            </div>
          </div>

          {/* 서브태스크 정보 */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="modal-section">
              <h3>🛰️ Subtasks ({task.subtasks.length})</h3>
              <div className="subtasks-list">
                {task.subtasks.map((subtask, index) => (
                  <div key={index} className={`subtask-item ${subtask.completed ? 'completed' : ''}`}>
                    <span className="subtask-status">
                      {subtask.completed ? '✅' : '⏳'}
                    </span>
                    <span className="subtask-text">{subtask.text}</span>
                    {subtask.keywords && (
                      <div className="subtask-keywords">
                        {subtask.keywords.map((keyword, kidx) => (
                          <span key={kidx} className="mini-keyword">{keyword}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 생성일 */}
          <div className="modal-section">
            <h3>📅 Timeline</h3>
            <div className="timeline-info">
              <div className="timeline-item">
                <strong>Created:</strong> {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'Unknown'}
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {onUpdate && (
            <button className="btn btn-primary" onClick={() => {
              onUpdate(task.id, { completed: !task.completed });
              onClose();
            }}>
              {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;