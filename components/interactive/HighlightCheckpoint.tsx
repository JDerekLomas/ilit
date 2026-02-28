"use client";

import { useState } from "react";
import type { Checkpoint } from "@/lib/types";

interface Props {
  sentences: string[];
  checkpoint: Checkpoint;
  onAnswer: (correct: boolean) => void;
  answered: boolean;
  isCorrect: boolean | null;
}

export default function HighlightCheckpoint({
  sentences,
  checkpoint,
  onAnswer,
  answered,
  isCorrect,
}: Props) {
  const [selectedSentences, setSelectedSentences] = useState<Set<number>>(
    new Set()
  );
  const [activeMarker, setActiveMarker] = useState<"yellow" | "pink">("yellow");

  const correctAnswers = Array.isArray(checkpoint.correctAnswer)
    ? checkpoint.correctAnswer
    : [checkpoint.correctAnswer];

  const toggleSentence = (index: number) => {
    if (answered) return;
    setSelectedSentences((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const selectedTexts = [...selectedSentences].map((i) => sentences[i]);
    const allCorrect = correctAnswers.every((answer) =>
      selectedTexts.some(
        (text) => text.trim().toLowerCase() === answer.trim().toLowerCase()
      )
    );
    const noExtras = selectedTexts.length === correctAnswers.length;
    onAnswer(allCorrect && noExtras);
  };

  // After answering correctly, highlight the correct sentences
  const correctIndices =
    answered && isCorrect
      ? sentences.reduce<number[]>((acc, s, i) => {
          if (
            correctAnswers.some(
              (a) => a.trim().toLowerCase() === s.trim().toLowerCase()
            )
          )
            acc.push(i);
          return acc;
        }, [])
      : [];

  return (
    <div>
      <div className="font-serif text-sm md:text-base leading-relaxed text-gray-800 space-y-0.5">
        {sentences.map((sentence, i) => {
          const isSelected = selectedSentences.has(i);
          const isCorrectHighlight = correctIndices.includes(i);

          let className =
            "inline cursor-pointer rounded px-0.5 transition-colors ";
          if (isCorrectHighlight) {
            className += "bg-yellow-200 font-semibold";
          } else if (isSelected) {
            className +=
              activeMarker === "yellow"
                ? "bg-yellow-100 outline-dashed outline-2 outline-blue-400"
                : "bg-pink-100 outline-dashed outline-2 outline-blue-400";
          } else if (!answered) {
            className += "hover:bg-gray-100";
          }

          return (
            <span key={i} onClick={() => toggleSentence(i)} className={className}>
              {sentence}{" "}
            </span>
          );
        })}
      </div>

      {!answered && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveMarker("yellow")}
              className={`w-8 h-8 rounded-full border-2 ${
                activeMarker === "yellow"
                  ? "border-gray-800 ring-2 ring-gray-400"
                  : "border-gray-300"
              } bg-yellow-300`}
              title="Yellow marker"
            />
            <button
              onClick={() => setActiveMarker("pink")}
              className={`w-8 h-8 rounded-full border-2 ${
                activeMarker === "pink"
                  ? "border-gray-800 ring-2 ring-gray-400"
                  : "border-gray-300"
              } bg-pink-300`}
              title="Pink marker"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={selectedSentences.size === 0}
            className="px-5 py-2 bg-indigo-700 text-white text-sm font-medium rounded-full hover:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Save &amp; Continue
          </button>
        </div>
      )}
    </div>
  );
}
