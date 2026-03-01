# I-LIT Project Status — March 2026

## What This Is

A modernized replica of Savvas I-LIT, a reading intervention app for grades 4-8 struggling readers. Built with Next.js 15, TypeScript, Tailwind CSS v4, and Framer Motion. Deployed at https://ilit.vercel.app.

The goal is to replicate the *feel* and pedagogical structure of the original Savvas ClassView student experience — not pixel-perfect cloning, but faithful reproduction of interactions, content flow, and visual design.

## What Works

### Interactive Reader (IR) — The Core Product
The primary learning experience. Students read nonfiction passages with embedded comprehension checkpoints.

| Feature | Status | Notes |
|---------|--------|-------|
| Reading slides with passage text | Working | Vocab words highlighted, tap-to-define |
| Highlight checkpoints | Working | Yellow/pink markers, eraser, 2 attempts, scoring |
| Drag-and-drop checkpoints | Working | Fill-in-blank with draggable answer tiles |
| Multiple choice checkpoints | Working | Used in 1 passage (hidden-ads) |
| Text answer checkpoints | Component exists | No passage content uses it yet |
| Summary writing with rubric feedback | Working | Rubric bars, section scores, quality checks |
| Vocabulary popups | Working | 33 words across 7 passages, 5 with images |
| Slide-by-slide navigation | Working | Freeze/unfreeze gating (checkpoints must be answered) |
| Passage backgrounds | Partial | 3 of 7 passages have background images |
| Audio/TTS for passages | Working | Browser speechSynthesis API |
| Scoring & leveling | Working | L1/L2/L3 adaptive leveling stored in localStorage |

### eBook Reader — Digital Library
Two-page spread reader for leveled texts.

| Feature | Status | Notes |
|---------|--------|-------|
| Two-page spread layout | Working | Wooden frame, cyan border, page turning |
| TextHelp popup (word click) | Working | Speak, Translate, Notes, Copy |
| Annotation pen (4 colors) | Working | Cyan, magenta, green + strikethrough |
| Collected highlights panel | Working | Grouped by color |
| Font resize | Working | Aa button |
| Translation dropdown | Working | 100+ languages via Google Translate widget |
| Table of Contents panel | Working | Chapter list + Book Notes tab |
| Accessibility panel | Working | Screen mask, keyboard nav instructions |
| Page slider | Working | Bottom navigation with page numbers |
| 27 books with full content | Working | Pre-converted from Savvas CDN |
| 1,493 books in catalog | Working | On-demand loading via API proxy to Savvas CDN |
| SVG book covers | Working | Generated for all 1,493 catalog entries |

### Dashboard — 5-Tab Interface

| Tab | Status | Notes |
|-----|--------|-------|
| Library | Working | 3D carousel, book detail panel, filters |
| Assignments | Working | 7 category accordion, links to IR passages |
| Notebook | Working | 5 sub-tabs, full-viewport spiral notebook |
| Connect | Working | Comments feed, star display |
| Review | Working | Book review modal |

### Infrastructure

| Feature | Status | Notes |
|---------|--------|-------|
| localStorage persistence | Working | Progress, journal, notes, vocab, highlights |
| LTI 1.3 integration | Code exists | OIDC login, AGS grades — untested with real LMS |
| Vercel deployment | Working | Production at ilit.vercel.app |
| On-demand book loading | Working | API route fetches from Savvas CDN, Vercel edge cache |

## What's Honestly Missing or Broken

### Content Gaps (HIGH impact — affects demo quality)

1. **Only 3 of 7 IR passages have background images.** The other 4 show a plain dark background. Passages without backgrounds: cell-phones, having-friends, mentors, the-power-to-move.

2. **Cell Phones passage is a stub.** Only 2 slides (1 reading + 1 checkpoint) vs the typical 8-14 slides. It's listed in Assignments and launchable but obviously incomplete.

3. **No text-answer checkpoint in any passage.** The TextAnswerCheckpoint component exists and works, but zero passages actually use it. The original I-LIT has text-answer checkpoints.

4. **28 of 33 vocabulary words have no image.** Only 5 words (all from bomb-dogs) have images. The VocabPopup renders a placeholder when no image exists.

5. **Having-Friends and Cell-Phones passages have no summary slide.** Students reach the end without a summary writing exercise.

6. **Only 7 IR passages total.** The original I-LIT has dozens per grade band. Our 7 are all grade 4-5 level.

### Visual/UI Gaps (MEDIUM impact)

7. **Notebook tabs don't have the exact colored-tab styling from the original.** The spiral binding and paper texture are close but the colored right-edge tabs are simplified.

8. **No fingerprint unlock animation on notebook.** Original has a biometric scanner flourish when opening the notebook for the first time.

9. **Assignment categories don't link to non-IR content.** Study Plan, iPractice, Writing, etc. show items but clicking them does nothing — there's no content behind those categories.

10. **Review tab shows static placeholder.** "No books available for review" always — the review flow isn't wired to completed books.

11. **Connect tab stars are decorative.** The star count and comments feed render but aren't connected to any teacher workflow.

### Functional Gaps (LOW impact for demo, HIGH for production)

12. **No student authentication.** Anyone can access the app. There's no login, no student identity. localStorage uses a hardcoded "Student" name.

13. **LTI integration is untested.** The OIDC login, resource launch, and grade passback routes exist but have never been tested against a real LMS (Canvas, Blackboard, etc.).

14. **No teacher interface.** The original I-LIT has a full teacher dashboard for assigning content, viewing scores, sending comments/stars. We have none of this.

15. **No Word Study slides.** The original has 9 word study types (phonics, word sort, word families, syllables, etc.). We have zero.

16. **No Fluent Reading System (FRS).** The original has fill-in-blank dropdown exercises for fluency. We have none.

17. **Translation in TextHelp uses browser API only.** Works but quality varies. The original uses a more sophisticated translation service.

18. **No offline support.** The original I-LIT works offline (service worker + cached content). Our app requires network for everything.

## Content Inventory

### IR Passages (7 total)
| Passage | Slides | Checkpoint Types | Background | Summary | Vocab Words |
|---------|--------|-----------------|------------|---------|-------------|
| Bomb Dogs | 10 | highlight, drag-drop | Yes | Yes | 5 (all have images) |
| Turn It Down | 8 | drag-drop, highlight | Yes | Yes | 5 |
| Hidden Ads | 10 | multiple-choice, highlight | Yes | Yes | 5 |
| The Power to Move | 13 | highlight (x4) | **No** | Yes | 5 |
| Mentors Make a Difference | 10 | highlight (x3) | **No** | Yes | 5 |
| Having Friends, Making Choices | 14 | highlight (x5) | **No** | No | 5 |
| Cell Phones (STUB) | 2 | highlight | **No** | No | 3 |

### Books (27 pre-converted, 1,493 in catalog)
All 27 pre-converted books load instantly from static JSON. The remaining 1,466 load on-demand from the Savvas CDN via our API proxy (cached at Vercel edge after first load).

### Vocabulary (33 words)
5 per passage (except Cell Phones: 3). Only 5 words have images (all from bomb-dogs passage — handler, brand, decibel, frequency, sponsor). The images are in `/public/images/covers/` alongside book covers.

## Architecture

```
App Routes (15)
├── / (landing)
├── /dashboard/ (5 tabs)
│   ├── library/ (carousel + detail)
│   ├── assignments/ (accordion + IR links)
│   ├── notebook/ (5 sub-tabs)
│   ├── connect/ (comments + stars)
│   └── review/ (book review modal)
├── /interactive/[passageId]/ (IR player)
├── /reader/[bookId]/ (eBook reader)
└── /api/ (LTI + book proxy)

Components (18)
├── interactive/ (9: Shell, Reading, Checkpoint, DragDrop, Highlight, MC, TextAnswer, Summary, VocabPopup)
└── reader/ (9: Shell, BookPage, Toolbar, TextHelp, TOC, Accessibility, PageSlider, CollectedHighlights, types)

Content (static JSON)
├── 7 IR passages (815 lines total)
├── 27 books with content + 1,493 catalog entries
├── 33 vocabulary words
└── Assignment metadata, categories, skills taxonomy
```

## Completed GitHub Issues (47 closed)
See `gh issue list --state closed` for the full list. Key milestones:
- All 5 dashboard tabs implemented (#25-27, #30-31)
- All 5 eBook reader features (#16-19, #29)
- All 5 IR checkpoint types (#20-22, #28, #32)
- Progress tracking (#33)
- Library carousel with 1,493 books
- On-demand book loading from Savvas CDN

## Open Issues (3)
- **#51** — Content gaps: passage backgrounds, vocabulary images, Cell Phones stub
- **#41** — Notebook: sidebar and toolbar styling refinements
- **#1** — LTI integration plan (planning only, not started)
