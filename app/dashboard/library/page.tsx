"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { loadStudentData, getLevelLexileRange, type StudentData } from "@/lib/storage";
import type { CatalogBook } from "@/lib/types";

/** Extended catalog entry with parsed genres for UI filtering */
interface LibraryBook extends CatalogBook {
  /** All genres as an array */
  genres: string[];
  /** Description text */
  description: string;
}

const FILTERS_LEFT = ["All Titles", "My Level", "My Books"] as const;
const FILTERS_RIGHT = ["Recommended", "Reviewed", "Reserved"] as const;

const GENRE_FILTERS = [
  "All",
  "Fiction",
  "Adventure",
  "Action",
  "History",
  "Mystery",
  "Nonfiction",
  "Science Fiction",
  "Sports",
  "Horror",
  "Fantasy",
  "Humor",
] as const;

export default function LibraryPage() {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState("All Titles");
  const [genre, setGenre] = useState("All");
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
        const libraryBooks: LibraryBook[] = data.map((b) => ({
          ...b,
          genres: b.genre.split(",").map((g) => g.trim()).filter(Boolean),
          description: b.summary,
        }));
        setBooks(libraryBooks);
        setSelectedIndex(Math.floor(libraryBooks.length / 2));
      });
    setStudentData(loadStudentData());
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Filter books based on active filter, genre, and search
  const filteredBooks = useMemo(() => {
    let result = books;

    // Genre filter
    if (genre !== "All") {
      result = result.filter((b) =>
        b.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
      );
    }

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
          const { center, range } = getLevelLexileRange(studentData.progress.irLevel || "L2");
          result = result.filter((b) => Math.abs(b.lexileLevel - center) <= range);
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
  }, [books, filter, genre, searchQuery, studentData]);

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

      {/* Genre filter chips */}
      <div className="flex gap-1.5 px-3 sm:px-4 pb-2 overflow-x-auto scrollbar-hide">
        {GENRE_FILTERS.map((g) => (
          <button
            key={g}
            onClick={() => { setGenre(g); setSelectedIndex(0); }}
            className={`px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              genre === g
                ? "bg-cyan-500 text-white"
                : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
            }`}
          >
            {g}
          </button>
        ))}
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

      {/* Book count */}
      <div className="px-3 sm:px-4 pb-1">
        <p className="text-white/30 text-[10px] sm:text-xs">
          {filteredBooks.length} of {books.length} titles
          {genre !== "All" && ` in ${genre}`}
        </p>
      </div>

      {/* 3D Book Carousel */}
      {filteredBooks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/40 text-sm italic">No books match your search</p>
        </div>
      ) : (
        <>
          <div
            className="relative"
            style={{ height: "clamp(260px, 38vh, 340px)" }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Chalkboard background */}
            <div className="absolute inset-0" style={{ background: "url(/images/textures/book_bg.jpg) repeat 0 bottom", backgroundSize: "cover" }} />
            {/* Edge borders */}
            <div className="absolute left-0 top-0 bottom-0 w-3 z-10 pointer-events-none" style={{ background: "url(/images/textures/left_border.png) repeat-y 0 0" }} />
            <div className="absolute right-0 top-0 bottom-0 w-3 z-10 pointer-events-none" style={{ background: "url(/images/textures/right_border.png) repeat-y right 0" }} />

            {/* 3D Carousel — matches original ILITBookShelfRounder */}
            <div
              ref={carouselRef}
              className="relative h-full flex items-end justify-center overflow-hidden"
              style={{
                perspective: 1500,
                paddingBottom: 50,
                transform: "scale(0.9)",
                transformOrigin: "center bottom",
              }}
            >
              {filteredBooks.map((book, i) => {
                const offset = i - selectedIndex;
                const absOffset = Math.abs(offset);
                if (absOffset > 10) return null;

                const isSelected = offset === 0;
                const sign = offset >= 0 ? 1 : -1;

                // Progressive gap compression (approximates easeInOutSine curve)
                const baseGap = 125;
                const compression = 0.06;
                const xPx = sign * (absOffset * baseGap - absOffset * (absOffset - 1) / 2 * baseGap * compression);

                // Scale shrinks with distance
                const scale = Math.max(0.75, 1 - absOffset * 0.03);

                return (
                  <button
                    key={book.id}
                    onClick={() => setSelectedIndex(i)}
                    className="absolute transition-all duration-300 ease-out origin-bottom"
                    style={{
                      width: 130,
                      height: "82%",
                      transform: `translateX(${xPx}px) translateZ(${-5 * absOffset}px) scale(${scale})`,
                      zIndex: isSelected ? 500 : Math.floor(500 - 10 * absOffset),
                      filter: isSelected ? "none" : `brightness(${Math.max(0.65, 1 - absOffset * 0.05)})`,
                    }}
                  >
                    <div
                      className="w-full h-full overflow-hidden relative"
                      style={{
                        border: "4px solid #fff",
                        borderRadius: 5,
                        boxShadow: "0px 2px 13px rgba(50,50,50,0.86)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                        loading={absOffset > 6 ? "lazy" : undefined}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Shelf — 50px solid border matching original #222224 */}
            <div
              className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
              style={{
                height: 50,
                background: "#222224",
                borderTop: "2px solid #3a3a3c",
              }}
            />
          </div>

          {/* Selected book title + genres */}
          {selectedBook && (
            <div className="text-center py-2 sm:py-3">
              <h2 className="text-white text-lg sm:text-xl font-bold">{selectedBook.title}</h2>
              <p className="text-white/50 text-xs sm:text-sm">{selectedBook.author}</p>
              {selectedBook.genres.length > 0 && (
                <div className="flex justify-center gap-1 mt-1 flex-wrap px-4">
                  {selectedBook.genres.slice(0, 4).map((g) => (
                    <span key={g} className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/40">
                      {g}
                    </span>
                  ))}
                </div>
              )}
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
                  <StatRow label="Total Words" value={studentData?.progress.totalWords.toLocaleString() ?? "—"} />
                  <StatRow label="Total Pages" value={studentData?.progress.totalPages.toString() ?? "—"} />
                  <StatRow label="Total Books" value={studentData?.progress.totalBooks.toString() ?? "0"} />
                  <div className="border-t border-white/10 mt-1 pt-1">
                    <StatRow label="IR Level" value={studentData?.progress.irLevel ?? "L2"} />
                    <StatRow label="Book Lexile" value={selectedBook?.lexileLevel ? `${selectedBook.lexileLevel}L` : "—"} />
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

          {/* Description */}
          {selectedBook?.description && (
            <div className="px-3 sm:px-4 pb-4 flex justify-center">
              <p className="text-white/40 text-xs sm:text-sm leading-relaxed max-w-[903px] line-clamp-3">
                {selectedBook.description}
              </p>
            </div>
          )}
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
