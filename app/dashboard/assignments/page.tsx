"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

// Map category names to types
const TYPE_MAP: Record<string, AssignmentItem["type"]> = {
  "INTERACTIVE READING": "interactive-reading",
  "STUDY PLAN": "vocabulary",
  "VOCABULARY, WORD STUDY, AND READING COMPREHENSION": "vocabulary",
  "iPRACTICE": "ipractice",
  "WRITING": "writing",
  "MONITOR PROGRESS": "monitor",
  "INFORMATION": "info",
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
  "Vocabulary, Word Study, and Reading Comprehension": [
    { id: "long-vowels", title: "Long Vowels CVCe", type: "vocabulary" },
    { id: "word-slam", title: "Word Slam", type: "vocabulary" },
    { id: "word-study-practice", title: "Word Study Practice", type: "vocabulary" },
    { id: "word-study-readers-1", title: "Word Study Readers: Unit 1", type: "vocabulary" },
    { id: "reading-comp-1", title: "Reading Comprehension: Main Idea", type: "vocabulary" },
  ],
  "iPractice": [
    { id: "multimedia", title: "Plan a Multimedia Presentation", type: "ipractice" },
    { id: "poem", title: "Write a Poem", type: "ipractice" },
    { id: "drama", title: "Elements of Drama", type: "ipractice" },
    { id: "figurative-lang", title: "Figurative Language", type: "ipractice" },
    { id: "text-structure", title: "Text Structure", type: "ipractice" },
    { id: "point-of-view", title: "Point of View", type: "ipractice" },
    { id: "summarize-practice", title: "Summarize", type: "ipractice" },
    { id: "make-inferences", title: "Make Inferences", type: "ipractice" },
  ],
  "Monitor Progress": [
    { id: "reading-check-7", title: "Reading Check 7", type: "monitor" },
    { id: "grade-a-mid", title: "GRADE Level A — Middle of the Year", type: "monitor" },
  ],
  "Information": [
    { id: "lo-u3w1", title: "Learning Objectives, Unit 3, Week 1", type: "info" },
    { id: "lo-u5w1", title: "Learning Objectives, Unit 5, Week 1", type: "info" },
  ],
};

const categories: AssignmentCategory[] = assignmentCategoriesRaw.map((cat) => ({
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

  const [toast, setToast] = useState<string | null>(null);

  const handleItemClick = (item: AssignmentItem) => {
    if (item.type === "interactive-reading") {
      router.push(`/interactive/${item.id}`);
    } else {
      setToast(item.title);
      setTimeout(() => setToast(null), 2000);
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
    <motion.div
      className="relative min-h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
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
                    <motion.svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="flex-shrink-0 text-gray-400"
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </motion.svg>
                    <span className="text-sm font-bold text-gray-900 truncate">
                      {cat.label}
                    </span>
                  </div>
                  <span
                    className={`min-w-[30px] h-[30px] flex items-center justify-center rounded-full text-xs font-bold text-white ${
                      badgeColor === "green"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {total}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`overflow-hidden bg-gray-50 ${!isLast ? "border-b border-gray-200" : ""}`}
                    >
                      {cat.items.length > 0 ? (
                        cat.items.map((item, itemIndex) => {
                          const isDone = completedSet.has(item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleItemClick(item)}
                              className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center gap-3 text-gray-800 hover:bg-gray-100 cursor-pointer ${
                                itemIndex < cat.items.length - 1 ? "border-b border-gray-100" : ""
                              }`}
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
                              {!isDone && (
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast for non-IR items */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-black/80 text-white text-sm font-medium shadow-lg backdrop-blur-sm"
          >
            Coming soon
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
