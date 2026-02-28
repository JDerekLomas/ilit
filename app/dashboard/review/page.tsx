export default function ReviewPage() {
  return (
    <div className="fixed inset-0 z-40 flex flex-col">
      {/* Dark overlay background matching reference */}
      <div className="absolute inset-0 bg-[#555] " />

      {/* Top toolbar with Done button */}
      <div className="relative z-10 flex items-center px-3 py-2 bg-black">
        <a
          href="/dashboard/library"
          className="px-5 py-1.5 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
        >
          Done
        </a>
      </div>

      {/* Centered modal */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-lg overflow-hidden shadow-2xl">
          {/* Gold/amber header */}
          <div className="bg-[#e8a830] px-6 py-2.5">
            <h1 className="text-white text-base font-bold text-center">
              Book Review
            </h1>
          </div>
          {/* White body */}
          <div className="bg-white px-6 py-6">
            <p className="text-[#555] text-sm font-bold text-center">
              No books available for review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
