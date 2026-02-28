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
    label: "Study Plan",
    type: "vocabulary",
    badgeColor: "red",
    items: [
      { id: "study-plan-1", title: "Study Plan Week 1", type: "vocabulary" },
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
  {
    label: "Information",
    type: "info",
    badgeColor: "red",
    items: [
      { id: "lo-u3w1", title: "Learning Objectives, Unit 3, Week 1", type: "info" },
      { id: "lo-u5w1", title: "Learning Objectives, Unit 5, Week 1", type: "info" },
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
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
      {/* Header */}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl px-6 py-4 mb-6">
        <h1 className="text-white text-xl font-bold tracking-wide text-center">
          Assignments
        </h1>
      </div>

      {/* Single white card with all categories */}
      <div className="bg-white rounded-xl overflow-hidden shadow-lg">
        {categories.map((cat, catIndex) => {
          const isOpen = expanded.has(cat.label);
          const count = cat.items.length;
          const isLast = catIndex === categories.length - 1;

          return (
            <div key={cat.label}>
              {/* Category row */}
              <button
                onClick={() => toggle(cat.label)}
                className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors ${
                  !isLast && !isOpen ? "border-b border-gray-200" : ""
                }`}
              >
                <span className="text-sm font-bold text-gray-900 text-left">
                  {cat.label}
                </span>
                <span
                  className={`min-w-[26px] h-[26px] flex items-center justify-center rounded-full text-xs font-bold border-2 ${
                    cat.badgeColor === "green"
                      ? "border-green-500 text-green-600 bg-green-50"
                      : "border-red-500 text-red-600 bg-red-50"
                  }`}
                >
                  {count}
                </span>
              </button>

              {/* Expanded items */}
              {isOpen && (
                <div className={`bg-gray-50 ${!isLast ? "border-b border-gray-200" : ""}`}>
                  {cat.items.length > 0 ? (
                    cat.items.map((item, itemIndex) => (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`w-full text-left px-8 py-3 text-sm transition-colors ${
                          item.type === "interactive-reading"
                            ? "text-gray-800 hover:bg-gray-100 cursor-pointer"
                            : "text-gray-500 cursor-default"
                        } ${itemIndex < cat.items.length - 1 ? "border-b border-gray-100" : ""}`}
                      >
                        {item.title}
                      </button>
                    ))
                  ) : (
                    <div className="px-8 py-3 text-sm text-gray-400 italic">
                      All complete
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
