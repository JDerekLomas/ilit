"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import type { VocabularyWord } from "@/lib/types";
import { addSavedWord, loadStudentData } from "@/lib/storage";

interface Props {
  word: VocabularyWord;
  anchorRect: DOMRect;
  onClose: () => void;
  passageId: string;
}

export default function VocabPopup({
  word,
  anchorRect,
  onClose,
  passageId,
}: Props) {
  const popupRef = useRef<HTMLDivElement>(null);
  const alreadySaved = loadStudentData().savedWords.some(
    (w) => w.word === word.word
  );

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handlePronounce = useCallback(() => {
    if (typeof window === "undefined") return;
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.rate = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [word.word]);

  const handleAddToWordBank = useCallback(() => {
    addSavedWord({
      word: word.word,
      definition: word.definition,
      exampleSentence: word.exampleSentence,
      passageId,
    });
    onClose();
  }, [word, passageId, onClose]);

  // Position the popup above the word, centered horizontally
  const popupStyle: React.CSSProperties = {
    position: "fixed",
    left: Math.max(
      16,
      Math.min(
        anchorRect.left + anchorRect.width / 2 - 160,
        window.innerWidth - 336
      )
    ),
    bottom: window.innerHeight - anchorRect.top + 8,
    zIndex: 9999,
  };

  // If not enough room above, show below
  if (anchorRect.top < 280) {
    popupStyle.bottom = undefined;
    popupStyle.top = anchorRect.bottom + 8;
  }

  // Highlight the word in the example sentence
  const renderExample = () => {
    const text = word.exampleSentence;
    const regex = new RegExp(`(${word.word})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <strong key={i} className="text-teal-700 italic">
          {part}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <motion.div
      ref={popupRef}
      style={popupStyle}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="w-[320px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-teal-600 px-4 py-3 flex items-center justify-between">
        <h3 className="text-white text-lg font-bold">{word.word}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePronounce}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            title="Pronounce"
          >
            <SpeakerIcon />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Definition */}
        <p className="text-sm text-gray-700 leading-relaxed">
          {word.definition}
        </p>

        {/* Example sentence */}
        <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
          {renderExample()}
        </div>

        {/* Word parts breakdown */}
        {word.wordParts && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-teal-50 border border-teal-200 rounded text-teal-700 font-medium">
              {word.wordParts.base}
            </span>
            {word.wordParts.affix && (
              <>
                <span>+</span>
                <span className="px-2 py-1 bg-amber-50 border border-amber-200 rounded text-amber-700 font-medium">
                  {word.wordParts.affix}
                </span>
                <span>=</span>
                <span className="px-2 py-1 bg-green-50 border border-green-200 rounded text-green-700 font-bold">
                  {word.wordParts.result}
                </span>
              </>
            )}
            {word.wordParts.affixType && (
              <span className="text-gray-400 ml-1">
                ({word.wordParts.affixType})
              </span>
            )}
          </div>
        )}

        {/* Add to Word Bank button */}
        {alreadySaved ? (
          <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Saved to Word Bank
          </div>
        ) : (
          <button
            onClick={handleAddToWordBank}
            className="w-full py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            + Add to Word Bank
          </button>
        )}
      </div>
    </motion.div>
  );
}

function SpeakerIcon() {
  return (
    <svg
      width="14"
      height="14"
      fill="white"
      viewBox="0 0 16 16"
    >
      <path d="M8 2L4 6H1v4h3l4 4V2z" />
      <path
        d="M10.5 4.5a4.5 4.5 0 010 7"
        stroke="white"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
