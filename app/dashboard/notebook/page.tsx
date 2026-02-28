"use client";

import { useState } from "react";

const tabs = ["Journal", "Word Bank", "Class Notes", "My Work", "Resources"] as const;

export default function NotebookPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Journal");

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <div className="bg-amber-50 rounded-xl shadow-xl overflow-hidden border-l-8 border-amber-800/30">
        {/* Tab bar */}
        <div className="flex border-b border-amber-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-amber-100 text-amber-900 border-b-2 border-amber-700"
                  : "text-amber-600 hover:bg-amber-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 min-h-[300px]">
          {activeTab === "Journal" ? (
            <div>
              <input
                type="text"
                placeholder="Title"
                className="w-full text-lg font-semibold border-b border-amber-200 bg-transparent pb-2 mb-4 focus:outline-none focus:border-amber-500 placeholder:text-amber-300"
              />
              <textarea
                placeholder="Start writing..."
                className="w-full h-48 bg-transparent resize-none text-sm text-gray-700 leading-relaxed focus:outline-none placeholder:text-amber-300"
                style={{
                  backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #e8d8b8 28px)",
                  lineHeight: "28px",
                }}
              />
            </div>
          ) : (
            <p className="text-sm text-amber-600 italic text-center mt-12">
              {activeTab} coming soon
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
