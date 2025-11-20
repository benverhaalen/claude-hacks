// Tool definitions for Claude's agentic behavior

export const detectSemesterStartTool = {
  name: 'detect_semester_start',
  description:
    'Detects the semester start date from syllabus text. Look for phrases like "First day of class", "Semester begins", specific dates in August/September (Fall) or January (Spring), or course schedule headers.',
  input_schema: {
    type: 'object',
    properties: {
      detected_date: {
        type: 'string',
        description: 'The detected start date in ISO format (YYYY-MM-DD)',
      },
      confidence: {
        type: 'string',
        enum: ['high', 'medium', 'low'],
        description: 'Confidence level in the detection',
      },
      source_text: {
        type: 'string',
        description: 'The exact text snippet that indicates the start date',
      },
    },
    required: ['detected_date', 'confidence'],
  },
};

export const extractEventTool = {
  name: 'extract_event',
  description:
    'Extracts a single academic event with all details. Call this once for each event found (exams, assignments, projects, quizzes).',
  input_schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Event title/name (e.g., "Midterm Exam", "Homework 3")',
      },
      type: {
        type: 'string',
        enum: ['exam', 'assignment', 'project', 'quiz'],
        description: 'Event category',
      },
      date_info: {
        type: 'object',
        properties: {
          explicit_date: {
            type: 'string',
            description:
              'If explicit date found (e.g., "October 15"), provide in ISO format (YYYY-MM-DD)',
          },
          relative_date: {
            type: 'string',
            description:
              'If relative reference (e.g., "Week 5", "Day 10"), provide the reference exactly as stated',
          },
          time: {
            type: 'string',
            description:
              'Specific time if mentioned (e.g., "3:00 PM", "15:00", "23:59")',
          },
        },
        description:
          'Date information - provide either explicit_date or relative_date',
      },
      description: {
        type: 'string',
        description: 'Additional details about the event (topics, chapters, etc.)',
      },
      source_text: {
        type: 'string',
        description: 'Original text from syllabus for debugging',
      },
    },
    required: ['title', 'type', 'date_info'],
  },
};

export const requestClarificationTool = {
  name: 'request_clarification',
  description:
    'Request clarification when semester start cannot be determined from syllabus. Suggest a fallback based on UW Madison academic calendar.',
  input_schema: {
    type: 'object',
    properties: {
      question: {
        type: 'string',
        description: 'What clarification is needed',
      },
      suggested_fallback: {
        type: 'object',
        properties: {
          semester: {
            type: 'string',
            enum: ['Fall 2024', 'Spring 2025', 'Summer 2025'],
            description: 'Best guess for semester based on context',
          },
          start_date: {
            type: 'string',
            description: 'UW Madison calendar fallback date (ISO format)',
          },
        },
        required: ['semester', 'start_date'],
      },
    },
    required: ['question', 'suggested_fallback'],
  },
};

// Export all tools as an array for easy use
export const extractionTools = [
  detectSemesterStartTool,
  extractEventTool,
  requestClarificationTool,
];
