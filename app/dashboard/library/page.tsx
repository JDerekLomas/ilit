"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { loadStudentData, type StudentData } from "@/lib/storage";

/** Lightweight catalog entry — no chapter content */
interface CatalogBook {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  lexileLevel: number;
  genre: string;
  summary: string;
  totalPages: number;
  chapterCount: number;
  wordCount: number;
}

const FILTERS_LEFT = ["All Titles", "My Level", "My Books"] as const;
const FILTERS_RIGHT = ["Recommended", "Reviewed", "Reserved"] as const;

export default function LibraryPage() {
  const [books, setBooks] = useState<CatalogBook[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
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
    fetch("/content/books/catalog.json")
      .then((r) => r.json())
      .then((data: CatalogBook[]) => {
        setBooks(data);
        setSelectedIndex(Math.floor(data.length / 2));
      });
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goTo(1); }
      else if (e.key === "Enter" && selectedBook) { router.push(`/reader/${selectedBook.id}`); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goTo, selectedBook, router]);

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
            style={{ height: "clamp(200px, 32vh, 300px)" }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Chalkboard background */}
            <div className="absolute inset-0" style={{ background: "url(/images/textures/book_bg.jpg) repeat 0 bottom", backgroundSize: "cover" }} />
            {/* Edge borders */}
            <div className="absolute left-0 top-0 bottom-0 w-3 z-10 pointer-events-none" style={{ background: "url(/images/textures/left_border.png) repeat-y 0 0" }} />
            <div className="absolute right-0 top-0 bottom-0 w-3 z-10 pointer-events-none" style={{ background: "url(/images/textures/right_border.png) repeat-y right 0" }} />

            {/* Horizontal bookshelf strip */}
            <div
              ref={carouselRef}
              className="relative h-full flex items-end justify-center overflow-hidden px-4"
              style={{ paddingBottom: 12 }}
            >
              {filteredBooks.map((book, i) => {
                const offset = i - selectedIndex;
                const isSelected = offset === 0;
                // Book width and gap — tightly packed
                const bookW = 100; // px base width
                const gap = 6;
                const xPx = offset * (bookW + gap);

                return (
                  <button
                    key={book.id}
                    onClick={() => setSelectedIndex(i)}
                    className="absolute transition-all duration-300 ease-out origin-bottom"
                    style={{
                      width: bookW,
                      height: isSelected ? "85%" : "75%",
                      transform: `translateX(${xPx}px)`,
                      zIndex: isSelected ? 20 : 10 - Math.abs(offset),
                      filter: isSelected ? "none" : "brightness(0.85)",
                    }}
                  >
                    <div
                      className="w-full h-full rounded-[3px] overflow-hidden relative"
                      style={{
                        border: isSelected ? "3px solid #fff" : "2px solid rgba(255,255,255,0.5)",
                        boxShadow: isSelected
                          ? "0 4px 20px rgba(0,0,0,0.7)"
                          : "0 2px 8px rgba(0,0,0,0.5)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                        loading={Math.abs(offset) > 6 ? "lazy" : undefined}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Shelf ledge — thick dark bar like the original */}
            <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
              <div style={{ height: 8, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.6))" }} />
              <div style={{ height: 20, background: "linear-gradient(to bottom, #2a2a2c, #1a1a1c)", borderTop: "2px solid #3a3a3c", borderBottom: "3px solid #111" }} />
            </div>
          </div>

          {/* Selected book title */}
          {selectedBook && (
            <div className="text-center py-2 sm:py-3">
              <h2 className="text-white text-lg sm:text-xl font-bold">{selectedBook.title}</h2>
              <p className="text-white/50 text-xs sm:text-sm">{selectedBook.author}</p>
            </div>
          )}

          {/* Book detail panel */}
          <div className="flex justify-center px-3 sm:px-4 pb-4">
            <div
              className="w-full flex items-stretch"
              style={{ maxWidth: 903 }}
            >
              {/* Left: Read Aloud Think Aloud */}
              <button
                onClick={() => { if (selectedBook) router.push(`/reader/${selectedBook.id}`); }}
                className="flex flex-col items-center justify-center px-3 sm:px-5 py-3 hover:brightness-110 transition-all"
                style={{
                  background: "#121313",
                  borderRadius: "5px 0 0 5px",
                  width: "clamp(100px, 18%, 160px)",
                }}
              >
                <div
                  className="rounded-[3px] overflow-hidden relative shadow-lg"
                  style={{
                    width: "clamp(70px, 100%, 114px)",
                    aspectRatio: "114 / 164",
                    border: "3px solid #fff",
                  }}
                >
                  {selectedBook && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={selectedBook.coverImage} alt={selectedBook.title} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                </div>
                <span className="text-white/70 text-[10px] sm:text-xs font-medium text-center leading-tight mt-2">
                  Read Aloud Think Aloud
                </span>
              </button>

              {/* Center: Progress stats */}
              <div
                className="flex-1 flex flex-col"
                style={{ background: "#121313" }}
              >
                <div
                  className="text-white text-center font-semibold py-2"
                  style={{
                    fontSize: 16,
                    background: "#0b0c0c",
                    borderBottom: "2px solid #000",
                  }}
                >
                  Progress
                </div>
                <div className="flex-1 flex flex-col justify-center px-3 sm:px-6 py-2">
                  <StatRow label="Total Words" value={selectedBook?.wordCount.toLocaleString() ?? "—"} />
                  <StatRow label="Total Pages" value={selectedBook?.totalPages.toString() ?? "—"} />
                  <StatRow label="Total Books" value="—" />
                  <div className="border-t border-white/10 mt-1 pt-1">
                    <StatRow label="IR Lexile Level" value={selectedBook?.lexileLevel.toString() ?? "—"} />
                  </div>
                </div>
              </div>

              {/* Right: My Current Reading */}
              <button
                onClick={() => { if (selectedBook) router.push(`/reader/${selectedBook.id}`); }}
                className="flex flex-col items-center justify-center px-3 sm:px-5 py-3 hover:brightness-110 transition-all"
                style={{
                  background: "#121313",
                  borderRadius: "0 5px 5px 0",
                  width: "clamp(100px, 18%, 160px)",
                }}
              >
                <div
                  className="rounded-[3px] overflow-hidden relative shadow-lg"
                  style={{
                    width: "clamp(70px, 100%, 114px)",
                    aspectRatio: "114 / 164",
                    border: "3px solid #fff",
                  }}
                >
                  {selectedBook && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={selectedBook.coverImage} alt={selectedBook.title} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                </div>
                <span className="text-white/70 text-[10px] sm:text-xs font-medium text-center leading-tight mt-2">
                  My Current Reading
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 sm:py-2">
      <span className="text-white/70 text-xs sm:text-[15px]">{label}</span>
      <span className="text-white text-sm sm:text-[15px] font-bold">{value}</span>
    </div>
  );
}
