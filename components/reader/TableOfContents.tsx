"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { FlatPage } from "./types";

export interface BookNote {
  id: string;
  pageNumber: number;
  text: string;
  createdAt: string;
}

interface Props {
  flatPages: FlatPage[];
  currentPage: number;
  onNavigate: (pageIndex: number) => void;
  onClose: () => void;
  bookNotes: BookNote[];
  onAddNote: (pageNumber: number, text: string) => void;
  onDeleteNote: (noteId: string) => void;
}

interface ChapterEntry {
  title: string;
  startIndex: number;
  endIndex: number;
  startPage: number;
  endPage: number;
}

type Tab = "toc" | "notes";

export default function TableOfContents({
  flatPages,
  currentPage,
  onNavigate,
  onClose,
  bookNotes,
  onAddNote,
  onDeleteNote,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("toc");

  const chapters = useMemo<ChapterEntry[]>(() => {
    const result: ChapterEntry[] = [];
    for (let i = 0; i < flatPages.length; i++) {
      if (flatPages[i].isFirstInChapter) {
        if (result.length > 0) {
          const prev = result[result.length - 1];
          prev.endIndex = i - 1;
          prev.endPage = flatPages[i - 1].pageNumber;
        }
        result.push({
          title: flatPages[i].chapterTitle,
          startIndex: i,
          endIndex: i,
          startPage: flatPages[i].pageNumber,
          endPage: flatPages[i].pageNumber,
        });
      }
    }
    if (result.length > 0) {
      const last = result[result.length - 1];
      last.endIndex = flatPages.length - 1;
      last.endPage = flatPages[flatPages.length - 1].pageNumber;
    }
    return result;
  }, [flatPages]);

  const currentChapterIndex = chapters.findIndex(
    (ch) => currentPage >= ch.startIndex && currentPage <= ch.endIndex
  );

  // Get current page number for adding notes
  const currentPageNumber = flatPages[currentPage]?.pageNumber ?? 1;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-30"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-amber-50 shadow-2xl z-40 flex flex-col"
      >
        {/* Header */}
        <div className="bg-amber-900 px-4 py-3 flex items-center justify-between">
          <h2 className="text-amber-100 font-serif font-bold text-lg">
            {activeTab === "toc" ? "Table of Contents" : "Book Notes"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-amber-200/80 hover:text-amber-100"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-4 pt-3 pb-2">
          <div className="inline-flex rounded-md border border-amber-800 overflow-hidden">
            <button
              onClick={() => setActiveTab("toc")}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "toc"
                  ? "bg-amber-800 text-white"
                  : "bg-transparent text-amber-800 hover:bg-amber-100"
              }`}
            >
              Contents
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "notes"
                  ? "bg-amber-800 text-white"
                  : "bg-transparent text-amber-800 hover:bg-amber-100"
              }`}
            >
              Book Notes
              {bookNotes.length > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({bookNotes.length})</span>
              )}
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "toc" ? (
            <TOCList
              chapters={chapters}
              currentChapterIndex={currentChapterIndex}
              onNavigate={onNavigate}
            />
          ) : (
            <NotesTab
              notes={bookNotes}
              currentPageNumber={currentPageNumber}
              onAddNote={onAddNote}
              onDeleteNote={onDeleteNote}
              onNavigateToNote={(pageNumber) => {
                // Find the flat page index for this page number
                const idx = flatPages.findIndex((p) => p.pageNumber === pageNumber);
                if (idx >= 0) onNavigate(idx);
              }}
            />
          )}
        </div>
      </motion.div>
    </>
  );
}

function TOCList({
  chapters,
  currentChapterIndex,
  onNavigate,
}: {
  chapters: ChapterEntry[];
  currentChapterIndex: number;
  onNavigate: (index: number) => void;
}) {
  return (
    <div className="py-1">
      {chapters.map((chapter, i) => {
        const isCurrent = i === currentChapterIndex;
        return (
          <button
            key={i}
            onClick={() => onNavigate(chapter.startIndex)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-amber-100 ${
              isCurrent ? "bg-amber-200/60" : ""
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                isCurrent
                  ? "bg-amber-800 text-amber-100"
                  : "bg-amber-200 text-amber-800"
              }`}
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="font-serif font-semibold text-gray-800 text-sm truncate">
                {chapter.title}
              </div>
              <div className="text-xs text-gray-500">
                Pages {chapter.startPage}–{chapter.endPage}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function NotesTab({
  notes,
  currentPageNumber,
  onAddNote,
  onDeleteNote,
  onNavigateToNote,
}: {
  notes: BookNote[];
  currentPageNumber: number;
  onAddNote: (pageNumber: number, text: string) => void;
  onDeleteNote: (noteId: string) => void;
  onNavigateToNote: (pageNumber: number) => void;
}) {
  const [newNoteText, setNewNoteText] = useState("");

  const handleSubmit = () => {
    const text = newNoteText.trim();
    if (!text) return;
    onAddNote(currentPageNumber, text);
    setNewNoteText("");
  };

  // Sort notes by page number
  const sortedNotes = [...notes].sort((a, b) => a.pageNumber - b.pageNumber);

  return (
    <div className="flex flex-col h-full">
      {/* Add note form */}
      <div className="px-4 py-3 border-b border-amber-200/60">
        <label className="text-xs text-gray-500 mb-1 block">
          Add note for page {currentPageNumber}
        </label>
        <div className="flex gap-2">
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Type a note..."
            className="flex-1 text-sm border border-amber-300 rounded-md px-2 py-1.5 resize-none bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!newNoteText.trim()}
            className="self-end px-3 py-1.5 bg-amber-800 text-white text-sm rounded-md hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto">
        {sortedNotes.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            No notes yet. Add a note above.
          </p>
        ) : (
          <ol className="py-2">
            {sortedNotes.map((note, i) => (
              <li
                key={note.id}
                className="px-4 py-2.5 border-b border-amber-100 hover:bg-amber-100/50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => onNavigateToNote(note.pageNumber)}
                    className="flex-1 text-left"
                  >
                    <span className="text-xs text-amber-700 font-medium">
                      {i + 1}. Page {note.pageNumber}
                    </span>
                    <p className="text-sm text-gray-700 mt-0.5">{note.text}</p>
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 flex-shrink-0"
                    title="Delete note"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
