// Event type categories
export type EventType = 'exam' | 'assignment' | 'project' | 'quiz';

// Date information from extraction
export interface DateInfo {
  explicitDate?: string;  // ISO format (YYYY-MM-DD)
  relativeDate?: string;  // "Week 5", "Day 10", etc.
  time?: string;          // "15:00", "23:59", etc.
}

// Raw event extracted by Claude
export interface RawEvent {
  title: string;
  type: EventType;
  dateInfo: DateInfo;
  description?: string;
  sourceText?: string;  // Original syllabus text for debugging
}

// Fully resolved event ready for calendar
export interface ResolvedEvent {
  title: string;
  type: EventType;
  start: Date;
  end?: Date;
  isAllDay: boolean;
  description?: string;
  color: string;
}

// Semester information
export interface SemesterInfo {
  semester: string;
  startDate: string;  // ISO format
  finalsWeek: {
    start: string;
    end: string;
  };
  breaks: Array<{
    name: string;
    start: string;
    end: string;
  }>;
}

// Result from Claude extraction
export interface ExtractionResult {
  semesterStart: string;
  semesterDetectionConfidence: 'high' | 'medium' | 'low' | 'fallback';
  events: ResolvedEvent[];
  rawExtraction: any;
  warnings: string[];
}

// Claude tool call responses
export interface SemesterDetectionTool {
  detected_date: string;
  confidence: 'high' | 'medium' | 'low';
  source_text?: string;
}

export interface EventExtractionTool {
  title: string;
  type: EventType;
  date_info: DateInfo;
  description?: string;
  source_text?: string;
}

export interface ClarificationTool {
  question: string;
  suggested_fallback: {
    semester: string;
    start_date: string;
  };
}
