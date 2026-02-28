"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { FlatPage, BookAnnotations, AnnotationColor } from "./types";

interface Props {
  annotations: BookAnnotations;
  flatPages: FlatPage[];
  onClose: () => void;
}

interface CollectedEntry {
  word: string;
  pageNumber: number;
  color: AnnotationColor;
}

const colorLabels: Record<AnnotationColor, string> = {
  cyan: "Cyan",
  magenta: "Magenta",
  green: "Green",
  strike: "Strikethrough",
};

const colorDots: Record<AnnotationColor, string> = {
  cyan: "bg-cyan-400",
  magenta: "bg-fuchsia-400",
  green: "bg-green-400",
  strike: "bg-gray-400",
};

export default function CollectedHighlights({ annotations, flatPages, onClose }: Props) {
  const grouped = useMemo(() => {
    const entries: CollectedEntry[] = [];

    // Build a lookup from pageNumber to page text
    const pageTextMap = new Map<number, string>();
    for (const p of flatPages) {
      pageTextMap.set(p.pageNumber, p.text);
    }

    for (const [pageKey, pageAnns] of Object.entries(annotations)) {
      const pageNumber = parseInt(pageKey, 10);
      const text = pageTextMap.get(pageNumber);
      if (!text) continue;

      const paragraphs = text.split("\n\n");

      for (const [wordKey, color] of Object.entries(pageAnns)) {
        const [paraIdx, tokenIdx] = wordKey.split(":").map(Number);
        const para = paragraphs[paraIdx];
        if (!para) continue;

        // Re-tokenize to find the word
        const tokens = para.match(/\S+|\s+/g) ?? [];
        const word = tokens[tokenIdx];
        if (!word || !word.trim()) continue;

        entries.push({ word: word.trim(), pageNumber, color });
      }
    }

    // Group by color
    const groups = new Map<AnnotationColor, CollectedEntry[]>();
    for (const entry of entries) {
      const list = groups.get(entry.color) ?? [];
      list.push(entry);
      groups.set(entry.color, list);
    }
    return groups;
  }, [annotations, flatPages]);

  const hasAnnotations = grouped.size > 0;

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

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:max-h-[80vh] bg-white rounded-xl shadow-2xl z-40 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-amber-900 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <h2 className="text-amber-100 font-serif font-bold text-lg">
            Collected Highlights
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {!hasAnnotations ? (
            <p className="text-gray-500 text-center py-8">
              No highlights yet. Use the annotation pen to highlight words.
            </p>
          ) : (
            <div className="space-y-6">
              {(["cyan", "magenta", "green", "strike"] as AnnotationColor[]).map(
                (color) => {
                  const items = grouped.get(color);
                  if (!items || items.length === 0) return null;
                  return (
                    <div key={color}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-3 h-3 rounded-full ${colorDots[color]}`} />
                        <h3 className="font-sans font-semibold text-sm text-gray-700">
                          {colorLabels[color]}
                        </h3>
                        <span className="text-xs text-gray-400">
                          ({items.length})
                        </span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 pl-1">
                        {items.map((item, i) => (
                          <li
                            key={i}
                            className={`text-sm text-gray-800 ${
                              color === "strike" ? "line-through" : ""
                            }`}
                          >
                            {item.word}
                            <span className="text-xs text-gray-400 ml-2">
                              p.{item.pageNumber}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 bg-amber-800 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </>
  );
}
