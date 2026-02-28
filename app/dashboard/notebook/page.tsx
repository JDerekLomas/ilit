"use client";

import { useState } from "react";

const tabs = [
  { name: "Journal" as const, color: "#0b89b7" },
  { name: "Word Bank" as const, color: "#1a5479" },
  { name: "Class Notes" as const, color: "#fc4333" },
  { name: "My Work" as const, color: "#ff8c00" },
  { name: "Resources" as const, color: "#d42a2a" },
] as const;

type TabName = (typeof tabs)[number]["name"];

// Spiral ring SVG rendered as a column of rings
function SpiralBinding() {
  const ringCount = 18;
  const ringSpacing = 32;
  const ringWidth = 28;
  const ringHeight = 16;
  const totalHeight = ringCount * ringSpacing;

  return (
    <div
      className="flex-shrink-0 relative z-10"
      style={{ width: 48, minHeight: totalHeight }}
    >
      <svg
        width="48"
        height={totalHeight}
        viewBox={`0 0 48 ${totalHeight}`}
        className="absolute inset-0"
      >
        {Array.from({ length: ringCount }, (_, i) => {
          const cy = i * ringSpacing + ringSpacing / 2;
          const cx = 24;
          return (
            <g key={i}>
              {/* Ring shadow */}
              <ellipse
                cx={cx}
                cy={cy + 1}
                rx={ringWidth / 2}
                ry={ringHeight / 2}
                fill="none"
                stroke="#1a1a1a"
                strokeWidth={3.5}
                opacity={0.3}
              />
              {/* Ring body — metallic gradient effect */}
              <ellipse
                cx={cx}
                cy={cy}
                rx={ringWidth / 2}
                ry={ringHeight / 2}
                fill="none"
                stroke="url(#ringGradient)"
                strokeWidth={3}
              />
              {/* Inner highlight */}
              <ellipse
                cx={cx}
                cy={cy - 1}
                rx={ringWidth / 2 - 1.5}
                ry={ringHeight / 2 - 1.5}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={1}
              />
            </g>
          );
        })}
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8a8a8a" />
            <stop offset="30%" stopColor="#c0c0c0" />
            <stop offset="50%" stopColor="#e0e0e0" />
            <stop offset="70%" stopColor="#b0b0b0" />
            <stop offset="100%" stopColor="#707070" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function NotebookPage() {
  const [activeTab, setActiveTab] = useState<TabName>("Journal");

  const activeColor = tabs.find((t) => t.name === activeTab)?.color ?? "#0b89b7";

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-8">
      {/* Outer notebook container — dark background simulating the cover */}
      <div
        className="relative flex rounded-lg overflow-visible"
        style={{ background: "#5a5957" }}
      >
        {/* Spiral binding on the left */}
        <SpiralBinding />

        {/* Main notebook body */}
        <div className="flex-1 flex flex-col min-h-[576px] relative">
          {/* Paper surface */}
          <div
            className="flex-1 flex flex-col rounded-r-md overflow-hidden"
            style={{
              background: "#fff",
              boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.12), inset -1px -1px 3px rgba(0,0,0,0.05)",
            }}
          >
            {/* Colored header strip */}
            <div
              className="h-1.5 flex-shrink-0"
              style={{ background: activeColor }}
            />

            {/* Toolbar row */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
              <span className="text-sm font-semibold text-gray-500 flex-shrink-0">
                Title:
              </span>
              <input
                type="text"
                placeholder="Untitled"
                className="flex-1 text-sm font-medium border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-gray-500 placeholder:text-gray-300"
              />
              <button
                className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Delete"
                title="Delete"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
              <button
                className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Add new"
                title="Add new"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            {/* Content area with ruled lines */}
            <div className="flex-1 relative overflow-auto">
              {activeTab === "Journal" ? (
                <div className="px-6 pt-4 pb-6">
                  <textarea
                    placeholder="Start writing..."
                    className="w-full min-h-[400px] bg-transparent resize-none text-sm text-gray-700 focus:outline-none placeholder:text-gray-300"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(transparent, transparent 27px, #d6cfc4 28px)",
                      lineHeight: "28px",
                    }}
                  />
                </div>
              ) : activeTab === "Word Bank" ? (
                <div className="px-6 pt-6">
                  <p className="text-sm text-gray-500 italic text-center mt-12">
                    Word Bank -- save vocabulary words here
                  </p>
                </div>
              ) : activeTab === "Class Notes" ? (
                <div className="px-6 pt-4 pb-6">
                  <textarea
                    placeholder="Take notes during class..."
                    className="w-full min-h-[400px] bg-transparent resize-none text-sm text-gray-700 focus:outline-none placeholder:text-gray-300"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(transparent, transparent 27px, #d6cfc4 28px)",
                      lineHeight: "28px",
                    }}
                  />
                </div>
              ) : (
                <div className="px-6 pt-6">
                  <p className="text-sm text-gray-500 italic text-center mt-12">
                    {activeTab} coming soon
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right-side colored tabs */}
        <div
          className="absolute flex flex-col gap-0.5"
          style={{ right: -36, top: 20 }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className="relative group"
                aria-label={tab.name}
                title={tab.name}
              >
                <div
                  className="flex items-center justify-center transition-all"
                  style={{
                    width: isActive ? 40 : 36,
                    background: tab.color,
                    borderRadius: "0 6px 6px 0",
                    border: `1px solid rgba(0,0,0,0.25)`,
                    borderLeft: "none",
                    boxShadow: isActive
                      ? "2px 1px 4px rgba(0,0,0,0.3)"
                      : "1px 1px 2px rgba(0,0,0,0.2)",
                    padding: "14px 4px",
                    marginLeft: isActive ? -4 : 0,
                  }}
                >
                  <span
                    className="text-white font-bold text-[10px] leading-tight tracking-wide"
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                    }}
                  >
                    {tab.name}
                  </span>
                </div>
                {/* Active indicator — triangle pointing left into the page */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full"
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: "6px solid transparent",
                      borderBottom: "6px solid transparent",
                      borderRight: `6px solid ${tab.color}`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
