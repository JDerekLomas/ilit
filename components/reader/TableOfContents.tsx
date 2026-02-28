"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { FlatPage } from "./types";

interface Props {
  flatPages: FlatPage[];
  currentPage: number;
  onNavigate: (pageIndex: number) => void;
  onClose: () => void;
}

interface ChapterEntry {
  title: string;
  startIndex: number;
  endIndex: number;
  startPage: number;
  endPage: number;
}

export default function TableOfContents({
  flatPages,
  currentPage,
  onNavigate,
  onClose,
}: Props) {
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

  // Find which chapter contains current page
  const currentChapterIndex = chapters.findIndex(
    (ch) => currentPage >= ch.startIndex && currentPage <= ch.endIndex
  );

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
            Table of Contents
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

        {/* Chapter list */}
        <div className="flex-1 overflow-y-auto py-2">
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
      </motion.div>
    </>
  );
}
