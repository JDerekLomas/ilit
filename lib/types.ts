// ── Interactive Reader ──

export interface Passage {
  id: string;
  title: string;
  author: string;
  lexileLevel: number;
  backgroundImage: string;
  slides: Slide[];
}

export interface Slide {
  type: "reading" | "checkpoint" | "summary";
  /** Section heading shown above text (e.g., "Finding Explosives") */
  heading?: string;
  /** Per-slide background image (overrides passage-level backgroundImage) */
  backgroundImage?: string;
  /** The passage text for this slide */
  text?: string;
  /** Pre-split sentences for highlight checkpoints — UI needs sentence boundaries */
  sentences?: string[];
  /** Sentence indices where new paragraphs begin (for rendering paragraph breaks in highlight checkpoints) */
  paragraphBreaks?: number[];
  /** Checkpoint data (only for type: "checkpoint") */
  checkpoint?: Checkpoint;
  /** Summary instructions (only for type: "summary") */
  summaryPrompt?: string;
  /** Key concepts the student should include in their summary */
  expectedKeyConcepts?: string[];
}

export interface Checkpoint {
  type: "highlight" | "drag-drop" | "multiple-choice";
  /** Reading skill being assessed (e.g., "Make Inferences", "Main Idea") */
  skill: string;
  /** The question/instruction prompt */
  prompt: string;
  /** Correct answer — sentence text for highlight, word(s) for drag-drop, letter for MC */
  correctAnswer: string | string[];
  /** Draggable options for drag-drop, answer choices for MC */
  options?: string[];
  /** Fill-in-the-blank template for drag-drop (use ___ for blanks) */
  template?: string;
  /** Explanatory context shown above drag-drop exercises */
  contextText?: string;
  feedback: {
    correct: string;
    incorrect: string;
  };
}

// ── Digital Library ──

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  lexileLevel: number;
  genre: string;
  /** Short description for library card display */
  summary: string;
  totalPages: number;
  chapters: Chapter[];
}

export interface Chapter {
  title: string;
  pages: BookPage[];
}

export interface BookPage {
  pageNumber: number;
  text: string;
  image?: string;
}

// ── Vocabulary ──

export interface VocabularyWord {
  word: string;
  definition: string;
  exampleSentence: string;
  wordParts?: {
    base: string;
    affix?: string;
    affixType?: "prefix" | "suffix";
    result: string;
  };
  image?: string;
  /** Which passage this word belongs to */
  passageId: string;
}

// ── Student Progress ──

export interface CheckpointScore {
  slideIndex: number;
  type: "highlight" | "drag-drop" | "multiple-choice";
  score: number;
  maxScore: number;
  attempts: number;
}

export interface PassageProgress {
  passageId: string;
  completedSlides: number[];
  checkpointScores: CheckpointScore[];
  summarySubmitted: boolean;
  totalScore: number;
  maxPossibleScore: number;
  completedAt?: string; // ISO string
}

export interface StudentProgress {
  studentName: string;
  currentLexile: number;
  totalWords: number;
  totalPages: number;
  totalBooks: number;
  completedPassages: string[];
  passageProgress: Record<string, PassageProgress>; // passageId -> progress
  bookProgress: Record<string, number>; // bookId -> last page
  highlights: Record<string, Highlight[]>;
  bookReviews: Record<string, BookReview>;
}

export interface Highlight {
  pageNumber: number;
  text: string;
  color: "yellow" | "pink" | "cyan" | "green";
}

export interface BookReview {
  bookId: string;
  rating: number;
  text: string;
  date: string;
}
