import React, { useState, useEffect } from 'react';
import './TaskDetailModal.css';

// v0.8.5: TaskDetailModal 완전한 CRUD 기능 구현
// functional_specification.md: "상세 창에서 각각의 태스크에 대해 수정, 삭제 등 모든 조작을 할 수 있습니다"
// functional_specification.md: "Enhanced Mission Control 메뉴도 패널도 필요 없어요"

const TaskDetailModal = ({ task, isVisible, onClose, onUpdate, onDelete, onAddSubtask }) => {
  // 편집 상태 관리
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  
  // 서브태스크 추가 상태
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtask, setNewSubtask] = useState({ text: '', keywords: '' });

  // 태스크 데이터 초기화
  useEffect(() => {
    if (task) {
      setEditedTask({
        id: task.id,
        text: task.text || task.name || '',
        category: task.category || 'general',
        priority: task.priority || 'medium',
        completed: task.completed || false,
        keywords: (task.keywords || []).join(', '),
        startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        subtasks: task.subtasks || []
      });
    }
  }, [task]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    };
    if (isVisible) {
      document.addEventListener('keydown', handleEsc, false);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc, false);
    };
  }, [isVisible, isEditing, onClose]);

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
      if (isEditing) {
        setIsEditing(false);
      } else {
        onClose();
      }
    }
  };

  // v0.8.5: 태스크 저장 (수정 기능)
  const handleSave = () => {
    if (!editedTask.text.trim()) {
      alert('태스크 제목을 입력해주세요.');
      return;
    }

    const updatedTask = {
      ...editedTask,
      keywords: editedTask.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0),
      startDate: editedTask.startDate ? new Date(editedTask.startDate) : new Date(),
      deadline: editedTask.deadline ? new Date(editedTask.deadline) : null
    };

    if (onUpdate) {
      onUpdate(task.id, updatedTask);
    }
    
    setIsEditing(false);
    console.log('✅ 태스크 수정 완료:', updatedTask.text);
  };

  // v0.8.5: 태스크 삭제
  const handleDelete = () => {
    const confirmMessage = `"${task.text || task.name}"을(를) 삭제하시겠습니까?${
      task.subtasks && task.subtasks.length > 0 ? `\n(${task.subtasks.length}개의 서브태스크도 함께 삭제됩니다)` : ''
    }`;
    
    if (window.confirm(confirmMessage)) {
      if (onDelete) {
        onDelete(task.id);
      }
      onClose();
      console.log('🗑️ 태스크 삭제:', task.text || task.name);
    }
  };

  // v0.8.5: 서브태스크 추가
  const handleAddSubtask = () => {
    if (!newSubtask.text.trim()) {
      alert('서브태스크 제목을 입력해주세요.');
      return;
    }

    const subtaskData = {
      text: newSubtask.text.trim(),
      keywords: newSubtask.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0),
      completed: false,
      startDate: new Date(),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 기본 7일 후
    };

    if (onAddSubtask) {
      onAddSubtask(task.id, subtaskData);
    }

    // 입력 폼 초기화
    setNewSubtask({ text: '', keywords: '' });
    setIsAddingSubtask(false);
    console.log('✅ 서브태스크 추가:', subtaskData.text);
  };

  // v0.8.5: 서브태스크 완료 상태 토글
  const handleSubtaskToggle = (subtaskIndex, completed) => {
    const updatedSubtasks = [...(task.subtasks || [])];
    updatedSubtasks[subtaskIndex] = {
      ...updatedSubtasks[subtaskIndex],
      completed: completed
    };

    if (onUpdate) {
      onUpdate(task.id, { subtasks: updatedSubtasks });
    }
    console.log('🔄 서브태스크 상태 변경:', updatedSubtasks[subtaskIndex].text, completed);
  };

  return (
    <div className="task-detail-modal-backdrop" onClick={handleBackdropClick}>
      <div className="task-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="task-type-icon">{taskTypeInfo.icon}</span>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask.text}
                  onChange={(e) => setEditedTask({...editedTask, text: e.target.value})}
                  className="edit-title-input"
                  placeholder="태스크 제목을 입력하세요"
                  autoFocus
                />
              ) : (
                <h2>{task.name || task.text}</h2>
              )}
              <p className="task-type-description">{taskTypeInfo.description}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* v0.8.5: 편집/저장 버튼 */}
            {task.type !== 'asteroid' && task.type !== 'sun' && (
              <button 
                className="modal-action-btn edit-btn" 
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
                title={isEditing ? "저장" : "편집"}
              >
                {isEditing ? '💾' : '✏️'}
              </button>
            )}
            
            {/* v0.8.5: 삭제 버튼 */}
            {task.type !== 'asteroid' && task.type !== 'sun' && (
              <button 
                className="modal-action-btn delete-btn" 
                onClick={handleDelete}
                title="삭제"
              >
                🗑️
              </button>
            )}
            
            <button className="modal-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="modal-body">
          {/* v0.8.5: 편집 모드에서 추가 필드들 */}
          {isEditing && (
            <div className="modal-section">
              <h3>⚙️ Task Settings</h3>
              <div className="edit-form">
                <div className="form-row">
                  <label>카테고리:</label>
                  <select
                    value={editedTask.category}
                    onChange={(e) => setEditedTask({...editedTask, category: e.target.value})}
                    className="edit-select"
                  >
                    <option value="work">업무</option>
                    <option value="personal">개인</option>
                    <option value="health">건강</option>
                    <option value="study">학습</option>
                    <option value="general">일반</option>
                  </select>
                </div>
                
                <div className="form-row">
                  <label>우선순위:</label>
                  <select
                    value={editedTask.priority}
                    onChange={(e) => setEditedTask({...editedTask, priority: e.target.value})}
                    className="edit-select"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
                
                <div className="form-row">
                  <label>시작일:</label>
                  <input
                    type="date"
                    value={editedTask.startDate}
                    onChange={(e) => setEditedTask({...editedTask, startDate: e.target.value})}
                    className="edit-input"
                  />
                </div>
                
                <div className="form-row">
                  <label>마감일:</label>
                  <input
                    type="date"
                    value={editedTask.deadline}
                    onChange={(e) => setEditedTask({...editedTask, deadline: e.target.value})}
                    className="edit-input"
                  />
                </div>
                
                <div className="form-row">
                  <label>키워드 (쉼표로 구분):</label>
                  <input
                    type="text"
                    value={editedTask.keywords}
                    onChange={(e) => setEditedTask({...editedTask, keywords: e.target.value})}
                    className="edit-input"
                    placeholder="키워드1, 키워드2, 키워드3"
                  />
                </div>
              </div>
            </div>
          )}

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
              {task.category && (
                <div className="status-item">
                  <span className="status-label">Category:</span>
                  <span className="status-value">{task.category}</span>
                </div>
              )}
              {task.priority && (
                <div className="status-item">
                  <span className="status-label">Priority:</span>
                  <span className={`status-value priority-${task.priority}`}>
                    {task.priority === 'high' ? '🔴 High' : 
                     task.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* v0.8.5: 서브태스크 관리 섹션 */}
          {(task.subtasks || task.type === 'planet') && (
            <div className="modal-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3>🛰️ Subtasks ({task.subtasks?.length || 0})</h3>
                {task.type === 'planet' && !isAddingSubtask && (
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => setIsAddingSubtask(true)}
                  >
                    + Add Subtask
                  </button>
                )}
              </div>

              {/* v0.8.5: 서브태스크 추가 폼 */}
              {isAddingSubtask && (
                <div className="add-subtask-form">
                  <input
                    type="text"
                    value={newSubtask.text}
                    onChange={(e) => setNewSubtask({...newSubtask, text: e.target.value})}
                    placeholder="서브태스크 제목을 입력하세요"
                    className="edit-input"
                    style={{ marginBottom: '10px' }}
                    autoFocus
                  />
                  <input
                    type="text"
                    value={newSubtask.keywords}
                    onChange={(e) => setNewSubtask({...newSubtask, keywords: e.target.value})}
                    placeholder="키워드 (쉼표로 구분)"
                    className="edit-input"
                    style={{ marginBottom: '10px' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-sm btn-primary" onClick={handleAddSubtask}>
                      ✅ Add
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary" 
                      onClick={() => {
                        setIsAddingSubtask(false);
                        setNewSubtask({ text: '', keywords: '' });
                      }}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* 서브태스크 목록 */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="subtasks-list">
                  {task.subtasks.map((subtask, index) => (
                    <div key={index} className={`subtask-item ${subtask.completed ? 'completed' : ''}`}>
                      <button
                        className="subtask-toggle-btn"
                        onClick={() => handleSubtaskToggle(index, !subtask.completed)}
                        title={subtask.completed ? "Mark as incomplete" : "Mark as complete"}
                      >
                        {subtask.completed ? '✅' : '⏳'}
                      </button>
                      <div className="subtask-content">
                        <span className="subtask-text">{subtask.text}</span>
                        {subtask.keywords && subtask.keywords.length > 0 && (
                          <div className="subtask-keywords">
                            {subtask.keywords.map((keyword, kidx) => (
                              <span key={kidx} className="mini-keyword">{keyword}</span>
                            ))}
                          </div>
                        )}
                        {subtask.deadline && (
                          <div className="subtask-deadline">
                            📅 {new Date(subtask.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 날짜 정보 */}
          <div className="modal-section">
            <h3>📅 Timeline</h3>
            <div className="timeline-info">
              <div className="timeline-item">
                <strong>Created:</strong> {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'Unknown'}
              </div>
              {task.startDate && (
                <div className="timeline-item">
                  <strong>Start Date:</strong> {new Date(task.startDate).toLocaleDateString()}
                </div>
              )}
              {task.deadline && (
                <div className="timeline-item">
                  <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
                  <span className={`deadline-status ${
                    new Date(task.deadline) < new Date() ? 'overdue' : 
                    newDate(task.deadline) - new Date() < 3 * 24 * 60 * 60 * 1000 ? 'urgent' : 'normal'
                  }`}>
                    {new Date(task.deadline) < new Date() ? ' (Overdue)' : 
                     new Date(task.deadline) - new Date() < 3 * 24 * 60 * 60 * 1000 ? ' (Urgent)' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 소행성 특별 정보 */}
          {task.type === 'asteroid' && task.suggestion && (
            <div className="modal-section">
              <h3>☄️ AI Action Suggestion</h3>
              <div className="asteroid-info">
                <div className="asteroid-action">
                  <strong>Action:</strong> {task.suggestion.action}
                </div>
                <div className="asteroid-description">
                  <strong>Description:</strong> {task.suggestion.description}
                </div>
                <div className="asteroid-impact">
                  <strong>Impact Level:</strong> {task.suggestion.impact}/3
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          
          {/* v0.8.5: 완료 상태 토글 버튼 */}
          {task.type !== 'asteroid' && task.type !== 'sun' && onUpdate && (
            <button className="btn btn-primary" onClick={() => {
              onUpdate(task.id, { completed: !task.completed });
              console.log('🔄 태스크 완료 상태 변경:', task.text || task.name, !task.completed);
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
