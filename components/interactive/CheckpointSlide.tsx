"use client";

import { useState } from "react";
import type { Slide, Checkpoint } from "@/lib/types";
import HighlightCheckpoint from "./HighlightCheckpoint";
import DragDropCheckpoint from "./DragDropCheckpoint";

interface Props {
  slide: Slide;
  sentences: string[];
  checkpoint: Checkpoint;
  onComplete: () => void;
  completed: boolean;
}

export default function CheckpointSlide({
  slide,
  sentences,
  checkpoint,
  onComplete,
  completed,
}: Props) {
  const [answered, setAnswered] = useState(completed);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(
    completed ? true : null
  );

  const handleAnswer = (correct: boolean) => {
    setIsCorrect(correct);
    setAnswered(true);
    if (correct) {
      onComplete();
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6 items-start">
      {/* Left: Text panel with sentences */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto">
        {slide.heading && (
          <h2 className="font-serif font-bold text-lg mb-3 text-gray-900">
            {slide.heading}
          </h2>
        )}
        {checkpoint.type === "highlight" ? (
          <HighlightCheckpoint
            sentences={sentences}
            checkpoint={checkpoint}
            onAnswer={handleAnswer}
            answered={answered}
            isCorrect={isCorrect}
          />
        ) : (
          <div className="font-serif text-sm md:text-base leading-relaxed text-gray-800 space-y-4">
            {(slide.text || sentences.join(" ")).split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
      </div>

      {/* Right: Question / Feedback panel */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto">
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
          <div>
            <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full mb-3">
              {checkpoint.skill}
            </div>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              {checkpoint.prompt}
            </p>
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

function FeedbackPanel({
  isCorrect,
  feedback,
  onRetry,
}: {
  isCorrect: boolean;
  feedback: { correct: string; incorrect: string };
  onRetry?: () => void;
}) {
  return (
    <div>
      <h3
        className={`text-lg font-bold mb-3 ${
          isCorrect ? "text-green-700" : "text-orange-700"
        }`}
      >
        {isCorrect ? "YOU GOT IT!" : "Not quite."}
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
