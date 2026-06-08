export interface CheckItem {
  id: string;
  label: string;
  sort_order: number;
}

export interface DailyChecks {
  [id: string]: boolean;
}

export interface RoadmapStep {
  step: number;
  title: string;
  period: string;
  goal: number;
}

export interface PageLog {
  id: number;
  step: number;
  pages: number;
  logged_at: string;
}

export interface MathState {
  current_step: number;
  done_steps: number[];
}
