"use client";

import { useState } from "react";
import type { Slide, Checkpoint } from "@/lib/types";
import HighlightCheckpoint from "./HighlightCheckpoint";
import DragDropCheckpoint from "./DragDropCheckpoint";

interface Props {
  slide: Slide;
  sentences: string[];
  precedingText?: string;
  checkpoint: Checkpoint;
  onComplete: () => void;
  completed: boolean;
}

export default function CheckpointSlide({
  slide,
  sentences,
  precedingText,
  checkpoint,
  onComplete,
  completed,
}: Props) {
  const [answered, setAnswered] = useState(completed);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(
    completed ? true : null
  );
  const [activeMarker, setActiveMarker] = useState<"yellow" | "pink">("yellow");

  const handleAnswer = (correct: boolean) => {
    setIsCorrect(correct);
    setAnswered(true);
    if (correct) {
      onComplete();
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6 items-start">
      {/* Left: Text panel with sentences */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-h-[50vh] md:max-h-[70vh] overflow-y-auto w-full">
        {slide.heading && (
          <h2 className="font-serif font-bold text-lg mb-3 text-gray-900">
            {slide.heading}
          </h2>
        )}
        {checkpoint.type === "highlight" ? (
          <HighlightCheckpoint
            sentences={sentences}
            paragraphBreaks={slide.paragraphBreaks}
            checkpoint={checkpoint}
            onAnswer={handleAnswer}
            answered={answered}
            isCorrect={isCorrect}
            activeMarker={activeMarker}
          />
        ) : (
          <div className="font-serif text-sm md:text-base leading-relaxed text-gray-800 space-y-4">
            {(slide.text || sentences.join(" ") || precedingText || "").split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
      </div>

      {/* Right: Question / Feedback panel */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-h-[40vh] md:max-h-[70vh] overflow-y-auto w-full">
        {answered && isCorrect !== null ? (
          <FeedbackPanel
            isCorrect={isCorrect}
            feedback={checkpoint.feedback}
            onRetry={
              !isCorrect
                ? () => {
                    setAnswered(false);
                    setIsCorrect(null);
                  }
                : undefined
            }
          />
        ) : checkpoint.type === "drag-drop" ? (
          <DragDropCheckpoint
            checkpoint={checkpoint}
            onAnswer={handleAnswer}
          />
        ) : checkpoint.type === "highlight" ? (
          <div className="flex flex-col h-full">
            <h3 className="font-bold text-base text-gray-900 mb-2">
              {checkpoint.skill}
            </h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4">
              {checkpoint.prompt}
            </p>
            <div className="mt-auto flex items-center gap-2 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500 mr-1">Marker:</span>
              <button
                onClick={() => setActiveMarker("yellow")}
                className={`w-7 h-7 rounded-full border-2 ${
                  activeMarker === "yellow"
                    ? "border-gray-800 ring-2 ring-gray-400"
                    : "border-gray-300"
                } bg-yellow-300`}
                title="Yellow marker"
              />
              <button
                onClick={() => setActiveMarker("pink")}
                className={`w-7 h-7 rounded-full border-2 ${
                  activeMarker === "pink"
                    ? "border-gray-800 ring-2 ring-gray-400"
                    : "border-gray-300"
                } bg-pink-300`}
                title="Pink marker"
              />
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-700">{checkpoint.prompt}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const CELEBRATION_MESSAGES = [
  "YOU GOT IT!",
  "WAY TO GO!",
  "GREAT JOB!",
  "NICE WORK!",
];

function FeedbackPanel({
  isCorrect,
  feedback,
  onRetry,
}: {
  isCorrect: boolean;
  feedback: { correct: string; incorrect: string };
  onRetry?: () => void;
}) {
  // Pick a random celebration message on mount
  const [celebrationMsg] = useState(
    () => CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)]
  );

  return (
    <div>
      <h3
        className={`text-lg font-bold mb-3 ${
          isCorrect ? "text-green-700" : "text-orange-700"
        }`}
      >
        {isCorrect ? celebrationMsg : "Not quite."}
      </h3>
      <p className="text-sm md:text-base text-gray-700 leading-relaxed">
        {isCorrect ? feedback.correct : feedback.incorrect}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-6 py-2 bg-indigo-700 text-white text-sm font-medium rounded-full hover:bg-indigo-800 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
