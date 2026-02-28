"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

// Scoring constants from the reference spec
const MAX_SCORE = 2.0;
const MAX_ATTEMPTS = 2;

type DndState =
  | "interacting"     // student is dragging/dropping
  | "shaking"         // wrong answer animation playing
  | "retryPrompt"     // wrong on attempt 1, showing fail text + retry
  | "snapSuccess"     // correct answer, snap animation
  | "finalCorrect"    // done, correct
  | "finalIncorrect"; // done, both wrong, showing correct answer

type HighlightState =
  | "selecting"       // student is highlighting sentences
  | "correct"         // answered correctly
  | "showingWrong"    // wrong on attempt 1, showing fail text + retry
  | "revealAnswer";   // both attempts wrong, showing correct answer

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
  const [attemptCount, setAttemptCount] = useState(0);
  const [score, setScore] = useState<number | null>(null);

  // Highlight state
  const [highlightState, setHighlightState] = useState<HighlightState>(
    completed && checkpoint.type === "highlight" ? "correct" : "selecting"
  );

  // Drag-drop state
  const [droppedWord, setDroppedWord] = useState<string | null>(null);
  const [isDragOverDrop, setIsDragOverDrop] = useState(false);
  const [dragActiveWord, setDragActiveWord] = useState<string | null>(null);
  const [dndState, setDndState] = useState<DndState>(
    completed && checkpoint.type === "drag-drop" ? "finalCorrect" : "interacting"
  );
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleAnswer = useCallback((correct: boolean) => {
    setIsCorrect(correct);
    setAnswered(true);
    if (correct) {
      onComplete();
    }
  }, [onComplete]);

  // Highlight answer handler (receives score from HighlightCheckpoint)
  const handleHighlightAnswer = useCallback((correct: boolean, hlScore: number) => {
    setScore(hlScore);
    setIsCorrect(correct);
    setAnswered(true);
    if (correct) {
      onComplete();
    }
  }, [onComplete]);

  const handleDndRetry = () => {
    setDndState("interacting");
    setDroppedWord(null);
    setDragActiveWord(null);
  };

  const isDragDrop = checkpoint.type === "drag-drop";
  const isHighlight = checkpoint.type === "highlight";

  const options = checkpoint.options || [];
  const template = checkpoint.template || "";
  const templateParts = template.split("___");

  const checkCorrect = useCallback((word: string): boolean => {
    return Array.isArray(checkpoint.correctAnswer)
      ? checkpoint.correctAnswer.includes(word)
      : checkpoint.correctAnswer === word;
  }, [checkpoint.correctAnswer]);

  const handleDragDropSubmit = () => {
    if (!droppedWord) return;
    const correct = checkCorrect(droppedWord);
    const newAttempt = attemptCount + 1;
    setAttemptCount(newAttempt);

    if (correct) {
      const trialScore = newAttempt === 1 ? 2.0 : 1.5;
      setScore(trialScore);
      setDndState("snapSuccess");
      setTimeout(() => {
        setDndState("finalCorrect");
        handleAnswer(true);
      }, 900);
    } else {
      setDndState("shaking");
      setTimeout(() => {
        if (newAttempt >= MAX_ATTEMPTS) {
          const correctWord = Array.isArray(checkpoint.correctAnswer)
            ? checkpoint.correctAnswer[0]
            : checkpoint.correctAnswer;
          setDroppedWord(correctWord);
          setScore(0);
          setDndState("finalIncorrect");
          setTimeout(() => handleAnswer(false), 1000);
        } else {
          setDndState("retryPrompt");
        }
      }, 600);
    }
  };

  // Handle drop via native drag events (desktop)
  const handleNativeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDrop(false);
    const word = e.dataTransfer.getData("text/plain");
    if (word) setDroppedWord(word);
  };

  const handleWordTap = (word: string) => {
    if (dndState !== "interacting") return;
    setDragActiveWord(word);
    setDroppedWord(word);
  };

  const handleDropZoneTap = () => {
    if (dragActiveWord && dndState === "interacting") {
      setDroppedWord(dragActiveWord);
      setDragActiveWord(null);
    }
  };

  const passageText = slide.text || sentences.join(" ") || precedingText || "";

  const wordBankVisible = isDragDrop && (dndState === "interacting" || dndState === "retryPrompt");

  // Right panel shows feedback when in a final state
  const showDndFeedback = dndState === "finalCorrect" || dndState === "finalIncorrect";
  const showHighlightFeedback = highlightState === "correct" || highlightState === "revealAnswer";
  const highlightToolsDisabled = highlightState !== "selecting";

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
            sentences={sentences}
            paragraphBreaks={slide.paragraphBreaks}
            checkpoint={checkpoint}
            onAnswer={handleHighlightAnswer}
            answered={answered}
            isCorrect={isCorrect}
            activeMarker={activeMarker}
            attemptCount={attemptCount}
            onAttemptChange={setAttemptCount}
            highlightState={highlightState}
            onStateChange={setHighlightState}
          />
        ) : (
          <div>
            <div className="font-serif text-sm md:text-base leading-relaxed text-gray-800 space-y-4">
              {passageText.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Drag-drop: word bank */}
            {wordBankVisible && (
              <motion.div
                className="border-t border-gray-200 pt-4 mt-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <p className="text-xs text-gray-500 mb-3 font-sans uppercase tracking-wide">
                  Word Bank
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {options.map((word) => {
                    const isPlaced = droppedWord === word;
                    const isActive = dragActiveWord === word;
                    return (
                      <motion.button
                        key={word}
                        draggable
                        onDragStart={(e) => {
                          const de = e as unknown as React.DragEvent;
                          if (de.dataTransfer) {
                            de.dataTransfer.setData("text/plain", word);
                            de.dataTransfer.effectAllowed = "move";
                          }
                          setDragActiveWord(word);
                        }}
                        onDragEnd={() => setDragActiveWord(null)}
                        onClick={() => handleWordTap(word)}
                        whileHover={{ scale: 1.05, boxShadow: "0 4px 15px rgba(0,0,0,0.12)" }}
                        whileTap={{ scale: 0.95 }}
                        animate={
                          isPlaced
                            ? { opacity: 0.4, scale: 0.95 }
                            : isActive
                            ? { scale: 1.08, boxShadow: "0 6px 20px rgba(99,102,241,0.3)" }
                            : { opacity: 1, scale: 1 }
                        }
                        className={`px-5 py-2.5 border-2 rounded-xl text-sm font-semibold cursor-grab active:cursor-grabbing transition-colors select-none ${
                          isPlaced
                            ? "border-indigo-300 bg-indigo-50 text-indigo-400"
                            : isActive
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg"
                            : "border-gray-200 bg-white text-gray-800 hover:border-indigo-400 hover:bg-indigo-50 shadow-sm"
                        }`}
                      >
                        {word}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Right: Question / Feedback panel */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl p-4 sm:p-6 overflow-y-auto w-full min-h-0">
        <AnimatePresence mode="wait">
          {/* DnD feedback panel */}
          {showDndFeedback && !isHighlight ? (
            <motion.div
              key="dnd-feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FeedbackPanel
                isCorrect={dndState === "finalCorrect"}
                feedback={checkpoint.feedback}
                score={score}
                revealedAnswer={
                  dndState === "finalIncorrect"
                    ? (Array.isArray(checkpoint.correctAnswer)
                        ? checkpoint.correctAnswer[0]
                        : checkpoint.correctAnswer)
                    : null
                }
              />
            </motion.div>

          /* Highlight feedback panel */
          ) : showHighlightFeedback && isHighlight ? (
            <motion.div
              key="highlight-feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FeedbackPanel
                isCorrect={highlightState === "correct"}
                feedback={checkpoint.feedback}
                score={score}
                revealedAnswer={null}
              />
            </motion.div>

          /* DnD interaction panel */
          ) : isDragDrop ? (
            <motion.div
              key="dragdrop"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-bold text-base text-gray-900 mb-1">
                {checkpoint.skill}
              </h3>

              {/* Retry prompt after first wrong answer */}
              {dndState === "retryPrompt" && (
                <motion.div
                  className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-orange-800 font-medium mb-1">Not quite right.</p>
                  <p className="text-xs text-orange-700">{checkpoint.feedback.incorrect}</p>
                  <button
                    onClick={handleDndRetry}
                    className="mt-2 px-4 py-1.5 bg-orange-600 text-white text-xs font-semibold rounded-full hover:bg-orange-700 transition-colors"
                  >
                    Try Again (1 attempt remaining)
                  </button>
                </motion.div>
              )}

              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-5">
                {checkpoint.prompt}
              </p>

              {/* Template with drop zone */}
              <div
                ref={dropZoneRef}
                className="bg-gray-50 rounded-xl p-5 mb-5 text-sm md:text-base leading-relaxed border border-gray-100"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setIsDragOverDrop(true);
                }}
                onDragLeave={() => setIsDragOverDrop(false)}
                onDrop={handleNativeDrop}
                onClick={handleDropZoneTap}
              >
                {templateParts.map((part, i) => (
                  <span key={i}>
                    {part}
                    {i < templateParts.length - 1 && (
                      <motion.span
                        className={`inline-block min-w-[120px] mx-1 px-4 py-1.5 rounded-lg border-2 text-center align-middle ${
                          dndState === "snapSuccess"
                            ? "border-green-400 bg-green-50 text-green-800 font-bold"
                            : dndState === "finalIncorrect"
                            ? "border-blue-400 bg-blue-50 text-blue-800 font-bold"
                            : droppedWord
                            ? "border-indigo-400 bg-indigo-50 text-indigo-800 font-semibold"
                            : isDragOverDrop
                            ? "border-indigo-500 bg-indigo-100 text-indigo-500 border-solid shadow-inner"
                            : "border-gray-300 bg-white text-gray-400 border-dashed"
                        }`}
                        animate={
                          dndState === "shaking"
                            ? { x: [0, -8, 8, -6, 6, -3, 3, 0], borderColor: "#ef4444" }
                            : dndState === "snapSuccess"
                            ? { scale: [1, 1.1, 1], borderColor: "#22c55e" }
                            : {}
                        }
                        transition={
                          dndState === "shaking"
                            ? { duration: 0.5, ease: "easeInOut" }
                            : dndState === "snapSuccess"
                            ? { duration: 0.4, ease: "easeOut" }
                            : {}
                        }
                      >
                        {dndState === "snapSuccess" && droppedWord && (
                          <motion.span
                            className="inline-block mr-1 text-green-600"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
                          >
                            &#10003;
                          </motion.span>
                        )}
                        {dndState === "shaking" && droppedWord && (
                          <motion.span
                            className="inline-block mr-1 text-red-500"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.05, type: "spring", stiffness: 500 }}
                          >
                            &#10007;
                          </motion.span>
                        )}
                        {droppedWord || (isDragOverDrop ? "Drop here" : "Drag Word Here")}
                      </motion.span>
                    )}
                  </span>
                ))}
              </div>

              {/* Actions */}
              {dndState === "interacting" && (
                <div className="flex gap-3 justify-end items-center">
                  {droppedWord && (
                    <button
                      onClick={() => {
                        setDroppedWord(null);
                        setDragActiveWord(null);
                      }}
                      className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                  <motion.button
                    onClick={handleDragDropSubmit}
                    disabled={!droppedWord}
                    whileHover={droppedWord ? { scale: 1.03 } : {}}
                    whileTap={droppedWord ? { scale: 0.97 } : {}}
                    className="px-6 py-2.5 bg-indigo-700 text-white text-sm font-semibold rounded-full hover:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md"
                  >
                    Save and Continue
                  </motion.button>
                </div>
              )}
            </motion.div>

          /* Highlight tools panel */
          ) : isHighlight ? (
            <motion.div
              className="flex flex-col h-full"
              key="highlight-tools"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-bold text-base text-gray-900 mb-1">
                {checkpoint.skill}
              </h3>

              {/* Show retry feedback inline */}
              {highlightState === "showingWrong" && (
                <motion.div
                  className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-orange-800 font-medium mb-1">Not quite right.</p>
                  <p className="text-xs text-orange-700">{checkpoint.feedback.incorrect}</p>
                </motion.div>
              )}

              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4">
                {checkpoint.prompt}
              </p>

              {/* Highlighter tools */}
              <div className={`mt-auto pt-4 border-t border-gray-100 ${highlightToolsDisabled ? "opacity-40 pointer-events-none" : ""}`}>
                <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Highlighter Tools</p>
                <div className="flex items-center gap-3">
                  {/* Yellow marker */}
                  <motion.button
                    onClick={() => setActiveMarker("yellow")}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 transition-colors ${
                      activeMarker === "yellow"
                        ? "border-gray-800 bg-yellow-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-400"
                    }`}
                    title="Yellow highlighter"
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-gray-300"
                      style={{ backgroundColor: "#f4df76" }}
                    />
                    <span className="text-xs font-medium text-gray-700">Yellow</span>
                  </motion.button>

                  {/* Pink/Red marker */}
                  <motion.button
                    onClick={() => setActiveMarker("pink")}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 transition-colors ${
                      activeMarker === "pink"
                        ? "border-gray-800 bg-pink-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-400"
                    }`}
                    title="Pink highlighter"
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-gray-300"
                      style={{ backgroundColor: "#f47676" }}
                    />
                    <span className="text-xs font-medium text-gray-700">Red</span>
                  </motion.button>
                </div>

                {/* Attempt counter */}
                {attemptCount > 0 && highlightState === "selecting" && (
                  <p className="mt-3 text-xs text-gray-400">
                    Attempt {attemptCount + 1} of {MAX_ATTEMPTS}
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <div key="generic">
              <p className="text-sm text-gray-700">{checkpoint.prompt}</p>
            </div>
          )}
        </AnimatePresence>
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
  score,
  revealedAnswer,
}: {
  isCorrect: boolean;
  feedback: { correct: string; incorrect: string };
  score: number | null;
  revealedAnswer: string | null;
}) {
  const [celebrationMsg] = useState(
    () => CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)]
  );

  return (
    <div>
      {/* Success/Failure icon */}
      <motion.div
        className="flex items-center gap-3 mb-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {isCorrect ? (
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        )}
        <div>
          <h3
            className={`text-lg font-bold ${
              isCorrect ? "text-green-700" : "text-red-600"
            }`}
          >
            {isCorrect ? celebrationMsg : "Not quite."}
          </h3>
          {score !== null && (
            <p className="text-xs text-gray-500">
              Score: {score} / {MAX_SCORE} points
            </p>
          )}
        </div>
      </motion.div>

      <p className="text-sm md:text-base text-gray-700 leading-relaxed">
        {isCorrect ? feedback.correct : feedback.incorrect}
      </p>

      {revealedAnswer && (
        <motion.div
          className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-blue-800">
            The correct answer is: <strong>{revealedAnswer}</strong>
          </p>
        </motion.div>
      )}
    </div>
  );
}
