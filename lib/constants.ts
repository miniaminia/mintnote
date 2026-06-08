import type { CheckItem, RoadmapStep } from '@/types';

export const SCHEDULE = [
  { time: '기상', tasks: ['양압기 정리', '눈뜨스'] },
  { time: '출근 후', tasks: ['모닝페이지', '몰입노트', '확언쓰기', '책읽기'] },
  { time: '점심', tasks: ['낮잠', '걷기'] },
  { time: '오후 1', tasks: ['노션 정리', '사진 업로드', 'PMS 확인', '이닦기'] },
  { time: '오후 2', tasks: ['위너루틴', '책상닦기', '블로깅'] },
  { time: '퇴근 후', tasks: ['운동', '씻기', '내일 준비'] },
];

export const DEFAULT_CHECKS: CheckItem[] = [
  { id: 'cpap', label: '양압기 정리', sort_order: 0 },
  { id: 'morning_pages', label: '모닝페이지', sort_order: 1 },
  { id: 'focus_note', label: '몰입노트', sort_order: 2 },
  { id: 'affirm', label: '확언쓰기', sort_order: 3 },
  { id: 'reading', label: '책읽기', sort_order: 4 },
  { id: 'walk', label: '걷기', sort_order: 5 },
  { id: 'notion', label: '노션 정리', sort_order: 6 },
  { id: 'blog', label: '블로깅', sort_order: 7 },
  { id: 'exercise', label: '운동', sort_order: 8 },
  { id: 'tomorrow_prep', label: '내일 준비', sort_order: 9 },
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
