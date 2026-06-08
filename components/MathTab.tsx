'use client';

import { useState, useRef, useEffect } from 'react';
import { REWARD_PER } from '@/lib/constants';
import type { RoadmapStep, PageLog, MathState } from '@/types';

interface MathTabProps {
  roadmap: RoadmapStep[];
  mathState: MathState;
  pageLogs: PageLog[];
  stickerCount: number;
  onAddStep: (title: string, period: string) => void;
  onUpdateStep: (step: number, title: string, period: string) => void;
  onDeleteStep: (step: number) => void;
  onToggleDone: (step: number) => void;
  onSavePages: (pages: number, currentStep: number) => void;
  onUpdateGoal: (step: number, goal: number) => void;
  showToast: (msg: string) => void;
}

export default function MathTab({
  roadmap,
  mathState,
  pageLogs,
  stickerCount,
  onAddStep,
  onUpdateStep,
  onDeleteStep,
  onToggleDone,
  onSavePages,
  onUpdateGoal,
  showToast,
}: MathTabProps) {
  const { current_step: currentStep, done_steps: doneSteps } = mathState;

  // 로드맵 추가 입력
  const [addTitle, setAddTitle] = useState('');
  const [addPeriod, setAddPeriod] = useState('');
  const periodInputRef = useRef<HTMLInputElement>(null);

  // 인라인 편집
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPeriod, setEditPeriod] = useState('');
  const editTitleRef = useRef<HTMLInputElement>(null);

  // 페이지 입력
  const [pageInput, setPageInput] = useState('');

  // 목표 편집
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  useEffect(() => {
    if (editingStep !== null && editTitleRef.current) {
      editTitleRef.current.focus();
      editTitleRef.current.select();
    }
  }, [editingStep]);

  const startEdit = (r: RoadmapStep) => {
    setEditingStep(r.step);
    setEditTitle(r.title);
    setEditPeriod(r.period);
  };

  const commitEdit = () => {
    if (editingStep === null) return;
    if (editTitle.trim()) {
      onUpdateStep(editingStep, editTitle.trim(), editPeriod.trim());
    }
    setEditingStep(null);
  };

  const handleAddStep = () => {
    if (!addTitle.trim()) { showToast('단원 이름을 입력해줘'); return; }
    onAddStep(addTitle.trim(), addPeriod.trim());
    setAddTitle('');
    setAddPeriod('');
  };

  const handleSavePages = () => {
    const pages = parseInt(pageInput);
    onSavePages(pages, currentStep);
    setPageInput('');
  };

  const commitGoal = () => {
    const val = parseInt(goalInput);
    if (val > 0) onUpdateGoal(currentStep, val);
    setEditingGoal(false);
  };

  // 현재 단계 진도 계산
  const currentRoadmap = roadmap.find((r) => r.step === currentStep);
  const goal = currentRoadmap?.goal || 10;
  const stepLogs = pageLogs.filter((l) => l.step === currentStep);
  const totalPages = stepLogs.reduce((s, l) => s + l.pages, 0);
  const pct = Math.min((totalPages / goal) * 100, 100);
  const recentLogs = [...stepLogs].reverse().slice(0, 5);

  // 스티커
  const inCycle = stickerCount % REWARD_PER;
  const earned = Math.floor(stickerCount / REWARD_PER);
  const left = REWARD_PER - inCycle;

  return (
    <>
      {/* 로드맵 */}
      <div className="section">
        <div className="section-header">
          <span className="section-label">로드맵</span>
        </div>
        <div className="roadmap-list">
          {roadmap.map((r) => {
            const isDone = doneSteps.includes(r.step);
            const isCurrent = r.step === currentStep && !isDone;
            const stepCls = isDone ? 'done' : isCurrent ? 'current' : '';
            const isEditing = editingStep === r.step;

            if (isEditing) {
              return (
                <div key={r.step} className="roadmap-item">
                  <div className={`roadmap-step ${stepCls}`}>{r.step}</div>
                  <div className="roadmap-info">
                    <input
                      ref={editTitleRef}
                      className="roadmap-title-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); }}
                      onBlur={commitEdit}
                    />
                    <input
                      className="roadmap-period-edit"
                      value={editPeriod}
                      placeholder="기간"
                      onChange={(e) => setEditPeriod(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); }}
                      onBlur={commitEdit}
                    />
                  </div>
                  <button
                    className="roadmap-edit-btn"
                    onClick={() => { setEditingStep(null); onDeleteStep(r.step); }}
                    aria-label="삭제"
                  >
                    ×
                  </button>
                </div>
              );
            }

            return (
              <div key={r.step} className="roadmap-item">
                <div
                  className={`roadmap-step ${stepCls}`}
                  onClick={() => onToggleDone(r.step)}
                >
                  {r.step}
                </div>
                <div className="roadmap-info" onClick={() => startEdit(r)}>
                  <div className={`roadmap-title${!isCurrent && !isDone ? ' dim' : ''}`}>
                    {r.title}
                  </div>
                  <div className="roadmap-period">{r.period || '기간 없음'}</div>
                </div>
                {isDone && <span className="roadmap-check">✓</span>}
                <button
                  className="roadmap-edit-btn"
                  onClick={() => onDeleteStep(r.step)}
                  aria-label="삭제"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
        <div className="roadmap-add-row">
          <input
            className="roadmap-add-input"
            type="text"
            placeholder="단원 이름 (예: 분수 약분)"
            maxLength={20}
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') periodInputRef.current?.focus();
            }}
          />
          <input
            ref={periodInputRef}
            className="roadmap-period-input"
            type="text"
            placeholder="기간"
            maxLength={8}
            value={addPeriod}
            onChange={(e) => setAddPeriod(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddStep(); }}
          />
          <button className="roadmap-add-btn" onClick={handleAddStep}>
            +
          </button>
        </div>
      </div>

      {/* 문제집 진도 */}
      <div className="section">
        <div className="section-header">
          <span className="section-label">문제집 진도</span>
        </div>
        <div className="progress-wrap">
          <div className="progress-book-label">
            {currentRoadmap ? `${currentRoadmap.step}단계 · ${currentRoadmap.title}` : ''}
          </div>
          <div className="progress-input-row">
            <span className="progress-input-label">오늘 푼 쪽</span>
            <input
              className="page-input"
              type="number"
              min="1"
              max="999"
              placeholder="0"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSavePages(); }}
            />
            <button className="page-save-btn" onClick={handleSavePages}>
              기록
            </button>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-label">
              <span>누적 {totalPages}p</span>
              {editingGoal ? (
                <span>
                  목표{' '}
                  <input
                    className="goal-edit-input"
                    type="number"
                    min="1"
                    max="9999"
                    value={goalInput}
                    autoFocus
                    onChange={(e) => setGoalInput(e.target.value)}
                    onBlur={commitGoal}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitGoal(); }}
                  />
                  p
                </span>
              ) : (
                <span
                  style={{ cursor: 'pointer', textDecoration: 'underline dotted', textUnderlineOffset: '3px' }}
                  onClick={() => { setGoalInput(String(goal)); setEditingGoal(true); }}
                >
                  목표 {goal}p
                </span>
              )}
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="page-log">
            {recentLogs.map((l) => {
              const d = new Date(l.logged_at);
              return (
                <div key={l.id} className="page-log-item">
                  <span>{d.getMonth() + 1}.{d.getDate()}</span>
                  <span className="page-log-val">+{l.pages}p</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 스티커 */}
      <div className="section">
        <div className="section-header">
          <span className="section-label">스티커</span>
        </div>
        <div className="sticker-wrap">
          <div className="sticker-count-row">
            <div className="sticker-count-num">{stickerCount}</div>
            <div className="sticker-count-total">개 누적</div>
          </div>
          <div className="sticker-grid">
            {Array.from({ length: REWARD_PER }, (_, i) => (
              <div key={i} className={`sticker-cell${i >= inCycle ? ' empty' : ''}`}>
                {i < inCycle ? '⭐' : ''}
              </div>
            ))}
          </div>
          <div className="reward-next">
            {left > 0 ? (
              <>
                <div className="reward-icon">💵</div>
                <div>
                  <div className="reward-label">{left}개 더 모으면</div>
                  <div className="reward-desc">
                    만원 {earned > 0 ? `(지금까지 ${earned}번 달성!)` : ''}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="reward-icon">🎉</div>
                <div>
                  <div className="reward-label">만원 달성!</div>
                  <div className="reward-desc">엄마한테 말해봐</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
