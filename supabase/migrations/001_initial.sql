-- 체크리스트 항목 목록
create table if not exists check_items (
  id text primary key,
  label text not null,
  sort_order int not null default 0
);

-- 날짜별 체크 상태 (checks: { [id]: boolean })
create table if not exists daily_checks (
  date text primary key,
  checks jsonb not null default '{}'::jsonb
);

-- 날짜별 한 줄 메모
create table if not exists daily_memos (
  date text primary key,
  content text not null
);

-- 수학 로드맵 단계
create table if not exists roadmap_steps (
  step int primary key,
  title text not null,
  period text not null default '',
  goal int not null default 10
);

-- 수학 진행 상태 (단일 행, id=1 고정)
create table if not exists math_state (
  id int primary key default 1,
  current_step int not null default 1,
  done_steps int[] not null default '{}'::int[]
);

-- 문제집 페이지 기록
create table if not exists page_logs (
  id bigserial primary key,
  step int not null,
  pages int not null,
  logged_at timestamptz not null default now()
);

-- 스티커 상태 (단일 행, id=1 고정)
create table if not exists sticker_state (
  id int primary key default 1,
  count int not null default 0
);

-- 날짜별 스티커 리워드 지급 여부
create table if not exists daily_rewards (
  date text primary key,
  rewarded boolean not null default false
);

-- 날짜별 페널티 처리 여부
create table if not exists daily_penalties (
  date text primary key,
  processed boolean not null default false
);

-- RLS 비활성화 (단일 사용자 앱)
alter table check_items disable row level security;
alter table daily_checks disable row level security;
alter table daily_memos disable row level security;
alter table roadmap_steps disable row level security;
alter table math_state disable row level security;
alter table page_logs disable row level security;
alter table sticker_state disable row level security;
alter table daily_rewards disable row level security;
alter table daily_penalties disable row level security;
