/**
 * localStorage persistence layer for student data.
 * All reads/writes are synchronous since localStorage is synchronous.
 * Gracefully degrades if localStorage is unavailable (SSR, private browsing).
 */

import type { StudentProgress, BookReview, Highlight } from "./types";

const STORAGE_KEY = "ilit-student-data";

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  date: string; // ISO string
}

export interface ClassNote {
  id: string;
  title: string;
  body: string;
  date: string;
}

export interface SavedWord {
  word: string;
  definition: string;
  exampleSentence: string;
  passageId: string;
  dateAdded: string;
}

export interface StudentData {
  progress: StudentProgress;
  journalEntries: JournalEntry[];
  classNotes: ClassNote[];
  savedWords: SavedWord[];
  completedAssignments: string[]; // assignment item IDs
}

const DEFAULT_DATA: StudentData = {
  progress: {
    studentName: "Student",
    currentLexile: 900,
    totalWords: 8404,
    totalPages: 30,
    totalBooks: 0,
    completedPassages: [],
    bookProgress: {},
    highlights: {},
    bookReviews: {},
  },
  journalEntries: [
    {
      id: "default-1",
      title: "Because of Winn-Dixie",
      body: "Today I started reading Because of Winn-Dixie. The main character Opal found a dog in a grocery store. I think this book will be about friendship.",
      date: new Date().toISOString(),
    },
  ],
  classNotes: [],
  savedWords: [],
  completedAssignments: [],
};

function isLocalStorageAvailable(): boolean {
  try {
    const test = "__ilit_test__";
    localStorage.setItem(test, "1");
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function loadStudentData(): StudentData {
  if (!isLocalStorageAvailable()) return { ...DEFAULT_DATA };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };
    const parsed = JSON.parse(raw) as Partial<StudentData>;
    // Merge with defaults for forward-compatibility
    return {
      ...DEFAULT_DATA,
      ...parsed,
      progress: { ...DEFAULT_DATA.progress, ...parsed.progress },
    };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

export function saveStudentData(data: StudentData): void {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded — fail silently
  }
}

// Convenience helpers

export function addJournalEntry(entry: Omit<JournalEntry, "id" | "date">): StudentData {
  const data = loadStudentData();
  data.journalEntries.unshift({
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  });
  saveStudentData(data);
  return data;
}

export function updateJournalEntry(id: string, updates: Partial<Pick<JournalEntry, "title" | "body">>): StudentData {
  const data = loadStudentData();
  const entry = data.journalEntries.find((e) => e.id === id);
  if (entry) {
    if (updates.title !== undefined) entry.title = updates.title;
    if (updates.body !== undefined) entry.body = updates.body;
    saveStudentData(data);
  }
  return data;
}

export function deleteJournalEntry(id: string): StudentData {
  const data = loadStudentData();
  data.journalEntries = data.journalEntries.filter((e) => e.id !== id);
  saveStudentData(data);
  return data;
}

export function addSavedWord(word: Omit<SavedWord, "dateAdded">): StudentData {
  const data = loadStudentData();
  // Avoid duplicates
  if (!data.savedWords.some((w) => w.word === word.word)) {
    data.savedWords.unshift({ ...word, dateAdded: new Date().toISOString() });
    saveStudentData(data);
  }
  return data;
}

export function removeSavedWord(word: string): StudentData {
  const data = loadStudentData();
  data.savedWords = data.savedWords.filter((w) => w.word !== word);
  saveStudentData(data);
  return data;
}

export function toggleAssignmentComplete(itemId: string): StudentData {
  const data = loadStudentData();
  const idx = data.completedAssignments.indexOf(itemId);
  if (idx >= 0) {
    data.completedAssignments.splice(idx, 1);
  } else {
    data.completedAssignments.push(itemId);
  }
  saveStudentData(data);
  return data;
}

export function markPassageComplete(passageId: string): StudentData {
  const data = loadStudentData();
  if (!data.progress.completedPassages.includes(passageId)) {
    data.progress.completedPassages.push(passageId);
    saveStudentData(data);
  }
  return data;
}
