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

  const label =
    rightPageNum && rightPageNum !== leftPageNum
      ? `Pages ${leftPageNum}–${rightPageNum}`
      : `Page ${leftPageNum}`;

  return (
    <div className="flex items-center gap-3 px-4 md:px-16 py-2 border-t border-amber-200/40">
      <span className="text-xs text-amber-800/70 font-sans whitespace-nowrap min-w-[5rem]">
        {label}
      </span>
      <input
        type="range"
        min={0}
        max={totalPages - 1}
        value={currentPage}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 appearance-none bg-amber-200 rounded-full cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-amber-700
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-amber-700
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:shadow-md
          [&::-moz-range-thumb]:cursor-pointer"
      />
      <span className="text-xs text-amber-800/70 font-sans whitespace-nowrap">
        of {totalPages}
      </span>
    </div>
  );
}
