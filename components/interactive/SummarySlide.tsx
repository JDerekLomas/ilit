"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Slide } from "@/lib/types";

interface Props {
  slide: Slide;
}

const MIN_WORDS = 10;

export default function SummarySlide({ slide }: Props) {
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState<"instruction" | "feedback">(
    "instruction"
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackRatio, setFeedbackRatio] = useState(0);

  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const handleGetFeedback = useCallback(() => {
    if (!text.trim()) return;

    const concepts = slide.expectedKeyConcepts || [];
    const lowerText = text.toLowerCase();
    const found = concepts.filter((c) => lowerText.includes(c.toLowerCase()));
    const ratio = concepts.length > 0 ? found.length / concepts.length : 0;
    setFeedbackRatio(ratio);

    let feedbackText: string;
    if (ratio >= 0.6) {
      feedbackText = `Great work! Your summary covers ${found.length} of ${concepts.length} key ideas from the passage. You mentioned: ${found.join(", ")}. Keep up the good work!`;
    } else if (ratio >= 0.3) {
      const missing = concepts
        .filter((c) => !found.includes(c))
        .slice(0, 3)
        .join(", ");
      feedbackText = `Good start! Your summary covers ${found.length} of ${concepts.length} key ideas. Try to include more details about: ${missing}. Remember to use your own words to describe the main ideas.`;
    } else {
      feedbackText = `Your summary needs more detail. Try to include information about: ${concepts.slice(0, 4).join(", ")}. Re-read the passage and think about the most important ideas in each section.`;
    }

    setFeedback(feedbackText);
    setActiveTab("feedback");
  }, [text, slide.expectedKeyConcepts]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
  }, []);

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6 items-stretch min-h-0">
      {/* Left: Writing panel */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl p-4 sm:p-6 overflow-y-auto w-full min-h-0 flex flex-col">
        <h3 className="font-serif font-bold text-lg text-gray-900 mb-2">
          Write Your Summary
        </h3>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {slide.summaryPrompt ||
            "Write a summary of the text you have just read. Tap on the white space below to type your answer."}
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitted}
          placeholder="Type your summary here..."
          className="flex-1 min-h-[160px] w-full p-4 border-2 border-gray-200 bg-white rounded-xl resize-none font-serif text-sm md:text-base leading-relaxed focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
        />

        {/* Word count + actions */}
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`text-xs font-medium ${
              wordCount >= MIN_WORDS ? "text-green-600" : "text-gray-400"
            }`}
          >
            {wordCount} {wordCount === 1 ? "word" : "words"}
            {wordCount > 0 && wordCount < MIN_WORDS && (
              <span className="text-gray-400 ml-1">
                (min {MIN_WORDS})
              </span>
            )}
          </span>

          <div className="flex items-center gap-2">
            {!submitted && (
              <motion.button
                onClick={handleGetFeedback}
                disabled={wordCount < MIN_WORDS}
                whileHover={wordCount >= MIN_WORDS ? { scale: 1.03 } : {}}
                whileTap={wordCount >= MIN_WORDS ? { scale: 0.97 } : {}}
                className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Get Feedback
              </motion.button>
            )}
            {!submitted ? (
              <motion.button
                onClick={handleSubmit}
                disabled={wordCount < MIN_WORDS}
                whileHover={wordCount >= MIN_WORDS ? { scale: 1.03 } : {}}
                whileTap={wordCount >= MIN_WORDS ? { scale: 0.97 } : {}}
                className="px-6 py-2 bg-indigo-700 text-white text-sm font-semibold rounded-full hover:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                Submit Summary
              </motion.button>
            ) : (
              <motion.div
                className="flex items-center gap-2 text-sm text-green-600 font-medium"
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
        </div>
      </div>

      {/* Right: Instruction / Feedback tabs */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl overflow-hidden w-full min-h-0 flex flex-col">
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setActiveTab("instruction")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "instruction"
                ? "bg-white text-gray-900 border-b-2 border-indigo-600"
                : "bg-gray-50 text-gray-500 hover:text-gray-700"
            }`}
          >
            Instruction
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "feedback"
                ? "bg-white text-gray-900 border-b-2 border-indigo-600"
                : "bg-gray-50 text-gray-500 hover:text-gray-700"
            }`}
          >
            Feedback
            {feedback && (
              <span className="ml-1.5 inline-block w-2 h-2 bg-indigo-500 rounded-full" />
            )}
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
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
                <h3 className="font-bold text-base text-gray-900">
                  How to Write a Summary
                </h3>
                <p>
                  In a summary, you use your own words to tell what a piece of
                  writing is about. A summary is shorter than the original text.
                  It only contains the most important ideas.
                </p>
                <p>
                  Here are tips for writing a good summary:
                </p>
                <ul className="space-y-2.5 ml-1">
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold">1.</span>
                    <span>
                      Write a{" "}
                      <span className="text-teal-600 font-semibold">
                        topic sentence
                      </span>{" "}
                      that tells what the passage is about.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold">2.</span>
                    <span>
                      Include the{" "}
                      <span className="text-teal-600 font-semibold">
                        most important ideas and details
                      </span>{" "}
                      from each section. Leave out less important details.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold">3.</span>
                    <span>
                      Use{" "}
                      <span className="text-teal-600 font-semibold">
                        your own words
                      </span>
                      . Don&apos;t copy sentences from the article.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold">4.</span>
                    <span>
                      Write a{" "}
                      <span className="text-teal-600 font-semibold">
                        concluding sentence
                      </span>{" "}
                      that wraps up the main idea.
                    </span>
                  </li>
                </ul>

                {/* Key concepts hint */}
                {slide.expectedKeyConcepts &&
                  slide.expectedKeyConcepts.length > 0 && (
                    <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                      <p className="text-xs text-indigo-600 font-medium mb-1.5">
                        Key ideas to include:
                      </p>
                      <ul className="space-y-1">
                        {slide.expectedKeyConcepts.map((concept, i) => (
                          <li
                            key={i}
                            className="text-xs text-indigo-700 flex gap-1.5"
                          >
                            <span className="text-indigo-300">&#8226;</span>
                            {concept}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </motion.div>
            ) : (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-gray-700 leading-relaxed"
              >
                <h3 className="font-bold text-base text-gray-900 mb-3">
                  Feedback
                </h3>
                {feedback ? (
                  <div className="space-y-3">
                    {/* Score indicator */}
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                        feedbackRatio >= 0.6
                          ? "bg-green-100 text-green-700"
                          : feedbackRatio >= 0.3
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {feedbackRatio >= 0.6
                        ? "Great Job!"
                        : feedbackRatio >= 0.3
                        ? "Good Start"
                        : "Needs More Detail"}
                    </div>
                    <p className="leading-relaxed">{feedback}</p>
                    {!submitted && feedbackRatio < 0.6 && (
                      <p className="text-xs text-gray-400 italic">
                        You can revise your summary and get feedback again before
                        submitting.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">
                    Write your summary and click &quot;Get Feedback&quot; to see
                    how you did.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
