# Syllabus Calendar Generator - Project Documentation

## Overview

A Next.js 14 TypeScript web application that uses Claude's API to intelligently extract academic dates from university syllabi (PDF uploads or pasted text) and converts them into downloadable calendar files.

## Core Workflow

1. **Input**: User uploads PDF or pastes syllabus text
2. **Extraction**: Claude uses tool definitions to:
   - Auto-detect semester start date from syllabus
   - Extract all academic events (Exams, Assignments, Projects, Quizzes)
   - Resolve ambiguous dates like "Week 5" using detected or fallback dates
   - Apply default times (exams = all-day, assignments = 11:59 PM)
3. **Output**: Generate color-coded .ics file for download
4. **Import**: User imports to any calendar app (Google Calendar, Apple Calendar, etc.)

## Project Structure

```
claude-hacks/
├── app/
│   ├── api/
│   │   ├── extract/          # Claude extraction endpoint ✓
│   │   ├── generate-ics/     # iCal generation endpoint ✓
│   │   ├── parse-pdf/        # PDF parsing endpoint (TODO)
│   │   └── test-claude/      # Claude API test endpoint ✓
│   ├── components/           # UI components (future session)
│   ├── layout.tsx            # Root layout ✓
│   ├── globals.css           # Global styles ✓
│   └── page.tsx              # Home page ✓
├── lib/
│   ├── claude/
│   │   ├── client.ts         # Claude API client ✓
│   │   ├── tools.ts          # Tool definitions ✓
│   │   └── extractor.ts      # Extraction logic (TODO)
│   ├── tools.ts              # Main tool definitions ✓
│   ├── calendar/
│   │   ├── ics-generator.ts  # iCal generation ✓
│   │   ├── date-resolver.ts  # Date resolution (TODO)
│   │   └── event-types.ts    # Event type constants (TODO)
│   ├── pdf/
│   │   └── parser.ts         # PDF text extraction ✓
│   └── utils/
│       ├── semester-calendar.ts  # UW Madison fallback dates (TODO)
│       └── validation.ts         # Input validation (TODO)
├── types/
│   └── index.ts              # TypeScript type definitions ✓
├── public/
│   └── test-syllabi/         # Test PDFs for Phase 1 (TODO)
├── .env.local                # Environment variables ✓
├── .env.example              # Example env file ✓
└── package.json              # Dependencies ✓
```

## Setup Instructions

### 1. Install Dependencies

Already installed:
```bash
npm install
```

### 2. Configure API Key

1. Get your Anthropic API key from: https://console.anthropic.com/
2. Open `.env.local`
3. Replace `your_api_key_here` with your actual API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
   ```

### 3. Test Claude Connection

```bash
# Start the development server
npm run dev

# In another terminal, test the API
curl http://localhost:3000/api/test-claude
```

Expected response:
```json
{
  "success": true,
  "message": "Hello! I'm working perfectly...",
  "model": "claude-sonnet-4-5-20250929",
  "usage": { ... }
}
```

## Claude API Integration

### Client Setup

The Claude client is configured in [lib/claude/client.ts](lib/claude/client.ts):

- **Model**: `claude-sonnet-4-5-20250929` (latest Sonnet 4.5)
- **Functions**:
  - `callClaude()` - Simple message API
  - `callClaudeWithTools()` - Message API with tool support

### Tool Definitions

Three tools are defined in [lib/claude/tools.ts](lib/claude/tools.ts):

1. **`detect_semester_start`**: Finds semester start date from syllabus text
   - Returns: `detected_date`, `confidence`, `source_text`
   - Confidence levels: high, medium, low

2. **`extract_event`**: Extracts individual academic events
   - Parameters: `title`, `type`, `date_info`, `description`, `source_text`
   - Event types: exam, assignment, project, quiz
   - Date info: explicit_date OR relative_date, plus optional time

3. **`request_clarification`**: Requests clarification for ambiguous dates
   - Returns: `question`, `suggested_fallback`
   - Fallback options: Fall 2024 (Sept 3), Spring 2025 (Jan 22)

## Date Resolution Strategy

### Priority Order

1. **User-provided override**: Manual semester start input
2. **Claude-detected**: Auto-detected from syllabus header
3. **Fallback**: UW Madison academic calendar

### UW Madison Calendar (Fallback)

- **Fall 2024**: Starts September 3, 2024
- **Spring 2025**: Starts January 22, 2025

### Relative Date Handling

- **"Week 5"**: Calculate from semester start (7-day weeks)
- **"Day 10"**: Count class days from start
- **"Finals Week"**: Use semester calendar

### Default Times

- **Exams**: All-day event (no specific time)
- **Assignments**: 11:59 PM (if no time specified)
- **Projects**: 11:59 PM (if no time specified)
- **Quizzes**: All-day OR specific time (context-dependent)

## iCal Color Coding

Target color scheme:
- 🔴 **Red**: Exams
- 🔵 **Blue**: Assignments
- 🟢 **Green**: Projects
- 🟡 **Yellow**: Quizzes

**Implementation Notes**:
- Standard .ics format doesn't guarantee colors across all calendar apps
- Use `CATEGORIES` field (universally supported)
- Add `X-APPLE-CALENDAR-COLOR` for Apple Calendar users
- Include emoji prefixes in event titles as visual indicators

## TypeScript Types

All types are defined in [types/index.ts](types/index.ts):

- `EventType`: Enum for event categories
- `DateInfo`: Date information from extraction
- `RawEvent`: Unprocessed event from Claude
- `ResolvedEvent`: Fully resolved event with Date objects
- `SemesterInfo`: Semester dates and breaks
- `ExtractionResult`: Complete extraction output

## Development Workflow

### Phase 1 (Current): Foundation ✓

- [x] Next.js 14 setup with TypeScript
- [x] Install dependencies
- [x] Create directory structure
- [x] Define TypeScript types
- [x] Implement Claude client
- [x] Create tool definitions
- [x] Test Claude API connection

### Phase 2 (Current): Core Logic

- [x] Implement extraction API with tool use ✓
- [x] Create tool definitions (extract_dates, categorize_event, resolve_ambiguous_date) ✓
- [x] Build extraction endpoint /app/api/extract/route.ts ✓
- [x] Test with sample syllabus - 7/7 events extracted correctly ✓
- [x] Implement iCal generator ✓
- [x] Build generate-ics API route ✓
- [x] Test end-to-end workflow (extract → generate-ics) - 6/6 events ✓
- [x] Verify .ics opens in macOS Calendar ✓
- [x] Build PDF parser ✓
- [x] Update extraction API to accept PDF uploads ✓
- [x] Test with real PDF syllabus (CS354) - 3/3 events ✓
- [x] Test complete PDF → .ics workflow ✓
- [ ] Build date resolution logic (enhanced)
- [ ] Create semester calendar utilities

### Phase 3 (Future Session): UI

- [ ] Build SyllabusUploader component
- [ ] Build EventPreview component
- [ ] Build CalendarDownload component
- [ ] Connect UI to API routes
- [ ] Add loading states and error handling

### Phase 4: Testing & Polish

- [ ] Create 3 test syllabi (explicit dates, relative dates, mixed)
- [ ] Test extraction accuracy
- [ ] Verify .ics downloads
- [ ] Test calendar imports (Google, Apple)
- [ ] Bug fixes and polish

## Testing the API

### Test Claude Connection

```bash
# Method 1: Using curl
curl http://localhost:3000/api/test-claude

# Method 2: In browser
open http://localhost:3000/api/test-claude
```

### Test Extraction API ✓ WORKING

```bash
# Start the dev server
npm run dev

# Test with sample syllabus
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{
    "text": "CS 540 - Artificial Intelligence\nFall 2024\n\nCourse Schedule:\nWeek 1 (Sept 3): Introduction to AI\nWeek 5 (Oct 1): Midterm Exam\nWeek 10 (Nov 5): Final Project due at 11:59 PM\nWeek 15 (Dec 10): Final Exam\n\nAssignments:\n- Homework 1: Due September 15 at 11:59 PM\n- Homework 2: Due October 20\n- Quiz 1: September 22 in class\n- Final Paper: Due December 5"
  }'
```

**Expected Response:** 7 extracted events with correct categorization:
- 2 Exams (Midterm, Final) - all-day events
- 2 Assignments (Homework 1, 2) - 11:59 PM time
- 2 Projects (Final Project, Final Paper) - 11:59 PM time
- 1 Quiz - all-day event

**Validation:**
- ✓ All dates correctly parsed (explicit dates + "Week X" references)
- ✓ Events categorized with 100% confidence
- ✓ Default times applied (exams/quizzes all-day, assignments 11:59 PM)
- ✓ Semester detected: Fall 2024, starts Sept 3

### Tool Definitions

The extraction API uses three Claude tools defined in [lib/tools.ts](lib/tools.ts):

1. **`extract_dates`**: Finds all date references in syllabus
   - Returns: Array of `{raw_text, date_string, context, event_name}`
   - Example: "Week 5 (Oct 1): Midterm Exam"

2. **`categorize_event`**: Categorizes events by keywords
   - Categories: exam, assignment, project, quiz
   - Returns: `{category, confidence}`
   - Keywords: exam/midterm/final → exam, homework/hw → assignment, etc.

3. **`resolve_ambiguous_date`**: Resolves relative dates
   - Input: "Week 5", semester start date
   - Returns: `{iso_date, is_all_day, time}`
   - Calculates actual dates from semester start

### Future API Endpoints

```bash
# Parse PDF to text (TODO)
curl -X POST http://localhost:3000/api/parse-pdf \
  -F "file=@syllabus.pdf"

# Generate .ics file (TODO)
curl -X POST http://localhost:3000/api/generate-ics \
  -H "Content-Type: application/json" \
  -d '{"events": [...], "courseName": "CS101"}'
```

## Dependencies

### Core Dependencies

- **next**: 14.2.18 - Next.js framework
- **react**: 18.3.1 - React library
- **@anthropic-ai/sdk**: 0.32.0 - Claude API client
- **ics**: 3.8.1 - iCal file generation
- **pdf-parse**: 1.1.1 - PDF text extraction
- **date-fns**: 4.1.0 - Date manipulation
- **zod**: 3.23.8 - Schema validation

### Dev Dependencies

- **typescript**: 5.6.3 - TypeScript compiler
- **tailwindcss**: 3.4.14 - CSS framework
- **@types/pdf-parse**: 1.1.4 - PDF parse types

## Architecture Decisions

### Server-Side Processing

All Claude API calls and business logic happen server-side in API routes:
- Keeps API keys secure
- Reduces client bundle size
- Enables server-side caching (future)

### Stateless MVP

Phase 1 has no database:
- Simple upload → process → download workflow
- No user authentication
- No saved calendars

### Future Canvas API Support

Architecture supports Phase 2 integration:
- Modular event sources (syllabus vs Canvas)
- Shared `ResolvedEvent` interface
- Designed for event merging/deduplication

## Agentic Behavior Demo

This project showcases Claude's agentic capabilities:

1. **Tool Calling**: Claude uses tools to structure extraction
2. **Context Awareness**: Understands academic terminology and date formats
3. **Ambiguity Resolution**: Requests clarification or suggests fallbacks
4. **Multi-Step Reasoning**: Detects semester start, then resolves relative dates

## Troubleshooting

### "Authentication Error"

If you see `401 authentication_error`:
1. Check `.env.local` exists
2. Verify API key is correct (starts with `sk-ant-`)
3. Restart the dev server after changing `.env.local`

### "Module Not Found"

If TypeScript can't find modules:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## Next Steps

1. **Add your API key** to `.env.local`
2. **Test the connection**: Run `npm run dev` and visit `/api/test-claude`
3. **Implement extraction engine**: Start with [lib/claude/extractor.ts](lib/claude/extractor.ts)
4. **Build API routes**: Create the extract, parse-pdf, and generate-ics endpoints
5. **Test with real syllabi**: Add PDFs to `public/test-syllabi/`

## Resources

- [Claude API Documentation](https://docs.anthropic.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [iCalendar Specification](https://icalendar.org/)
- [date-fns Documentation](https://date-fns.org/)

---

**Status**: Phase 1 Complete ✓
**Next**: Implement core extraction engine and API routes
**Future**: UI components (separate session)
