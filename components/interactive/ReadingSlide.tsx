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
    <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
      <div className="bg-white rounded-xl shadow-2xl p-5 md:p-7 max-h-[75vh] overflow-y-auto">
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
          <div className="mt-6 text-center text-sm text-green-600 font-medium">
            Checkpoint completed
          </div>
        )}
      </div>
    </div>
  );
}
