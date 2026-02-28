"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStudentData, toggleAssignmentComplete, type StudentData } from "@/lib/storage";
import assignmentCategoriesRaw from "@/content/assignment-categories.json";

interface AssignmentItem {
  id: string;
  title: string;
  type: "interactive-reading" | "vocabulary" | "ipractice" | "writing" | "monitor" | "info";
}

interface AssignmentCategory {
  label: string;
  type: AssignmentItem["type"];
  items: AssignmentItem[];
}

// Deduplicate categories from JSON (removes duplicate EXTRA PRACTICE entries)
const uniqueCategories = assignmentCategoriesRaw.filter(
  (cat, idx, arr) => arr.findIndex((c) => c.name === cat.name) === idx
);

// Map category names to types
const TYPE_MAP: Record<string, AssignmentItem["type"]> = {
  "INTERACTIVE READING": "interactive-reading",
  "STUDY PLAN": "vocabulary",
  "VOCABULARY, WORD STUDY, AND ACADEMIC TEXTS": "vocabulary",
  "iPRACTICE": "ipractice",
  "WRITING": "writing",
  "INFORMATION": "info",
  "EXTRA PRACTICE": "vocabulary",
  "SORT": "vocabulary",
  "UNIT BENCHMARK ASSESSMENT": "monitor",
  "WEEKLY READING CHECK": "monitor",
  "GRADE": "monitor",
};

// Existing items mapped to category popupNames
const EXISTING_ITEMS: Record<string, AssignmentItem[]> = {
  "Interactive Reading": [
    { id: "bomb-dogs", title: "Bomb Dogs: Canine Heroes", type: "interactive-reading" },
    { id: "turn-it-down", title: "Turn It Down!", type: "interactive-reading" },
    { id: "hidden-ads", title: "Hidden Ads", type: "interactive-reading" },
    { id: "the-power-to-move", title: "The Power to Move", type: "interactive-reading" },
    { id: "mentors-make-a-difference", title: "Mentors Make a Difference", type: "interactive-reading" },
    { id: "having-friends-making-choices", title: "Having Friends, Making Choices", type: "interactive-reading" },
    { id: "cell-phones-tools-or-troublemakers", title: "Cell Phones: Tools or Troublemakers?", type: "interactive-reading" },
  ],
  "Study Plan": [
    { id: "study-plan-1", title: "Study Plan Week 1", type: "vocabulary" },
  ],
  "Vocabulary, Word Study, And Academic Texts": [
    { id: "long-vowels", title: "Long Vowels CVCe", type: "vocabulary" },
    { id: "word-slam", title: "Word Slam", type: "vocabulary" },
  ],
  "iPractice": [
    { id: "multimedia", title: "Plan a Multimedia Presentation", type: "ipractice" },
    { id: "poem", title: "Write a Poem", type: "ipractice" },
    { id: "drama", title: "Elements of Drama", type: "ipractice" },
  ],
  "Information": [
    { id: "lo-u3w1", title: "Learning Objectives, Unit 3, Week 1", type: "info" },
    { id: "lo-u5w1", title: "Learning Objectives, Unit 5, Week 1", type: "info" },
  ],
  "Weekly Reading Check": [
    { id: "reading-check-7", title: "Reading Check 7", type: "monitor" },
  ],
  "Grade": [
    { id: "grade-a-mid", title: "GRADE Level A — Middle of the Year", type: "monitor" },
  ],
};

const categories: AssignmentCategory[] = uniqueCategories.map((cat) => ({
  label: cat.popupName,
  type: TYPE_MAP[cat.name] ?? "info",
  items: EXISTING_ITEMS[cat.popupName] ?? [],
}));

// ── Main page ──

export default function AssignmentsPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const router = useRouter();

  useEffect(() => {
    setStudentData(loadStudentData());
  }, []);

  const completedSet = new Set(studentData?.completedAssignments ?? []);

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

  const handleToggleComplete = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const updated = toggleAssignmentComplete(itemId);
    setStudentData(updated);
  };

  // Count completed items per category
  const getCategoryCount = (cat: AssignmentCategory) => {
    const completed = cat.items.filter((item) => completedSet.has(item.id)).length;
    const total = cat.items.length;
    return { completed, total, allDone: total > 0 && completed === total };
  };

  return (
    <div className="relative min-h-full">
      <div className="relative max-w-2xl mx-auto px-3 sm:px-4 pt-6 sm:pt-8 pb-4">
        {/* Header */}
        <div
          className="rounded-xl px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-6 backdrop-blur-sm"
          style={{
            background: "linear-gradient(135deg, rgba(140, 30, 80, 0.5) 0%, rgba(60, 30, 100, 0.5) 50%, rgba(30, 60, 130, 0.5) 100%)",
          }}
        >
          <h1 className="text-white text-xl font-bold tracking-wide text-center">
            Assignments
          </h1>
        </div>

        {/* Categories card */}
        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          {categories.map((cat, catIndex) => {
            const isOpen = expanded.has(cat.label);
            const isLast = catIndex === categories.length - 1;
            const { completed, total, allDone } = getCategoryCount(cat);
            const badgeColor = allDone ? "green" : "red";

            return (
              <div key={cat.label}>
                <button
                  onClick={() => toggle(cat.label)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors ${
                    !isLast && !isOpen ? "border-b border-gray-200" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 text-left flex-1 min-w-0">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className={`flex-shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <span className="text-sm font-bold text-gray-900 truncate">
                      {cat.label}
                    </span>
                  </div>
                  <span
                    className={`min-w-[26px] h-[26px] flex items-center justify-center rounded-full text-xs font-bold border-2 ${
                      badgeColor === "green"
                        ? "border-green-500 text-green-600 bg-green-50"
                        : "border-red-500 text-red-600 bg-red-50"
                    }`}
                  >
                    {allDone ? total : `${completed}/${total}`}
                  </span>
                </button>

                {isOpen && (
                  <div className={`bg-gray-50 ${!isLast ? "border-b border-gray-200" : ""}`}>
                    {cat.items.length > 0 ? (
                      cat.items.map((item, itemIndex) => {
                        const isDone = completedSet.has(item.id);
                        const isClickable = item.type === "interactive-reading";
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center gap-3 ${
                              isClickable ? "text-gray-800 hover:bg-gray-100 cursor-pointer" : "text-gray-500 cursor-default"
                            } ${itemIndex < cat.items.length - 1 ? "border-b border-gray-100" : ""}`}
                          >
                            {/* Completion checkbox */}
                            <button
                              onClick={(e) => handleToggleComplete(e, item.id)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                isDone
                                  ? "bg-green-500 border-green-500 text-white"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                              aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                            >
                              {isDone && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                            <span className={isDone ? "line-through text-gray-400" : ""}>
                              {item.title}
                            </span>
                            {isClickable && !isDone && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto flex-shrink-0 text-gray-300">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            )}
                          </button>
                        );
                      })
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
    </div>
  );
}
