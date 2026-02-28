"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AssignmentItem {
  id: string;
  title: string;
  type: "interactive-reading" | "vocabulary" | "ipractice" | "writing" | "monitor" | "info";
}

interface AssignmentCategory {
  label: string;
  type: AssignmentItem["type"];
  items: AssignmentItem[];
  badgeColor: "red" | "green";
}

const categories: AssignmentCategory[] = [
  {
    label: "Interactive Reading",
    type: "interactive-reading",
    badgeColor: "red",
    items: [
      { id: "bomb-dogs", title: "Bomb Dogs: Canine Heroes", type: "interactive-reading" },
      { id: "turn-it-down", title: "Turn It Down!", type: "interactive-reading" },
      { id: "hidden-ads", title: "Hidden Ads", type: "interactive-reading" },
    ],
  },
  {
    label: "Vocabulary, Word Study, and Reading Comprehension",
    type: "vocabulary",
    badgeColor: "red",
    items: [
      { id: "long-vowels", title: "Long Vowels CVCe", type: "vocabulary" },
      { id: "word-slam", title: "Word Slam", type: "vocabulary" },
    ],
  },
  {
    label: "iPractice",
    type: "ipractice",
    badgeColor: "red",
    items: [
      { id: "multimedia", title: "Plan a Multimedia Presentation", type: "ipractice" },
      { id: "poem", title: "Write a Poem", type: "ipractice" },
      { id: "drama", title: "Elements of Drama", type: "ipractice" },
    ],
  },
  {
    label: "Writing",
    type: "writing",
    badgeColor: "green",
    items: [],
  },
  {
    label: "Monitor Progress",
    type: "monitor",
    badgeColor: "red",
    items: [
      { id: "grade-a-mid", title: "GRADE Level A — Middle of the Year", type: "monitor" },
      { id: "reading-check-7", title: "Reading Check 7", type: "monitor" },
    ],
  },
];

export default function AssignmentsPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const router = useRouter();

  const toggle = (label: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleItemClick = (item: AssignmentItem) => {
    if (item.type === "interactive-reading") {
      router.push(`/interactive/${item.id}`);
    }
    // Other types are placeholder for now
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-4">
      {/* Header */}
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-gray-500 px-6 py-4 mb-6">
        <h1 className="text-white text-xl font-bold tracking-wide">
          Assignments
        </h1>
      </div>

      {/* Category list */}
      <div className="space-y-2">
        {categories.map((cat) => {
          const isOpen = expanded.has(cat.label);
          const count = cat.items.length;

          return (
            <div key={cat.label}>
              {/* Category header */}
              <button
                onClick={() => toggle(cat.label)}
                className="w-full flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3.5 shadow-sm hover:bg-white transition-colors"
              >
                <ChevronIcon open={isOpen} />
                <span className="flex-1 text-left text-sm font-semibold text-gray-800 leading-snug">
                  {cat.label}
                </span>
                <span
                  className={`min-w-[28px] h-7 flex items-center justify-center rounded-full text-xs font-bold text-white ${
                    cat.badgeColor === "green" ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {count}
                </span>
              </button>

              {/* Expanded items */}
              {isOpen && cat.items.length > 0 && (
                <div className="ml-4 mt-1 space-y-1">
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                        item.type === "interactive-reading"
                          ? "bg-white/80 text-gray-800 hover:bg-white hover:shadow-sm cursor-pointer"
                          : "bg-white/50 text-gray-500 cursor-default"
                      }`}
                    >
                      {item.title}
                      {item.type === "interactive-reading" && (
                        <span className="float-right text-gray-400">&rsaquo;</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {isOpen && cat.items.length === 0 && (
                <div className="ml-4 mt-1 px-4 py-3 bg-white/50 rounded-lg text-sm text-gray-400 italic">
                  All complete
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-gray-500 transition-transform ${open ? "rotate-90" : ""}`}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
