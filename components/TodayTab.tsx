'use client';

import { useState, useEffect, useRef } from 'react';
import { SCHEDULE } from '@/lib/constants';
import type { CheckItem, DailyChecks } from '@/types';

interface TodayTabProps {
  weekday: string;
  dateBig: string;
  checkItems: CheckItem[];
  dailyChecks: DailyChecks;
  memo: string;
  onToggleCheck: (id: string) => void;
  onAddCheckItem: (label: string) => void;
  onDeleteCheckItem: (id: string) => void;
  onSaveMemo: (content: string) => void;
}

export default function TodayTab({
  weekday,
  dateBig,
  checkItems,
  dailyChecks,
  memo,
  onToggleCheck,
  onAddCheckItem,
  onDeleteCheckItem,
  onSaveMemo,
}: TodayTabProps) {
  const [addInput, setAddInput] = useState('');
  const [memoValue, setMemoValue] = useState(memo);
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMemoValue(memo);
  }, [memo]);

  const handleAddCheck = () => {
    const label = addInput.trim();
    if (!label) return;
    onAddCheckItem(label);
    setAddInput('');
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddCheck();
  };

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  return (
    <>
      <div className="today-date-banner">
        <div className="today-weekday">{weekday}</div>
        <div className="today-date-big">{dateBig}</div>
      </div>

      {/* 시간표 */}
      <div className="section">
        <div className="section-header">
          <span className="section-label">시간표</span>
        </div>
        <div className="schedule-list">
          {SCHEDULE.map((s) => {
            const [h, m] = s.time.split(':').map(Number);
            const sMin = h * 60 + m;
            const isActive = Math.abs(sMin - nowMin) < 90;
            return (
              <div className="schedule-row" key={s.time}>
                <span className="schedule-time">{s.time}</span>
                <span className={`schedule-dot${isActive ? ' active' : ''}`} />
                <span className="schedule-name">{s.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 체크리스트 */}
      <div className="section">
        <div className="section-header">
          <span className="section-label">체크리스트</span>
        </div>
        <div className="checklist">
          {checkItems.map((c) => {
            const done = !!dailyChecks[c.id];
            return (
              <div key={c.id} className={`check-item${done ? ' done' : ''}`}>
                <div
                  className={`check-box${done ? ' checked' : ''}`}
                  onClick={() => onToggleCheck(c.id)}
                />
                <span className="check-label" onClick={() => onToggleCheck(c.id)}>
                  {c.label}
                </span>
                <button
                  className="check-delete"
                  onClick={() => onDeleteCheckItem(c.id)}
                  aria-label="삭제"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
        <div className="check-add-row">
          <input
            ref={addInputRef}
            className="check-add-input"
            type="text"
            placeholder="할 일 추가..."
            maxLength={30}
            value={addInput}
            onChange={(e) => setAddInput(e.target.value)}
            onKeyDown={handleAddKeyDown}
          />
          <button className="check-add-btn" onClick={handleAddCheck}>
            +
          </button>
        </div>
      </div>

      {/* 한 줄 메모 */}
      <div className="section">
        <div className="section-header">
          <span className="section-label">오늘 한 줄</span>
        </div>
        <div className="memo-wrap">
          <textarea
            className="memo-input"
            rows={2}
            placeholder="오늘 하루 한 줄로 남겨봐..."
            value={memoValue}
            onChange={(e) => setMemoValue(e.target.value)}
          />
          <button className="memo-save-btn" onClick={() => onSaveMemo(memoValue)}>
            저장
          </button>
        </div>
      </div>
    </>
  );
}
