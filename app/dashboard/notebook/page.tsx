"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { VocabularyWord } from "@/lib/types";
import {
  loadStudentData,
  saveStudentData,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  addSavedWord,
  removeSavedWord,
  type StudentData,
  type JournalEntry,
  type SavedWord,
} from "@/lib/storage";


const tabs = [
  { name: "Journal" as const, color: "#0b89b7" },
  { name: "Word Bank" as const, color: "#1a5479" },
  { name: "Class Notes" as const, color: "#fc4333" },
  { name: "My Work" as const, color: "#ff8c00" },
  { name: "Resources" as const, color: "#daa520" },
] as const;

type TabName = (typeof tabs)[number]["name"];

// ── Spiral binding — matches reference: dark rectangular rings on dark strip ──

function SpiralBinding() {
  const ringCount = 18;
  const ringSpacing = 32;
  const totalHeight = ringCount * ringSpacing;

  return (
    <div
      className="flex-shrink-0 relative z-10"
      style={{ width: 48, minHeight: totalHeight }}
    >
      {Array.from({ length: ringCount }, (_, i) => {
        const top = i * ringSpacing + ringSpacing / 2 - 12;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: 6,
              top,
              width: 36,
              height: 24,
              borderRadius: 2,
              border: "3px solid #1a1a1a",
              background: "linear-gradient(180deg, #4a4a4a 0%, #1e1e1e 40%, #2a2a2a 60%, #3a3a3a 100%)",
              boxShadow:
                "inset 0 2px 1px rgba(255,255,255,0.12), inset 0 -1px 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.2)",
            }}
          />
        );
      })}
    </div>
  );
}

// ── Notebook locked cover — uses note_book.png and finger_stamp.png ──

function NotebookCover({ onUnlock }: { onUnlock: () => void }) {
  const [pressing, setPressing] = useState(false);
  const [glowing, setGlowing] = useState(false);

  const handlePress = () => {
    setPressing(true);
    setGlowing(true);
    setTimeout(() => {
      onUnlock();
    }, 600);
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative" style={{ width: 422, height: 605 }}>
        {/* Notebook cover image */}
        <Image
          src="/images/notebook/note_book.png"
          alt="Notebook cover"
          width={422}
          height={605}
          className="w-full h-full object-contain"
          priority
        />
        {/* Fingerprint stamp button — positioned to match original CSS */}
        <button
          onClick={handlePress}
          className="absolute cursor-pointer transition-all duration-300"
          style={{
            width: 64,
            height: 85,
            right: 42,
            top: "50%",
            marginTop: -43,
            border: "none",
            background: "none",
            padding: 0,
            filter: glowing
              ? "brightness(1.8) drop-shadow(0 0 12px rgba(0,255,100,0.8))"
              : pressing
              ? "brightness(1.3)"
              : "none",
          }}
          aria-label="Unlock notebook with fingerprint"
        >
          <Image
            src="/images/notebook/finger_stamp.png"
            alt="Fingerprint scanner"
            width={64}
            height={85}
            className="w-full h-full object-contain"
          />
        </button>
        {/* "NOTEBOOK" label at bottom */}
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.3em] font-semibold"
          style={{ color: "#6a6a6a" }}
        >
          NOTEBOOK
        </div>
      </div>
    </div>
  );
}

// ── My Work data — maps to real I-LIT unit/lesson structure ──

const MY_WORK_UNITS = [
  {
    unit: "Unit 1",
    items: [
      { title: "Interactive Reading: Bomb Dogs", score: "29/36", hasLink: true },
      { title: "Interactive Reading: Turn It Down!", score: "32/36", hasLink: true },
      { title: "Vocabulary: Lesson 11 — Introduce Vocabulary", score: "18/20", hasLink: true },
      { title: "Word Study Practice", score: "14/15", hasLink: true },
      { title: "Weekly Reading Check 1", score: "4/5", hasLink: true },
      { title: "Weekly Reading Check 2", score: "3/5", hasLink: true },
    ],
  },
  {
    unit: "Unit 2",
    items: [
      { title: "Interactive Reading: Hidden Ads", score: "—", hasLink: false },
      { title: "Interactive Reading: The Power to Move", score: "—", hasLink: false },
      { title: "Vocabulary: Word Slam", score: "15/20", hasLink: true },
      { title: "Writing: Narrative Paragraph", score: "—", hasLink: false },
      { title: "Weekly Reading Check 3", score: "—", hasLink: false },
    ],
  },
  {
    unit: "Unit 3",
    items: [
      { title: "Interactive Reading: Mentors Make a Difference", score: "—", hasLink: false },
      { title: "Study Plan: Pretest", score: "—", hasLink: false },
      { title: "iPractice: Plan a Multimedia Presentation", score: "—", hasLink: false },
      { title: "Unit Benchmark Assessment", score: "—", hasLink: false },
    ],
  },
  {
    unit: "Unit 4",
    items: [
      { title: "Interactive Reading: Having Friends, Making Choices", score: "—", hasLink: false },
      { title: "Vocabulary: Context Clues", score: "—", hasLink: false },
      { title: "Writing: Explanatory Essay", score: "—", hasLink: false },
    ],
  },
  {
    unit: "Unit 5",
    items: [
      { title: "Interactive Reading: Cell Phones: Tools or Troublemakers?", score: "—", hasLink: false },
      { title: "iPractice: Write a Poem", score: "—", hasLink: false },
      { title: "Weekly Reading Check 4", score: "—", hasLink: false },
      { title: "Weekly Reading Check 5", score: "—", hasLink: false },
    ],
  },
];

// ── Resources data — built from real skills taxonomy ──

const RESOURCE_CATEGORIES: {
  label: string;
  children: {
    label: string;
    items: { label: string; links: string[] }[];
  }[];
}[] = [
  {
    label: "Lesson Screens",
    children: [
      {
        label: "Vocabulary",
        items: [
          { label: "Unit 1, Lessons 1-5", links: ["1.1 Introduce Vocabulary", "1.1 Vocabulary Practice", "1.2 Introduce Vocabulary", "1.2 Vocabulary Practice"] },
          { label: "Unit 1, Lessons 6-10", links: ["1.3 Introduce Vocabulary", "1.3 Vocabulary Practice", "1.4 Introduce Vocabulary", "1.4 Vocabulary Practice"] },
          { label: "Unit 2, Lessons 11-15", links: ["2.1 Introduce Vocabulary", "2.1 Vocabulary Practice", "2.2 Introduce Vocabulary", "2.2 Vocabulary Practice"] },
          { label: "Unit 2, Lessons 16-20", links: ["2.3 Introduce Vocabulary", "2.3 Vocabulary Practice", "2.4 Introduce Vocabulary", "2.4 Vocabulary Practice"] },
          { label: "Unit 3, Lessons 21-25", links: ["3.1 Introduce Vocabulary", "3.1 Vocabulary Practice", "3.2 Introduce Vocabulary", "3.2 Vocabulary Practice"] },
        ],
      },
    ],
  },
  {
    label: "Whole Group Instruction",
    children: [
      {
        label: "Reading Strategies",
        items: [
          { label: "Make Inferences", links: ["Whole Group: Make Inferences Lesson", "Whole Group: Make Inferences Practice"] },
          { label: "Main Idea & Details", links: ["Whole Group: Main Idea Lesson", "Whole Group: Main Idea Practice"] },
          { label: "Summarize", links: ["Whole Group: Summarize Lesson", "Whole Group: Summarize Practice"] },
        ],
      },
    ],
  },
  {
    label: "Routine Cards",
    children: [
      {
        label: "Daily Routines",
        items: [
          { label: "Read Aloud Think Aloud", links: ["Routine: Read Aloud Think Aloud"] },
          { label: "Vocabulary Warm-Up", links: ["Routine: Vocabulary Warm-Up"] },
          { label: "Partner Reading", links: ["Routine: Partner Reading"] },
          { label: "Word Study", links: ["Routine: Word Study"] },
        ],
      },
    ],
  },
  {
    label: "Book Club",
    children: [
      {
        label: "Discussion Guides",
        items: [
          { label: "Crash Dive", links: ["Book Club: Crash Dive Discussion Guide"] },
          { label: "Dream of the Dead", links: ["Book Club: Dream of the Dead Discussion Guide"] },
          { label: "Jungle Jenny", links: ["Book Club: Jungle Jenny Discussion Guide"] },
        ],
      },
    ],
  },
  {
    label: "Standards",
    children: [
      {
        label: "Common Core ELA",
        items: [
          { label: "Reading Literature", links: ["RL.8.1 Cite Textual Evidence", "RL.8.2 Determine Theme", "RL.8.4 Word Meaning in Context"] },
          { label: "Reading Informational", links: ["RI.8.1 Cite Textual Evidence", "RI.8.2 Central Idea", "RI.8.4 Word Meaning in Context"] },
          { label: "Language", links: ["L.8.4 Determine Word Meaning", "L.8.5 Figurative Language", "L.8.6 Academic Vocabulary"] },
        ],
      },
    ],
  },
];

// ── Main component ──

export default function NotebookPage() {
  const [isLocked, setIsLocked] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>("Journal");
  const [data, setData] = useState<StudentData | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);

  // Check if user has previously unlocked
  useEffect(() => {
    const unlocked = sessionStorage.getItem("notebook-unlocked");
    if (unlocked === "true") setIsLocked(false);
  }, []);

  // Load persisted data
  useEffect(() => {
    const d = loadStudentData();
    setData(d);
    if (d.journalEntries.length > 0) {
      setSelectedEntryId(d.journalEntries[0].id);
    }
    fetch("/content/vocabulary/vocabulary.json")
      .then((r) => r.json())
      .then(setVocabulary)
      .catch(() => {});
  }, []);

  const handleUnlock = () => {
    sessionStorage.setItem("notebook-unlocked", "true");
    setIsLocked(false);
  };

  if (!data) return null;

  // Show locked cover — dark tiled texture background matching original
  if (isLocked) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{
          backgroundImage: "url(/images/notebook/lading_page_bg.jpg)",
          backgroundRepeat: "repeat",
          backgroundColor: "#1a1a1a",
        }}
      >
        <NotebookCover onUnlock={handleUnlock} />
      </div>
    );
  }

  const activeColor = tabs.find((t) => t.name === activeTab)?.color ?? "#0b89b7";
  const selectedEntry = data.journalEntries.find((e) => e.id === selectedEntryId);

  // Journal handlers
  const handleNewEntry = () => {
    const updated = addJournalEntry({ title: "Untitled", body: "" });
    setData(updated);
    setSelectedEntryId(updated.journalEntries[0].id);
  };

  const handleDeleteEntry = () => {
    if (!selectedEntryId) return;
    const updated = deleteJournalEntry(selectedEntryId);
    setData(updated);
    setSelectedEntryId(updated.journalEntries[0]?.id ?? null);
  };

  const handleUpdateEntry = (field: "title" | "body", value: string) => {
    if (!selectedEntryId) return;
    const updated = updateJournalEntry(selectedEntryId, { [field]: value });
    setData(updated);
  };

  // Word Bank handlers
  const handleAddWord = (vw: VocabularyWord) => {
    const updated = addSavedWord({
      word: vw.word,
      definition: vw.definition,
      exampleSentence: vw.exampleSentence,
      passageId: vw.passageId,
    });
    setData(updated);
  };

  const handleRemoveWord = (word: string) => {
    const updated = removeSavedWord(word);
    setData(updated);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden pr-[50px]">
      <div className="relative flex overflow-visible flex-1 min-h-0">
        {/* Spiral binding — hidden on small screens */}
        <div className="hidden sm:block flex-shrink-0" style={{ background: "#1a1a1a", width: 48 }}>
          <SpiralBinding />
        </div>

        {/* Main notebook body */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            {/* Two-part header: sidebar header (teal) + content toolbar (dark) */}
            <div className="flex">
              {/* Sidebar header — teal, matches active tab color */}
              <div
                className="w-36 sm:w-56 flex-shrink-0 flex items-center gap-2 px-2"
                style={{
                  background: activeColor,
                  boxShadow: "inset 0 2px 1px 0 rgba(207,213,217,0.3), inset 0 0 1px 2px rgba(0,0,0,0.2)",
                  minHeight: 42,
                }}
              >
                <button
                  onClick={() => { setIsLocked(true); sessionStorage.removeItem("notebook-unlocked"); }}
                  className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors flex-shrink-0"
                  title="Close notebook"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <span className="text-white font-bold text-sm tracking-wide flex-1 truncate">
                  {activeTab === "Journal" ? "Notes" : activeTab === "Class Notes" ? "Saved Notes" : activeTab}
                </span>
                {/* Dropdown arrow */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white" className="flex-shrink-0 opacity-70">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </div>

              {/* Content toolbar — dark strip with action buttons */}
              <div
                className="flex-1 flex items-center justify-end px-2 gap-2.5"
                style={{
                  background: "#555350",
                  boxShadow: "0 0 0 0 #000, 0 2px 1px 0 #CFD5D9 inset, 0 0 1px 2px #000 inset",
                  minHeight: 42,
                }}
              >
                {activeTab === "Journal" && (
                  <>
                    <ToolbarButton icon="menu" onClick={() => {}} />
                    <ToolbarButton icon="trash" onClick={handleDeleteEntry} />
                    <ToolbarButton icon="plus" onClick={handleNewEntry} />
                  </>
                )}
                {activeTab === "Class Notes" && (
                  <>
                    <ToolbarButton icon="menu" onClick={() => {}} />
                    <ToolbarButton icon="plus" onClick={() => {}} />
                  </>
                )}
                {activeTab === "Word Bank" && (
                  <ToolbarButton icon="plus" onClick={() => {}} />
                )}
              </div>
            </div>

            {/* Tab content area — plain white like original */}
            <div
              className="flex-1 flex flex-col"
              style={{ backgroundColor: "#fff" }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {activeTab === "Journal" && (
                    <JournalTab
                      entries={data.journalEntries}
                      selectedId={selectedEntryId}
                      selectedEntry={selectedEntry ?? null}
                      onSelect={setSelectedEntryId}
                      onNew={handleNewEntry}
                      onDelete={handleDeleteEntry}
                      onUpdate={handleUpdateEntry}
                    />
                  )}
                  {activeTab === "Word Bank" && (
                    <WordBankTab
                      savedWords={data.savedWords}
                      vocabulary={vocabulary}
                      onAdd={handleAddWord}
                      onRemove={handleRemoveWord}
                    />
                  )}
                  {activeTab === "Class Notes" && <ClassNotesTab />}
                  {activeTab === "My Work" && <MyWorkTab />}
                  {activeTab === "Resources" && <ResourcesTab />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right-side colored tabs — matches original notebook tab style */}
        <div className="absolute flex flex-col gap-0.5" style={{ right: -47, top: 20 }}>
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
                    width: 47,
                    background: tab.color,
                    border: "1px solid #363636",
                    borderLeft: isActive ? "none" : "1px solid #363636",
                    padding: "18px 6px",
                    marginBottom: 2,
                  }}
                >
                  <span
                    className="text-white font-bold text-[10px] leading-tight tracking-wide"
                    style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                  >
                    {tab.name}
                  </span>
                </div>
                {/* Active arrow indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full">
                    <div style={{
                      width: 0, height: 0,
                      borderTop: "11px solid transparent",
                      borderBottom: "11px solid transparent",
                      borderRight: "11px solid #363636",
                    }}>
                      <div style={{
                        position: "absolute",
                        left: 2,
                        top: -11,
                        width: 0, height: 0,
                        borderTop: "11px solid transparent",
                        borderBottom: "11px solid transparent",
                        borderRight: "11px solid #fff",
                      }} />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Toolbar button matching original dark inset style ──

function ToolbarButton({ icon, onClick }: { icon: "menu" | "trash" | "plus"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-[35px] h-[35px] flex items-center justify-center rounded-[5px] cursor-pointer"
      style={{
        backgroundColor: "#555350",
        boxShadow: "0 0 0 0 #000, 0 -2px 1px 0 #CFD5D9 inset, 0 0 1px 2px #000 inset",
      }}
    >
      {icon === "menu" && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      )}
      {icon === "trash" && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      )}
      {icon === "plus" && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )}
    </button>
  );
}

// ── Journal Tab ──

function JournalTab({
  entries,
  selectedId,
  selectedEntry,
  onSelect,
  onNew,
  onDelete,
  onUpdate,
}: {
  entries: JournalEntry[];
  selectedId: string | null;
  selectedEntry: JournalEntry | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: () => void;
  onUpdate: (field: "title" | "body", value: string) => void;
}) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = useCallback(
    (field: "title" | "body", value: string) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onUpdate(field, value), 300);
    },
    [onUpdate]
  );

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left sidebar — entry list with notes_rgt_bg edge */}
      <div
        className="w-36 sm:w-56 flex-shrink-0 flex flex-col overflow-hidden"
        style={{
          background: "#cdd9e2",
          backgroundImage: "url(/images/notebook/notes_rgt_bg.png)",
          backgroundRepeat: "repeat-y",
          backgroundPosition: "right 0",
          paddingRight: 8,
        }}
      >
        <div className="px-3 py-2.5 border-b border-[#1a5479]/30 flex items-center justify-between">
          <select className="text-xs font-semibold text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer">
            <option>All Units</option>
            <option>Unit 1</option>
            <option>Unit 2</option>
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          {entries.map((entry) => {
            const dateStr = new Date(entry.date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
            const isActive = entry.id === selectedId;
            return (
              <button
                key={entry.id}
                onClick={() => onSelect(entry.id)}
                className={`w-full text-left px-3 py-2.5 border-b border-[#b8c5cf] transition-colors ${
                  isActive ? "bg-white/60" : "hover:bg-white/30"
                }`}
              >
                <span className={`text-xs block truncate ${isActive ? "text-[#0b89b7] font-medium" : "text-[#272727]"}`}>
                  {dateStr} {entry.title || "Untitled"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right content — editor with pad_bg texture */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200">
          <span className="text-base font-medium text-gray-500 flex-shrink-0">Title:</span>
          <div className="flex-1 rounded-[5px] border border-gray-300 px-2 py-1" style={{ boxShadow: "0 0 1px 0 #ddd" }}>
            <input
              key={selectedEntry?.id ?? "none"}
              type="text"
              defaultValue={selectedEntry?.title ?? ""}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Untitled"
              className="w-full text-base bg-transparent focus:outline-none placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Text area */}
        <div className="flex-1 relative overflow-auto bg-white">
          <div className="px-6 pt-4 pb-6">
            <textarea
              key={selectedEntry?.id ?? "none"}
              defaultValue={selectedEntry?.body ?? ""}
              onChange={(e) => handleChange("body", e.target.value)}
              placeholder="Start writing..."
              className="w-full min-h-[400px] bg-transparent resize-none text-base text-[#272727] leading-[28px] focus:outline-none placeholder:text-gray-300"
              style={{ lineHeight: "28px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Word Bank Tab ──

function WordBankTab({
  savedWords,
  vocabulary,
  onAdd,
  onRemove,
}: {
  savedWords: SavedWord[];
  vocabulary: VocabularyWord[];
  onAdd: (word: VocabularyWord) => void;
  onRemove: (word: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const savedWordSet = new Set(savedWords.map((w) => w.word));

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">

      <div className="flex-1 overflow-y-auto">
        {showPicker && (
          <div className="border-b border-gray-200 bg-blue-50 px-4 py-3">
            <p className="text-xs text-gray-500 mb-2">Tap a word to add it to your bank:</p>
            <div className="flex flex-wrap gap-1.5">
              {vocabulary
                .filter((vw) => !savedWordSet.has(vw.word))
                .map((vw) => (
                  <button
                    key={vw.word}
                    onClick={() => onAdd(vw)}
                    className="px-2.5 py-1 rounded-full bg-white border border-blue-200 text-xs text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    {vw.word}
                  </button>
                ))}
              {vocabulary.filter((vw) => !savedWordSet.has(vw.word)).length === 0 && (
                <span className="text-xs text-gray-400 italic">All available words added!</span>
              )}
            </div>
          </div>
        )}

        {savedWords.length === 0 ? (
          <div className="flex-1" />
        ) : (
          <div className="divide-y divide-gray-100">
            {savedWords.map((sw) => (
              <div key={sw.word} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-gray-900">{sw.word}</span>
                    <p className="text-xs text-gray-600 mt-0.5">{sw.definition}</p>
                    <p className="text-xs text-gray-400 italic mt-1">&quot;{sw.exampleSentence}&quot;</p>
                  </div>
                  <button
                    onClick={() => onRemove(sw.word)}
                    className="ml-2 p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                    title="Remove word"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Class Notes Tab ──

function ClassNotesTab() {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left sidebar — saved notes list matching reference */}
      <div
        className="w-36 sm:w-56 flex-shrink-0 flex flex-col overflow-hidden"
        style={{
          background: "#cdd9e2",
          backgroundImage: "url(/images/notebook/notes_rgt_bg.png)",
          backgroundRepeat: "repeat-y",
          backgroundPosition: "right 0",
          paddingRight: 8,
        }}
      >
        <div className="flex-1 overflow-y-auto">
          <p className="px-3 py-6 text-xs text-gray-400 italic text-center">No saved notes</p>
        </div>
      </div>

      {/* Right content — editor */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200">
          <span className="text-base font-medium text-gray-500 flex-shrink-0">Title:</span>
          <div className="flex-1 rounded-[5px] border border-gray-300 px-2 py-1" style={{ boxShadow: "0 0 1px 0 #ddd" }}>
            <input
              type="text"
              placeholder="Insert Title Here"
              className="w-full text-base bg-transparent focus:outline-none placeholder:text-gray-300"
            />
          </div>
        </div>
        <div className="flex-1 relative overflow-auto bg-white">
          <div className="px-6 pt-4 pb-6">
            <textarea
              placeholder="Take notes during class..."
              className="w-full min-h-[400px] bg-transparent resize-none text-base text-[#272727] leading-[28px] focus:outline-none placeholder:text-gray-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── My Work Tab ──

function MyWorkTab() {
  const [expandedUnit, setExpandedUnit] = useState<string>("Unit 1");
  const [selectedSection, setSelectedSection] = useState<string>("Lessons");

  // Build display items based on selected section
  const currentUnit = MY_WORK_UNITS.find((u) => u.unit === expandedUnit);
  const displayItems = currentUnit?.items ?? [];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left sidebar — unit tree with sub-sections matching reference */}
      <div
        className="w-36 sm:w-56 flex-shrink-0 flex flex-col overflow-hidden"
        style={{
          background: "#cdd9e2",
          backgroundImage: "url(/images/notebook/notes_rgt_bg.png)",
          backgroundRepeat: "repeat-y",
          backgroundPosition: "right 0",
          paddingRight: 8,
        }}
      >
        <div className="flex-1 overflow-y-auto text-xs">
          {MY_WORK_UNITS.map((u) => {
            const isExpanded = expandedUnit === u.unit;
            return (
              <div key={u.unit}>
                <button
                  onClick={() => setExpandedUnit(u.unit)}
                  className={`w-full text-left px-3 py-2.5 border-b border-[#b8c5cf] flex items-center justify-between transition-colors ${
                    isExpanded ? "font-semibold text-[#272727]" : "text-[#272727] hover:bg-white/30"
                  }`}
                >
                  <span>{u.unit}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                {isExpanded && (
                  <div>
                    {["Lessons", "Benchmark Assessment(s)", "Weekly Reading Check(s)"].map((section) => (
                      <button
                        key={section}
                        onClick={() => setSelectedSection(section)}
                        className={`w-full text-left pl-6 pr-3 py-1.5 border-b border-[#b8c5cf]/50 transition-colors ${
                          selectedSection === section ? "text-[#ff8c00] font-medium bg-white/40" : "text-gray-500 hover:bg-white/20"
                        }`}
                      >
                        {section}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right content — assignments with scores */}
      <div className="flex-1 flex flex-col overflow-auto bg-white">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-base font-bold text-[#272727]">{expandedUnit} {selectedSection}</h3>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {displayItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50">
              <span className="text-sm text-[#262626] flex-1 min-w-0 truncate pr-2">{item.title}</span>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-sm font-bold ${item.score === "—" ? "text-gray-300" : "text-gray-800"}`}>
                  {item.score}
                </span>
                {item.hasLink && item.score !== "—" && (
                  <button className="text-xs text-blue-600 hover:underline whitespace-nowrap">
                    View Feedback
                  </button>
                )}
                {item.hasLink && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                )}
              </div>
            </div>
          ))}
          {displayItems.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400 italic">No items</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Resources Tab ──

function ResourcesTab() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Vocabulary");
  const [selectedLesson, setSelectedLesson] = useState<string>("Unit 1, Lessons 1-5");

  // Find the selected item across all categories
  const selectedItems = RESOURCE_CATEGORIES
    .flatMap((cat) => cat.children)
    .find((child) => child.label === selectedCategory)
    ?.items.find((item) => item.label === selectedLesson);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left sidebar — resource tree */}
      <div
        className="w-36 sm:w-56 flex-shrink-0 flex flex-col overflow-hidden"
        style={{
          background: "#cdd9e2",
          backgroundImage: "url(/images/notebook/notes_rgt_bg.png)",
          backgroundRepeat: "repeat-y",
          backgroundPosition: "right 0",
          paddingRight: 8,
        }}
      >
        <div className="px-3 py-2.5 bg-[#daa520]">
          <span className="text-xs font-bold text-white">Resources</span>
        </div>
        <div className="flex-1 overflow-y-auto text-xs">
          {RESOURCE_CATEGORIES.map((cat) => (
            <div key={cat.label}>
              <div className="px-3 py-2 font-semibold text-[#daa520] border-b border-[#b8c5cf] bg-white/30">
                {cat.label}
              </div>
              {cat.children?.map((child) => (
                <div key={child.label}>
                  <button
                    onClick={() => setSelectedCategory(child.label)}
                    className={`w-full text-left px-4 py-1.5 border-b border-[#b8c5cf] transition-colors ${
                      selectedCategory === child.label ? "text-[#ff8c00] font-medium bg-white/50" : "text-[#343434] hover:bg-white/30"
                    }`}
                  >
                    {child.label}
                  </button>
                  {selectedCategory === child.label &&
                    child.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => setSelectedLesson(item.label)}
                        className={`w-full text-left pl-6 pr-3 py-1.5 border-b border-[#b8c5cf]/50 transition-colors ${
                          selectedLesson === item.label ? "text-[#ff8c00] font-medium bg-white/40" : "text-gray-500 hover:bg-white/20"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right content — resource links */}
      <div className="flex-1 flex flex-col overflow-auto bg-white">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-base font-bold text-[#272727]">{selectedLesson}</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {selectedItems?.links.map((link, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 hover:bg-gray-50"
            >
              <span className="text-sm text-[#262626]">{link}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </div>
          )) ?? (
            <div className="px-4 py-8 text-center text-sm text-gray-400 italic">Select a lesson to view resources</div>
          )}
        </div>
      </div>
    </div>
  );
}
