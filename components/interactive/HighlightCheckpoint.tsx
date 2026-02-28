"use client";

import { useState } from "react";
import type { Checkpoint } from "@/lib/types";

interface Props {
  sentences: string[];
  paragraphBreaks?: number[];
  checkpoint: Checkpoint;
  onAnswer: (correct: boolean) => void;
  answered: boolean;
  isCorrect: boolean | null;
  activeMarker: "yellow" | "pink";
}

export default function HighlightCheckpoint({
  sentences,
  paragraphBreaks,
  checkpoint,
  onAnswer,
  answered,
  isCorrect,
  activeMarker,
}: Props) {
  const breakSet = new Set(paragraphBreaks || []);
  const [selectedSentences, setSelectedSentences] = useState<Set<number>>(
    new Set()
  );

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
      <div className="font-serif text-sm md:text-base leading-relaxed text-gray-800 space-y-3">
        {sentences.map((sentence, i) => {
          const isSelected = selectedSentences.has(i);
          const isCorrectHighlight = correctIndices.includes(i);
          const isParagraphStart = i > 0 && breakSet.has(i);

          let className =
            "inline cursor-pointer rounded px-0.5 transition-colors ";
          if (isCorrectHighlight) {
            className += "bg-yellow-200 font-bold italic";
          } else if (isSelected) {
            className +=
              activeMarker === "yellow"
                ? "bg-yellow-100 outline-dashed outline-2 outline-blue-400"
                : "bg-pink-100 outline-dashed outline-2 outline-blue-400";
          } else if (!answered) {
            className += "hover:bg-gray-100";
          }

          return (
            <span key={i}>
              {isParagraphStart && <span className="block mb-3" />}
              <span onClick={() => toggleSentence(i)} className={className}>
                {sentence}{" "}
              </span>
            </span>
          );
        })}
      </div>

      {!answered && selectedSentences.size > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-indigo-700 text-white text-sm font-medium rounded-full hover:bg-indigo-800 transition-colors"
          >
            Save &amp; Continue
          </button>
        </div>
      )}
    </div>
  );
}
