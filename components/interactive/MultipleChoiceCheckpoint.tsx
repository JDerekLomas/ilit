"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Checkpoint } from "@/lib/types";

const MC_FIRST_TRIAL_SCORE = 2.0;
const MC_SECOND_TRIAL_SCORE = 1.5;
const MAX_ATTEMPTS = 2;

const LETTER_LABELS = ["A", "B", "C", "D", "E", "F"];

export type McState =
  | "selecting"
  | "correct"
  | "showingWrong"
  | "revealAnswer";

interface Props {
  checkpoint: Checkpoint;
  onAnswer: (correct: boolean, score: number) => void;
  mcState: McState;
  onStateChange: (state: McState) => void;
  attemptCount: number;
  onAttemptChange: (count: number) => void;
}

export default function MultipleChoiceCheckpoint({
  checkpoint,
  onAnswer,
  mcState,
  onStateChange,
  attemptCount,
  onAttemptChange,
}: Props) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = checkpoint.options || [];

  const isCorrectAnswer = (option: string): boolean => {
    const correct = checkpoint.correctAnswer;
    if (Array.isArray(correct)) {
      return correct.some(
        (a) => a.trim().toLowerCase() === option.trim().toLowerCase()
      );
    }
    return correct.trim().toLowerCase() === option.trim().toLowerCase();
  };

  const handleSelect = (option: string) => {
    if (mcState !== "selecting") return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    const correct = isCorrectAnswer(selectedOption);
    const newAttempt = attemptCount + 1;
    onAttemptChange(newAttempt);

    if (correct) {
      const trialScore =
        newAttempt === 1 ? MC_FIRST_TRIAL_SCORE : MC_SECOND_TRIAL_SCORE;
      onStateChange("correct");
      onAnswer(true, trialScore);
    } else {
      if (newAttempt >= MAX_ATTEMPTS) {
        onStateChange("revealAnswer");
        onAnswer(false, 0);
      } else {
        onStateChange("showingWrong");
      }
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    onStateChange("selecting");
  };

  const isShowingResult = mcState === "correct" || mcState === "revealAnswer";

  // Extract the letter label from option text if it starts with "A. ", "B. ", etc.
  const parseOption = (option: string) => {
    const match = option.match(/^([A-F])\.\s*(.*)/);
    if (match) {
      return { letter: match[1], text: match[2] };
    }
    return null;
  };

  return (
    <div>
      <div className="space-y-3">
        {options.map((option, i) => {
          const parsed = parseOption(option);
          const letter = parsed ? parsed.letter : LETTER_LABELS[i] || String(i + 1);
          const text = parsed ? parsed.text : option;
          const isSelected = selectedOption === option;
          const isCorrect = isCorrectAnswer(option);

          // Determine visual state
          let borderColor = "border-gray-200";
          let bgColor = "bg-white";
          let textColor = "text-gray-800";
          let letterBg = "bg-gray-100 text-gray-600";
          let ringStyle = "";
          let opacity = "";

          if (isShowingResult) {
            if (isCorrect) {
              borderColor = "border-green-400";
              bgColor = "bg-green-50";
              textColor = "text-green-900";
              letterBg = "bg-green-500 text-white";
            } else if (isSelected && !isCorrect) {
              borderColor = "border-red-300";
              bgColor = "bg-red-50";
              textColor = "text-red-700";
              letterBg = "bg-red-400 text-white";
            } else {
              // Dim non-selected, non-correct options
              opacity = "opacity-40";
            }
          } else if (mcState === "showingWrong") {
            if (isSelected) {
              borderColor = "border-red-300";
              bgColor = "bg-red-50";
              textColor = "text-red-700";
              letterBg = "bg-red-400 text-white";
            } else if (isCorrect) {
              // Show correct answer in green on first wrong attempt
              borderColor = "border-green-400";
              bgColor = "bg-green-50";
              textColor = "text-green-900";
              letterBg = "bg-green-500 text-white";
            } else {
              opacity = "opacity-40";
            }
          } else if (isSelected) {
            borderColor = "border-indigo-400";
            bgColor = "bg-indigo-50";
            textColor = "text-indigo-900";
            letterBg = "bg-indigo-600 text-white";
            ringStyle = "ring-2 ring-indigo-200";
          }

          const isClickable = mcState === "selecting";

          return (
            <motion.button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={!isClickable}
              whileHover={isClickable ? { scale: 1.01, x: 4 } : {}}
              whileTap={isClickable ? { scale: 0.99 } : {}}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-colors ${borderColor} ${bgColor} ${textColor} ${ringStyle} ${opacity} ${
                isClickable ? "cursor-pointer hover:shadow-md" : "cursor-default"
              }`}
            >
              {/* Letter circle */}
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${letterBg}`}
              >
                {letter}
              </span>

              {/* Option text */}
              <span className="text-sm md:text-base leading-relaxed pt-1 flex-1">
                {text}
              </span>

              {/* Result indicator */}
              {isShowingResult && isCorrect && (
                <motion.span
                  className="flex-shrink-0 mt-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.span>
              )}
              {isShowingResult && isSelected && !isCorrect && (
                <motion.span
                  className="flex-shrink-0 mt-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Submit button */}
      {mcState === "selecting" && selectedOption && (
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
            Check Answer
          </motion.button>
        </motion.div>
      )}

      {/* Retry prompt */}
      {mcState === "showingWrong" && (
        <motion.div
          className="mt-4"
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
