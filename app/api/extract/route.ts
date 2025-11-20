import { NextRequest, NextResponse } from 'next/server';
import { anthropic, MODEL } from '@/lib/claude/client';
import { syllabusParsingTools } from '@/lib/tools';
import { extractTextFromPDF, validatePDFFile } from '@/lib/pdf/parser';

// Define the Event type for the response
interface Event {
  event_name: string;
  category: 'exam' | 'assignment' | 'project' | 'quiz';
  date: string; // ISO format
  time?: string; // HH:MM format
  is_all_day: boolean;
  raw_text: string;
  context: string;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let syllabusText: string;
    let semester_start: string | undefined;
    let extractionMethod: 'text' | 'pdf' = 'text';

    // Handle multipart/form-data (PDF upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      semester_start = formData.get('semester_start') as string | undefined;

      if (!file) {
        return NextResponse.json(
          { error: 'Missing "file" field. Provide a PDF file to upload.' },
          { status: 400 }
        );
      }

      // Validate PDF file
      const validation = validatePDFFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // Extract text from PDF
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfResult = await extractTextFromPDF(buffer);

      if (!pdfResult.success || !pdfResult.text) {
        return NextResponse.json(
          {
            error: pdfResult.error || 'Failed to extract text from PDF',
            warning: pdfResult.warning,
          },
          { status: 400 }
        );
      }

      syllabusText = pdfResult.text;
      extractionMethod = 'pdf';
    } else {
      // Handle application/json (text input)
      const body = await request.json();
      const { text } = body;
      semester_start = body.semester_start;

      if (!text || typeof text !== 'string') {
        return NextResponse.json(
          { error: 'Missing or invalid "text" field. Provide syllabus text as a string.' },
          { status: 400 }
        );
      }

      syllabusText = text;
    }

    // Determine semester info
    const semesterInfo = determineSemester(semester_start);

    // System prompt for Claude
    const systemPrompt = `You are an expert at parsing university syllabi and extracting academic events.

Your task:
1. Extract ALL dates mentioned in the syllabus
2. Categorize each event as: exam, assignment, project, or quiz
3. Resolve ambiguous dates using the semester start date

Guidelines:
- UW Madison Fall 2024 starts September 3, 2024
- UW Madison Spring 2025 starts January 22, 2025
- If current semester is: ${semesterInfo.semester_name}, starting ${semesterInfo.semester_start}
- Look for keywords:
  * Exam: "exam", "midterm", "final", "test"
  * Assignment: "assignment", "homework", "hw", "problem set", "reading", "essay"
  * Project: "project", "paper", "presentation", "report"
  * Quiz: "quiz", "pop quiz"
- For ambiguous dates like "Week 5", calculate from semester start (weeks start on Monday)
- Exams without specific times should be all-day events
- Assignments without times default to 11:59 PM

Use the tools provided to extract and structure this information.`;

    // Call Claude with tools
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: systemPrompt,
      tools: syllabusParsingTools,
      messages: [
        {
          role: 'user',
          content: `Please extract all academic events (exams, assignments, projects, quizzes) from this syllabus:\n\n${syllabusText}`,
        },
      ],
    });

    // Process tool calls
    const events: Event[] = [];
    const toolCalls = response.content.filter((block) => block.type === 'tool_use');

    // First pass: extract dates
    let extractedDates: any[] = [];
    for (const toolCall of toolCalls) {
      if (toolCall.type === 'tool_use' && toolCall.name === 'extract_dates') {
        const input = toolCall.input as any;
        if (input.dates && Array.isArray(input.dates)) {
          extractedDates = input.dates;
        }
      }
    }

    // Second pass: categorize and resolve dates
    const categorizations: Map<string, any> = new Map();
    const dateResolutions: Map<string, any> = new Map();

    for (const toolCall of toolCalls) {
      if (toolCall.type === 'tool_use') {
        if (toolCall.name === 'categorize_event') {
          const input = toolCall.input as any;
          categorizations.set(input.event_description, {
            category: input.category,
            confidence: input.confidence,
          });
        } else if (toolCall.name === 'resolve_ambiguous_date') {
          const input = toolCall.input as any;
          dateResolutions.set(input.date_string, {
            iso_date: input.iso_date,
            is_all_day: input.is_all_day,
            time: input.time,
          });
        }
      }
    }

    // Combine extracted data into events
    for (const dateEntry of extractedDates) {
      const eventName = dateEntry.event_name;
      const rawText = dateEntry.raw_text;
      const context = dateEntry.context;
      let dateString = dateEntry.date_string;

      // Try to get categorization
      let category: Event['category'] = 'assignment'; // default
      let confidence = 0.5;

      // Match categorization by event description
      const matchingCat = Array.from(categorizations.entries()).find(([desc]) =>
        desc.toLowerCase().includes(eventName.toLowerCase())
      );
      if (matchingCat) {
        category = matchingCat[1].category;
        confidence = matchingCat[1].confidence;
      } else {
        // Fallback: categorize by keywords in event name
        const lowerName = eventName.toLowerCase();
        if (lowerName.includes('exam') || lowerName.includes('midterm') || lowerName.includes('final')) {
          category = 'exam';
          confidence = 0.8;
        } else if (lowerName.includes('quiz')) {
          category = 'quiz';
          confidence = 0.8;
        } else if (lowerName.includes('project') || lowerName.includes('paper') || lowerName.includes('presentation')) {
          category = 'project';
          confidence = 0.8;
        }
      }

      // Try to resolve date
      let isoDate = dateString;
      let isAllDay = category === 'exam' || category === 'quiz';
      let time: string | undefined = undefined;

      const resolution = dateResolutions.get(rawText) || dateResolutions.get(dateString);
      if (resolution) {
        isoDate = resolution.iso_date;
        isAllDay = resolution.is_all_day;
        time = resolution.time;
      }

      // Apply default times
      if (!isAllDay && !time) {
        time = '23:59'; // 11:59 PM for assignments/projects
      }

      events.push({
        event_name: eventName,
        category,
        date: isoDate,
        time: isAllDay ? undefined : time,
        is_all_day: isAllDay,
        raw_text: rawText,
        context,
        confidence,
      });
    }

    // Detect deadline clustering (multiple deadlines within 3 days)
    const clusters = detectDeadlineClusters(events);

    // Return structured events
    return NextResponse.json({
      success: true,
      extraction_method: extractionMethod,
      semester: semesterInfo,
      events,
      clusters,
      raw_response: {
        model: response.model,
        usage: response.usage,
        tool_calls_count: toolCalls.length,
      },
    });
  } catch (error: any) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to extract events from syllabus',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

// Helper function to detect deadline clustering
function detectDeadlineClusters(events: Event[]): Array<{
  start_date: string;
  end_date: string;
  event_count: number;
  events: string[];
}> {
  const clusters: Array<{
    start_date: string;
    end_date: string;
    event_count: number;
    events: string[];
  }> = [];

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Look for clusters of 2+ events within 3 days
  for (let i = 0; i < sortedEvents.length; i++) {
    const currentEvent = sortedEvents[i];
    const currentDate = new Date(currentEvent.date);
    const clusterEvents: Event[] = [currentEvent];

    // Check next events for clustering
    for (let j = i + 1; j < sortedEvents.length; j++) {
      const nextEvent = sortedEvents[j];
      const nextDate = new Date(nextEvent.date);
      const daysDiff = Math.floor((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 3) {
        clusterEvents.push(nextEvent);
      } else {
        break;
      }
    }

    // If we found 2+ events within 3 days, it's a cluster
    if (clusterEvents.length >= 2) {
      const startDate = clusterEvents[0].date;
      const endDate = clusterEvents[clusterEvents.length - 1].date;

      // Check if this cluster overlaps with an existing one
      const overlapping = clusters.find(
        c => c.start_date === startDate && c.end_date === endDate
      );

      if (!overlapping) {
        clusters.push({
          start_date: startDate,
          end_date: endDate,
          event_count: clusterEvents.length,
          events: clusterEvents.map(e => `${e.event_name} (${e.date})`),
        });
      }
    }
  }

  return clusters;
}

// Helper function to determine semester info
function determineSemester(providedStart?: string): {
  semester_start: string;
  semester_name: string;
} {
  if (providedStart) {
    // User provided semester start
    const date = new Date(providedStart);
    const month = date.getMonth();
    const year = date.getFullYear();

    let semesterName = 'Unknown';
    if (month >= 8 && month <= 11) {
      semesterName = `Fall ${year}`;
    } else if (month >= 0 && month <= 4) {
      semesterName = `Spring ${year}`;
    } else {
      semesterName = `Summer ${year}`;
    }

    return {
      semester_start: providedStart,
      semester_name: semesterName,
    };
  }

  // Fallback to current date logic
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Determine which semester we're likely in
  if (currentMonth >= 8) {
    // August-December: Fall semester
    return {
      semester_start: '2024-09-03',
      semester_name: 'Fall 2024',
    };
  } else if (currentMonth >= 1 && currentMonth <= 5) {
    // January-May: Spring semester
    return {
      semester_start: '2025-01-22',
      semester_name: 'Spring 2025',
    };
  } else {
    // June-July: Assume next Fall semester
    return {
      semester_start: '2024-09-03',
      semester_name: 'Fall 2024',
    };
  }
}
