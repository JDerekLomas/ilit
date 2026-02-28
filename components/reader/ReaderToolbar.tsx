"use client";

import { useState, useRef, useEffect } from "react";

export type HighlightColor = "cyan" | "magenta" | "green" | "none";

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
}

const HIGHLIGHT_COLORS: { color: HighlightColor; label: string; bg: string }[] = [
  { color: "cyan", label: "Cyan", bg: "#00e5ff" },
  { color: "magenta", label: "Magenta", bg: "#ff4081" },
  { color: "green", label: "Green", bg: "#69f0ae" },
  { color: "none", label: "Remove highlights", bg: "transparent" },
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
}: Props) {
  const [showAnnotation, setShowAnnotation] = useState(false);
  const annotationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (annotationRef.current && !annotationRef.current.contains(e.target as Node)) {
        setShowAnnotation(false);
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
            active={activeHighlight !== "none"}
          >
            <PenIcon />
          </ToolButton>
          {showAnnotation && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 min-w-[160px] z-50">
              {HIGHLIGHT_COLORS.map((h) => (
                <button
                  key={h.color}
                  onClick={() => { onHighlightChange(h.color); setShowAnnotation(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                    activeHighlight === h.color ? "font-bold" : ""
                  }`}
                >
                  {h.color !== "none" ? (
                    <span className="w-4 h-4 rounded-full border border-gray-300" style={{ background: h.bg }} />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-gray-400">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="4" y1="4" x2="20" y2="20" />
                      </svg>
                    </span>
                  )}
                  <span className="text-gray-700">{h.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Screen mask */}
        <ToolButton onClick={onToggleScreenMask} title="Screen Mask" active={screenMaskEnabled}>
          <MaskIcon />
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

function MaskIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
    </svg>
  );
}
