import { NextRequest, NextResponse } from 'next/server';
import {
  generateICS,
  generateFilename,
  getEventStats,
  ExtractedEvent,
} from '@/lib/calendar/ics-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events, courseCode, courseName, calendarName } = body;

    // Validate input
    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing or invalid "events" field. Provide an array of events.',
        },
        { status: 400 }
      );
    }

    // Validate event structure
    const validEvents: ExtractedEvent[] = [];
    const errors: string[] = [];

    events.forEach((event, index) => {
      if (!event.event_name || !event.category || !event.date) {
        errors.push(
          `Event ${index + 1}: Missing required fields (event_name, category, date)`
        );
        return;
      }

      if (
        !['exam', 'assignment', 'project', 'quiz'].includes(event.category)
      ) {
        errors.push(
          `Event ${index + 1}: Invalid category "${event.category}". Must be one of: exam, assignment, project, quiz`
        );
        return;
      }

      validEvents.push(event);
    });

    if (validEvents.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid events provided',
          validation_errors: errors,
        },
        { status: 400 }
      );
    }

    // Generate ICS file
    const result = generateICS(validEvents, {
      courseCode,
      courseName,
      calendarName,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to generate ICS file',
        },
        { status: 500 }
      );
    }

    // Generate filename
    const filename = generateFilename({ courseCode, courseName });

    // Get statistics
    const stats = getEventStats(validEvents);

    // Return ICS file as downloadable attachment
    return new NextResponse(result.data, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Event-Count': stats.total.toString(),
        'X-Date-Range': stats.dateRange
          ? `${stats.dateRange.start} to ${stats.dateRange.end}`
          : 'unknown',
      },
    });
  } catch (error: any) {
    console.error('ICS generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate calendar file',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

// Optional GET endpoint to test API availability
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'ICS generation API is ready',
    usage: {
      method: 'POST',
      endpoint: '/api/generate-ics',
      required_fields: ['events'],
      optional_fields: ['courseCode', 'courseName', 'calendarName'],
      example: {
        events: [
          {
            event_name: 'Midterm Exam',
            category: 'exam',
            date: '2024-10-15',
            is_all_day: true,
            context: 'Midterm covering chapters 1-5',
            raw_text: 'Midterm: October 15',
          },
        ],
        courseCode: 'CS540',
        courseName: 'Artificial Intelligence',
      },
    },
  });
}
