"use client";

import { useState } from "react";
import type { Slide, Checkpoint } from "@/lib/types";
import HighlightCheckpoint from "./HighlightCheckpoint";

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
  const [retryCount, setRetryCount] = useState(0);

  // Drag-drop state lifted here so left panel (word bank) and right panel (drop zone) share it
  const [droppedWord, setDroppedWord] = useState<string | null>(null);

  const handleAnswer = (correct: boolean) => {
    setIsCorrect(correct);
    setAnswered(true);
    if (correct) {
      onComplete();
    }
  };

  const handleRetry = () => {
    setAnswered(false);
    setIsCorrect(null);
    setRetryCount((c) => c + 1);
    setDroppedWord(null);
  };

  const isDragDrop = checkpoint.type === "drag-drop";
  const isHighlight = checkpoint.type === "highlight";

  const options = checkpoint.options || [];
  const template = checkpoint.template || "";
  const templateParts = template.split("___");

  const handleDragDropSubmit = () => {
    if (!droppedWord) return;
    const correct = Array.isArray(checkpoint.correctAnswer)
      ? checkpoint.correctAnswer.includes(droppedWord)
      : checkpoint.correctAnswer === droppedWord;
    handleAnswer(correct);
  };

  const passageText = slide.text || sentences.join(" ") || precedingText || "";

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6 items-stretch min-h-0">
      {/* Left: Text panel with sentences */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl p-4 sm:p-6 overflow-y-auto w-full min-h-0">
        {slide.heading && (
          <h2 className="font-serif font-bold text-lg mb-3 text-gray-900">
            {slide.heading}
          </h2>
        )}
        {isHighlight ? (
          <HighlightCheckpoint
            key={retryCount}
            sentences={sentences}
            paragraphBreaks={slide.paragraphBreaks}
            checkpoint={checkpoint}
            onAnswer={handleAnswer}
            answered={answered}
            isCorrect={isCorrect}
            activeMarker={activeMarker}
          />
        ) : (
          <div>
            <div className="font-serif text-sm md:text-base leading-relaxed text-gray-800 space-y-4">
              {passageText.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Drag-drop: word bank lives here, in the text panel */}
            {isDragDrop && !answered && (
              <div className="border-t border-gray-200 pt-3 mt-4">
                <p className="text-xs text-gray-500 mb-2 font-sans">
                  Drag a word to complete the sentence:
                </p>
                <div className="flex flex-wrap gap-2">
                  {options.map((word) => (
                    <button
                      key={word}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", word);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onClick={() => setDroppedWord(word)}
                      className={`px-4 py-2 border-2 rounded-lg text-sm font-medium cursor-grab active:cursor-grabbing transition-colors ${
                        droppedWord === word
                          ? "border-indigo-400 bg-indigo-50 text-indigo-600 opacity-50"
                          : "border-gray-300 bg-white text-gray-800 hover:border-indigo-400 hover:bg-indigo-50"
                      }`}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Question / Feedback panel */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl p-4 sm:p-6 overflow-y-auto w-full min-h-0">
        {answered && isCorrect !== null ? (
          <FeedbackPanel
            isCorrect={isCorrect}
            feedback={checkpoint.feedback}
            onRetry={!isCorrect ? handleRetry : undefined}
          />
        ) : isDragDrop ? (
          <div>
            <h3 className="font-bold text-base text-gray-900 mb-2">
              {checkpoint.skill}
            </h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4">
              {checkpoint.prompt}
            </p>

            {/* Template with drop zone */}
            <div
              className="bg-gray-50 rounded-lg p-4 mb-4 text-sm md:text-base leading-relaxed"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const word = e.dataTransfer.getData("text/plain");
                if (word) setDroppedWord(word);
              }}
            >
              {templateParts.map((part, i) => (
                <span key={i}>
                  {part}
                  {i < templateParts.length - 1 && (
                    <span
                      className={`inline-block min-w-[100px] mx-1 px-3 py-1 rounded border-2 border-dashed text-center ${
                        droppedWord
                          ? "border-indigo-400 bg-indigo-50 text-indigo-800 font-medium"
                          : "border-gray-400 bg-white text-gray-400"
                      }`}
                    >
                      {droppedWord || "___________"}
                    </span>
                  )}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              {droppedWord && (
                <button
                  onClick={() => setDroppedWord(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Reset
                </button>
              )}
              <button
                onClick={handleDragDropSubmit}
                disabled={!droppedWord}
                className="px-5 py-2 bg-indigo-700 text-white text-sm font-medium rounded-full hover:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        ) : isHighlight ? (
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
