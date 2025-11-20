export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Syllabus Calendar Generator</h1>
        <p className="text-lg mb-8">
          Upload your syllabus and let Claude AI extract all your academic events into a downloadable calendar.
        </p>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-500">
            UI components will be implemented in a future session.
          </p>
        </div>
      </div>
    </main>
  )
}
