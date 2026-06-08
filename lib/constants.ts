import type { CheckItem, RoadmapStep } from '@/types';

export const SCHEDULE = [
  { time: '09:00', name: '하루 계획 쓰기' },
  { time: '09:15', name: '수학 공부' },
  { time: '10:15', name: '휴식' },
  { time: '10:30', name: '국어 / 독서' },
  { time: '11:30', name: '점심 + 자유시간' },
  { time: '12:30', name: '과학 / 복습' },
  { time: '13:30', name: '링피트 1시간' },
  { time: '14:30', name: '오늘 한 줄 기록' },
  { time: '15:00', name: '끝!' },
];

export const DEFAULT_CHECKS: CheckItem[] = [
  { id: 'math', label: '수학', sort_order: 0 },
  { id: 'korean', label: '국어', sort_order: 1 },
  { id: 'science', label: '과학', sort_order: 2 },
  { id: 'ringfit', label: '링피트 1시간', sort_order: 3 },
];

export const DEFAULT_ROADMAP: RoadmapStep[] = [
  { step: 1, title: '분수 약분 / 통분', period: '6월', goal: 10 },
  { step: 2, title: '소수·분수 사칙연산', period: '7월', goal: 10 },
  { step: 3, title: '비율·비례식', period: '8월', goal: 10 },
  { step: 4, title: '정수·유리수', period: '9월', goal: 10 },
  { step: 5, title: '일차방정식', period: '10월', goal: 10 },
  { step: 6, title: '함수·좌표', period: '11월', goal: 10 },
  { step: 7, title: '총복습 + 실전', period: '12월~2월', goal: 10 },
];

export const REWARD_PER = 10;

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 2026~2027 한국 공휴일
const HOLIDAYS = new Set([
  '2026-01-01', '2026-01-28', '2026-01-29', '2026-01-30',
  '2026-03-01', '2026-05-05', '2026-05-15', '2026-06-06',
  '2026-06-08', '2026-08-15', '2026-09-24', '2026-09-25',
  '2026-09-26', '2026-10-03', '2026-10-09', '2026-12-25',
  '2027-01-01', '2027-02-15', '2027-02-16', '2027-02-17',
  '2027-03-01', '2027-05-03', '2027-05-05', '2027-06-06',
  '2027-08-15', '2027-10-03', '2027-10-09', '2027-12-25',
]);

export function isSchoolDay(dateStr: string): boolean {
  const d = new Date(dateStr + 'T00:00:00');
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return false;
  if (HOLIDAYS.has(dateStr)) return false;
  return true;
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
