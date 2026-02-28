"use client";

import Image from "next/image";
import { useState, useCallback, useRef } from "react";
import type { FlatPage } from "./types";
import TextHelpToolbar from "./TextHelpToolbar";

interface Props {
  page: FlatPage;
  fontSize: "sm" | "md" | "lg";
}

const fontSizeClasses = {
  sm: "text-sm leading-relaxed",
  md: "text-base leading-relaxed",
  lg: "text-xl leading-relaxed",
} as const;

interface TextHelpState {
  text: string;
  scope: "word" | "sentence";
  anchorRect: DOMRect;
}

export default function BookPageView({ page, fontSize }: Props) {
  const paragraphs = page.text.split("\n\n");
  const [highlight, setHighlight] = useState<{
    paraIndex: number;
    wordIndex: number | null; // null = whole paragraph selected
  } | null>(null);
  const [textHelp, setTextHelp] = useState<TextHelpState | null>(null);
  const lastTapRef = useRef<{ time: number; paraIndex: number }>({ time: 0, paraIndex: -1 });

  const handleWordClick = useCallback(
    (
      e: React.MouseEvent<HTMLSpanElement>,
      word: string,
      paraIndex: number,
      wordIndex: number
    ) => {
      e.stopPropagation();
      const now = Date.now();
      const lastTap = lastTapRef.current;
      const isDoubleTap = now - lastTap.time < 400 && lastTap.paraIndex === paraIndex;
      lastTapRef.current = { time: now, paraIndex };

      if (isDoubleTap) {
        // Double-tap: select the whole paragraph
        const paraEl = (e.target as HTMLElement).closest("[data-para]");
        if (paraEl) {
          const rect = paraEl.getBoundingClientRect();
          const paraText = paragraphs[paraIndex];
          setHighlight({ paraIndex, wordIndex: null });
          setTextHelp({ text: paraText, scope: "sentence", anchorRect: rect });
        }
      } else {
        // Single tap: select this word
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setHighlight({ paraIndex, wordIndex });
        setTextHelp({ text: word, scope: "word", anchorRect: rect });
      }
    },
    [paragraphs]
  );

  const closeTextHelp = useCallback(() => {
    setTextHelp(null);
    setHighlight(null);
    // Cancel any ongoing speech
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
      <div className={`flex-1 font-serif text-gray-800 text-justify ${fontSizeClasses[fontSize]}`}>
        {paragraphs.map((para, pIdx) => {
          const isParaHighlighted = highlight?.paraIndex === pIdx && highlight.wordIndex === null;
          return (
            <p
              key={pIdx}
              data-para={pIdx}
              className={`${pIdx < paragraphs.length - 1 ? "mb-3" : ""} ${
                isParaHighlighted ? "bg-yellow-200" : ""
              } rounded-sm transition-colors`}
            >
              {splitIntoWords(para).map((token, wIdx) => {
                if (token.type === "space") {
                  return <span key={wIdx}>{token.value}</span>;
                }
                const isWordHighlighted =
                  highlight?.paraIndex === pIdx && highlight.wordIndex === wIdx;
                return (
                  <span
                    key={wIdx}
                    tabIndex={0}
                    onClick={(e) => handleWordClick(e, token.value, pIdx, wIdx)}
                    className={`cursor-pointer rounded-sm transition-colors ${
                      isWordHighlighted && !isParaHighlighted
                        ? "bg-yellow-300"
                        : "hover:bg-amber-100/50"
                    }`}
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
