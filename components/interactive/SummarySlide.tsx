"use client";

import { useState } from "react";
import type { Slide } from "@/lib/types";

interface Props {
  slide: Slide;
}

export default function SummarySlide({ slide }: Props) {
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState<"instruction" | "feedback">(
    "instruction"
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleGetFeedback = () => {
    if (!text.trim()) return;

    const concepts = slide.expectedKeyConcepts || [];
    const lowerText = text.toLowerCase();
    const found = concepts.filter((c) => lowerText.includes(c.toLowerCase()));
    const ratio = concepts.length > 0 ? found.length / concepts.length : 0;

    let feedbackText: string;
    if (ratio >= 0.6) {
      feedbackText = `Great work! Your summary covers ${found.length} of ${concepts.length} key ideas from the passage. You mentioned: ${found.join(", ")}. Keep up the good work!`;
    } else if (ratio >= 0.3) {
      feedbackText = `Good start! Your summary covers ${found.length} of ${concepts.length} key ideas. Try to include more details about: ${concepts.filter((c) => !found.includes(c)).slice(0, 3).join(", ")}. Remember to use your own words to describe the main ideas.`;
    } else {
      feedbackText = `Your summary needs more detail. Try to include information about: ${concepts.slice(0, 4).join(", ")}. Re-read the passage and think about the most important ideas in each section.`;
    }

    setFeedback(feedbackText);
    setActiveTab("feedback");
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  // Parse instruction tips from the slide data
  const instructionTips = (
    slide as unknown as Record<string, unknown>
  ).instructionTips as Array<{ text: string; term?: string; definition?: string }> | undefined;

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6 items-start">
      {/* Left: Writing panel */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto">
        <p className="text-sm text-gray-700 mb-4">
          {slide.summaryPrompt ||
            "Write a summary of the text you have just read."}
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitted}
          placeholder="Type your summary here..."
          className="w-full h-40 md:h-48 p-4 border-2 border-gray-300 bg-white rounded-lg resize-none font-serif text-sm md:text-base leading-relaxed focus:outline-none focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
        <button
          onClick={handleGetFeedback}
          disabled={!text.trim() || submitted}
          className="mt-3 w-full py-2.5 bg-indigo-700 text-white font-medium rounded-lg hover:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Get Feedback
        </button>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || submitted}
          className="mt-2 mx-auto block px-8 py-2 bg-indigo-700 text-white text-sm font-medium rounded-lg hover:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitted ? "Summary Submitted" : "Submit Summary"}
        </button>
      </div>

      {/* Right: Instruction / Feedback tabs */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl overflow-hidden max-h-[70vh]">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("instruction")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "instruction"
                ? "bg-white text-gray-900 border-b-2 border-indigo-600"
                : "bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}
          >
            Instruction
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "feedback"
                ? "bg-white text-gray-900 border-b-2 border-indigo-600"
                : "bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}
          >
            Feedback
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(70vh-48px)]">
          {activeTab === "instruction" ? (
            <div className="text-sm text-gray-700 leading-relaxed space-y-3">
              <h3 className="font-bold text-base text-gray-900">Instruction</h3>
              <p>
                In a summary, you use your own words to tell what a piece of
                writing is about. A summary is shorter than the original text. It
                only contains the most important ideas.
              </p>
              <p>
                The article you read was organized into four sections. Here are
                tips for summarizing each section of the article:
              </p>
              <ul className="space-y-2 ml-1">
                {instructionTips ? (
                  instructionTips.map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-gray-400">&#8226;</span>
                      <span>
                        {tip.term
                          ? tip.text.replace(
                              `{${tip.term}}`,
                              `<a class="text-blue-600 underline cursor-help" title="${tip.definition || ""}">${tip.term}</a>`
                            )
                          : tip.text}
                      </span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex gap-2">
                      <span className="text-gray-400">&#8226;</span>
                      <span>
                        Write a{" "}
                        <span className="text-blue-600 underline cursor-help">
                          topic sentence
                        </span>{" "}
                        that tells what the paragraph or group of paragraphs is
                        about.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gray-400">&#8226;</span>
                      <span>
                        Tell the{" "}
                        <span className="text-blue-600 underline cursor-help">
                          important ideas and details
                        </span>{" "}
                        you learned from that section. Leave out less important
                        details.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gray-400">&#8226;</span>
                      <span>
                        Use your own words. Don&apos;t copy sentences from the
                        article.
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          ) : (
            <div className="text-sm text-gray-700 leading-relaxed">
              <h3 className="font-bold text-base text-gray-900 mb-3">
                Feedback
              </h3>
              {feedback ? (
                <p>{feedback}</p>
              ) : (
                <p className="text-gray-400 italic">
                  Write your summary and click &quot;Get Feedback&quot; to see
                  feedback here.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
