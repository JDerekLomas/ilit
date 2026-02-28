"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Book } from "@/lib/types";

const BOOK_IDS = [
  "little-big-top",
  "crash-dive",
  "dream-dead",
  "jungle-jenny",
  "prince-pauper",
];

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState<"all" | "level" | "mine">("all");
  const router = useRouter();

  useEffect(() => {
    Promise.all(
      BOOK_IDS.map((id) =>
        fetch(`/content/books/${id}.json`).then((r) => r.json())
      )
    ).then(setBooks);
  }, []);

  const selectedBook = books[selectedIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-white/20 backdrop-blur-sm rounded-full p-1">
          {(["all", "level", "mine"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === f
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {f === "all" ? "All Titles" : f === "level" ? "My Level" : "My Books"}
            </button>
          ))}
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {/* Book carousel */}
      <div className="flex items-center justify-center gap-3 mb-6 min-h-[200px]">
        {books.map((book, i) => {
          const offset = i - selectedIndex;
          const isSelected = offset === 0;
          return (
            <button
              key={book.id}
              onClick={() => setSelectedIndex(i)}
              className="transition-all duration-300 flex-shrink-0"
              style={{
                transform: `perspective(600px) rotateY(${offset * -15}deg) scale(${isSelected ? 1.1 : 0.85})`,
                zIndex: isSelected ? 10 : 5 - Math.abs(offset),
                opacity: Math.abs(offset) > 2 ? 0.3 : 1,
              }}
            >
              <div
                className={`w-28 h-40 rounded-lg shadow-xl flex items-center justify-center text-center p-2 ${
                  isSelected ? "ring-4 ring-white/60" : ""
                }`}
                style={{
                  background: bookGradient(i),
                }}
              >
                <span className="text-white text-xs font-bold leading-tight drop-shadow-md">
                  {book.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected book info */}
      {selectedBook && (
        <div className="text-center mb-6">
          <h2 className="text-white text-xl font-bold drop-shadow-md">
            {selectedBook.title}
          </h2>
          <p className="text-white/70 text-sm">{selectedBook.author}</p>
        </div>
      )}

      {/* Stats and actions */}
      <div className="grid grid-cols-3 gap-3">
        {/* Read aloud card */}
        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center gap-2">
          <div
            className="w-16 h-22 rounded-md flex items-center justify-center"
            style={{ background: selectedBook ? bookGradient(selectedIndex) : "#666" }}
          >
            <span className="text-white text-[8px] font-bold text-center px-1 leading-tight">
              {selectedBook?.title || ""}
            </span>
          </div>
          <span className="text-white/80 text-[10px] font-medium text-center leading-tight">
            Read Aloud Think Aloud
          </span>
        </div>

        {/* Progress card */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 flex flex-col gap-1.5">
          <StatRow label="Total Words" value="8,818" />
          <StatRow label="Total Pages" value="33" />
          <StatRow label="Total Books" value="-" />
          <div className="border-t border-white/10 pt-1.5 mt-0.5">
            <StatRow label="IR Lexile Level" value="900" />
          </div>
        </div>

        {/* Current reading card */}
        <button
          onClick={() => {
            if (selectedBook) router.push(`/reader/${selectedBook.id}`);
          }}
          className="bg-white/15 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-white/25 transition-colors"
        >
          <div
            className="w-16 h-22 rounded-md flex items-center justify-center"
            style={{ background: selectedBook ? bookGradient(selectedIndex) : "#666" }}
          >
            <span className="text-white text-[8px] font-bold text-center px-1 leading-tight">
              {selectedBook?.title || ""}
            </span>
          </div>
          <span className="text-white/80 text-[10px] font-medium text-center leading-tight">
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
      <span className="text-white/60 text-[10px]">{label}</span>
      <span className="text-white text-xs font-bold">{value}</span>
    </div>
  );
}

const gradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
];

function bookGradient(index: number): string {
  return gradients[index % gradients.length];
}
