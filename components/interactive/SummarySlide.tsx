"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Slide } from "@/lib/types";

interface Props {
  slide: Slide;
}

const MIN_WORDS = 10;
const MAX_SCORE = 4;

// Colors matching the original rubric bars
const SCORE_COLORS = ["#d32f2f", "#e64a19", "#f9a825", "#388e3c"] as const;
const GRAY = "#d0d0d0";

/** Map a 0-1 ratio to a 1-4 integer score */
function ratioToScore(ratio: number): number {
  if (ratio >= 0.8) return 4;
  if (ratio >= 0.6) return 3;
  if (ratio >= 0.3) return 2;
  return 1;
}

/** Render a row of colored blocks for a score (0-based index into 13 blocks) */
function ScoreBar({ score, maxBlocks = 13 }: { score: number; maxBlocks?: number }) {
  const filledCount = Math.round((score / MAX_SCORE) * maxBlocks);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxBlocks }, (_, i) => {
        const isFilled = i < filledCount;
        const colorIndex = Math.min(
          Math.floor((i / maxBlocks) * SCORE_COLORS.length),
          SCORE_COLORS.length - 1
        );
        return (
          <div
            key={i}
            className="w-[18px] h-[18px] rounded-[2px]"
            style={{
              backgroundColor: isFilled ? SCORE_COLORS[colorIndex] : GRAY,
            }}
          />
        );
      })}
    </div>
  );
}

interface SectionScore {
  label: string;
  concept: string;
  found: boolean;
  score: number;
}

export default function SummarySlide({ slide }: Props) {
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState<"instruction" | "feedback">(
    "instruction"
  );
  const [feedback, setFeedback] = useState<{
    overall: number;
    sections: SectionScore[];
    checks: { label: string; ok: boolean }[];
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const concepts = useMemo(
    () => slide.expectedKeyConcepts || [],
    [slide.expectedKeyConcepts]
  );

  const handleGetFeedback = useCallback(() => {
    if (!text.trim()) return;

    const lowerText = text.toLowerCase();

    // Score each concept as a "section"
    const sections: SectionScore[] = concepts.map((concept, i) => {
      const found = lowerText.includes(concept.toLowerCase());
      return {
        label: `Section ${i + 1}`,
        concept,
        found,
        score: found ? 3 + Math.random() * 1 : 0.5 + Math.random() * 1,
      };
    });

    const foundCount = sections.filter((s) => s.found).length;
    const ratio = concepts.length > 0 ? foundCount / concepts.length : 0;
    const overall = ratioToScore(ratio);

    // Quality checks
    const words = text.trim().split(/\s+/);
    const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
    const repetitionRatio = words.length > 0 ? uniqueWords.size / words.length : 1;

    const checks = [
      { label: "Repeated Ideas", ok: repetitionRatio > 0.5 },
      { label: "Unrelated Ideas", ok: ratio > 0.2 },
      { label: "Copying", ok: true }, // We don't have source text to check
      { label: "Spelling", ok: true }, // No spell check available
    ];

    setFeedback({ overall, sections, checks });
    setActiveTab("feedback");
  }, [text, concepts]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
  }, []);

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-0 items-stretch min-h-0">
      {/* Left: Writing panel — 57% matching checkpoint panels */}
      <div className="md:w-[57%] md:flex-none flex-1 bg-white rounded-xl border-[6px] border-black/30 p-4 sm:p-6 overflow-y-auto w-full min-h-0 flex flex-col">
        <p className="text-sm md:text-base text-gray-800 mb-4 leading-relaxed">
          {slide.summaryPrompt ||
            "Write a summary of the text you have just read. Tap on the white space below to type your answer."}
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitted}
          placeholder="Type your summary here..."
          className="flex-1 min-h-[200px] w-full p-4 border border-gray-300 bg-white resize-none font-serif text-sm md:text-base leading-relaxed focus:outline-none focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
        />

        {/* Buttons stacked like original */}
        {!submitted ? (
          <div className="mt-4 flex flex-col items-end gap-3">
            <motion.button
              onClick={handleGetFeedback}
              disabled={wordCount < MIN_WORDS}
              whileHover={wordCount >= MIN_WORDS ? { scale: 1.01 } : {}}
              whileTap={wordCount >= MIN_WORDS ? { scale: 0.99 } : {}}
              className="w-full py-3 text-white text-sm font-bold rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{
                background: "#3f3f8f",
                borderBottom: "3px dashed rgba(255,255,255,0.3)",
              }}
            >
              Get Feedback
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              disabled={wordCount < MIN_WORDS}
              whileHover={wordCount >= MIN_WORDS ? { scale: 1.02 } : {}}
              whileTap={wordCount >= MIN_WORDS ? { scale: 0.98 } : {}}
              className="px-8 py-2.5 text-white text-sm font-bold rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ background: "#3f3f8f" }}
            >
              Submit Summary
            </motion.button>
          </div>
        ) : (
          <motion.div
            className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600 font-medium"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Submitted
          </motion.div>
        )}
      </div>

      {/* Right: Instruction / Feedback tabs — 43% with overlap */}
      <div className="md:w-[43%] md:flex-none md:-ml-3 flex-1 bg-white rounded-xl border-[6px] border-black/30 overflow-hidden w-full min-h-0 flex flex-col">
        {/* Pill-style tabs matching original */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setActiveTab("instruction")}
              className={`px-6 py-2 text-xs font-bold transition-colors ${
                activeTab === "instruction"
                  ? "bg-[#3f3f8f] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Instruction
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`px-6 py-2 text-xs font-bold transition-colors ${
                activeTab === "feedback"
                  ? "bg-[#3f3f8f] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Feedback
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === "instruction" ? (
              <motion.div
                key="instruction"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-gray-700 leading-relaxed space-y-3"
              >
                <h3 className="font-bold text-center text-base text-gray-900">
                  Instruction
                </h3>
                <p>
                  In a summary, you use your own words to tell what a piece of
                  writing is about. A summary is shorter than the original text.
                  It only contains the most important ideas.
                </p>
                <p>
                  The article you read was organized into four sections. Here are
                  tips for summarizing each section of the article:
                </p>
                <ul className="space-y-2 ml-1">
                  <li className="flex gap-2">
                    <span className="text-gray-400">&bull;</span>
                    <span>
                      Write a{" "}
                      <span className="text-blue-700 underline">
                        topic sentence
                      </span>{" "}
                      that tells what the paragraph or group of paragraphs is
                      about.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gray-400">&bull;</span>
                    <span>
                      Tell the{" "}
                      <span className="text-blue-700 underline">
                        important ideas and details
                      </span>{" "}
                      you learned from that section. Leave out less important
                      details.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gray-400">&bull;</span>
                    <span>
                      Use your own words. Don&apos;t copy sentences from the
                      article.
                    </span>
                  </li>
                </ul>
              </motion.div>
            ) : (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-gray-700"
              >
                {feedback ? (
                  <div className="space-y-4">
                    {/* Overall */}
                    <div className="text-center">
                      <h3 className="font-bold text-base text-gray-900">
                        Feedback
                      </h3>
                      <p className="text-xs text-gray-500">Overall</p>
                    </div>

                    {/* Overall score bar */}
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1 px-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                      </div>
                      <ScoreBar score={feedback.overall} />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 px-1">
                        <span>Poor</span>
                        <span>Fair</span>
                        <span>Excellent</span>
                      </div>
                    </div>

                    {/* Section scores */}
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                      {feedback.sections.map((section, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-2"
                        >
                          <span className="text-xs font-medium text-gray-700 w-16 flex-shrink-0">
                            {section.label}
                          </span>
                          <div className="flex-1">
                            <ScoreBar
                              score={section.score}
                              maxBlocks={13}
                            />
                          </div>
                          <button className="w-5 h-5 bg-[#3f3f8f] rounded-sm flex items-center justify-center flex-shrink-0">
                            <svg
                              width="8"
                              height="10"
                              viewBox="0 0 8 10"
                              fill="white"
                            >
                              <path d="M0 0 L8 5 L0 10 Z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quality checks */}
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                      {feedback.checks.map((check, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-2"
                        >
                          <span className="text-xs font-medium text-gray-700 flex-1">
                            {check.label}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              check.ok
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {check.ok ? "Check Your Work" : "Check Your Work"}
                          </span>
                          <button className="w-5 h-5 bg-[#3f3f8f] rounded-sm flex items-center justify-center flex-shrink-0">
                            <svg
                              width="8"
                              height="10"
                              viewBox="0 0 8 10"
                              fill="white"
                            >
                              <path d="M0 0 L8 5 L0 10 Z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <h3 className="font-bold text-base text-gray-900 mb-2">
                      Feedback
                    </h3>
                    <p className="text-gray-400 italic text-sm">
                      Write your summary and click &quot;Get Feedback&quot; to
                      see how you did.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
