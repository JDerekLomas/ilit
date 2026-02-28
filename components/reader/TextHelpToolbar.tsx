"use client";

import { useEffect, useRef, useCallback } from "react";

type SelectionScope = "word" | "sentence";

interface Props {
  text: string;
  scope: SelectionScope;
  /** The bounding rect of the selected element, relative to the viewport */
  anchorRect: DOMRect;
  onClose: () => void;
}

export default function TextHelpToolbar({ text, scope, anchorRect, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Use a slight delay so the triggering click doesn't immediately close
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handler);
      document.addEventListener("touchstart", handler);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Position: centered above the anchor, 8px gap
  const menuWidth = menuRef.current?.offsetWidth ?? 200;
  let left = anchorRect.left + anchorRect.width / 2 - menuWidth / 2;
  const top = anchorRect.top - 50;

  // Clamp to viewport
  if (left < 8) left = 8;
  if (left + menuWidth > window.innerWidth - 8) {
    left = window.innerWidth - menuWidth - 8;
  }

  const speak = useCallback(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    synth.speak(utterance);
    onClose();
  }, [text, onClose]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback: no-op for now
    }
    onClose();
  }, [text, onClose]);

  // Word-level gets all buttons; sentence-level hides Dictionary/Picture Dictionary
  const showDictionary = scope === "word";

  const buttons: { label: string; onClick: () => void; show: boolean }[] = [
    { label: "Speak", onClick: speak, show: true },
    { label: "Translate", onClick: onClose, show: true },
    { label: "Notes", onClick: onClose, show: true },
    { label: "Copy", onClick: copy, show: true },
  ];

  if (showDictionary) {
    // Insert Dictionary after Speak
    buttons.splice(1, 0, {
      label: "Dictionary",
      onClick: onClose,
      show: true,
    });
  }

  const visibleButtons = buttons.filter((b) => b.show);

  return (
    <div
      ref={menuRef}
      role="region"
      aria-label="TextHelp popup"
      className="fixed z-50 flex items-stretch rounded shadow-lg"
      style={{
        left,
        top: Math.max(4, top),
        background: "#000",
      }}
    >
      {visibleButtons.map((btn, i) => (
        <div key={btn.label} className="flex items-stretch">
          {i > 0 && (
            <div
              className="self-stretch my-0"
              style={{
                width: 1,
                margin: "0 2px",
                borderRight: "1px dotted #fff",
              }}
            />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              btn.onClick();
            }}
            className="text-white text-sm px-2.5 py-2.5 cursor-pointer select-none hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            {btn.label}
          </button>
        </div>
      ))}
      {/* Arrow pointing down toward the word */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: -5,
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "5px solid #000",
        }}
      />
    </div>
  );
}
