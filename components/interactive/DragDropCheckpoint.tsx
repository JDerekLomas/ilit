"use client";

import { useState } from "react";
import type { Checkpoint } from "@/lib/types";

interface Props {
  checkpoint: Checkpoint;
  onAnswer: (correct: boolean) => void;
}

export default function DragDropCheckpoint({ checkpoint, onAnswer }: Props) {
  const [droppedWord, setDroppedWord] = useState<string | null>(null);
  const [draggedWord, setDraggedWord] = useState<string | null>(null);

  const options = checkpoint.options || [];
  const template = checkpoint.template || "";
  const parts = template.split("___");

  const handleDragStart = (word: string) => {
    setDraggedWord(word);
  };

  const handleDrop = () => {
    if (draggedWord) {
      setDroppedWord(draggedWord);
      setDraggedWord(null);
    }
  };

  const handleWordClick = (word: string) => {
    // Tap-to-place for mobile
    setDroppedWord(word);
  };

  const handleSubmit = () => {
    if (!droppedWord) return;
    const correct = Array.isArray(checkpoint.correctAnswer)
      ? checkpoint.correctAnswer.includes(droppedWord)
      : checkpoint.correctAnswer === droppedWord;
    onAnswer(correct);
  };

  const handleReset = () => {
    setDroppedWord(null);
  };

  return (
    <div>
      {/* Context text if available */}
      {checkpoint.contextText && (
        <p className="text-sm text-gray-600 italic mb-4">
          The word that completes the sentence is{" "}
          <strong className="not-italic">{checkpoint.correctAnswer}</strong>.{" "}
          {checkpoint.contextText}
        </p>
      )}

      <h3 className="font-bold text-base mb-2">Check Your Understanding</h3>
      <p className="text-sm text-gray-700 mb-4">{checkpoint.prompt}</p>

      {/* Fill-in-the-blank sentence */}
      <div
        className="bg-gray-50 rounded-lg p-4 mb-4 text-sm md:text-base leading-relaxed"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
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

      {/* Draggable word options */}
      <div className="flex flex-wrap gap-2 mb-4">
        {options.map((word) => (
          <button
            key={word}
            draggable
            onDragStart={() => handleDragStart(word)}
            onClick={() => handleWordClick(word)}
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

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        {droppedWord && (
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Reset
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!droppedWord}
          className="px-5 py-2 bg-indigo-700 text-white text-sm font-medium rounded-full hover:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
