"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Passage, Slide } from "@/lib/types";
import ReadingSlide from "./ReadingSlide";
import CheckpointSlide from "./CheckpointSlide";
import SummarySlide from "./SummarySlide";

interface Props {
  passage: Passage;
  onExit: () => void;
}

export default function InteractiveShell({ passage, onExit }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<number>>(
    new Set()
  );
  const [showCheckpoint, setShowCheckpoint] = useState(false);

  const slide = passage.slides[currentSlide];
  const totalSlides = passage.slides.length;

  // For checkpoint slides with no text, gather text from preceding reading slides
  const getPrecedingText = useCallback(
    (index: number): string => {
      const texts: string[] = [];
      for (let i = index - 1; i >= 0; i--) {
        const s = passage.slides[i];
        if (s.type === "reading" && s.text) {
          texts.unshift(s.text);
          break; // Just the immediately preceding reading slide
        }
      }
      return texts.join("\n\n");
    },
    [passage.slides]
  );

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides) return;
      setDirection(index > currentSlide ? 1 : -1);
      setShowCheckpoint(false);
      setCurrentSlide(index);
    },
    [currentSlide, totalSlides]
  );

  const handleCheckpointComplete = useCallback(() => {
    setCompletedCheckpoints((prev) => new Set([...prev, currentSlide]));
  }, [currentSlide]);

  const handleShowCheckpoint = useCallback(() => {
    setShowCheckpoint(true);
  }, []);

  // Determine if this reading slide has an attached checkpoint to reveal
  const hasAttachedCheckpoint =
    slide.type === "reading" && slide.checkpoint != null;
  const showingCheckpointOnReading = hasAttachedCheckpoint && showCheckpoint;

  return (
    <div className="fixed inset-0 bg-gray-900 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{
          backgroundImage: `url(${passage.backgroundImage})`,
          filter: slide.type === "summary" ? "brightness(0.3)" : "brightness(0.6)",
        }}
      />
      <div className="absolute inset-0 bg-black/20" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        <button
          onClick={onExit}
          className="px-4 py-1.5 bg-indigo-700 text-white text-sm font-medium rounded-full hover:bg-indigo-800 transition-colors"
        >
          Save &amp; Exit
        </button>
        <h1 className="text-white font-semibold text-sm md:text-base truncate mx-4">
          {passage.title}
        </h1>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white">
            <AccessibilityIcon />
          </button>
          <AudioControls text={slide.text || slide.sentences?.join(" ") || ""} />
        </div>
      </div>

      {/* Slide content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 md:px-16 pb-16 pt-2 h-[calc(100vh-120px)]">
        {/* Left arrow — green circle matching original I-LIT */}
        <button
          onClick={() => goToSlide(currentSlide - 1)}
          disabled={currentSlide === 0}
          className="absolute left-2 md:left-4 z-20 w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-green-600 text-white shadow-lg disabled:opacity-30 hover:bg-green-500 transition-colors"
        >
          <ChevronLeft />
        </button>

        {/* Right arrow — green circle matching original I-LIT */}
        <button
          onClick={() => goToSlide(currentSlide + 1)}
          disabled={currentSlide === totalSlides - 1}
          className="absolute right-2 md:right-4 z-20 w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-green-600 text-white shadow-lg disabled:opacity-30 hover:bg-green-500 transition-colors"
        >
          <ChevronRight />
        </button>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${currentSlide}-${showCheckpoint}`}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full max-w-5xl mx-auto h-full flex items-start"
          >
            {slide.type === "reading" && !showingCheckpointOnReading && (
              <ReadingSlide
                slide={slide}
                onShowCheckpoint={
                  hasAttachedCheckpoint ? handleShowCheckpoint : undefined
                }
                checkpointCompleted={completedCheckpoints.has(currentSlide)}
              />
            )}
            {slide.type === "reading" && showingCheckpointOnReading && (
              <CheckpointSlide
                slide={slide}
                sentences={slide.sentences || []}
                checkpoint={slide.checkpoint!}
                onComplete={handleCheckpointComplete}
                completed={completedCheckpoints.has(currentSlide)}
              />
            )}
            {slide.type === "checkpoint" && (
              <CheckpointSlide
                slide={slide}
                sentences={slide.sentences || []}
                precedingText={getPrecedingText(currentSlide)}
                checkpoint={slide.checkpoint!}
                onComplete={handleCheckpointComplete}
                completed={completedCheckpoints.has(currentSlide)}
              />
            )}
            {slide.type === "summary" && <SummarySlide slide={slide} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot navigation — larger dots matching original */}
      <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2.5">
        {passage.slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === currentSlide
                ? "bg-white scale-125 shadow-md"
                : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function AudioControls({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false);

  // Estimate duration from word count (~150 words per minute for TTS)
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const totalSeconds = Math.max(5, Math.round((wordCount / 150) * 60));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const duration = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-2 bg-black/30 rounded-full px-3 py-1.5">
      <button
        onClick={() => setPlaying(!playing)}
        className="w-6 h-6 flex items-center justify-center text-white"
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <span className="text-white/70 text-xs font-mono">0:00 / {duration}</span>
      {/* Scrubber bar */}
      <div className="w-16 md:w-24 h-1 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full w-0 bg-white/70 rounded-full" />
      </div>
      <button className="w-5 h-5 flex items-center justify-center text-white/70">
        <VolumeIcon />
      </button>
    </div>
  );
}

// Icons
function ChevronLeft() {
  return (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M4 2l10 6-10 6V2z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <rect x="3" y="2" width="4" height="12" rx="1" />
      <rect x="9" y="2" width="4" height="12" rx="1" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 2L4 6H1v4h3l4 4V2zm2.5 2.5a4.5 4.5 0 010 7" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AccessibilityIcon() {
  return (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="4" r="2" />
      <path d="M12 8c-3.5 0-6 1-6 1v2s2.5-.5 5-.8V14l-3 6h2.5l2.5-5 2.5 5H18l-3-6v-3.8c2.5.3 5 .8 5 .8V9s-2.5-1-6-1z" />
    </svg>
  );
}
