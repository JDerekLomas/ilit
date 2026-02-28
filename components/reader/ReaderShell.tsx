"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Book } from "@/lib/types";
import type { FlatPage } from "./types";
import BookPageView from "./BookPage";
import ReaderToolbar, { type HighlightColor } from "./ReaderToolbar";
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
  const [activeHighlight, setActiveHighlight] = useState<HighlightColor>("none");
  const [screenMaskEnabled, setScreenMaskEnabled] = useState(false);

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
        activeHighlight={activeHighlight}
        onHighlightChange={setActiveHighlight}
        screenMaskEnabled={screenMaskEnabled}
        onToggleScreenMask={() => setScreenMaskEnabled((v) => !v)}
      />

      {/* Book frame + nav arrows */}
      <div className="flex-1 flex items-center justify-center px-2 md:px-6 py-2 md:py-4 min-h-0 gap-2 md:gap-4">
        {/* Left arrow — outside frame */}
        <button
          onClick={goPrev}
          disabled={!canGoPrev}
          className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-stone-800/70 text-white disabled:opacity-20 hover:bg-stone-700/80 transition-colors"
        >
          <ChevronLeft />
        </button>

        {/* Book frame */}
        <div
          className="relative flex-1 max-w-6xl h-full rounded-lg flex flex-col min-w-0"
          style={{
            backgroundColor: "#fefaf0",
            border: "4px solid #00b4d8",
            boxShadow:
              "0 0 20px rgba(0, 180, 216, 0.4), 0 0 40px rgba(0, 180, 216, 0.15), 0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Page content area */}
          <div className="flex-1 flex min-h-0 overflow-hidden px-2 md:px-6 py-2 md:py-4">
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

          {/* Page slider */}
          <PageSlider
            currentPage={currentPage}
            totalPages={totalPages}
            isWide={isWide}
            onChange={goToPage}
          />
        </div>

        {/* Right arrow — outside frame */}
        <button
          onClick={goNext}
          disabled={!canGoNext}
          className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-stone-800/70 text-white disabled:opacity-20 hover:bg-stone-700/80 transition-colors"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Screen mask overlay */}
      {screenMaskEnabled && <ScreenMask />}

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

function ScreenMask() {
  const [maskY, setMaskY] = useState(50); // percentage from top
  const dragging = useRef(false);

  useEffect(() => {
    const handleMove = (clientY: number) => {
      if (!dragging.current) return;
      const pct = (clientY / window.innerHeight) * 100;
      setMaskY(Math.max(10, Math.min(90, pct)));
    };
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);
    const onUp = () => { dragging.current = false; };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      {/* Dark mask covering bottom portion */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-black/80 pointer-events-auto"
        style={{ top: `${maskY}%` }}
      />
      {/* Draggable handle at the edge */}
      <div
        className="absolute left-0 right-0 h-6 flex items-center justify-center cursor-ns-resize pointer-events-auto"
        style={{ top: `calc(${maskY}% - 12px)` }}
        onMouseDown={() => { dragging.current = true; }}
        onTouchStart={() => { dragging.current = true; }}
      >
        <div className="w-16 h-1.5 rounded-full bg-white/70 shadow" />
      </div>
    </div>
  );
}
