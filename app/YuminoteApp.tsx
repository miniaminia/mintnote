'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { DEFAULT_CHECKS, DEFAULT_ROADMAP, WEEKDAYS, isSchoolDay, todayKey } from '@/lib/constants';
import type { CheckItem, DailyChecks, RoadmapStep, PageLog, MathState } from '@/types';
import TodayTab from '@/components/TodayTab';
import RecordTab from '@/components/RecordTab';
import MathTab from '@/components/MathTab';
import Toast from '@/components/Toast';

type Tab = 'today' | 'record' | 'math';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 오늘 탭
  const [checkItems, setCheckItems] = useState<CheckItem[]>([]);
  const [dailyChecks, setDailyChecks] = useState<DailyChecks>({});
  const [memo, setMemo] = useState('');

  // 기록 탭
  const [records, setRecords] = useState<Record<string, string>>({});

  // 수학 탭
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [mathState, setMathState] = useState<MathState>({ current_step: 1, done_steps: [] });
  const [pageLogs, setPageLogs] = useState<PageLog[]>([]);
  const [stickerCount, setStickerCount] = useState(0);
  // 최신 sticker count를 ref로 유지 (클로저 문제 방지)
  const stickerRef = useRef(0);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2000);
  }, []);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll() {
    const today = todayKey();

    // 체크 아이템
    let { data: items } = await supabase
      .from('check_items')
      .select('*')
      .order('sort_order');
    if (!items || items.length === 0) {
      const { data: inserted } = await supabase
        .from('check_items')
        .insert(DEFAULT_CHECKS)
        .select();
      items = inserted ?? DEFAULT_CHECKS;
    }
    const checkItemList = (items ?? DEFAULT_CHECKS) as CheckItem[];
    setCheckItems(checkItemList);

    // 오늘 체크 상태
    const { data: checksData } = await supabase
      .from('daily_checks')
      .select('checks')
      .eq('date', today)
      .maybeSingle();
    setDailyChecks((checksData?.checks as DailyChecks) ?? {});

    // 오늘 메모
    const { data: memoData } = await supabase
      .from('daily_memos')
      .select('content')
      .eq('date', today)
      .maybeSingle();
    setMemo(memoData?.content ?? '');

    // 전체 메모 (기록 탭)
    const { data: allMemos } = await supabase
      .from('daily_memos')
      .select('date, content')
      .order('date', { ascending: false });
    const recordMap: Record<string, string> = {};
    allMemos?.forEach((m) => { recordMap[m.date] = m.content; });
    setRecords(recordMap);

    // 로드맵
    let { data: roadmapData } = await supabase
      .from('roadmap_steps')
      .select('*')
      .order('step');
    if (!roadmapData || roadmapData.length === 0) {
      const { data: inserted } = await supabase
        .from('roadmap_steps')
        .insert(DEFAULT_ROADMAP)
        .select();
      roadmapData = inserted ?? DEFAULT_ROADMAP;
    }
    setRoadmap((roadmapData ?? DEFAULT_ROADMAP) as RoadmapStep[]);

    // 수학 상태
    let { data: mathData } = await supabase
      .from('math_state')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (!mathData) {
      const { data: inserted } = await supabase
        .from('math_state')
        .insert({ id: 1, current_step: 1, done_steps: [] })
        .select()
        .maybeSingle();
      mathData = inserted;
    }
    setMathState({
      current_step: mathData?.current_step ?? 1,
      done_steps: mathData?.done_steps ?? [],
    });

    // 페이지 로그
    const { data: logs } = await supabase
      .from('page_logs')
      .select('*')
      .order('logged_at');
    setPageLogs((logs ?? []) as PageLog[]);

    // 스티커 상태
    let { data: stickerData } = await supabase
      .from('sticker_state')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (!stickerData) {
      const { data: inserted } = await supabase
        .from('sticker_state')
        .insert({ id: 1, count: 0 })
        .select()
        .maybeSingle();
      stickerData = inserted;
    }
    const count = stickerData?.count ?? 0;
    stickerRef.current = count;
    setStickerCount(count);

    // 페널티 체크 (어제 미완료 여부)
    await checkPenalty(checkItemList, count);
  }

  async function checkPenalty(items: CheckItem[], currentCount: number) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);

    const { data: penaltyData } = await supabase
      .from('daily_penalties')
      .select('processed')
      .eq('date', yKey)
      .maybeSingle();
    if (penaltyData?.processed) return;

    if (!isSchoolDay(yKey)) {
      await supabase.from('daily_penalties').upsert({ date: yKey, processed: true });
      return;
    }

    const { data: yChecks } = await supabase
      .from('daily_checks')
      .select('checks')
      .eq('date', yKey)
      .maybeSingle();
    const checks = (yChecks?.checks as DailyChecks) ?? {};
    const hasAny = Object.keys(checks).length > 0;
    const allDone = items.every((c) => checks[c.id]);

    let penalty = 0;
    if (hasAny && !allDone) {
      penalty = items.filter((c) => !checks[c.id]).length;
    } else if (!hasAny) {
      penalty = 1;
    }

    if (penalty > 0) {
      const newCount = Math.max(0, currentCount - penalty);
      await supabase.from('sticker_state').update({ count: newCount }).eq('id', 1);
      stickerRef.current = newCount;
      setStickerCount(newCount);
      setTimeout(() => showToast(`어제 ${penalty}개 미완료 → 스티커 -${penalty} ⚠️`), 800);
    }

    await supabase.from('daily_penalties').upsert({ date: yKey, processed: true });
  }

  const incrementSticker = async () => {
    const newCount = stickerRef.current + 1;
    stickerRef.current = newCount;
    setStickerCount(newCount);
    await supabase.from('sticker_state').update({ count: newCount }).eq('id', 1);
  };

  // ── 체크리스트 ─────────────────────────────────────────

  const toggleCheck = async (id: string) => {
    const today = todayKey();
    const newChecks = { ...dailyChecks, [id]: !dailyChecks[id] };
    setDailyChecks(newChecks);
    await supabase.from('daily_checks').upsert({ date: today, checks: newChecks });

    if (checkItems.every((c) => newChecks[c.id])) {
      const { data: reward } = await supabase
        .from('daily_rewards')
        .select('rewarded')
        .eq('date', today)
        .maybeSingle();
      if (!reward?.rewarded) {
        await incrementSticker();
        await supabase.from('daily_rewards').upsert({ date: today, rewarded: true });
        showToast('🌟 체크리스트 완성! 스티커 +1');
      }
    }
  };

  const addCheckItem = async (label: string) => {
    const id = 'custom_' + Date.now();
    const sort_order = checkItems.length;
    const newItem: CheckItem = { id, label, sort_order };
    await supabase.from('check_items').insert(newItem);
    setCheckItems((prev) => [...prev, newItem]);
    showToast('추가됐어 ✓');
  };

  const deleteCheckItem = async (id: string) => {
    await supabase.from('check_items').delete().eq('id', id);
    setCheckItems((prev) => prev.filter((c) => c.id !== id));
    const today = todayKey();
    const newChecks = { ...dailyChecks };
    delete newChecks[id];
    setDailyChecks(newChecks);
    await supabase.from('daily_checks').upsert({ date: today, checks: newChecks });
  };

  // ── 메모 ─────────────────────────────────────────────

  const saveMemo = async (content: string) => {
    if (!content.trim()) return;
    const today = todayKey();
    const trimmed = content.trim();
    await supabase.from('daily_memos').upsert({ date: today, content: trimmed });
    setMemo(trimmed);
    setRecords((prev) => ({ ...prev, [today]: trimmed }));
    showToast('저장됐어 ✓');
  };

  // ── 로드맵 ────────────────────────────────────────────

  const addRoadmapStep = async (title: string, period: string) => {
    const newStep = roadmap.length + 1;
    const item: RoadmapStep = { step: newStep, title, period, goal: 10 };
    await supabase.from('roadmap_steps').insert(item);
    setRoadmap((prev) => [...prev, item]);
    showToast('추가됐어 ✓');
  };

  const updateRoadmapStep = async (step: number, title: string, period: string) => {
    await supabase.from('roadmap_steps').update({ title, period }).eq('step', step);
    setRoadmap((prev) => prev.map((r) => (r.step === step ? { ...r, title, period } : r)));
  };

  const deleteRoadmapStep = async (step: number) => {
    // 삭제 후 step 번호 재정렬
    const remaining = roadmap
      .filter((r) => r.step !== step)
      .map((r, i) => ({ ...r, step: i + 1 }));

    // 기존 전부 삭제 후 재삽입 (step이 PK이므로)
    await supabase.from('roadmap_steps').delete().gte('step', 0);
    if (remaining.length > 0) {
      await supabase.from('roadmap_steps').insert(remaining);
    }
    setRoadmap(remaining);

    // math_state 보정
    const newCurrent = Math.min(mathState.current_step, Math.max(1, remaining.length));
    const newDone = mathState.done_steps.filter((s) => s <= remaining.length);
    if (newCurrent !== mathState.current_step || newDone.length !== mathState.done_steps.length) {
      await supabase
        .from('math_state')
        .update({ current_step: newCurrent, done_steps: newDone })
        .eq('id', 1);
      setMathState({ current_step: newCurrent, done_steps: newDone });
    }
  };

  const toggleRoadmapDone = async (step: number) => {
    const done = [...mathState.done_steps];
    const idx = done.indexOf(step);
    let newCurrent = mathState.current_step;

    if (idx >= 0) {
      done.splice(idx, 1);
    } else {
      done.push(step);
      newCurrent = Math.min(step + 1, roadmap.length);
      showToast(`${step}단계 완료! 🎉`);
      await incrementSticker();
    }

    const newMathState = { current_step: newCurrent, done_steps: done };
    await supabase
      .from('math_state')
      .update({ current_step: newCurrent, done_steps: done })
      .eq('id', 1);
    setMathState(newMathState);
  };

  // ── 페이지 로그 ───────────────────────────────────────

  const savePages = async (pages: number, currentStep: number) => {
    if (!pages || pages <= 0) { showToast('쪽수를 입력해줘'); return; }
    const { data } = await supabase
      .from('page_logs')
      .insert({ step: currentStep, pages })
      .select()
      .maybeSingle();
    if (data) setPageLogs((prev) => [...prev, data as PageLog]);
    showToast(`${pages}쪽 기록 완료 ✓`);
  };

  const updateGoal = async (step: number, goal: number) => {
    if (goal <= 0) return;
    await supabase.from('roadmap_steps').update({ goal }).eq('step', step);
    setRoadmap((prev) => prev.map((r) => (r.step === step ? { ...r, goal } : r)));
    showToast(`목표 ${goal}p 저장 ✓`);
  };

  // ── 헤더 날짜 ─────────────────────────────────────────

  const now = new Date();
  const headerDate = `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}`;
  const weekday = WEEKDAYS[now.getDay()] + '요일';
  const dateBig = `${now.getMonth() + 1}월 ${now.getDate()}일`;

  return (
    <div className="app-wrapper">
      <div className="status-bar" />

      <header className="header">
        <div className="header-logo">민트노트</div>
        <div className="header-date">{headerDate}</div>
      </header>

      <div className={`tab-screen scroll-area${activeTab === 'today' ? ' active' : ''}`}>
        <TodayTab
          weekday={weekday}
          dateBig={dateBig}
          checkItems={checkItems}
          dailyChecks={dailyChecks}
          memo={memo}
          onToggleCheck={toggleCheck}
          onAddCheckItem={addCheckItem}
          onDeleteCheckItem={deleteCheckItem}
          onSaveMemo={saveMemo}
        />
      </div>

      <div className={`tab-screen scroll-area${activeTab === 'record' ? ' active' : ''}`}>
        <RecordTab records={records} />
      </div>

      <div className={`tab-screen scroll-area${activeTab === 'math' ? ' active' : ''}`}>
        <MathTab
          roadmap={roadmap}
          mathState={mathState}
          pageLogs={pageLogs}
          stickerCount={stickerCount}
          onAddStep={addRoadmapStep}
          onUpdateStep={updateRoadmapStep}
          onDeleteStep={deleteRoadmapStep}
          onToggleDone={toggleRoadmapDone}
          onSavePages={savePages}
          onUpdateGoal={updateGoal}
          showToast={showToast}
        />
      </div>

      <div className="tabbar">
        {(['today', 'record', 'math'] as Tab[]).map((tab) => (
          <button
            key={tab}
            className={`tab-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="tab-label">
              {tab === 'today' ? '오늘' : tab === 'record' ? '기록' : '수학'}
            </span>
          </button>
        ))}
      </div>

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
