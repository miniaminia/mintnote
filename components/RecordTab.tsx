'use client';

import { useState } from 'react';
import { isSchoolDay, todayKey } from '@/lib/constants';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

interface RecordTabProps {
  records: Record<string, string>;
}

export default function RecordTab({ records }: RecordTabProps) {
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const changeMonth = (delta: number) => {
    setCalMonth((prev) => {
      const next = prev + delta;
      if (next < 0) {
        setCalYear((y) => y - 1);
        return 11;
      }
      if (next > 11) {
        setCalYear((y) => y + 1);
        return 0;
      }
      return next;
    });
  };

  const todayStr = todayKey();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const lastDate = new Date(calYear, calMonth + 1, 0).getDate();

  const sorted = Object.entries(records)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 20);

  return (
    <>
      {/* 달력 */}
      <div className="section">
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={() => changeMonth(-1)}>
            ‹
          </button>
          <div className="cal-month">
            {calYear}년 {calMonth + 1}월
          </div>
          <button className="cal-nav-btn" onClick={() => changeMonth(1)}>
            ›
          </button>
        </div>
        <div className="calendar-wrap">
          <div className="cal-grid">
            {WEEKDAY_LABELS.map((l) => (
              <div key={l} className="cal-day-label">
                {l}
              </div>
            ))}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="cal-day empty" />
            ))}
            {Array.from({ length: lastDate }, (_, i) => {
              const d = i + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const isDone = !!records[dateStr];
              const isToday = dateStr === todayStr;
              const isOff = !isSchoolDay(dateStr);
              const cls = [
                'cal-day',
                isDone ? 'done' : '',
                isToday ? 'today' : '',
                isOff ? 'off' : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <div key={dateStr} className={cls}>
                  {d}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 기록 목록 */}
      <div className="section">
        <div className="section-header">
          <span className="section-label">한 줄 기록</span>
        </div>
        <div className="record-list">
          {sorted.length === 0 ? (
            <div className="empty-state">
              아직 기록이 없어. 오늘 탭에서 첫 줄 써봐!
            </div>
          ) : (
            sorted.map(([date, text]) => {
              const d = new Date(date);
              const label = `${d.getMonth() + 1}.${d.getDate()}`;
              return (
                <div key={date} className="record-item">
                  <span className="record-date">{label}</span>
                  <div className="record-dot" />
                  <span className="record-text">{text}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
