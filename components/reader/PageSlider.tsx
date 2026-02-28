"use client";

interface Props {
  currentPage: number;
  totalPages: number;
  isWide: boolean;
  onChange: (page: number) => void;
}

export default function PageSlider({
  currentPage,
  totalPages,
  isWide,
  onChange,
}: Props) {
  const leftPageNum = currentPage + 1;
  const rightPageNum = isWide ? Math.min(currentPage + 2, totalPages) : null;

  const pageLabel =
    rightPageNum && rightPageNum !== leftPageNum
      ? `${leftPageNum}-${rightPageNum}`
      : `${leftPageNum}`;

  return (
    <div className="relative px-4 md:px-8 py-3 border-t border-amber-200/30">
      <input
        type="range"
        min={0}
        max={totalPages - 1}
        value={currentPage}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 appearance-none bg-amber-300/50 rounded-full cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-amber-700
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-5
          [&::-moz-range-thumb]:h-5
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-amber-700
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:shadow-md
          [&::-moz-range-thumb]:cursor-pointer"
      />
      {/* Floating page pill */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 px-3 py-0.5 bg-stone-700 text-white text-xs font-sans rounded-full shadow-md">
        {pageLabel}
      </div>
    </div>
  );
}
