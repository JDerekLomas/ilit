"use client";

import type { FlatPage } from "./types";

interface Props {
  page: FlatPage;
  fontSize: "sm" | "md" | "lg";
}

const fontSizeClasses = {
  sm: "text-sm leading-relaxed",
  md: "text-base leading-relaxed",
  lg: "text-xl leading-relaxed",
} as const;

export default function BookPageView({ page, fontSize }: Props) {
  const paragraphs = page.text.split("\n\n");

  return (
    <div className="h-full flex flex-col px-2 md:px-4 py-2">
      {/* Chapter header */}
      {page.isFirstInChapter && (
        <h2 className="text-center text-amber-900 font-bold uppercase tracking-widest text-sm md:text-base mb-4 font-sans">
          {page.chapterTitle}
        </h2>
      )}

      {/* Illustration */}
      {page.image && (
        <div className="flex justify-center mb-4">
          <img
            src={page.image}
            alt=""
            className="max-h-48 rounded-lg shadow-md object-cover"
          />
        </div>
      )}

      {/* Text */}
      <div className={`flex-1 font-serif text-gray-800 text-justify ${fontSizeClasses[fontSize]}`}>
        {paragraphs.map((para, i) => (
          <p key={i} className={i < paragraphs.length - 1 ? "mb-3" : ""}>
            {para}
          </p>
        ))}
      </div>

      {/* Page number */}
      <div className="text-center text-gray-400 text-xs font-sans mt-2 pt-1">
        {page.pageNumber}
      </div>
    </div>
  );
}
