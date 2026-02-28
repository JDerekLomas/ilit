"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Checkpoint } from "@/lib/types";

interface Props {
  checkpoint: Checkpoint;
  onComplete: () => void;
  completed: boolean;
}

export default function TextAnswerCheckpoint({
  checkpoint,
  onComplete,
  completed,
}: Props) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(completed);

  const handleSubmit = () => {
    if (!text.trim()) return;
    setSubmitted(true);
    onComplete();
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={submitted}
        placeholder="Type your answer here..."
        className="w-full min-h-[200px] md:min-h-[320px] p-4 border-2 border-gray-200 bg-white rounded-xl resize-none font-serif text-sm md:text-base leading-relaxed focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
      />

      {!submitted ? (
        <div className="mt-4 flex justify-end">
          <motion.button
            onClick={handleSubmit}
            disabled={!text.trim()}
            whileHover={text.trim() ? { scale: 1.03 } : {}}
            whileTap={text.trim() ? { scale: 0.97 } : {}}
            className="px-6 py-2.5 bg-indigo-700 text-white text-sm font-semibold rounded-full hover:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            Save and Continue
          </motion.button>
        </div>
      ) : (
        <motion.div
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-green-800 font-medium">
            {checkpoint.feedback.correct || "Thank you for your response."}
          </p>
        </motion.div>
      )}
    </div>
  );
}
