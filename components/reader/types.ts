export interface FlatPage {
  pageNumber: number;
  text: string;
  image?: string;
  chapterTitle: string;
  isFirstInChapter: boolean;
}

/** Annotation color applied by the annotation pen (not the TextHelp yellow selection highlight) */
export type AnnotationColor = "cyan" | "magenta" | "green" | "strike";

/** Key: "paraIndex:wordIndex" (word tokens only, not space tokens) */
export type PageAnnotations = Record<string, AnnotationColor>;

/** Key: pageNumber (as string) */
export type BookAnnotations = Record<string, PageAnnotations>;
