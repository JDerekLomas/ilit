"use client";

import { useState, useEffect } from "react";
import { loadStudentData, saveStudentData, type StudentData } from "@/lib/storage";

const STAR_COUNT = 5;

const STAR_LABELS: Record<number, string> = {
  1: "Did not like it",
  2: "It was okay",
  3: "Liked it",
  4: "Really liked it",
  5: "It was awesome",
};

const FEEDBACK_TAGS = [
  "I liked it",
  "I didn't like it",
  "I learned a lot",
  "It was too hard to read",
  "I didn't understand it",
  "It was exciting",
  "It was boring",
  "I liked the setting",
  "I liked the characters",
  "I related to the characters",
  "It was funny",
  "It was sad",
  "It was scary",
  "It was suspenseful",
  "It changed my point of view",
];

export default function ReviewPage() {
  const [data, setData] = useState<StudentData | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setData(loadStudentData());
  }, []);

  // Find a book that hasn't been reviewed yet
  const unreviewedBookId = data
    ? Object.keys(data.progress.bookProgress).find(
        (id) => !(id in (data.progress.bookReviews ?? {}))
      )
    : null;

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      if (prev.length >= 3) {
        // FIFO: remove oldest, add new
        return [...prev.slice(1), tag];
      }
      return [...prev, tag];
    });
  };

  const handleSubmit = () => {
    if (!data || !unreviewedBookId || rating === 0) return;
    const updated = { ...data };
    updated.progress = {
      ...updated.progress,
      bookReviews: {
        ...updated.progress.bookReviews,
        [unreviewedBookId]: {
          bookId: unreviewedBookId,
          rating,
          text: reviewText,
          date: new Date().toISOString(),
        },
      },
    };
    saveStudentData(updated);
    setData(updated);
    setSubmitted(true);
  };

  const hasBookToReview = unreviewedBookId && !submitted;
  const displayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      {/* Dark overlay background */}
      <div className="absolute inset-0" style={{ backgroundColor: "#585858" }} />

      {/* Top toolbar with Done button */}
      <div className="relative z-10 flex items-center px-2.5 py-2 bg-black border-b border-black">
        <a
          href="/dashboard/library"
          className="px-5 py-1 text-sm rounded"
          style={{
            backgroundColor: "#fff",
            color: "#252629",
            border: "1px solid #fff",
          }}
        >
          Done
        </a>
      </div>

      {/* Centered modal */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full overflow-hidden shadow-2xl" style={{ maxWidth: 600, borderRadius: 5 }}>
          {/* Gold/amber header */}
          <div
            className="px-4 py-2 text-center"
            style={{
              backgroundColor: "#eeb01c",
              borderRadius: "5px 5px 0 0",
            }}
          >
            <h1 className="text-white text-lg font-bold">Book Review</h1>
          </div>

          {/* White body */}
          <div
            className="bg-white px-4 py-4"
            style={{ borderRadius: "0 0 5px 5px" }}
          >
            {hasBookToReview ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Rate and review your recently read book
                </p>

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
                          width="35"
                          height="35"
                          viewBox="0 0 24 24"
                          fill={filled ? "#eeb01c" : "none"}
                          stroke={filled ? "#eeb01c" : "#ccc"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
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
                            isSelected
                              ? "bg-gray-800 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {tag}
                          {isSelected && (
                            <svg
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
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
                  <span className="text-xs text-gray-400">
                    {reviewText.length}/150
                  </span>
                </div>

                {/* Submit button */}
                <div className="flex justify-end gap-2 pt-2" style={{ borderRadius: "0 0 5px 5px" }}>
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || selectedTags.length === 0}
                    className={`px-3 py-1.5 rounded text-xs font-semibold uppercase transition-colors ${
                      rating > 0 && selectedTags.length > 0
                        ? "bg-black text-white hover:bg-gray-800 cursor-pointer"
                        : "bg-black text-white opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Submit
                  </button>
                </div>
              </div>
            ) : submitted ? (
              <div className="text-center py-6">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="#eeb01c"
                  stroke="#eeb01c"
                  strokeWidth="1"
                  className="mx-auto mb-3"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <p className="text-green-700 text-sm font-bold">
                  Review submitted! Thank you.
                </p>
              </div>
            ) : (
              <div className="py-6">
                <p className="text-center font-bold" style={{ color: "#4e4e4e" }}>
                  No books available for review.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
