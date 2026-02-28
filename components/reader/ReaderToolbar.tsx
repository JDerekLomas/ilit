"use client";

interface Props {
  title: string;
  fontSize: "sm" | "md" | "lg";
  onFontSizeChange: () => void;
  isSpeaking: boolean;
  onToggleTTS: () => void;
  onToggleTOC: () => void;
  onExit: () => void;
}

export default function ReaderToolbar({
  title,
  fontSize,
  onFontSizeChange,
  isSpeaking,
  onToggleTTS,
  onToggleTOC,
  onExit,
}: Props) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-amber-900/90 backdrop-blur-sm z-10">
      {/* Left: Back + TOC */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExit}
          className="px-3 py-1 bg-amber-800 text-amber-100 text-sm font-medium rounded-full hover:bg-amber-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onToggleTOC}
          className="w-8 h-8 flex items-center justify-center text-amber-200/80 hover:text-amber-100 transition-colors"
          title="Table of Contents"
        >
          <TOCIcon />
        </button>
      </div>

      {/* Center: Title */}
      <h1 className="text-amber-100 font-serif font-semibold text-sm md:text-base truncate mx-4 max-w-xs md:max-w-lg">
        {title}
      </h1>

      {/* Right: Font size + TTS */}
      <div className="flex items-center gap-2">
        <button
          onClick={onFontSizeChange}
          className="w-8 h-8 flex items-center justify-center text-amber-200/80 hover:text-amber-100 transition-colors relative"
          title={`Font size: ${fontSize}`}
        >
          <FontSizeIcon />
          <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold text-amber-300">
            {fontSize === "sm" ? "S" : fontSize === "md" ? "M" : "L"}
          </span>
        </button>
        <button
          onClick={onToggleTTS}
          className={`w-8 h-8 flex items-center justify-center transition-colors ${
            isSpeaking
              ? "text-amber-300"
              : "text-amber-200/80 hover:text-amber-100"
          }`}
          title={isSpeaking ? "Stop reading" : "Read aloud"}
        >
          {isSpeaking ? <StopIcon /> : <SpeakerIcon />}
        </button>
      </div>
    </div>
  );
}

function TOCIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M4 6h16M4 12h12M4 18h8" />
    </svg>
  );
}

function FontSizeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <text x="2" y="18" fontSize="16" fontFamily="serif" fontWeight="bold">A</text>
      <text x="14" y="18" fontSize="10" fontFamily="serif">a</text>
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      <path d="M12 1L7 6H2v12h5l5 5V1zm-2 5.83v10.34L7.17 14H4V10h3.17L10 6.83z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
