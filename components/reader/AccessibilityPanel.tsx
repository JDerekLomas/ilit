"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Props {
  onClose: () => void;
}

const SHORTCUTS: { key: string; description: string }[] = [
  { key: "TAB", description: "Move focus between paragraphs" },
  { key: "W", description: "From a paragraph, move focus to its first word" },
  { key: "P", description: "From a word, move focus back to the paragraph" },
  { key: "Left / Right Arrow", description: "Navigate between words within a paragraph" },
  { key: "SPACE", description: "Highlight the focused word or paragraph and open TextHelp" },
  { key: "A", description: "Toggle the annotation pen" },
  { key: "ESC", description: "Dismiss highlights and close popups" },
];

export default function AccessibilityPanel({ onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-[600px] max-h-[80vh] overflow-auto bg-white rounded-xl shadow-2xl"
        role="dialog"
        aria-label="Accessibility Instructions"
      >
        {/* Header */}
        <div className="bg-amber-900 px-5 py-3 flex items-center justify-between rounded-t-xl">
          <h2 className="text-amber-100 font-sans font-bold text-lg">
            Accessibility Instructions
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-amber-200/80 hover:text-amber-100"
            aria-label="Close"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          <p className="text-gray-600 text-sm mb-4">
            Use the following keyboard shortcuts to navigate and interact with the book text.
          </p>

          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold text-gray-700 w-1/3">Key</th>
                <th className="text-left py-2 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {SHORTCUTS.map((s) => (
                <tr key={s.key} className="border-b border-gray-100">
                  <td className="py-2.5 pr-4">
                    <kbd className="inline-block px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-800">
                      {s.key}
                    </kbd>
                  </td>
                  <td className="py-2.5 text-gray-600">{s.description}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Page navigation: use the Left/Right arrow keys or the page slider at the bottom of the reader.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
