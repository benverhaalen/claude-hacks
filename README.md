# Academic Command Center 🎓

> **Problem Statement:** Create a tool that solves a real specific problem for a UW Madison student.

## The Problem

Every semester at UW Madison, students juggle 4-6 courses, each with its own syllabus format, deadline structure, and Canvas page. Between discussion sections, office hours, project deadlines, and exams - keeping track of everything becomes overwhelming. Students waste hours manually entering dates into calendars, miss assignment deadlines buried in 20-page syllabi, and scramble when multiple deadlines cluster during midterms week.

**This tool solves that problem.**

## What It Does

Upload your UW Madison syllabi once, get your entire semester organized into a downloadable calendar automatically.

## Why UW Madison Students Need This

### Real Pain Points Addressed:

1. **Syllabus Chaos**: Every professor uses a different format - some use Canvas, others email PDFs, some post Word docs. This tool handles them all.

2. **Hidden Deadlines**: That discussion post due Sunday at 11:59pm? The extra credit opportunity mentioned on page 18? We find everything.

3. **Time Management**: With 15-week semesters, study blocks for midterms, and finals scheduled 3+ weeks out, you need smart planning.

4. **Multiple Platforms**: Canvas, Piazza, Google Classroom, email attachments - materials are everywhere. We centralize it.

5. **Group Projects**: Coordinate with classmates when everyone's schedules are different.

## Features

### Intelligent Parsing

- Extracts assignments, due dates, exam schedules, grading weights
- Handles PDFs, Word docs, images, and text files
- Supports multiple syllabus formats (even handwritten notes!)
- Recognizes UW Madison-specific patterns (Canvas links, SOAR references, campus locations)

### Calendar Integration

- Creates color-coded events for each course
- Multi-tier reminders (1 week, 3 days, 1 day before)
- Automatic study time blocking based on your free hours
- Updates automatically when professors change deadlines
- Integrates with UW Madison academic calendar (holidays, breaks, exam periods)

### File Organization

- Auto-generates organized folder structure in Google Drive
- Sorts materials by course, week, and type
- Links relevant files to calendar events
- Tags by course number (e.g., CS 300, MATH 340, ECON 101)

## Tech Stack

- **Frontend:** React/Next.js
- **Backend:** Node.js/Express
- **LLM:** Claude API (Anthropic) - for intelligent syllabus parsing

## Quick Start

### Prerequisites

- Node.js 18+
- Anthropic API key

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/academic-command-center.git
cd academic-command-center

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Add your API keys to .env
```

### Environment Variables

```env
# Anthropic
ANTHROPIC_API_KEY=your_key_here
```

### Run the App

```bash
# Development mode
npm run dev

# Open http://localhost:3000
```

## Usage

### 1. Initial Setup

Upload all syllabi/Canvas pages for the current semester

### 2. Review & Confirm

- AI shows extracted assignments and dates
- Verify accuracy and make any corrections
- Click "Generate Structure" to create calendar events and folders

### 3. Daily Use

- Check your dashboard each morning for priorities
- Upload new materials as courses progress

## Project Structure

```
academic-command-center/
├── frontend/
│   ├── components/
│   │   ├── FileUpload.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CalendarView.jsx
│   │   └── TaskList.jsx
│   ├── pages/
│   │   ├── index.jsx
│   │   ├── setup.jsx
│   │   └── auth/callback.jsx
│   └── styles/
├── backend/
│   ├── routes/
│   │   ├── upload.js
│   │   ├── calendar.js
│   │   ├── drive.js
│   │   └── sms.js
│   ├── services/
│   │   ├── claudeParser.js
│   │   ├── googleCalendar.js
│   │   ├── googleDrive.js
│   │   └── twilioSMS.js
│   └── server.js
├── database/
│   └── schema.sql
└── README.md
```

## API Endpoints

### Upload & Parse

```
POST /api/upload
- Accepts: multipart/form-data (PDF, DOCX, images)
- Returns: Parsed course data (assignments, dates, weights)
```

### Calendar

```
POST /api/calendar/create
- Creates Google Calendar events from parsed data

GET /api/calendar/conflicts
- Returns detected scheduling conflicts
```

### Drive

```
POST /api/drive/organize
- Creates folder structure and organizes files
```

### Notifications

```
POST /api/sms/schedule
- Schedules SMS reminders for deadlines

PUT /api/sms/preferences
- Updates user notification preferences
```

## UW Madison-Specific Features

- **Campus Integration**: Recognizes UW Madison building names and locations (Van Vleck, Bascom, Memorial Union, etc.)
- **Academic Calendar Sync**: Pre-loaded with UW Madison semester dates, holidays, and exam periods
- **Canvas Integration**: Direct parsing of Canvas-formatted syllabi and assignment pages
- **Credit Load Management**: Tracks your credit hours and suggests optimal study time allocation
- **Resource Links**: Auto-links to UW writing center, tutoring resources, and academic advising

## License

MIT License - see [LICENSE](LICENSE) for details

## Acknowledgments

- Built with Claude Code for rapid development during Claude Hacks hackathon
- Powered by Anthropic's Claude AI
- Inspired by the chaos of time management and scheduling with courses at UW Madison

---

**Built for UW Madison students, by UW Madison students.** Stop drowning in syllabi. Start crushing your semester.

*On, Wisconsin!* 🦡
