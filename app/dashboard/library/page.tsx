"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Book } from "@/lib/types";

const BOOK_IDS = [
  "little-big-top",
  "crash-dive",
  "dream-dead",
  "jungle-jenny",
  "prince-pauper",
];

const FILTERS = [
  "Titles",
  "My Level",
  "My Books",
  "Recommended",
  "Reviewed",
  "Reserved",
] as const;

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(2);
  const [filter, setFilter] = useState("Titles");
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all(
      BOOK_IDS.map((id) =>
        fetch(`/content/books/${id}.json`).then((r) => r.json())
      )
    ).then(setBooks);
  }, []);

  const selectedBook = books[selectedIndex];

  const goTo = (dir: -1 | 1) => {
    setSelectedIndex((i) => Math.max(0, Math.min(books.length - 1, i + dir)));
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e]">
      {/* Filter bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex gap-0.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border ${
                filter === f
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/70 border-white/30 hover:text-white hover:border-white/50"
              } ${f === "Titles" ? "rounded-l-md" : ""} ${f === "Reserved" ? "rounded-r-md" : ""}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {/* 3D Book Carousel */}
      <div className="relative flex-shrink-0" style={{ height: 280 }}>
        {/* Dark carousel background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/40" />

        {/* Carousel container */}
        <div
          ref={carouselRef}
          className="relative h-full flex items-center justify-center"
          style={{ perspective: 1200 }}
        >
          {books.map((book, i) => {
            const offset = i - selectedIndex;
            const absOffset = Math.abs(offset);
            const isSelected = offset === 0;

            // Coverflow-style positioning
            const translateX = offset * 110;
            const translateZ = isSelected ? 80 : -absOffset * 40;
            const rotateY = offset * -25;
            const scale = isSelected ? 1 : Math.max(0.7, 1 - absOffset * 0.1);

            return (
              <button
                key={book.id}
                onClick={() => setSelectedIndex(i)}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  zIndex: 10 - absOffset,
                  opacity: absOffset > 3 ? 0 : 1,
                }}
              >
                {/* Book with 3D spine effect */}
                <div
                  className="relative"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Book cover */}
                  <div
                    className={`w-[140px] h-[200px] rounded-sm overflow-hidden shadow-2xl ${
                      isSelected ? "ring-2 ring-yellow-400/60" : ""
                    }`}
                    style={{
                      boxShadow: isSelected
                        ? "0 0 30px rgba(255,255,255,0.15), 4px 4px 20px rgba(0,0,0,0.6)"
                        : "4px 4px 15px rgba(0,0,0,0.5)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>

                  {/* Spine edge (visible on angled books) */}
                  <div
                    className="absolute top-0 h-[200px] w-[12px] bg-gradient-to-r from-gray-800 to-gray-600"
                    style={{
                      left: -12,
                      transform: "rotateY(-90deg)",
                      transformOrigin: "right center",
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Nav arrows */}
        <button
          onClick={() => goTo(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white/60 hover:text-white hover:bg-black/60 transition-colors z-20"
          aria-label="Previous book"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={() => goTo(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white/60 hover:text-white hover:bg-black/60 transition-colors z-20"
          aria-label="Next book"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Selected book title */}
      {selectedBook && (
        <div className="text-center py-3">
          <h2 className="text-white text-xl font-bold">{selectedBook.title}</h2>
          <p className="text-white/50 text-sm">{selectedBook.author}</p>
        </div>
      )}

      {/* Bottom cards: Read Aloud / Progress / My Current Reading */}
      <div className="grid grid-cols-3 gap-3 px-4 pb-4">
        {/* Read Aloud Think Aloud */}
        <div className="bg-black/40 rounded-lg p-3 flex flex-col items-center gap-2">
          <div className="w-20 h-28 rounded-sm overflow-hidden shadow-lg">
            {selectedBook && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={selectedBook.coverImage}
                alt={selectedBook.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <span className="text-white/70 text-[10px] font-medium text-center leading-tight">
            Read Aloud Think Aloud
          </span>
        </div>

        {/* Progress stats */}
        <div className="bg-black/40 rounded-lg p-3 flex flex-col justify-center">
          <h3 className="text-white/80 text-[11px] font-semibold text-center mb-2 tracking-wide">
            Progress
          </h3>
          <div className="space-y-1.5">
            <StatRow label="Total Words" value="8,404" />
            <StatRow label="Total Pages" value="30" />
            <StatRow label="Total Books" value="-" />
            <div className="border-t border-white/10 pt-1.5">
              <StatRow label="IR Lexile Level" value="900" />
            </div>
          </div>
        </div>

        {/* My Current Reading */}
        <button
          onClick={() => {
            if (selectedBook) router.push(`/reader/${selectedBook.id}`);
          }}
          className="bg-black/40 rounded-lg p-3 flex flex-col items-center gap-2 hover:bg-black/50 transition-colors"
        >
          <div className="w-20 h-28 rounded-sm overflow-hidden shadow-lg">
            {selectedBook && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={selectedBook.coverImage}
                alt={selectedBook.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <span className="text-white/70 text-[10px] font-medium text-center leading-tight">
            My Current Reading
          </span>
        </button>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-white/50 text-[10px]">{label}</span>
      <span className="text-white text-xs font-bold">{value}</span>
    </div>
  );
}
