"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { TranslateLanguage } from "./ReaderToolbar";

type SelectionScope = "word" | "sentence";

interface Props {
  text: string;
  scope: SelectionScope;
  /** The bounding rect of the selected element, relative to the viewport */
  anchorRect: DOMRect;
  onClose: () => void;
  translateLang: TranslateLanguage;
}

export default function TextHelpToolbar({
  text,
  scope,
  anchorRect,
  onClose,
  translateLang,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showTranslation, setShowTranslation] = useState(false);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
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
      if (e.key === "Escape") {
        if (showTranslation) {
          setShowTranslation(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, showTranslation]);

  // Position: centered above the anchor, 50px gap
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
      // Fallback: no-op
    }
    onClose();
  }, [text, onClose]);

  const translate = useCallback(() => {
    setShowTranslation(true);
  }, []);

  // Word-level gets all buttons; sentence-level hides Dictionary
  const showDictionary = scope === "word";

  const buttons: { label: string; onClick: () => void }[] = [
    { label: "Speak", onClick: speak },
  ];

  if (showDictionary) {
    buttons.push({ label: "Dictionary", onClick: onClose });
  }

  buttons.push(
    { label: "Translate", onClick: translate },
    { label: "Notes", onClick: onClose },
    { label: "Copy", onClick: copy }
  );

  return (
    <div
      ref={menuRef}
      role="region"
      aria-label="TextHelp popup"
      className="fixed z-50 flex flex-col items-center"
      style={{
        left,
        top: Math.max(4, top),
      }}
    >
      {/* Main toolbar buttons */}
      <div className="flex items-stretch rounded shadow-lg" style={{ background: "#000" }}>
        {buttons.map((btn, i) => (
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
            bottom: showTranslation ? undefined : -5,
            top: showTranslation ? undefined : undefined,
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid #000",
          }}
        />
      </div>

      {/* Translation panel */}
      {showTranslation && (
        <div className="mt-1 bg-white rounded-lg shadow-xl border border-gray-200 px-4 py-3 min-w-[200px] max-w-[300px]">
          {translateLang ? (
            <>
              <div className="text-xs text-gray-500 mb-1">
                {translateLang}
              </div>
              <p className="text-sm text-gray-400 italic">
                Translation not available in offline mode.
                Connect to a translation service to enable this feature.
              </p>
              <p className="text-xs text-gray-300 mt-2">
                &ldquo;{text}&rdquo;
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              Select a language from the Translate menu in the toolbar first.
            </p>
          )}
        </div>
      )}

      {/* Arrow for non-translation state */}
      {!showTranslation && (
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid #000",
          }}
        />
      )}
    </div>
  );
}
