"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
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
  { name: "Resources" as const, color: "#d42a2a" },
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
      style={{ width: 44, minHeight: totalHeight }}
    >
      {Array.from({ length: ringCount }, (_, i) => {
        const top = i * ringSpacing + ringSpacing / 2 - 10;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: 8,
              top,
              width: 28,
              height: 20,
              borderRadius: 3,
              border: "2.5px solid #3a3a3a",
              background: "linear-gradient(135deg, #555 0%, #2a2a2a 50%, #444 100%)",
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.4)",
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

// ── My Work data ──

const MY_WORK_UNITS = [
  {
    unit: "Unit 1",
    items: [
      { title: "Interactive Reading: Bomb Dogs", score: "29/36", hasLink: true },
      { title: "Vocabulary: Week 1", score: "18/20", hasLink: true },
    ],
  },
  {
    unit: "Unit 2",
    items: [
      { title: "Interactive Reading: Turn It Down!", score: "32/36", hasLink: true },
      { title: "Interactive Reading: Hidden Ads", score: "—", hasLink: false },
      { title: "Vocabulary: Week 2", score: "15/20", hasLink: true },
    ],
  },
  {
    unit: "Unit 3",
    items: [
      { title: "Weekly Reading Check 1", score: "—", hasLink: false },
      { title: "Benchmark Assessment", score: "—", hasLink: false },
    ],
  },
];

// ── Resources data ──

const RESOURCE_CATEGORIES = [
  {
    label: "Lesson Screens",
    children: [
      {
        label: "Vocabulary",
        items: [
          { label: "Unit 1, Lessons 1-5", links: ["1.1 Vocabulary 1", "1.1 Vocabulary 2", "1.2 Vocabulary 1", "1.2 Vocabulary 2"] },
          { label: "Unit 2, Lessons 6-10", links: ["2.1 Vocabulary 1", "2.1 Vocabulary 2", "2.2 Vocabulary 1", "2.2 Vocabulary 2"] },
        ],
      },
    ],
  },
  { label: "Whole Group Instruction", children: [] },
  { label: "Routine Cards", children: [] },
  { label: "Book Club", children: [] },
  { label: "Standards", children: [] },
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
    <div className="max-w-4xl mx-auto px-2 sm:px-4 pt-4 sm:pt-6 pb-8">
      <div className="relative flex overflow-visible">
        {/* Spiral binding — hidden on small screens */}
        <div className="hidden sm:block" style={{ background: "#2a2a2a" }}>
          <SpiralBinding />
        </div>

        {/* Main notebook body */}
        <div className="flex-1 flex flex-col min-h-[500px] sm:min-h-[600px] relative">
          <div
            className="flex-1 flex flex-col rounded-md sm:rounded-r-md sm:rounded-l-none overflow-hidden"
            style={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            {/* Colored header strip matching active tab */}
            <div
              className="flex items-center justify-between px-4"
              style={{
                background: activeColor,
                boxShadow: `inset 0 2px 1px 0 rgba(207,213,217,0.3), inset 0 0 1px 2px rgba(0,0,0,0.2)`,
                minHeight: 42,
              }}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIsLocked(true); sessionStorage.removeItem("notebook-unlocked"); }}
                  className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
                  title="Close notebook"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <span className="text-white font-bold text-sm tracking-wide">
                  {activeTab === "Journal" ? "Notes" : activeTab}
                </span>
              </div>
              {/* Toolbar icons */}
              <div className="flex items-center gap-1">
                {activeTab === "Journal" && (
                  <>
                    <ToolbarButton icon="menu" onClick={() => {}} />
                    <ToolbarButton icon="trash" onClick={handleDeleteEntry} />
                    <ToolbarButton icon="plus" onClick={handleNewEntry} />
                  </>
                )}
              </div>
            </div>

            {/* Tab content area — uses pad_bg texture */}
            <div
              className="flex-1 flex flex-col"
              style={{
                backgroundImage: "url(/images/notebook/pad_bg.png)",
                backgroundRepeat: "repeat",
                backgroundColor: "#fff",
              }}
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

        {/* Text area — pad_bg repeating ruled lines */}
        <div
          className="flex-1 relative overflow-auto"
          style={{
            backgroundImage: "url(/images/notebook/pad_bg.png)",
            backgroundRepeat: "repeat",
          }}
        >
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
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200">
        <span className="text-base font-semibold text-gray-500">My Words</span>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1a5479] text-white text-xs font-medium hover:bg-[#0f3a54] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Word
        </button>
      </div>

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
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3 opacity-40">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <p className="text-sm italic">No words saved yet</p>
            <p className="text-xs mt-1">Tap &quot;Add Word&quot; to start building your word bank</p>
          </div>
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
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200">
        <span className="text-base font-medium text-gray-500 flex-shrink-0">Title:</span>
        <div className="flex-1 rounded-[5px] border border-gray-300 px-2 py-1" style={{ boxShadow: "0 0 1px 0 #ddd" }}>
          <input
            type="text"
            placeholder="Untitled"
            className="w-full text-base bg-transparent focus:outline-none placeholder:text-gray-300"
          />
        </div>
      </div>
      <div
        className="flex-1 relative overflow-auto"
        style={{
          backgroundImage: "url(/images/notebook/pad_bg.png)",
          backgroundRepeat: "repeat",
        }}
      >
        <div className="px-6 pt-4 pb-6">
          <textarea
            placeholder="Take notes during class..."
            className="w-full min-h-[400px] bg-transparent resize-none text-base text-[#272727] leading-[28px] focus:outline-none placeholder:text-gray-300"
          />
        </div>
      </div>
    </div>
  );
}

// ── My Work Tab ──

function MyWorkTab() {
  const [expandedUnit, setExpandedUnit] = useState<string>("Unit 1");

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left sidebar — unit list with sidebar edge texture */}
      <div
        className="w-36 sm:w-48 flex-shrink-0 flex flex-col overflow-hidden"
        style={{
          background: "#cdd9e2",
          backgroundImage: "url(/images/notebook/notes_rgt_bg.png)",
          backgroundRepeat: "repeat-y",
          backgroundPosition: "right 0",
          paddingRight: 8,
        }}
      >
        <div className="px-3 py-2.5 border-b border-[#1a5479]/30">
          <span className="text-xs font-semibold text-gray-600">Units</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {MY_WORK_UNITS.map((u) => (
            <button
              key={u.unit}
              onClick={() => setExpandedUnit(u.unit)}
              className={`w-full text-left px-3 py-2.5 border-b border-[#b8c5cf] text-sm transition-colors ${
                expandedUnit === u.unit ? "bg-white/60 font-semibold text-[#ff8c00]" : "text-[#272727] hover:bg-white/30"
              }`}
            >
              {u.unit}
              <span className="text-gray-400 ml-1 text-xs">({u.items.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right content — assignments */}
      <div className="flex-1 flex flex-col overflow-auto bg-white">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-base font-bold text-[#272727]">{expandedUnit}</h3>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {MY_WORK_UNITS.find((u) => u.unit === expandedUnit)?.items.map((item, i) => (
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
              </div>
            </div>
          )) ?? (
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

  const vocabCategory = RESOURCE_CATEGORIES[0]?.children?.[0];
  const selectedItems = vocabCategory?.items.find((i) => i.label === selectedLesson);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left sidebar — resource tree */}
      <div
        className="w-44 sm:w-52 flex-shrink-0 flex flex-col overflow-hidden"
        style={{
          background: "#cdd9e2",
          backgroundImage: "url(/images/notebook/notes_rgt_bg.png)",
          backgroundRepeat: "repeat-y",
          backgroundPosition: "right 0",
          paddingRight: 8,
        }}
      >
        <div className="px-3 py-2.5 bg-[#d42a2a]">
          <span className="text-xs font-bold text-white">Resources</span>
        </div>
        <div className="flex-1 overflow-y-auto text-xs">
          {RESOURCE_CATEGORIES.map((cat) => (
            <div key={cat.label}>
              <div className="px-3 py-2 font-semibold text-[#d42a2a] border-b border-[#b8c5cf] bg-white/30">
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
