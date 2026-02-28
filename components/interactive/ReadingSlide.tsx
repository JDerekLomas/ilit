"use client";

import type { Slide } from "@/lib/types";

interface Props {
  slide: Slide;
  onShowCheckpoint?: () => void;
  checkpointCompleted: boolean;
}

export default function ReadingSlide({
  slide,
  onShowCheckpoint,
  checkpointCompleted,
}: Props) {
  return (
    <div className="w-full max-w-full sm:max-w-[90%] md:max-w-[48%] md:mr-auto self-stretch flex min-h-0">
      <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-5 md:p-7 overflow-y-auto flex-1 min-h-0">
        {slide.heading && (
          <h2 className="font-serif font-bold text-lg md:text-xl mb-4 text-gray-900">
            {slide.heading}
          </h2>
        )}
        <div className="font-serif text-sm md:text-base leading-relaxed text-gray-800 space-y-4">
          {(slide.text || "").split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        {onShowCheckpoint && !checkpointCompleted && (
          <button
            onClick={onShowCheckpoint}
            className="mt-6 w-full py-2.5 bg-indigo-700 text-white font-medium rounded-full hover:bg-indigo-800 transition-colors"
          >
            Reading Checkpoint
          </button>
        )}
        {checkpointCompleted && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-green-600 font-medium">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Checkpoint Complete
          </div>
        )}
      </div>
    </div>
  );
}
