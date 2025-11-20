// Claude tool definitions for syllabus parsing

export const extractDatesTool = {
  name: 'extract_dates',
  description:
    'Extracts ALL date references from syllabus text. Call this to find every mention of dates, deadlines, exam schedules, etc. Include the surrounding context to understand what the date refers to.',
  input_schema: {
    type: 'object',
    properties: {
      dates: {
        type: 'array',
        description: 'Array of all dates found in the syllabus',
        items: {
          type: 'object',
          properties: {
            raw_text: {
              type: 'string',
              description:
                'The exact date text as it appears in syllabus (e.g., "Sept 15", "Week 5", "10/20")',
            },
            date_string: {
              type: 'string',
              description:
                'Normalized date string - convert to YYYY-MM-DD if possible, otherwise keep as-is',
            },
            context: {
              type: 'string',
              description:
                'Surrounding text that explains what this date is for (1-2 sentences)',
            },
            event_name: {
              type: 'string',
              description:
                'Name of the event/assignment (e.g., "Midterm Exam", "Homework 3", "Final Project")',
            },
          },
          required: ['raw_text', 'date_string', 'context', 'event_name'],
        },
      },
    },
    required: ['dates'],
  },
};

export const categorizeEventTool = {
  name: 'categorize_event',
  description:
    'Categorizes an academic event into one of four types: Exam, Assignment, Project, or Quiz. Use keywords and context to determine the correct category.',
  input_schema: {
    type: 'object',
    properties: {
      event_description: {
        type: 'string',
        description: 'The event name and context from the syllabus',
      },
      category: {
        type: 'string',
        enum: ['exam', 'assignment', 'project', 'quiz'],
        description:
          'Event category based on keywords: exam/midterm/final → exam, assignment/hw/homework/problem set/reading → assignment, project/paper/presentation → project, quiz/pop quiz → quiz',
      },
      confidence: {
        type: 'number',
        description:
          'Confidence score 0-1 for this categorization (1.0 = certain, 0.5 = guess)',
      },
    },
    required: ['event_description', 'category', 'confidence'],
  },
};

export const resolveAmbiguousDateTool = {
  name: 'resolve_ambiguous_date',
  description:
    'Resolves ambiguous date references like "Week 5" or "Day 10" into specific ISO dates. Uses semester start date to calculate the actual date.',
  input_schema: {
    type: 'object',
    properties: {
      date_string: {
        type: 'string',
        description:
          'The ambiguous date string (e.g., "Week 5", "Day 10", "Third Monday")',
      },
      semester_info: {
        type: 'object',
        description: 'Information about the semester',
        properties: {
          semester_start: {
            type: 'string',
            description: 'Semester start date in YYYY-MM-DD format',
          },
          semester_name: {
            type: 'string',
            description: 'e.g., "Fall 2024", "Spring 2025"',
          },
        },
        required: ['semester_start'],
      },
      iso_date: {
        type: 'string',
        description: 'Resolved date in ISO format (YYYY-MM-DD)',
      },
      is_all_day: {
        type: 'boolean',
        description: 'True if this should be an all-day event (e.g., exams)',
      },
      time: {
        type: 'string',
        description:
          'Specific time in HH:MM format (24-hour) if mentioned, null if all-day or time not specified',
      },
    },
    required: ['date_string', 'semester_info', 'iso_date', 'is_all_day'],
  },
};

// Export all tools as an array for Claude API
export const syllabusParsingTools = [
  extractDatesTool,
  categorizeEventTool,
  resolveAmbiguousDateTool,
];
