<<<<<<< HEAD
# Academic Command Center 🎓

> **Problem Statement:** Create a tool that solves a real specific problem for a UW Madison student.

## The Problem

Every semester at UW Madison, students juggle 4-6 courses, each with its own syllabus format, deadline structure, and Canvas page. Between discussion sections, office hours, project deadlines, and exams - keeping track of everything becomes overwhelming. Students waste hours manually entering dates into calendars, miss assignment deadlines buried in 20-page syllabi, and scramble when multiple deadlines cluster during midterms week.

**This tool solves that problem.**

## What It Does

Upload your UW Madison syllabi once, get your entire semester organized automatically:

- ✅ **Smart Calendar** - All classes, assignments, exams, and office hours auto-added to Google Calendar
- 📁 **Auto-Organized Drive** - Clean folder structure for every course with tagged materials
- 📋 **Task Breakdown** - Complex projects split into actionable subtasks with timelines
- ⚠️ **Conflict Detection** - Warns when multiple deadlines cluster in the same week
- 📊 **Workload Visualization** - See your busy vs. light weeks at a glance
- 📱 **SMS Reminders** - Text notifications for upcoming deadlines (because you actually read texts)

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

### Smart Notifications

- SMS alerts for high-priority deadlines
- Customizable notification preferences
- "Heavy week" warnings when workload spikes
- Finals week countdown and study schedule suggestions

## Tech Stack

- **Frontend:** React/Next.js
- **Backend:** Node.js/Express
- **AI:** Claude API (Anthropic) - for intelligent syllabus parsing
- **Integrations:** 
  - Google Calendar API
  - Google Drive API
  - Twilio SMS API
- **Database:** PostgreSQL
- **Auth:** Google OAuth 2.0

## Quick Start

### Prerequisites

- Node.js 18+
- Google Cloud account (for Calendar/Drive APIs)
- Anthropic API key
- Twilio account (for SMS)

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

# Google APIs
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/academic_command_center
```

### Run the App

```bash
# Development mode
npm run dev

# Open http://localhost:3000
```

## Usage

### 1. Initial Setup

1. Sign in with Google to connect Calendar and Drive
2. Enter your phone number for SMS reminders
3. Upload all syllabi for the current semester (download from Canvas or email)

### 2. Review & Confirm

- AI shows extracted assignments, dates, and grading breakdowns
- Verify accuracy and make any corrections
- Click "Generate Structure" to create calendar events and folders

### 3. Daily Use

- Check your dashboard each morning for priorities
- Receive text reminders for upcoming deadlines
- Upload new materials as courses progress
- System automatically updates when schedules change

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

## Roadmap

- [x] Core syllabus parsing with Claude AI
- [x] Google Calendar integration
- [x] SMS notifications
- [ ] Canvas LMS direct integration (auto-sync with your courses)
- [ ] Mobile app (iOS/Android)
- [ ] Group project coordination features
- [ ] AI study buddy for exam prep
- [ ] Grade tracking and GPA projections
- [ ] McBurney Disability Resource Center accommodation tracking
- [ ] Notion/OneNote integration
- [ ] Integration with SOAR course registration
- [ ] Campus event discovery (lectures, career fairs, org meetings)

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details

## Acknowledgments

- Built with Claude Code for rapid development
- Powered by Anthropic's Claude AI
- Inspired by the chaos of managing multiple course syllabi at UW Madison
- Special thanks to frustrated students everywhere who just want to focus on learning

## Support

Questions? Issues? Open a GitHub issue or reach out at support@academiccommandcenter.com

---

**Built for UW Madison students, by UW Madison students.** Stop drowning in syllabi. Start crushing your semester. 🚀

*On, Wisconsin!* 🦡
=======
# Syllabus Calendar Generator

An intelligent Next.js application that uses Claude AI to extract academic events from syllabi and generate downloadable calendar files.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add your Anthropic API key to .env.local
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env.local

# 3. Start the development server
npm run dev

# 4. Test the Claude connection
curl http://localhost:3000/api/test-claude
```

## Features

- 📄 **PDF & Text Support**: Upload syllabus PDFs or paste text
- 🤖 **AI-Powered Extraction**: Claude identifies exams, assignments, projects, and quizzes
- 📅 **Smart Date Resolution**: Handles "Week 5" style references and auto-detects semester start
- 🎨 **Color-Coded Events**: Visual organization by event type
- 📥 **Universal Calendar Export**: Download .ics files for any calendar app

## Documentation

See [CLAUDE.md](CLAUDE.md) for complete project documentation, including:
- Architecture overview
- API integration details
- Development workflow
- Testing instructions
- Troubleshooting guide

## Project Status

- ✅ **Phase 1 Complete**: Foundation, Claude API integration, type definitions
- 🚧 **Phase 2 In Progress**: Core extraction logic and API routes
- ⏳ **Phase 3 Planned**: UI components (future session)

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **AI**: Claude API (Sonnet 4.5)
- **Calendar**: ics library for .ics generation
- **PDF**: pdf-parse for text extraction
- **Styling**: Tailwind CSS

## License

MIT License - See [LICENSE](LICENSE) for details
>>>>>>> 2e4a90d (Started project skeleton)
