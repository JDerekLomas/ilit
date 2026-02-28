"use client";

import { useState, useRef, useEffect } from "react";

export type HighlightColor = "cyan" | "magenta" | "green" | "strike" | "clear" | "none";

export const TRANSLATE_LANGUAGES = [
  "Spanish",
  "French",
  "Chinese (Simplified)",
  "Arabic",
  "Vietnamese",
  "Korean",
  "Portuguese",
  "Russian",
  "Tagalog",
  "Haitian Creole",
] as const;

export type TranslateLanguage = (typeof TRANSLATE_LANGUAGES)[number] | null;

interface Props {
  title: string;
  fontSize: "sm" | "md" | "lg";
  onFontSizeChange: () => void;
  isSpeaking: boolean;
  onToggleTTS: () => void;
  onToggleTOC: () => void;
  onExit: () => void;
  activeHighlight: HighlightColor;
  onHighlightChange: (color: HighlightColor) => void;
  screenMaskEnabled: boolean;
  onToggleScreenMask: () => void;
  onCollectHighlights: () => void;
  translateLang: TranslateLanguage;
  onTranslateLangChange: (lang: TranslateLanguage) => void;
  onToggleAccessibility: () => void;
}

const HIGHLIGHT_COLORS: { color: HighlightColor; label: string; bg: string; textLabel?: string }[] = [
  { color: "strike", label: "Strikethrough", bg: "transparent", textLabel: "S" },
  { color: "cyan", label: "Cyan", bg: "#00ffff" },
  { color: "magenta", label: "Magenta", bg: "#ff00ff" },
  { color: "green", label: "Green", bg: "#45eb53" },
  { color: "clear", label: "Remove highlights", bg: "transparent" },
];

export default function ReaderToolbar({
  title,
  fontSize,
  onFontSizeChange,
  isSpeaking,
  onToggleTTS,
  onToggleTOC,
  onExit,
  activeHighlight,
  onHighlightChange,
  screenMaskEnabled,
  onToggleScreenMask,
  onCollectHighlights,
  translateLang,
  onTranslateLangChange,
  onToggleAccessibility,
}: Props) {
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const annotationRef = useRef<HTMLDivElement>(null);
  const translateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (annotationRef.current && !annotationRef.current.contains(e.target as Node)) {
        setShowAnnotation(false);
      }
      if (translateRef.current && !translateRef.current.contains(e.target as Node)) {
        setShowTranslate(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-center justify-between px-2 sm:px-3 py-2 bg-amber-900/90 backdrop-blur-sm z-10 gap-1">
      {/* Left: Back + TOC */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onExit}
          className="px-2 sm:px-3 py-1 bg-amber-800 text-amber-100 text-xs sm:text-sm font-medium rounded-full hover:bg-amber-700 transition-colors"
        >
          Back
        </button>
        <ToolButton onClick={onToggleTOC} title="Table of Contents">
          <TOCIcon />
        </ToolButton>
      </div>

      {/* Center: Title */}
      <h1 className="text-amber-100 font-serif font-semibold text-xs sm:text-sm md:text-base truncate mx-1 sm:mx-4 max-w-[100px] sm:max-w-xs md:max-w-lg">
        {title}
      </h1>

      {/* Right: Tools */}
      <div className="flex items-center gap-0.5 sm:gap-1.5">
        {/* Annotation pen */}
        <div ref={annotationRef} className="relative">
          <ToolButton
            onClick={() => setShowAnnotation(!showAnnotation)}
            title="Annotation Pen"
            active={activeHighlight !== "none" && activeHighlight !== "clear"}
          >
            <PenIcon />
          </ToolButton>
          {showAnnotation && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 min-w-[180px] z-50">
              {HIGHLIGHT_COLORS.map((h) => (
                <button
                  key={h.color}
                  onClick={() => { onHighlightChange(h.color); setShowAnnotation(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                    activeHighlight === h.color ? "font-bold" : ""
                  }`}
                >
                  {h.color === "strike" ? (
                    <span className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm line-through">S</span>
                  ) : h.color === "clear" ? (
                    <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-400">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="4" y1="4" x2="20" y2="20" />
                      </svg>
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-gray-300" style={{ background: h.bg }} />
                  )}
                  <span className="text-gray-700">{h.label}</span>
                </button>
              ))}
              <div className="border-t border-gray-200 mt-1 pt-1">
                <button
                  onClick={() => { onCollectHighlights(); setShowAnnotation(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="w-5 h-5 flex items-center justify-center text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </span>
                  <span className="text-gray-700">Collect highlights</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Translate */}
        <div ref={translateRef} className="relative">
          <ToolButton
            onClick={() => setShowTranslate(!showTranslate)}
            title={translateLang ? `Translate: ${translateLang}` : "Translate"}
            active={translateLang !== null}
          >
            <TranslateIcon />
          </ToolButton>
          {showTranslate && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[180px] z-50 overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Language</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {TRANSLATE_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      onTranslateLangChange(translateLang === lang ? null : lang);
                      setShowTranslate(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                      translateLang === lang ? "font-bold bg-blue-50" : ""
                    }`}
                  >
                    <span className="text-gray-700">{lang}</span>
                    {translateLang === lang && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Screen mask */}
        <ToolButton onClick={onToggleScreenMask} title="Screen Mask" active={screenMaskEnabled}>
          <MaskIcon />
        </ToolButton>

        {/* Accessibility info */}
        <ToolButton onClick={onToggleAccessibility} title="Accessibility Instructions">
          <InfoIcon />
        </ToolButton>

        {/* Font size */}
        <ToolButton onClick={onFontSizeChange} title={`Font size: ${fontSize}`}>
          <FontSizeIcon />
          <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold text-amber-300">
            {fontSize === "sm" ? "S" : fontSize === "md" ? "M" : "L"}
          </span>
        </ToolButton>

        {/* TTS */}
        <ToolButton onClick={onToggleTTS} title={isSpeaking ? "Stop reading" : "Read aloud"} active={isSpeaking}>
          {isSpeaking ? <StopIcon /> : <SpeakerIcon />}
        </ToolButton>
      </div>
    </div>
  );
}

function ToolButton({ onClick, title, active, children }: {
  onClick: () => void; title: string; active?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-colors rounded ${
        active ? "text-amber-300 bg-amber-800/60" : "text-amber-200/80 hover:text-amber-100"
      }`}
      title={title}
    >
      {children}
    </button>
  );
}

function TOCIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M4 6h16M4 12h12M4 18h8" />
    </svg>
  );
}

function FontSizeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <text x="2" y="18" fontSize="16" fontFamily="serif" fontWeight="bold">A</text>
      <text x="14" y="18" fontSize="10" fontFamily="serif">a</text>
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      <path d="M12 1L7 6H2v12h5l5 5V1zm-2 5.83v10.34L7.17 14H4V10h3.17L10 6.83z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function TranslateIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8l6 6" />
      <path d="M4 14l6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2v3" />
      <path d="M22 22l-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}

function MaskIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
