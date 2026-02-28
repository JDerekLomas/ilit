"use client";

import { useState, useEffect } from "react";
import { loadStudentData, saveStudentData, type StudentData } from "@/lib/storage";

const STAR_COUNT = 5;

export default function ReviewPage() {
  const [data, setData] = useState<StudentData | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
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

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      {/* Dark overlay background */}
      <div className="absolute inset-0 bg-[#555]" />

      {/* Top toolbar with Done button */}
      <div className="relative z-10 flex items-center px-3 py-2 bg-black">
        <a
          href="/dashboard/library"
          className="px-5 py-1.5 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
        >
          Done
        </a>
      </div>

      {/* Centered modal */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-lg overflow-hidden shadow-2xl">
          {/* Gold/amber header */}
          <div className="bg-[#e8a830] px-6 py-2.5">
            <h1 className="text-white text-base font-bold text-center">
              Book Review
            </h1>
          </div>

          {/* White body */}
          <div className="bg-white px-6 py-6">
            {hasBookToReview ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Rate and review your recently read book
                </p>

                {/* Star rating */}
                <div className="flex justify-center gap-1">
                  {Array.from({ length: STAR_COUNT }, (_, i) => {
                    const starValue = i + 1;
                    const filled = starValue <= (hoverRating || rating);
                    return (
                      <button
                        key={i}
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill={filled ? "#e8a830" : "none"}
                          stroke={filled ? "#e8a830" : "#ccc"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    );
                  })}
                </div>

                {/* Review text */}
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 resize-none focus:outline-none focus:border-[#e8a830]"
                />

                {/* Submit button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0}
                    className={`px-8 py-2 rounded-md text-sm font-bold transition-colors ${
                      rating > 0
                        ? "bg-[#e8a830] text-white hover:bg-[#d49a28]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            ) : submitted ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">&#9733;</div>
                <p className="text-green-700 text-sm font-bold">Review submitted! Thank you.</p>
              </div>
            ) : (
              <p className="text-[#555] text-sm font-bold text-center">
                No books available for review.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
