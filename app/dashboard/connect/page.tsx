"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface BuzzComment {
  date: string;
  comment: string;
  stars: number;
}

const SAMPLE_COMMENTS: BuzzComment[] = [
  { date: "02/28/26", comment: "Great participation in today's discussion! Your ideas about the main character really helped the group.", stars: 2 },
  { date: "02/27/26", comment: "Nice job finishing your reading assignment on time.", stars: 1 },
  { date: "02/25/26", comment: "Keep up the excellent work with your vocabulary practice!", stars: 3 },
  { date: "02/24/26", comment: "I noticed you helped a classmate during partner reading. That's great teamwork!", stars: 1 },
  { date: "02/21/26", comment: "Your journal entry today showed strong comprehension. Well done!", stars: 2 },
];

export default function ConnectPage() {
  const [comments] = useState(SAMPLE_COMMENTS);
  const [refreshing, setRefreshing] = useState(false);

  const totalStars = comments.reduce((sum, c) => sum + c.stars, 0);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <motion.div
      className="max-w-[1003px] mx-auto px-4 pt-6 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div
        className="bg-white rounded-md overflow-hidden"
        style={{
          boxShadow: "0 5px 10px rgba(0,0,0,0.2)",
          padding: "22px 18px",
          minHeight: 500,
        }}
      >
        {/* Two-column layout */}
        <div className="flex flex-col sm:flex-row gap-4 h-full" style={{ minHeight: 456 }}>
          {/* Left column: Comments */}
          <div className="sm:w-[48%] flex flex-col">
            {/* Header with Comments title and refresh */}
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-xl font-bold text-gray-700">Comments</h1>
              <button
                onClick={handleRefresh}
                className="flex items-center justify-center w-[34px] h-[34px] rounded transition-colors"
                style={{ backgroundColor: "#6F9229" }}
                aria-label="Refresh Button"
                title="Refresh"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={refreshing ? "animate-spin" : ""}
                >
                  <path d="M21 2v6h-6" />
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
              </button>
            </div>

            {/* Comment table */}
            <div className="flex-1 overflow-auto" style={{ maxHeight: 420 }}>
              {comments.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
                  No comments yet
                </div>
              ) : (
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th
                        className="text-left p-2 border border-gray-300 bg-gray-50 font-semibold text-gray-600"
                        style={{ width: "30%" }}
                      >
                        Date
                      </th>
                      <th className="text-left p-2 border border-gray-300 bg-gray-50 font-semibold text-gray-600">
                        Comments
                      </th>
                    </tr>
                  </thead>
                  <tbody aria-label="Comments">
                    {comments.map((c, i) => (
                      <tr
                        key={i}
                        className={i % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"}
                      >
                        <td className="p-2 border border-gray-300 text-gray-600 align-top whitespace-nowrap">
                          {c.date}
                        </td>
                        <td className="p-2 border border-gray-300 text-gray-800 align-top leading-relaxed">
                          {c.comment}
                          {c.stars > 0 && (
                            <span className="ml-2 text-yellow-500">
                              {"★".repeat(c.stars)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right column: Star display */}
          <div className="sm:w-[48%] sm:ml-auto flex flex-col items-center justify-center text-center">
            {/* Star image */}
            <div style={{ margin: "55px 0" }}>
              <svg
                width="160"
                height="160"
                viewBox="0 0 24 24"
                fill={totalStars > 0 ? "#f59e0b" : "none"}
                stroke={totalStars > 0 ? "#f59e0b" : "#dc2626"}
                strokeWidth="1.5"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>

            {/* Star count text */}
            <p className="text-gray-600" style={{ fontSize: 24 }}>
              You have{" "}
              <span className="font-bold" style={{ fontSize: 30 }}>
                {totalStars}
              </span>{" "}
              star{totalStars !== 1 ? "s" : ""} !!!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
