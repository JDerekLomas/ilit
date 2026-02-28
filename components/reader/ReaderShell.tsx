"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Book } from "@/lib/types";
import type { FlatPage } from "./types";
import BookPageView from "./BookPage";
import ReaderToolbar from "./ReaderToolbar";
import TableOfContents from "./TableOfContents";
import PageSlider from "./PageSlider";

interface Props {
  book: Book;
  onExit: () => void;
}

type FontSize = "sm" | "md" | "lg";

export default function ReaderShell({ book, onExit }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [showTOC, setShowTOC] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isWide, setIsWide] = useState(false);

  // Flatten chapters into a single page array
  const flatPages = useMemo<FlatPage[]>(() => {
    const pages: FlatPage[] = [];
    for (const chapter of book.chapters) {
      for (let i = 0; i < chapter.pages.length; i++) {
        const p = chapter.pages[i];
        pages.push({
          pageNumber: p.pageNumber,
          text: p.text,
          image: p.image,
          chapterTitle: chapter.title,
          isFirstInChapter: i === 0,
        });
      }
    }
    return pages;
  }, [book.chapters]);

  const totalPages = flatPages.length;
  const step = isWide ? 2 : 1;

  // Track viewport width
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsWide(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setIsWide(e.matches);
      // Snap to even index when switching to wide
      if (e.matches) {
        setCurrentPage((prev) => (prev % 2 === 0 ? prev : prev - 1));
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Navigation
  const goToPage = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, totalPages - 1));
      // Snap to even in wide mode
      const snapped = isWide ? clamped - (clamped % 2) : clamped;
      setDirection(snapped > currentPage ? 1 : -1);
      setCurrentPage(snapped);
      // Cancel TTS on page change
      if (typeof window !== "undefined" && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    },
    [currentPage, totalPages, isWide]
  );

  const goPrev = useCallback(() => goToPage(currentPage - step), [currentPage, step, goToPage]);
  const goNext = useCallback(() => goToPage(currentPage + step), [currentPage, step, goToPage]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") setShowTOC(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

  // TTS
  const toggleTTS = useCallback(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;

    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    // Gather text from visible pages
    const visiblePages = isWide
      ? flatPages.slice(currentPage, currentPage + 2)
      : [flatPages[currentPage]];
    const text = visiblePages
      .filter(Boolean)
      .map((p) => p.text)
      .join("\n\n");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    synth.speak(utterance);
    setIsSpeaking(true);
  }, [currentPage, flatPages, isWide]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
    };
  }, []);

  // Font size cycling
  const cycleFontSize = useCallback(() => {
    setFontSize((prev) => {
      if (prev === "sm") return "md";
      if (prev === "md") return "lg";
      return "sm";
    });
  }, []);

  const leftPage = flatPages[currentPage];
  const rightPage = isWide ? flatPages[currentPage + 1] : undefined;
  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage + step < totalPages;

  return (
    <div
      className="fixed inset-0 overflow-hidden flex flex-col"
      style={{
        background: [
          "repeating-linear-gradient(90deg, #8B6914 0px, #7B5B12 2px, #A0734D 4px, #6B4226 7px, #D2A679 9px, #8B6914 12px)",
          "linear-gradient(180deg, #6B4226 0%, #8B6914 30%, #A0734D 60%, #6B4226 100%)",
        ].join(", "),
        backgroundBlendMode: "overlay",
      }}
    >
      {/* Toolbar */}
      <ReaderToolbar
        title={book.title}
        fontSize={fontSize}
        onFontSizeChange={cycleFontSize}
        isSpeaking={isSpeaking}
        onToggleTTS={toggleTTS}
        onToggleTOC={() => setShowTOC((v) => !v)}
        onExit={onExit}
      />

      {/* Book frame */}
      <div className="flex-1 flex items-center justify-center p-2 md:p-6 min-h-0">
        <div
          className="relative w-full max-w-6xl h-full rounded-lg border-2 border-amber-800/50 flex flex-col"
          style={{
            backgroundColor: "#fefaf0",
            boxShadow:
              "inset 0 0 30px rgba(0, 180, 200, 0.08), inset 0 0 60px rgba(0, 180, 200, 0.04), 0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Page content area */}
          <div className="flex-1 flex items-stretch min-h-0 px-2 md:px-4 py-2 md:py-4">
            {/* Left arrow */}
            <button
              onClick={goPrev}
              disabled={!canGoPrev}
              className="flex-shrink-0 w-8 md:w-12 flex items-center justify-center text-amber-800/60 disabled:opacity-20 hover:text-amber-900 transition-colors"
            >
              <ChevronLeft />
            </button>

            {/* Pages */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentPage}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -60 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="w-full flex min-h-0"
                >
                  {/* Left page */}
                  <div className={`${isWide ? "w-1/2 pr-2 md:pr-4" : "w-full"} min-h-0 overflow-y-auto`}>
                    {leftPage && (
                      <BookPageView page={leftPage} fontSize={fontSize} />
                    )}
                  </div>

                  {/* Spine divider */}
                  {isWide && (
                    <div className="w-px bg-amber-300/40 flex-shrink-0 self-stretch" />
                  )}

                  {/* Right page */}
                  {isWide && (
                    <div className="w-1/2 pl-2 md:pl-4 min-h-0 overflow-y-auto">
                      {rightPage ? (
                        <BookPageView page={rightPage} fontSize={fontSize} />
                      ) : (
                        <div className="h-full" />
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right arrow */}
            <button
              onClick={goNext}
              disabled={!canGoNext}
              className="flex-shrink-0 w-8 md:w-12 flex items-center justify-center text-amber-800/60 disabled:opacity-20 hover:text-amber-900 transition-colors"
            >
              <ChevronRight />
            </button>
          </div>

          {/* Page slider */}
          <PageSlider
            currentPage={currentPage}
            totalPages={totalPages}
            isWide={isWide}
            onChange={goToPage}
          />
        </div>
      </div>

      {/* Table of Contents overlay */}
      {showTOC && (
        <TableOfContents
          flatPages={flatPages}
          currentPage={currentPage}
          onNavigate={(index) => {
            goToPage(index);
            setShowTOC(false);
          }}
          onClose={() => setShowTOC(false)}
        />
      )}
    </div>
  );
}

// Icons
function ChevronLeft() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
