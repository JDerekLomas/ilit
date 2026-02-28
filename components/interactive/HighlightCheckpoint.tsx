"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Checkpoint } from "@/lib/types";

// Scoring constants from reference spec
const HIGHLIGHT_FIRST_TRIAL_SCORE = 2.0;
const HIGHLIGHT_SECOND_TRIAL_SCORE = 1.5;
const MAX_ATTEMPTS = 2;

// Highlight colors matching the reference app
const HIGHLIGHT_COLORS = {
  yellow: { bg: "#f4df76", bgLight: "#fdf8e1", border: "#e6c619" },
  pink: { bg: "#f47676", bgLight: "#fde8e8", border: "#e03e3e" },
} as const;

type HighlightState =
  | "selecting"      // student is selecting sentences
  | "correct"        // answered correctly
  | "showingWrong"   // showing what was wrong (before retry)
  | "revealAnswer";  // both attempts wrong, showing correct answer

interface Props {
  sentences: string[];
  paragraphBreaks?: number[];
  checkpoint: Checkpoint;
  onAnswer: (correct: boolean, score: number) => void;
  answered: boolean;
  isCorrect: boolean | null;
  activeMarker: "yellow" | "pink";
  attemptCount: number;
  onAttemptChange: (count: number) => void;
  highlightState: HighlightState;
  onStateChange: (state: HighlightState) => void;
}

export default function HighlightCheckpoint({
  sentences,
  paragraphBreaks,
  checkpoint,
  onAnswer,
  answered,
  isCorrect,
  activeMarker,
  attemptCount,
  onAttemptChange,
  highlightState,
  onStateChange,
}: Props) {
  const breakSet = new Set(paragraphBreaks || []);
  const [selectedSentences, setSelectedSentences] = useState<
    Map<number, "yellow" | "pink">
  >(new Map());

  const correctAnswers = Array.isArray(checkpoint.correctAnswer)
    ? checkpoint.correctAnswer
    : [checkpoint.correctAnswer];

  // Compute which sentence indices are correct answers
  const correctIndices = sentences.reduce<number[]>((acc, s, i) => {
    if (
      correctAnswers.some(
        (a) => a.trim().toLowerCase() === s.trim().toLowerCase()
      )
    )
      acc.push(i);
    return acc;
  }, []);

  const toggleSentence = (index: number) => {
    if (highlightState !== "selecting") return;
    setSelectedSentences((prev) => {
      const next = new Map(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.set(index, activeMarker);
      }
      return next;
    });
  };

  const eraseSentence = (index: number) => {
    setSelectedSentences((prev) => {
      const next = new Map(prev);
      next.delete(index);
      return next;
    });
  };

  const handleSubmit = () => {
    const selectedIndices = [...selectedSentences.keys()];
    const selectedTexts = selectedIndices.map((i) => sentences[i]);
    const allCorrect = correctAnswers.every((answer) =>
      selectedTexts.some(
        (text) => text.trim().toLowerCase() === answer.trim().toLowerCase()
      )
    );
    const noExtras = selectedTexts.length === correctAnswers.length;
    const correct = allCorrect && noExtras;
    const newAttempt = attemptCount + 1;
    onAttemptChange(newAttempt);

    if (correct) {
      const trialScore =
        newAttempt === 1
          ? HIGHLIGHT_FIRST_TRIAL_SCORE
          : HIGHLIGHT_SECOND_TRIAL_SCORE;
      onStateChange("correct");
      onAnswer(true, trialScore);
    } else {
      if (newAttempt >= MAX_ATTEMPTS) {
        // Reveal correct answer
        onStateChange("revealAnswer");
        onAnswer(false, 0);
      } else {
        onStateChange("showingWrong");
      }
    }
  };

  const handleRetry = () => {
    setSelectedSentences(new Map());
    onStateChange("selecting");
  };

  const isSelecting = highlightState === "selecting";
  const isShowingResult =
    highlightState === "correct" || highlightState === "revealAnswer";

  return (
    <div>
      <div className="font-serif text-sm md:text-base leading-relaxed text-gray-800">
        {sentences.map((sentence, i) => {
          const selectedColor = selectedSentences.get(i);
          const isSelected = selectedColor !== undefined;
          const isCorrectSentence = correctIndices.includes(i);
          const isParagraphStart = i > 0 && breakSet.has(i);

          // Determine visual state
          let bgColor = "transparent";
          let textColor = "";
          let borderStyle = "";
          let cursor = isSelecting ? "cursor-pointer" : "cursor-default";

          if (isShowingResult) {
            if (isCorrectSentence) {
              // Correct sentence -- highlighted in gold
              bgColor = HIGHLIGHT_COLORS.yellow.bg;
              textColor = "text-gray-900 font-semibold";
            } else if (isSelected) {
              // Student selected this but it was wrong
              bgColor = "#fee2e2";
              textColor = "text-red-800 line-through";
            }
          } else if (highlightState === "showingWrong") {
            if (isSelected && !isCorrectSentence) {
              bgColor = "#fee2e2";
              borderStyle = "border-b-2 border-red-300";
            } else if (isSelected && isCorrectSentence) {
              bgColor = HIGHLIGHT_COLORS[selectedColor].bg;
            } else if (isSelected) {
              bgColor = HIGHLIGHT_COLORS[selectedColor].bg;
            }
          } else if (isSelected) {
            // Active selection during "selecting" state
            bgColor = HIGHLIGHT_COLORS[selectedColor].bg;
            borderStyle = `border-b-2 border-[${HIGHLIGHT_COLORS[selectedColor].border}]`;
          }

          return (
            <span key={i}>
              {isParagraphStart && <span className="block mb-4" />}
              <motion.span
                onClick={() => toggleSentence(i)}
                className={`inline rounded-sm px-0.5 py-0.5 transition-colors ${cursor} ${textColor} ${borderStyle} ${
                  isSelecting && !isSelected ? "hover:bg-gray-100" : ""
                }`}
                style={{ backgroundColor: bgColor }}
                whileHover={
                  isSelecting ? { backgroundColor: isSelected ? bgColor : "#f3f4f6" } : {}
                }
                whileTap={isSelecting ? { scale: 0.99 } : {}}
                layout
              >
                {sentence}{" "}
                {/* Show correct/incorrect indicator on results */}
                {isShowingResult && isCorrectSentence && (
                  <motion.span
                    className="inline-block text-green-600 text-xs align-super"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 500 }}
                  >
                    &#10003;
                  </motion.span>
                )}
                {isShowingResult && isSelected && !isCorrectSentence && (
                  <motion.span
                    className="inline-block text-red-500 text-xs align-super"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 500 }}
                  >
                    &#10007;
                  </motion.span>
                )}
              </motion.span>
            </span>
          );
        })}
      </div>

      {/* Submit button during selecting state */}
      {isSelecting && selectedSentences.size > 0 && (
        <motion.div
          className="mt-5 flex justify-end"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-2.5 bg-indigo-700 text-white text-sm font-semibold rounded-full hover:bg-indigo-800 transition-colors shadow-md"
          >
            Save and Continue
          </motion.button>
        </motion.div>
      )}

      {/* Retry prompt after first wrong */}
      {highlightState === "showingWrong" && (
        <motion.div
          className="mt-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg mb-3">
            <p className="text-sm text-orange-800 font-medium mb-1">Not quite right.</p>
            <p className="text-xs text-orange-700">{checkpoint.feedback.incorrect}</p>
          </div>
          <div className="flex justify-end">
            <motion.button
              onClick={handleRetry}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2 bg-orange-600 text-white text-xs font-semibold rounded-full hover:bg-orange-700 transition-colors"
            >
              Try Again (1 attempt remaining)
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
