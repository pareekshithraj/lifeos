
export interface Activity {
  id: string;
  title: string;
  time: string;
  date: string;
  notes?: string;
}

export interface Rule {
  id: string;
  label: string;
}

export interface DisciplineRecord {
  [date: string]: {
    [ruleId: string]: boolean;
  };
}

export interface TimetableEntry {
  id: string;
  day: string; // "Monday", "Tuesday", etc.
  startTime: string; // "09:00"
  endTime: string;
  label: string;
}

export interface FinanceGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
}
