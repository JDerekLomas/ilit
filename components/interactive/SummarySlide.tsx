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
    <div className="w-full h-full flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-0 items-stretch min-h-0">
      {/* Left: Writing panel — 57% matching checkpoint panels */}
      <div className="md:w-[57%] md:flex-none flex-1 bg-white rounded-xl border-[6px] border-black/30 p-4 sm:p-6 overflow-y-auto w-full min-h-0 flex flex-col">
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
          className="flex-1 min-h-[160px] w-full p-4 border-2 border-gray-200 bg-white rounded-xl resize-none font-serif text-sm md:text-base leading-relaxed focus:outline-none focus:border-[#1c8ed5] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
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
                className="px-5 py-2 text-sm font-medium rounded shadow disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ background: 'linear-gradient(to bottom, #e8e8e8 0%, #f5f5f5 3%, #e8e8e8 5%, #e8e8e8 95%, #ccc 100%)', color: '#333' }}
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
                className="px-6 py-2 text-white text-sm font-semibold rounded shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ background: 'linear-gradient(to bottom, #1c8ed5 0%, #79bde6 3%, #1c8ed5 5%, #1c8ed5 95%, #025e97 100%)', boxShadow: '0 1px 0 0 #025e97, inset 0 -2px 0 0 #025e97, inset 0 0 0 1px #025e97' }}
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

      {/* Right: Instruction / Feedback tabs — 43% with overlap */}
      <div className="md:w-[43%] md:flex-none md:-ml-3 flex-1 bg-[#f7f9f9] rounded-xl border-[6px] border-black/30 overflow-hidden w-full min-h-0 flex flex-col">
        <div className="flex bg-[#eeeeee] flex-shrink-0">
          <button
            onClick={() => setActiveTab("instruction")}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "instruction"
                ? "bg-white text-gray-900 border-[#1c8ed5]"
                : "bg-[#eeeeee] text-gray-500 hover:text-gray-700 border-transparent"
            }`}
          >
            Instruction
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "feedback"
                ? "bg-white text-gray-900 border-[#1c8ed5]"
                : "bg-[#eeeeee] text-gray-500 hover:text-gray-700 border-transparent"
            }`}
          >
            Feedback
            {feedback && (
              <span className="ml-1.5 inline-block w-2 h-2 bg-[#1c8ed5] rounded-full" />
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
                    <span className="text-[#1c8ed5] font-bold">1.</span>
                    <span>
                      Write a{" "}
                      <span className="text-teal-600 font-semibold">
                        topic sentence
                      </span>{" "}
                      that tells what the passage is about.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1c8ed5] font-bold">2.</span>
                    <span>
                      Include the{" "}
                      <span className="text-teal-600 font-semibold">
                        most important ideas and details
                      </span>{" "}
                      from each section. Leave out less important details.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1c8ed5] font-bold">3.</span>
                    <span>
                      Use{" "}
                      <span className="text-teal-600 font-semibold">
                        your own words
                      </span>
                      . Don&apos;t copy sentences from the article.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#1c8ed5] font-bold">4.</span>
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
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium mb-1.5">
                        Key ideas to include:
                      </p>
                      <ul className="space-y-1">
                        {slide.expectedKeyConcepts.map((concept, i) => (
                          <li
                            key={i}
                            className="text-xs text-blue-700 flex gap-1.5"
                          >
                            <span className="text-blue-300">&#8226;</span>
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
