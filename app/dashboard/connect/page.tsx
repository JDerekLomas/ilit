export default function ConnectPage() {
  return (
    <div className="max-w-md mx-auto px-4 pt-6 text-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8">
        <h1 className="text-lg font-bold text-gray-800 mb-4">Comments</h1>
        <svg
          className="mx-auto mb-4 text-yellow-400"
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <p className="text-sm text-gray-600">
          You have <span className="font-bold">0</span> stars !!!
        </p>
      </div>
    </div>
  );
}
