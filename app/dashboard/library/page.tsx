"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Book } from "@/lib/types";
import { loadStudentData, type StudentData } from "@/lib/storage";

const BOOK_IDS = [
  "storm-chasers",
  "little-big-top",
  "crash-dive",
  "dream-dead",
  "jungle-jenny",
  "prince-pauper",
  "robot-revolution",
  "lost-city",
  "ocean-secrets",
];

const FILTERS_LEFT = ["All Titles", "My Level", "My Books"] as const;
const FILTERS_RIGHT = ["Recommended", "Reviewed", "Reserved"] as const;

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(4);
  const [filter, setFilter] = useState("All Titles");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    Promise.all(
      BOOK_IDS.map((id) =>
        fetch(`/content/books/${id}.json`).then((r) => r.json())
      )
    ).then(setBooks);
    setStudentData(loadStudentData());
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Filter books based on active filter and search
  const filteredBooks = useMemo(() => {
    let result = books;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.genre.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (studentData) {
      switch (filter) {
        case "My Level": {
          const lexile = studentData.progress.currentLexile;
          result = result.filter((b) => Math.abs(b.lexileLevel - lexile) <= 150);
          break;
        }
        case "My Books":
          result = result.filter((b) => b.id in (studentData.progress.bookProgress ?? {}));
          break;
        case "Reviewed":
          result = result.filter((b) => b.id in (studentData.progress.bookReviews ?? {}));
          break;
        // "All Titles", "Recommended", "Reserved" show all books
      }
    }

    return result;
  }, [books, filter, searchQuery, studentData]);

  // Clamp selectedIndex when filtered list changes
  useEffect(() => {
    if (filteredBooks.length > 0 && selectedIndex >= filteredBooks.length) {
      setSelectedIndex(Math.min(selectedIndex, filteredBooks.length - 1));
    }
  }, [filteredBooks.length, selectedIndex]);

  const selectedBook = filteredBooks[selectedIndex];

  const goTo = useCallback(
    (dir: -1 | 1) => {
      setSelectedIndex((i) => Math.max(0, Math.min(filteredBooks.length - 1, i + dir)));
    },
    [filteredBooks.length]
  );

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (Math.abs(touchDeltaX.current) > 50) {
      goTo(touchDeltaX.current > 0 ? -1 : 1);
    }
  }, [goTo]);

  return (
    <div className="flex flex-col flex-1 bg-black -mb-20 pb-20">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 pt-3 pb-2">
        <div className="flex gap-0.5">
          {FILTERS_LEFT.map((f, i) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSearchOpen(false); setSearchQuery(""); }}
              className={`px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium transition-colors border ${
                filter === f
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/70 border-white/30 hover:text-white hover:border-white/50"
              } ${i === 0 ? "rounded-l-md" : ""} ${i === FILTERS_LEFT.length - 1 ? "rounded-r-md" : ""}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex gap-0.5">
            {FILTERS_RIGHT.map((f, i) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setSearchOpen(false); setSearchQuery(""); }}
                className={`px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium transition-colors border ${
                  filter === f
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white/70 border-white/30 hover:text-white hover:border-white/50"
                } ${i === 0 ? "rounded-l-md" : ""} ${i === FILTERS_RIGHT.length - 1 ? "rounded-r-md" : ""}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
              searchOpen ? "text-white bg-white/20" : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search bar — slides in when open */}
      {searchOpen && (
        <div className="px-3 sm:px-4 pb-2">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or genre..."
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-white text-sm placeholder:text-white/40 border border-white/20 focus:outline-none focus:border-white/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3D Book Carousel */}
      {filteredBooks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/40 text-sm italic">No books match your search</p>
        </div>
      ) : (
        <>
          <div
            className="relative"
            style={{ height: "clamp(240px, 50vh, 500px)" }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="absolute inset-0 bg-black" />
            {/* Bookshelf wood texture on sides */}
            <div className="absolute left-0 top-0 bottom-0 w-[6vw] z-10 pointer-events-none"
              style={{
                background: "repeating-linear-gradient(90deg, #3d2b17 0px, #4e3820 4px, #33250f 8px, #2a1c0a 12px)",
                maskImage: "linear-gradient(to right, rgba(0,0,0,0.85), transparent)",
                WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,0.85), transparent)",
              }}
            />
            <div className="absolute right-0 top-0 bottom-0 w-[6vw] z-10 pointer-events-none"
              style={{
                background: "repeating-linear-gradient(90deg, #3d2b17 0px, #4e3820 4px, #33250f 8px, #2a1c0a 12px)",
                maskImage: "linear-gradient(to left, rgba(0,0,0,0.85), transparent)",
                WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.85), transparent)",
              }}
            />
            <div
              ref={carouselRef}
              className="relative h-full flex items-center justify-center overflow-hidden"
              style={{ perspective: "80vw" }}
            >
              {filteredBooks.map((book, i) => {
                const offset = i - selectedIndex;
                const absOffset = Math.abs(offset);
                const isSelected = offset === 0;

                return (
                  <button
                    key={book.id}
                    onClick={() => setSelectedIndex(i)}
                    className="absolute transition-all duration-500 ease-out"
                    style={{
                      width: "clamp(110px, 15vw, 200px)",
                      height: "clamp(155px, 21vw, 280px)",
                      transform: `translateX(calc(${offset} * clamp(40px, 5vw, 75px))) translateZ(${isSelected ? "clamp(20px, 3vw, 50px)" : `calc(${-absOffset} * clamp(10px, 1.5vw, 25px))`}) rotateY(${offset * -15}deg) scale(${isSelected ? 1.08 : Math.max(0.78, 1 - absOffset * 0.07)})`,
                      zIndex: 10 - absOffset,
                      opacity: absOffset > 5 ? 0 : 1,
                    }}
                  >
                    <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
                      <div
                        className={`w-full h-full rounded-sm overflow-hidden relative ${
                          isSelected ? "ring-2 ring-yellow-400/60" : ""
                        }`}
                        style={{
                          boxShadow: isSelected
                            ? "0 0 30px rgba(255,255,255,0.15), 4px 4px 20px rgba(0,0,0,0.6)"
                            : "4px 4px 15px rgba(0,0,0,0.5)",
                        }}
                      >
                        <Image
                          src={book.coverImage}
                          alt={book.title}
                          fill
                          sizes="(max-width: 640px) 100px, 12vw"
                          className="object-cover"
                          draggable={false}
                          priority={absOffset <= 2}
                          loading={absOffset > 2 ? "lazy" : undefined}
                        />
                      </div>
                      <div
                        className="absolute top-0 w-[14px] bg-gradient-to-r from-gray-800 to-gray-600"
                        style={{ left: -14, height: "100%", transform: "rotateY(-90deg)", transformOrigin: "right center" }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Nav arrows */}
            <button
              onClick={() => goTo(-1)}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white/60 hover:text-white hover:bg-black/60 transition-colors z-20"
              aria-label="Previous book"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => goTo(1)}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white/60 hover:text-white hover:bg-black/60 transition-colors z-20"
              aria-label="Next book"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Selected book title */}
          {selectedBook && (
            <div className="text-center py-2 sm:py-3">
              <h2 className="text-white text-lg sm:text-xl font-bold">{selectedBook.title}</h2>
              <p className="text-white/50 text-xs sm:text-sm">{selectedBook.author}</p>
            </div>
          )}

          {/* Bottom cards */}
          <div className="grid grid-cols-3 gap-px px-3 sm:px-4 pb-4">
            <div className="bg-[#1a1a1a] p-2 sm:p-3 flex flex-col items-center gap-1.5 sm:gap-2 rounded-l-md">
              <div className="w-16 h-22 sm:w-20 sm:h-28 rounded-sm overflow-hidden shadow-lg relative">
                {selectedBook && (
                  <Image src={selectedBook.coverImage} alt={selectedBook.title} fill sizes="80px" className="object-cover" />
                )}
              </div>
              <span className="text-white/70 text-[9px] sm:text-[10px] font-medium text-center leading-tight">
                Read Aloud Think Aloud
              </span>
            </div>

            <div className="bg-[#1a1a1a] p-2 sm:p-3 flex flex-col justify-center">
              <h3 className="text-white/80 text-[10px] sm:text-[11px] font-semibold text-center mb-1.5 sm:mb-2 tracking-wide">
                Progress
              </h3>
              <div className="space-y-1 sm:space-y-1.5">
                <StatRow label="Total Words" value={studentData?.progress.totalWords.toLocaleString() ?? "—"} />
                <StatRow label="Total Pages" value={studentData?.progress.totalPages.toString() ?? "—"} />
                <StatRow label="Total Books" value={studentData?.progress.totalBooks.toString() ?? "—"} />
                <div className="border-t border-white/10 pt-1 sm:pt-1.5">
                  <StatRow label="IR Lexile Level" value={studentData?.progress.currentLexile.toString() ?? "—"} />
                </div>
              </div>
            </div>

            <button
              onClick={() => { if (selectedBook) router.push(`/reader/${selectedBook.id}`); }}
              className="bg-[#1a1a1a] p-2 sm:p-3 flex flex-col items-center gap-1.5 sm:gap-2 hover:bg-[#222] transition-colors rounded-r-md"
            >
              <div className="w-16 h-22 sm:w-20 sm:h-28 rounded-sm overflow-hidden shadow-lg relative">
                {selectedBook && (
                  <Image src={selectedBook.coverImage} alt={selectedBook.title} fill sizes="80px" className="object-cover" />
                )}
              </div>
              <span className="text-white/70 text-[9px] sm:text-[10px] font-medium text-center leading-tight">
                My Current Reading
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-white/50 text-[9px] sm:text-[10px]">{label}</span>
      <span className="text-white text-[11px] sm:text-xs font-bold">{value}</span>
    </div>
  );
}
