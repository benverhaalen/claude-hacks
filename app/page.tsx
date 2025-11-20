'use client';

import { useState } from 'react';

interface Event {
  event_name: string;
  category: 'exam' | 'assignment' | 'project' | 'quiz';
  date: string;
  time?: string;
  is_all_day: boolean;
  raw_text: string;
  context: string;
  confidence: number;
}

interface Cluster {
  start_date: string;
  end_date: string;
  event_count: number;
  events: string[];
}

interface ExtractionResponse {
  success: boolean;
  extraction_method: 'text' | 'pdf';
  semester: {
    semester_start: string;
    semester_name: string;
  };
  events: Event[];
  clusters?: Cluster[];
  raw_response?: any;
}

export default function Home() {
  const [inputMode, setInputMode] = useState<'text' | 'pdf'>('text');
  const [syllabusText, setSyllabusText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [semesterStart, setSemesterStart] = useState('');
  const [calendarName, setCalendarName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResponse | null>(null);

  const handleExtract = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response;

      if (inputMode === 'pdf' && pdfFile) {
        const formData = new FormData();
        formData.append('file', pdfFile);
        if (semesterStart) {
          formData.append('semester_start', semesterStart);
        }

        response = await fetch('/api/extract', {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: syllabusText,
            semester_start: semesterStart || undefined,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract events');
      }

      setExtractionResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadICS = async () => {
    if (!extractionResult) return;

    try {
      const response = await fetch('/api/generate-ics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: extractionResult.events,
          courseCode: courseCode || 'COURSE',
          courseName: courseName || 'Academic Calendar',
          calendarName: calendarName || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate calendar file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(courseName || 'calendar').replace(/\s+/g, '_')}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to download calendar');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      {/* Header */}
      <header className="border-b-4 border-primary bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold tracking-tight">Syllabus Calendar Generator</h1>
          <p className="text-gray-300 mt-2">Extract events from syllabi and generate .ics calendar files</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Input Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-8 mb-8">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setInputMode('text')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                inputMode === 'text'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Text Input
            </button>
            <button
              onClick={() => setInputMode('pdf')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                inputMode === 'pdf'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              PDF Upload
            </button>
          </div>

          {/* Input Content */}
          {inputMode === 'text' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Paste Syllabus Text
              </label>
              <textarea
                value={syllabusText}
                onChange={(e) => setSyllabusText(e.target.value)}
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Paste your syllabus text here..."
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload PDF File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer"
                >
                  {pdfFile ? (
                    <div>
                      <p className="text-primary font-semibold text-lg">{pdfFile.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(pdfFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500 font-medium">Click to upload PDF</p>
                      <p className="text-xs text-gray-400 mt-2">Supported: .pdf, max 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Parameters */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Code
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., CS540"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Name
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Artificial Intelligence"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Semester Start (Optional)
              </label>
              <input
                type="date"
                value={semesterStart}
                onChange={(e) => setSemesterStart(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Calendar Name (Optional)
              </label>
              <input
                type="text"
                value={calendarName}
                onChange={(e) => setCalendarName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Fall 2024"
              />
            </div>
          </div>

          {/* Extract Button */}
          <button
            onClick={handleExtract}
            disabled={isLoading || (inputMode === 'text' && !syllabusText) || (inputMode === 'pdf' && !pdfFile)}
            className="w-full mt-6 bg-primary hover:bg-secondary text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? 'Extracting Events...' : 'Extract Events'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-white border-2 border-primary rounded-lg p-6 mb-8">
            <h3 className="text-primary font-bold text-lg mb-2">Error</h3>
            <p className="text-gray-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Results Section */}
        {extractionResult && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Extraction Results</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-primary">{extractionResult.events.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Events</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-secondary">
                    {extractionResult.events.filter(e => e.category === 'exam').length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Exams</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-black">
                    {extractionResult.events.filter(e => e.category === 'assignment').length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Assignments</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-600">
                    {extractionResult.events.filter(e => e.category === 'project').length +
                      extractionResult.events.filter(e => e.category === 'quiz').length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Projects & Quizzes</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Extraction Method: <span className="font-semibold">{extractionResult.extraction_method.toUpperCase()}</span></p>
                <p>Semester: <span className="font-semibold">{extractionResult.semester.semester_name}</span></p>
              </div>
            </div>

            {/* Clustering Alerts */}
            {extractionResult.clusters && extractionResult.clusters.length > 0 && (
              <div className="bg-white border-2 border-primary rounded-lg p-6">
                <h3 className="text-primary font-bold text-lg mb-4">Heavy Workload Detected</h3>
                {extractionResult.clusters.map((cluster, idx) => (
                  <div key={idx} className="mb-4 last:mb-0">
                    <p className="font-semibold text-gray-900">
                      {new Date(cluster.start_date).toLocaleDateString()} - {new Date(cluster.end_date).toLocaleDateString()}: {cluster.event_count} deadlines
                    </p>
                    <ul className="mt-2 ml-4 space-y-1">
                      {cluster.events.map((event, eventIdx) => (
                        <li key={eventIdx} className="text-gray-700 text-sm">
                          {event}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Events Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold">Event Name</th>
                      <th className="px-6 py-4 text-left font-bold">Category</th>
                      <th className="px-6 py-4 text-left font-bold">Date</th>
                      <th className="px-6 py-4 text-left font-bold">Time</th>
                      <th className="px-6 py-4 text-left font-bold">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractionResult.events
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((event, idx) => (
                        <tr
                          key={idx}
                          className={`border-b border-gray-200 ${
                            event.category === 'exam'
                              ? 'bg-red-50'
                              : event.category === 'assignment'
                              ? 'bg-gray-50'
                              : event.category === 'project'
                              ? 'bg-gray-100'
                              : 'bg-red-25'
                          }`}
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">{event.event_name}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                event.category === 'exam'
                                  ? 'bg-primary text-white'
                                  : event.category === 'assignment'
                                  ? 'bg-black text-white'
                                  : event.category === 'project'
                                  ? 'bg-gray-600 text-white'
                                  : 'bg-secondary text-white'
                              }`}
                            >
                              {event.category.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {event.is_all_day ? (
                              <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                                All Day
                              </span>
                            ) : (
                              event.time || '23:59'
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {(event.confidence * 100).toFixed(0)}%
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleDownloadICS}
                className="flex-1 bg-primary hover:bg-secondary text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-md"
              >
                Download Calendar (.ics)
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(extractionResult, null, 2)], { type: 'application/json' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'extraction_data.json';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                }}
                className="px-6 py-4 border-2 border-black text-black font-bold rounded-lg hover:bg-black hover:text-white transition-colors"
              >
                Download JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
