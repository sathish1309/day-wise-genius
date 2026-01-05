export interface SubjectWithGoals {
  name: string;
  goals: string; // chapters, topics, or specific goals
}

export interface StudyFormData {
  studentName: string;
  subjects: SubjectWithGoals[];
  dailyStudyHours: number;
  totalDays: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TimeBlock {
  subject: string;
  duration: string;
  startTime: string;
  endTime: string;
  topic?: string; // specific topic/chapter being covered
}

export interface StudyDay {
  day: number;
  date: string;
  subjects: TimeBlock[];
  breaks: { duration: string; afterSubject: string }[];
  totalStudyTime: string;
}

export interface StudyPlan {
  studentName: string;
  totalDays: number;
  dailyHours: number;
  difficulty: string;
  schedule: StudyDay[];
  summary: {
    subjectAllocation: { subject: string; totalHours: number; percentage: number }[];
    tips: string[];
  };
}
