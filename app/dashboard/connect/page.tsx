export default function ConnectPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-6">
      <div className="bg-white rounded-xl p-6 min-h-[60vh] relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-lg font-bold text-gray-800">Comments</h1>
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>

        {/* Star + message */}
        <div className="flex flex-col items-center justify-center mt-12">
          <svg
            width="140"
            height="140"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#e05540"
            strokeWidth="0.75"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <p className="mt-4 text-sm text-gray-600">
            You have <span className="font-bold">0</span> stars !!!
          </p>
        </div>
      </div>
    </div>
  );
}
