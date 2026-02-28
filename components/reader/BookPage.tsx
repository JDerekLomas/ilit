"use client";

import Image from "next/image";
import { useState, useCallback, useRef } from "react";
import type { FlatPage, PageAnnotations, AnnotationColor } from "./types";
import type { HighlightColor, TranslateLanguage } from "./ReaderToolbar";
import TextHelpToolbar from "./TextHelpToolbar";

interface Props {
  page: FlatPage;
  fontSize: "sm" | "md" | "lg";
  activeHighlight: HighlightColor;
  annotations: PageAnnotations;
  onAnnotateWord: (wordKey: string, color: AnnotationColor | "clear") => void;
  translateLang: TranslateLanguage;
}

const fontSizeClasses = {
  sm: "text-sm leading-relaxed",
  md: "text-base leading-relaxed",
  lg: "text-xl leading-relaxed",
} as const;

const annotationStyles: Record<AnnotationColor, string> = {
  cyan: "bg-cyan-300",
  magenta: "bg-fuchsia-300",
  green: "bg-green-300",
  strike: "line-through",
};

interface TextHelpState {
  text: string;
  scope: "word" | "sentence";
  anchorRect: DOMRect;
}

export default function BookPageView({
  page,
  fontSize,
  activeHighlight,
  annotations,
  onAnnotateWord,
  translateLang,
}: Props) {
  const paragraphs = page.text.split("\n\n");
  const [selectionHighlight, setSelectionHighlight] = useState<{
    paraIndex: number;
    wordIndex: number | null;
  } | null>(null);
  const [textHelp, setTextHelp] = useState<TextHelpState | null>(null);
  const lastTapRef = useRef<{ time: number; paraIndex: number }>({
    time: 0,
    paraIndex: -1,
  });

  const handleWordClick = useCallback(
    (
      e: React.MouseEvent<HTMLSpanElement>,
      word: string,
      paraIndex: number,
      wordIndex: number
    ) => {
      e.stopPropagation();
      const wordKey = `${paraIndex}:${wordIndex}`;

      // If annotation pen is active, apply the annotation color instead of TextHelp
      if (activeHighlight === "cyan" || activeHighlight === "magenta" || activeHighlight === "green" || activeHighlight === "strike") {
        onAnnotateWord(wordKey, activeHighlight);
        return;
      }
      if (activeHighlight === "clear") {
        onAnnotateWord(wordKey, "clear");
        return;
      }

      // Normal TextHelp mode (activeHighlight === "none")
      const now = Date.now();
      const lastTap = lastTapRef.current;
      const isDoubleTap =
        now - lastTap.time < 400 && lastTap.paraIndex === paraIndex;
      lastTapRef.current = { time: now, paraIndex };

      if (isDoubleTap) {
        const paraEl = (e.target as HTMLElement).closest("[data-para]");
        if (paraEl) {
          const rect = paraEl.getBoundingClientRect();
          const paraText = paragraphs[paraIndex];
          setSelectionHighlight({ paraIndex, wordIndex: null });
          setTextHelp({ text: paraText, scope: "sentence", anchorRect: rect });
        }
      } else {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setSelectionHighlight({ paraIndex, wordIndex });
        setTextHelp({ text: word, scope: "word", anchorRect: rect });
      }
    },
    [paragraphs, activeHighlight, onAnnotateWord]
  );

  const closeTextHelp = useCallback(() => {
    setTextHelp(null);
    setSelectionHighlight(null);
    if (typeof window !== "undefined" && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return (
    <div className="h-full flex flex-col px-2 md:px-4 py-2">
      {/* Chapter header */}
      {page.isFirstInChapter && (
        <h2 className="text-center text-amber-900 font-bold uppercase tracking-widest text-sm md:text-base mb-4 font-sans">
          {page.chapterTitle}
        </h2>
      )}

      {/* Illustration */}
      {page.image && (
        <div className="flex justify-center mb-4">
          <div className="relative w-full max-h-48 aspect-video">
            <Image
              src={page.image}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-lg shadow-md object-cover"
            />
          </div>
        </div>
      )}

      {/* Text with word-level wrapping */}
      <div
        className={`flex-1 font-serif text-gray-800 text-justify ${fontSizeClasses[fontSize]}`}
      >
        {paragraphs.map((para, pIdx) => {
          const isParaSelected =
            selectionHighlight?.paraIndex === pIdx &&
            selectionHighlight.wordIndex === null;
          return (
            <p
              key={pIdx}
              data-para={pIdx}
              className={`${pIdx < paragraphs.length - 1 ? "mb-3" : ""} ${
                isParaSelected ? "bg-yellow-200" : ""
              } rounded-sm transition-colors`}
            >
              {splitIntoWords(para).map((token, wIdx) => {
                if (token.type === "space") {
                  return <span key={wIdx}>{token.value}</span>;
                }
                const wordKey = `${pIdx}:${wIdx}`;
                const annotation = annotations[wordKey];
                const isWordSelected =
                  selectionHighlight?.paraIndex === pIdx &&
                  selectionHighlight.wordIndex === wIdx;

                // Build class list
                let wordClass = "cursor-pointer rounded-sm transition-colors";
                if (isWordSelected && !isParaSelected) {
                  wordClass += " bg-yellow-300";
                } else if (annotation) {
                  wordClass += ` ${annotationStyles[annotation]}`;
                } else {
                  wordClass += " hover:bg-amber-100/50";
                }

                // Show highlight pen cursor when an annotation tool is active
                if (activeHighlight !== "none") {
                  wordClass += " cursor-crosshair";
                }

                return (
                  <span
                    key={wIdx}
                    tabIndex={0}
                    onClick={(e) =>
                      handleWordClick(e, token.value, pIdx, wIdx)
                    }
                    className={wordClass}
                  >
                    {token.value}
                  </span>
                );
              })}
            </p>
          );
        })}
      </div>

      {/* Page number */}
      <div className="text-center text-gray-400 text-xs font-sans mt-2 pt-1">
        {page.pageNumber}
      </div>

      {/* TextHelp floating toolbar */}
      {textHelp && (
        <TextHelpToolbar
          text={textHelp.text}
          scope={textHelp.scope}
          anchorRect={textHelp.anchorRect}
          onClose={closeTextHelp}
          translateLang={translateLang}
        />
      )}
    </div>
  );
}

/** Split text into word and space tokens, preserving whitespace for proper rendering */
interface Token {
  type: "word" | "space";
  value: string;
}

function splitIntoWords(text: string): Token[] {
  const tokens: Token[] = [];
  const regex = /(\S+|\s+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const value = match[1];
    tokens.push({
      type: /\S/.test(value) ? "word" : "space",
      value,
    });
  }
  return tokens;
}
