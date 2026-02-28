"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Passage, Slide, VocabularyWord } from "@/lib/types";
import ReadingSlide from "./ReadingSlide";
import CheckpointSlide from "./CheckpointSlide";
import SummarySlide from "./SummarySlide";
import { recordCheckpointScore, markSlideComplete, markPassageComplete, recordPassageWordsRead, updateIrLevel } from "@/lib/storage";

interface Props {
  passage: Passage;
  onExit: () => void;
}

// Horizontal slide transition matching original Swipe.js parallax engine
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "60%" : "-60%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-40%" : "40%",
    opacity: 0,
  }),
};

export default function InteractiveShell({ passage, onExit }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<number>>(
    new Set()
  );
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [vocabWords, setVocabWords] = useState<VocabularyWord[]>([]);
  const [checkpointScores, setCheckpointScores] = useState<Map<number, { score: number; maxScore: number }>>(new Map());

  // Load vocabulary for this passage
  useEffect(() => {
    fetch("/content/vocabulary/vocabulary.json")
      .then((res) => res.json())
      .then((all: VocabularyWord[]) => {
        setVocabWords(all.filter((w) => w.passageId === passage.id));
      })
      .catch(() => {});
  }, [passage.id]);

  const slide = passage.slides[currentSlide];
  const totalSlides = passage.slides.length;

  // All checkpoint indices (for score tracking and completion)
  const scoredCheckpointIndices = useMemo(() =>
    passage.slides
      .map((s, i) => ((s.type === "checkpoint" || s.checkpoint) && s.checkpoint?.type !== "text-answer" ? i : -1))
      .filter((i) => i >= 0),
    [passage.slides]
  );

  // Score calculation
  const totalEarned = useMemo(() => {
    let sum = 0;
    checkpointScores.forEach((v) => { sum += v.score; });
    return sum;
  }, [checkpointScores]);

  const totalPossible = useMemo(() => {
    let sum = 0;
    checkpointScores.forEach((v) => { sum += v.maxScore; });
    return sum;
  }, [checkpointScores]);

  // Check if all checkpoints (including summary) are complete
  const allCheckpointIndices = useMemo(() =>
    passage.slides
      .map((s, i) => (s.type === "checkpoint" || s.checkpoint ? i : -1))
      .filter((i) => i >= 0),
    [passage.slides]
  );
  const allDone = allCheckpointIndices.length > 0 && allCheckpointIndices.every((i) => completedCheckpoints.has(i));

  // Freeze/unfreeze: compute the furthest slide the student can navigate to.
  // Students can navigate TO the first incomplete checkpoint but not past it.
  // Backward navigation is always allowed. Forward is blocked past freeze point.
  const freezePoint = useMemo(() => {
    for (let i = 0; i < passage.slides.length; i++) {
      const s = passage.slides[i];
      const hasCheckpoint = s.type === "checkpoint" || s.checkpoint;
      if (hasCheckpoint && !completedCheckpoints.has(i)) {
        return i;
      }
    }
    return passage.slides.length - 1;
  }, [passage.slides, completedCheckpoints]);

  // For checkpoint slides with no text, gather text from preceding reading slides
  const getPrecedingText = useCallback(
    (index: number): string => {
      const texts: string[] = [];
      for (let i = index - 1; i >= 0; i--) {
        const s = passage.slides[i];
        if (s.type === "reading" && s.text) {
          texts.unshift(s.text);
          break;
        }
      }
      return texts.join("\n\n");
    },
    [passage.slides]
  );

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides) return;
      // Freeze: block forward navigation past the first incomplete checkpoint
      if (index > freezePoint) return;
      setDirection(index > currentSlide ? 1 : -1);
      setShowCheckpoint(false);
      setCurrentSlide(index);
    },
    [currentSlide, totalSlides, freezePoint]
  );

  const handleCheckpointComplete = useCallback(
    (score: number, maxScore: number, attempts: number) => {
      setCompletedCheckpoints((prev) => new Set([...prev, currentSlide]));

      // Track scores for display
      if (maxScore > 0) {
        setCheckpointScores((prev) => {
          const next = new Map(prev);
          next.set(currentSlide, { score, maxScore });
          return next;
        });
      }

      // Persist checkpoint score
      const slideData = passage.slides[currentSlide];
      const checkpointType = slideData.checkpoint?.type || "highlight";
      recordCheckpointScore(passage.id, {
        slideIndex: currentSlide,
        type: checkpointType,
        score,
        maxScore,
        attempts,
      });
      markSlideComplete(passage.id, currentSlide);

      // Check if all checkpoints are now complete
      const newCompleted = new Set([...completedCheckpoints, currentSlide]);
      const done = allCheckpointIndices.every((i) => newCompleted.has(i));
      if (done) {
        markPassageComplete(passage.id);
        const totalWords = passage.slides.reduce((sum, s) => {
          const text = s.text || s.sentences?.join(" ") || "";
          return sum + text.split(/\s+/).filter(Boolean).length;
        }, 0);
        recordPassageWordsRead(passage.id, totalWords);
        updateIrLevel(passage.id);
      }
    },
    [currentSlide, passage, completedCheckpoints, allCheckpointIndices]
  );

  const handleShowCheckpoint = useCallback(() => {
    setShowCheckpoint(true);
  }, []);

  // Determine if this reading slide has an attached checkpoint to reveal
  const hasAttachedCheckpoint =
    slide.type === "reading" && slide.checkpoint != null;
  const showingCheckpointOnReading = hasAttachedCheckpoint && showCheckpoint;

  // Per-slide background with fallback to passage-level
  const bgImage = slide.backgroundImage || passage.backgroundImage;

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col" style={{ background: "linear-gradient(to bottom, #6cbaf8 0%, #3a8ae1 100%)" }}>
      {/* Background image — per-slide or passage-level fallback, layered over blue gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${bgImage})`,
          filter: slide.type === "summary" ? "brightness(0.3)" : "brightness(0.6)",
        }}
      />
      <div className="absolute inset-0 bg-black/20" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        <button
          onClick={onExit}
          className="px-4 py-1.5 text-white text-sm font-medium rounded-full transition-colors"
          style={{
            background: allDone
              ? "linear-gradient(to bottom, #48c05d 0%, #42d059 3%, #10c42e 5%, #18c835 95%, #007b14 100%)"
              : "linear-gradient(to bottom, #1c8ed5 0%, #79bde6 3%, #1c8ed5 5%, #1c8ed5 95%, #025e97 100%)",
          }}
        >
          {allDone ? "Done" : "Save & Exit"}
        </button>
        <h1 className="text-white font-semibold text-sm md:text-base truncate mx-4">
          {passage.title}
        </h1>
        <div className="flex items-center gap-2">
          {/* Score display */}
          {totalPossible > 0 && (
            <span className="text-white/90 text-xs sm:text-sm font-bold bg-black/30 rounded-full px-3 py-1">
              {totalEarned} / {totalPossible}
            </span>
          )}
          <button className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white">
            <AccessibilityIcon />
          </button>
          <AudioControls text={slide.text || slide.sentences?.join(" ") || ""} />
        </div>
      </div>

      {/* Slide content with 3D perspective */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-2 sm:px-4 md:px-16 pb-14 pt-1 sm:pt-2 min-h-0 overflow-hidden">
        {/* Left arrow — white border with shadow for contrast against blue gradient */}
        <button
          onClick={() => goToSlide(currentSlide - 1)}
          disabled={currentSlide === 0}
          className="absolute left-1 sm:left-2 md:left-4 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-black/30 text-white border-[2.5px] border-white shadow-[0_0_15px_rgba(0,0,0,0.3)] disabled:opacity-20 hover:bg-black/40 transition-colors"
        >
          <ChevronLeft />
        </button>

        {/* Right arrow — disabled when frozen or at end */}
        <button
          onClick={() => goToSlide(currentSlide + 1)}
          disabled={currentSlide === totalSlides - 1 || currentSlide >= freezePoint}
          className="absolute right-1 sm:right-2 md:right-4 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-black/30 text-white border-[2.5px] border-white shadow-[0_0_15px_rgba(0,0,0,0.3)] disabled:opacity-20 hover:bg-black/40 transition-colors"
        >
          <ChevronRight />
        </button>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${currentSlide}-${showCheckpoint}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-5xl mx-auto h-full flex items-start min-h-0"
          >
            {slide.type === "reading" && !showingCheckpointOnReading && (
              <ReadingSlide
                slide={slide}
                onShowCheckpoint={
                  hasAttachedCheckpoint ? handleShowCheckpoint : undefined
                }
                checkpointCompleted={completedCheckpoints.has(currentSlide)}
                vocabWords={vocabWords}
                passageId={passage.id}
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

      {/* Dot navigation — frozen dots past freeze point are dimmed */}
      <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
        {passage.slides.map((s, i) => {
          const isCheckpoint = s.type === "checkpoint" || s.checkpoint;
          const isCompleted = isCheckpoint && completedCheckpoints.has(i);
          const isFrozen = i > freezePoint;
          return (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              disabled={isFrozen}
              className={`w-[9px] h-[9px] rounded-full transition-all ${
                i === currentSlide
                  ? "bg-black shadow-[0_3px_2px_0_rgba(0,0,0,0.3)]"
                  : isCompleted
                  ? "bg-green-400"
                  : isFrozen
                  ? "bg-[#444] opacity-30 cursor-not-allowed"
                  : "bg-[#666] hover:bg-[#888]"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

function AudioControls({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const totalSeconds = Math.max(5, Math.round((wordCount / 150) * 60));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const duration = `${mins}:${secs.toString().padStart(2, "0")}`;

  const elapsed = Math.round(progress * totalSeconds);
  const eMins = Math.floor(elapsed / 60);
  const eSecs = elapsed % 60;
  const elapsedStr = `${eMins}:${eSecs.toString().padStart(2, "0")}`;

  const togglePlay = useCallback(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;

    if (playing) {
      synth.cancel();
      setPlaying(false);
      setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => {
      setPlaying(false);
      setProgress(1);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    synth.speak(utterance);
    setPlaying(true);
    setProgress(0);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setProgress(Math.min(1, elapsed / totalSeconds));
    }, 250);
  }, [playing, text, totalSeconds]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 bg-black/30 rounded-full px-2 sm:px-3 py-1.5">
      <button
        onClick={togglePlay}
        className="w-6 h-6 flex items-center justify-center text-white"
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <span className="text-white/70 text-[10px] sm:text-xs font-mono hidden sm:inline">
        {elapsedStr} / {duration}
      </span>
      <div className="w-12 sm:w-16 md:w-24 h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/70 rounded-full transition-all duration-200"
          style={{ width: `${progress * 100}%` }}
        />
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
