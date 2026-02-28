"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

// ── Spiral binding ──

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
          return (
            <g key={i}>
              <ellipse cx={24} cy={cy + 1} rx={ringWidth / 2} ry={ringHeight / 2} fill="none" stroke="#1a1a1a" strokeWidth={3.5} opacity={0.3} />
              <ellipse cx={24} cy={cy} rx={ringWidth / 2} ry={ringHeight / 2} fill="none" stroke="url(#ringGradient)" strokeWidth={3} />
              <ellipse cx={24} cy={cy - 1} rx={ringWidth / 2 - 1.5} ry={ringHeight / 2 - 1.5} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
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
  const [activeTab, setActiveTab] = useState<TabName>("Journal");
  const [data, setData] = useState<StudentData | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);

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

  const activeColor = tabs.find((t) => t.name === activeTab)?.color ?? "#0b89b7";

  if (!data) return null;

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
    <div className="max-w-3xl mx-auto px-2 sm:px-4 pt-4 sm:pt-6 pb-8">
      <div
        className="relative flex rounded-lg overflow-visible"
        style={{ background: "#5a5957" }}
      >
        {/* Spiral binding — hidden on small screens */}
        <div className="hidden sm:block">
          <SpiralBinding />
        </div>

        {/* Main notebook body */}
        <div className="flex-1 flex flex-col min-h-[400px] sm:min-h-[576px] relative">
          <div
            className="flex-1 flex flex-col rounded-md sm:rounded-r-md sm:rounded-l-none overflow-hidden"
            style={{
              background: "#fff",
              boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.12), inset -1px -1px 3px rgba(0,0,0,0.05)",
            }}
          >
            {/* Colored header strip */}
            <div className="h-1.5 flex-shrink-0" style={{ background: activeColor }} />

            {/* Tab content */}
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
            {activeTab === "Class Notes" && (
              <ClassNotesTab />
            )}
            {activeTab === "My Work" && (
              <MyWorkTab />
            )}
            {activeTab === "Resources" && (
              <ResourcesTab />
            )}
          </div>
        </div>

        {/* Right-side colored tabs */}
        <div className="absolute flex flex-col gap-0.5" style={{ right: -32, top: 16 }}>
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
                    width: isActive ? 36 : 32,
                    background: tab.color,
                    borderRadius: "0 6px 6px 0",
                    border: "1px solid rgba(0,0,0,0.25)",
                    borderLeft: "none",
                    boxShadow: isActive ? "2px 1px 4px rgba(0,0,0,0.3)" : "1px 1px 2px rgba(0,0,0,0.2)",
                    padding: "10px 3px",
                    marginLeft: isActive ? -4 : 0,
                  }}
                >
                  <span
                    className="text-white font-bold text-[9px] sm:text-[10px] leading-tight tracking-wide"
                    style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                  >
                    {tab.name}
                  </span>
                </div>
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
      {/* Left sidebar — entry list */}
      <div className="w-36 sm:w-44 flex-shrink-0 bg-gray-100 border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="px-2 py-2 border-b border-gray-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Notes</span>
          <button
            onClick={onNew}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
            title="New entry"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {entries.map((entry) => {
            const dateStr = new Date(entry.date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
            const isActive = entry.id === selectedId;
            return (
              <button
                key={entry.id}
                onClick={() => onSelect(entry.id)}
                className={`w-full text-left px-3 py-2 border-b border-gray-200 transition-colors ${
                  isActive ? "bg-white" : "hover:bg-gray-50"
                }`}
              >
                <span className="text-[10px] text-gray-400 block">{dateStr}</span>
                <span className={`text-xs leading-tight block truncate ${isActive ? "text-blue-600 font-medium" : "text-gray-600"}`}>
                  {entry.title || "Untitled"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right content — editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
          <span className="text-sm font-semibold text-gray-500 flex-shrink-0">Title:</span>
          <input
            key={selectedEntry?.id ?? "none"}
            type="text"
            defaultValue={selectedEntry?.title ?? ""}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Untitled"
            className="flex-1 text-sm font-medium border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-gray-500 placeholder:text-gray-300"
          />
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Delete"
            title="Delete entry"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
          <button
            onClick={onNew}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Add new"
            title="New entry"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Text area */}
        <div className="flex-1 relative overflow-auto">
          <div className="px-6 pt-4 pb-6">
            <textarea
              key={selectedEntry?.id ?? "none"}
              defaultValue={selectedEntry?.body ?? ""}
              onChange={(e) => handleChange("body", e.target.value)}
              placeholder="Start writing..."
              className="w-full min-h-[350px] bg-transparent resize-none text-sm text-gray-700 focus:outline-none placeholder:text-gray-300"
              style={{
                backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #d6cfc4 28px)",
                lineHeight: "28px",
              }}
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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <span className="text-sm font-semibold text-gray-500">My Words</span>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Word
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Word picker dropdown */}
        {showPicker && (
          <div className="border-b border-gray-200 bg-blue-50 px-4 py-3">
            <p className="text-xs text-gray-500 mb-2">Tap a word to add it to your bank:</p>
            <div className="flex flex-wrap gap-1.5">
              {vocabulary
                .filter((vw) => !savedWordSet.has(vw.word))
                .map((vw) => (
                  <button
                    key={vw.word}
                    onClick={() => { onAdd(vw); }}
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

        {/* Saved words list */}
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
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
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
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
        <span className="text-sm font-semibold text-gray-500 flex-shrink-0">Title:</span>
        <input
          type="text"
          placeholder="Untitled"
          className="flex-1 text-sm font-medium border-b border-gray-300 bg-transparent py-1 focus:outline-none focus:border-gray-500 placeholder:text-gray-300"
        />
      </div>
      <div className="flex-1 relative overflow-auto">
        <div className="px-6 pt-4 pb-6">
          <textarea
            placeholder="Take notes during class..."
            className="w-full min-h-[350px] bg-transparent resize-none text-sm text-gray-700 focus:outline-none placeholder:text-gray-300"
            style={{
              backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #d6cfc4 28px)",
              lineHeight: "28px",
            }}
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
      {/* Left sidebar — unit list */}
      <div className="w-36 sm:w-44 flex-shrink-0 bg-gray-100 border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <span className="text-xs font-semibold text-gray-500">Units</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {MY_WORK_UNITS.map((u) => (
            <button
              key={u.unit}
              onClick={() => setExpandedUnit(u.unit)}
              className={`w-full text-left px-3 py-2.5 border-b border-gray-200 text-xs transition-colors ${
                expandedUnit === u.unit ? "bg-white font-semibold text-orange-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {u.unit}
              <span className="text-gray-400 ml-1">({u.items.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right content — assignments in selected unit */}
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <h3 className="text-sm font-bold text-gray-800">{expandedUnit}</h3>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {MY_WORK_UNITS.find((u) => u.unit === expandedUnit)?.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <span className="text-sm text-gray-700 flex-1 min-w-0 truncate pr-2">{item.title}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
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

  // Find the currently selected vocabulary items
  const vocabCategory = RESOURCE_CATEGORIES[0]?.children?.[0];
  const selectedItems = vocabCategory?.items.find((i) => i.label === selectedLesson);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left sidebar — resource tree */}
      <div className="w-40 sm:w-48 flex-shrink-0 bg-gray-100 border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200 bg-orange-500">
          <span className="text-xs font-bold text-white">Resources</span>
        </div>
        <div className="flex-1 overflow-y-auto text-xs">
          {RESOURCE_CATEGORIES.map((cat) => (
            <div key={cat.label}>
              <div className="px-3 py-2 font-semibold text-orange-600 border-b border-gray-200 bg-gray-50">
                {cat.label}
              </div>
              {cat.children?.map((child) => (
                <div key={child.label}>
                  <button
                    onClick={() => setSelectedCategory(child.label)}
                    className={`w-full text-left px-4 py-1.5 border-b border-gray-200 transition-colors ${
                      selectedCategory === child.label ? "text-orange-600 font-medium bg-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {child.label}
                  </button>
                  {selectedCategory === child.label &&
                    child.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => setSelectedLesson(item.label)}
                        className={`w-full text-left pl-6 pr-3 py-1.5 border-b border-gray-100 transition-colors ${
                          selectedLesson === item.label ? "text-orange-600 font-medium bg-orange-50" : "text-gray-500 hover:bg-gray-50"
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
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <h3 className="text-sm font-bold text-gray-800">{selectedLesson}</h3>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {selectedItems?.links.map((link, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white hover:bg-gray-50"
            >
              <span className="text-sm text-gray-700">{link}</span>
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
