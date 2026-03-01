"use client";

import { useState, useEffect } from "react";
import { loadStudentData, saveStudentData, type StudentData } from "@/lib/storage";
import type { CatalogBook } from "@/lib/types";
import reviewPresets from "@/content/review-presets.json";

const STAR_COUNT = 5;

const STAR_LABELS: Record<number, string> = {
  1: "Did not like it",
  2: "It was okay",
  3: "Liked it",
  4: "Really liked it",
  5: "It was awesome",
};

const FEEDBACK_TAGS = reviewPresets.map((p) => p.text);

export default function ReviewPage() {
  const [data, setData] = useState<StudentData | null>(null);
  const [catalog, setCatalog] = useState<CatalogBook[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [view, setView] = useState<"write" | "history">("write");

  useEffect(() => {
    setData(loadStudentData());
    fetch("/content/books/catalog.json")
      .then((r) => r.json())
      .then((books: CatalogBook[]) => setCatalog(books))
      .catch(() => {});
  }, []);

  // Pick a book to review: prefer unreviewed books from progress, else first catalog book
  useEffect(() => {
    if (!data || selectedBookId) return;
    const reviewed = data.progress.bookReviews ?? {};
    const unreviewedFromProgress = Object.keys(data.progress.bookProgress ?? {}).find(
      (id) => !(id in reviewed)
    );
    if (unreviewedFromProgress) {
      setSelectedBookId(unreviewedFromProgress);
    } else if (catalog.length > 0) {
      // Pick a random unreviewed catalog book
      const unreviewedCatalog = catalog.find((b) => !(b.id in reviewed));
      if (unreviewedCatalog) setSelectedBookId(unreviewedCatalog.id);
    }
  }, [data, catalog, selectedBookId]);

  const selectedBook = catalog.find((b) => b.id === selectedBookId);
  const existingReviews = data ? Object.values(data.progress.bookReviews ?? {}) : [];

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 3) return [...prev.slice(1), tag];
      return [...prev, tag];
    });
  };

  const handleSubmit = () => {
    if (!data || !selectedBookId || rating === 0) return;
    const updated = { ...data };
    updated.progress = {
      ...updated.progress,
      bookReviews: {
        ...updated.progress.bookReviews,
        [selectedBookId]: {
          bookId: selectedBookId,
          rating,
          text: reviewText || selectedTags.join(", "),
          date: new Date().toISOString(),
        },
      },
    };
    saveStudentData(updated);
    setData(updated);
    setSubmitted(true);
    setRating(0);
    setReviewText("");
    setSelectedTags([]);
  };

  const handlePickBook = (bookId: string) => {
    setSelectedBookId(bookId);
    setShowPicker(false);
    setSubmitted(false);
    setRating(0);
    setReviewText("");
    setSelectedTags([]);
  };

  const displayRating = hoverRating || rating;
  const alreadyReviewed = selectedBookId ? selectedBookId in (data?.progress.bookReviews ?? {}) : false;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      {/* Dark overlay background */}
      <div className="absolute inset-0" style={{ backgroundColor: "#585858" }} />

      {/* Top toolbar with Done button and view toggle */}
      <div className="relative z-10 flex items-center justify-between px-2.5 py-2 bg-black border-b border-black">
        <a
          href="/dashboard/library"
          className="px-5 py-1 text-sm rounded"
          style={{ backgroundColor: "#fff", color: "#252629", border: "1px solid #fff" }}
        >
          Done
        </a>
        <div className="flex gap-1">
          <button
            onClick={() => setView("write")}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              view === "write" ? "bg-[#eeb01c] text-white" : "bg-white/20 text-white/70 hover:text-white"
            }`}
          >
            Write Review
          </button>
          <button
            onClick={() => setView("history")}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              view === "history" ? "bg-[#eeb01c] text-white" : "bg-white/20 text-white/70 hover:text-white"
            }`}
          >
            My Reviews ({existingReviews.length})
          </button>
        </div>
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex-1 flex items-start justify-center p-4 overflow-y-auto">
        {view === "history" ? (
          /* Review history */
          <div className="w-full" style={{ maxWidth: 600 }}>
            <div
              className="px-4 py-2 text-center"
              style={{ backgroundColor: "#eeb01c", borderRadius: "5px 5px 0 0" }}
            >
              <h1 className="text-white text-lg font-bold">My Reviews</h1>
            </div>
            <div className="bg-white px-4 py-4" style={{ borderRadius: "0 0 5px 5px" }}>
              {existingReviews.length === 0 ? (
                <p className="text-center text-gray-400 py-6 text-sm italic">No reviews yet. Write your first review!</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {existingReviews
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((review) => {
                      const book = catalog.find((b) => b.id === review.bookId);
                      return (
                        <div key={review.bookId} className="py-3">
                          <div className="flex items-start gap-3">
                            {book && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-12 h-16 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">
                                {book?.title ?? review.bookId}
                              </p>
                              <div className="flex items-center gap-0.5 mt-0.5">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <svg
                                    key={i}
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill={i < review.rating ? "#eeb01c" : "none"}
                                    stroke={i < review.rating ? "#eeb01c" : "#ccc"}
                                    strokeWidth="2"
                                  >
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                  </svg>
                                ))}
                                <span className="text-xs text-gray-400 ml-2">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                              {review.text && (
                                <p className="text-xs text-gray-600 mt-1">{review.text}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Write review */
          <div className="w-full overflow-hidden shadow-2xl" style={{ maxWidth: 600, borderRadius: 5 }}>
            {/* Gold/amber header */}
            <div
              className="px-4 py-2 text-center"
              style={{ backgroundColor: "#eeb01c", borderRadius: "5px 5px 0 0" }}
            >
              <h1 className="text-white text-lg font-bold">Book Review</h1>
            </div>

            {/* White body */}
            <div className="bg-white px-4 py-4" style={{ borderRadius: "0 0 5px 5px" }}>
              {submitted ? (
                <div className="text-center py-6">
                  <svg
                    width="48" height="48" viewBox="0 0 24 24"
                    fill="#eeb01c" stroke="#eeb01c" strokeWidth="1"
                    className="mx-auto mb-3"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <p className="text-green-700 text-sm font-bold">Review submitted! Thank you.</p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setSelectedBookId(null);
                    }}
                    className="mt-3 px-4 py-1.5 text-xs text-[#eeb01c] border border-[#eeb01c] rounded hover:bg-[#eeb01c] hover:text-white transition-colors"
                  >
                    Review another book
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Book selector */}
                  <div className="flex items-center gap-3">
                    {selectedBook && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={selectedBook.coverImage}
                        alt={selectedBook.title}
                        className="w-12 h-16 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {selectedBook?.title ?? "Select a book"}
                      </p>
                      {selectedBook && (
                        <p className="text-xs text-gray-500">{selectedBook.author}</p>
                      )}
                      <button
                        onClick={() => setShowPicker(!showPicker)}
                        className="text-xs text-[#0b89b7] hover:underline mt-0.5"
                      >
                        {showPicker ? "Close" : "Change book"}
                      </button>
                    </div>
                  </div>

                  {/* Book picker dropdown */}
                  {showPicker && (
                    <div className="border border-gray-200 rounded max-h-40 overflow-y-auto">
                      {catalog
                        .filter((b) => !(b.id in (data?.progress.bookReviews ?? {})))
                        .slice(0, 50)
                        .map((book) => (
                          <button
                            key={book.id}
                            onClick={() => handlePickBook(book.id)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={book.coverImage} alt="" className="w-6 h-8 object-cover rounded flex-shrink-0" />
                            <span className="truncate">{book.title}</span>
                          </button>
                        ))}
                    </div>
                  )}

                  {alreadyReviewed && (
                    <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
                      You already reviewed this book. Pick a different one.
                    </p>
                  )}

                  {/* Star rating */}
                  <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: STAR_COUNT }, (_, i) => {
                      const starValue = i + 1;
                      const filled = starValue <= displayRating;
                      return (
                        <button
                          key={i}
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-0.5 transition-transform hover:scale-110"
                          aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
                        >
                          <svg
                            width="35" height="35" viewBox="0 0 24 24"
                            fill={filled ? "#eeb01c" : "none"}
                            stroke={filled ? "#eeb01c" : "#ccc"}
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                      );
                    })}
                    {rating > 0 && (
                      <span className="ml-2 text-sm font-bold text-gray-600">
                        {STAR_LABELS[rating]}
                      </span>
                    )}
                  </div>

                  {/* Feedback tags */}
                  <div className="border border-gray-300 mt-4">
                    <div className="px-2 py-1.5 border-b border-gray-300 font-bold text-sm text-gray-700">
                      - Please Choose -
                    </div>
                    <ul className="max-h-[150px] overflow-auto m-0">
                      {FEEDBACK_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <li
                            key={tag}
                            onClick={() => handleToggleTag(tag)}
                            className={`py-1.5 px-2 pr-8 text-sm border-b border-gray-200 last:border-b-0 cursor-pointer relative transition-colors ${
                              isSelected ? "bg-gray-800 text-white" : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {tag}
                            {isSelected && (
                              <svg
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="white" strokeWidth="3"
                                strokeLinecap="round" strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Review text */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Write your review here (150 characters).
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value.slice(0, 150))}
                      maxLength={150}
                      placeholder="Write your review..."
                      className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 resize-none focus:outline-none focus:border-[#eeb01c]"
                    />
                    <span className="text-xs text-gray-400">{reviewText.length}/150</span>
                  </div>

                  {/* Submit button */}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={handleSubmit}
                      disabled={rating === 0 || selectedTags.length === 0 || !selectedBookId || alreadyReviewed}
                      className={`px-3 py-1.5 rounded text-xs font-semibold uppercase transition-colors ${
                        rating > 0 && selectedTags.length > 0 && selectedBookId && !alreadyReviewed
                          ? "bg-black text-white hover:bg-gray-800 cursor-pointer"
                          : "bg-black text-white opacity-50 cursor-not-allowed"
                      }`}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
