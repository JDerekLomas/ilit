# Interaction & Animation Inventory

Comparison of original Savvas I-LIT interactions vs our replica.
Use this as a punch list when polishing each feature.

---

## 1. Notebook

### Original Behavior
| Interaction | What Happens | Timing |
|-------------|-------------|--------|
| Tap fingerprint | Instant view swap — locked cover replaced by open notebook DOM | Instant |
| Tab switching | Left sidebar accordion: `slideUp`/`slideDown` on unit groups | 200ms jQuery "fast" |
| Loading tab data | Overlay with `loader.gif`, parent dims to opacity 0.9 | Until API responds (2s timeout) |
| Content fade-in | Tab content fades from opacity 0→1 | ~300ms (browser default) |
| Save/delete | jQuery UI modal dialog with `transition: all 0.3s` on overlay | 300ms |

### Our Replica
| Interaction | Status | Notes |
|-------------|--------|-------|
| Fingerprint unlock | Done | Green glow + 600ms delay, sessionStorage persistence |
| Tab switching | Done | Instant swap (no accordion animation) |
| Loading states | Missing | No loading overlay or spinner between tabs |
| Content fade-in | Missing | Content appears instantly, no fade |
| Save feedback | Partial | Debounced autosave, no modal confirmation |

### Gaps to Close
- [ ] Add `motion.div` fade-in (opacity 0→1, 300ms) when tab content renders
- [ ] Add slide animation on sidebar accordion (Journal entry list, My Work units)
- [ ] Add brief loading shimmer when switching to tabs that fetch data

---

## 2. Library / Book Carousel

### Original Behavior
| Interaction | What Happens | Timing |
|-------------|-------------|--------|
| Carousel rotation | `requestAnimationFrame` loop at 60fps, easeInOutSine positioning | Continuous |
| 3D transforms | `translateZ(-5*distance)`, z-index scales from 500 center outward | Per frame |
| Touch/swipe | `touchstart`→`touchmove`→`touchend`, snaps to nearest book | 300px min swipe |
| Arrow buttons | Dim to opacity 0.5 at carousel bounds | Instant |
| Book selection | Center book gets highest z-index, stats panel fades in | 500ms fadeIn |
| Book popup/detail | Modal with `.md-overlay` fade, content opacity 0→1 | 300ms CSS transition |
| No-book message | Fades in when filter returns empty | 1000ms fadeIn |
| Search dropdown | Slides up/down on toggle | 200ms |
| Grid view images | jQuery lazyload with fadeIn effect | On scroll |
| Stats title delay | Book name/author updates after search | 450ms setTimeout |

### Our Replica
| Interaction | Status | Notes |
|-------------|--------|-------|
| Horizontal carousel | Done | CSS `transition-all duration-300`, no 3D transforms |
| Touch/swipe | Done | 50px threshold |
| Keyboard nav | Done | Arrow keys |
| Book selection | Done | Scale + brightness change, white border |
| Book detail panel | Done | Static layout, no fade-in |
| Search bar | Done | Toggle open/close |
| Filter buttons | Done | Active state highlighting |
| Arrow dimming at bounds | Missing | Arrows don't dim at ends |

### Gaps to Close
- [ ] Add z-depth to carousel: center book closer (`translateZ`), side books recede
- [ ] Dim left/right arrows at carousel bounds (opacity 0.5)
- [ ] Fade-in on book detail panel when selection changes (300ms opacity)
- [ ] Add stats panel fade-in (500ms) when new book centered
- [ ] Consider 3D perspective on carousel container for depth effect
- [ ] Add "no books found" fade-in state for empty filter results

---

## 3. Interactive Reader

### Original Behavior
| Interaction | What Happens | Timing |
|-------------|-------------|--------|
| Slide transitions | Swipe.js parallax engine, continuous:false | 1200ms per slide |
| Right panel (checkpoint) | Animates from `left:-200px, opacity:0` to `left:0, opacity:1` | 400ms jQuery animate |
| Pagination dots | Active dot highlighted, updates per slide | Instant |
| Next/Prev disabled | `.dimmed` class when frozen (checkpoint incomplete) | Instant |
| Wrong answer (DnD) | 5-second loading overlay before showing fail feedback | 5000ms setTimeout |
| Correct answer reveal | DOM replacement with highlighted spans (yellow/red) | Instant |
| "Done" button | Background changes to green, text changes to "Done" | Instant |
| Audio pause on slide | TTS pauses when slide transition starts | On transition start |

### Our Replica
| Interaction | Status | Notes |
|-------------|--------|-------|
| Slide transitions | Done | Framer Motion X±100px, 0.3s ease-in-out |
| Background image | Done | Brightness transitions (0.3-0.6) per slide type |
| Dot navigation | Done | Scale up on active (150%) |
| Audio/TTS | Done | Play/pause, progress bar, speechSynthesis |
| DnD checkpoint | Done | Shake animation (0.5s), snap success, spring checkmark |
| Highlight checkpoint | Done | Yellow/pink markers, gold border on correct |
| Multiple choice | Done | Staggered spring-in, hover scale, green/red results |
| Next/Prev disabled | Done | Disabled at bounds |
| Vocab popup | Done | Opens on word click, positioned near word |

### Gaps to Close
- [ ] Slow slide transition to 1200ms to match original (currently 300ms — feels fast)
- [ ] Add checkpoint panel slide-in from left (400ms) instead of instant render
- [ ] Add 5-second delay overlay before showing wrong-answer feedback on DnD/highlight
- [ ] Pause TTS on slide transition start
- [ ] Add "Done" state to final slide (green button, text change)

---

## 4. eBook Reader

### Original Behavior
| Interaction | What Happens | Timing |
|-------------|-------------|--------|
| Page navigation | Arrow click swaps page content | Instant (no page-turn animation) |
| Page slider | Drag to jump to page | Instant |
| TextHelp popup | Double-click word → yellow highlight + floating toolbar | Instant |
| Annotation pen | Click word → applies color highlight (persisted) | Instant |
| Font size (Aa) | Cycles through 3 sizes (body class swap) | Instant |
| TOC panel | Side panel slides in | jQuery show (instant) |
| Screen mask | Overlay at adjustable position | Drag to reposition |
| Translate dropdown | Select language, toggle translate mode | Instant |

### Our Replica
| Interaction | Status | Notes |
|-------------|--------|-------|
| Page navigation | Done | Framer Motion slide (X±60px, 0.25s) |
| Page slider | Done | Draggable, keyboard accessible |
| TextHelp popup | Done | Double-click → highlight + toolbar |
| Annotation pen | Done | Color dropdown, per-word persistence |
| Font size | Done | 3-size cycle with label |
| TTS | Done | speechSynthesis, rate 0.9 |
| TOC panel | Done | Side panel overlay |
| Screen mask | Done | Drag handle, 10-90% clamp |
| Translate menu | Done | 10 languages, toggle mode |
| Keyboard nav | Done | Arrows, ESC, A key for annotation |

### Gaps to Close
- [ ] Reader is actually quite complete — main gap is visual polish
- [ ] TextHelp toolbar could be more prominent (bigger buttons matching reference)
- [ ] Annotation color indicators on toolbar could match original sprite styling
- [ ] Collected highlights view (grouped by color) not implemented

---

## 5. Assignments Tab

### Original Behavior
| Interaction | What Happens | Timing |
|-------------|-------------|--------|
| Page load | `.wrapper` fades in from opacity 0→1 | 800ms jQuery animate |
| Category accordion | `slideUp`/`slideDown` on category expand/collapse | 200ms "fast" |
| Arrow rotation | Sprite position changes on expand | Instant |
| Loading overlay | `loader.gif` + semi-transparent white (opacity 0.5) | Until data loads |
| Swiper slides (IWT) | Parallax slide transitions | 1200ms |
| Header show/hide | Hidden in TOC view, shown in slide view | Instant |

### Our Replica
| Interaction | Status | Notes |
|-------------|--------|-------|
| Particle background | Done | Canvas-based animated network (40 particles, 60fps) — exceeds original |
| Category expansion | Done | Instant expand with rotate-90 arrow |
| Badges (red/green) | Done | Completion tracking, localStorage persistence |
| Sub-item checkboxes | Done | Toggle with strike-through |
| Clickable IR links | Done | Navigate to interactive reader |

### Gaps to Close
- [ ] Add page fade-in animation (800ms opacity 0→1) on initial load
- [ ] Add `slideDown`/`slideUp` animation on category expand (200ms) instead of instant toggle
- [ ] Arrow icon should animate rotation (not just snap)

---

## 6. Dashboard / Global

### Original Behavior
| Interaction | What Happens | Timing |
|-------------|-------------|--------|
| Tab navigation | Instant view switch | Instant |
| Active tab | White background indicator | Instant |
| Modal overlays | `rgba(0,0,0,0.4-0.8)` bg, content `translateX/Y(-50%)` center | 300ms CSS transition |
| Body dimming | Body opacity set to 0.3-0.5 during modals | Instant CSS change |
| Background | Constellation network gradient images (bg1-bg7) | Static |

### Our Replica
| Interaction | Status | Notes |
|-------------|--------|-------|
| Bottom nav | Done | Cyan underline indicator, icon fill on active |
| Tab switching | Done | Instant (same as original) |
| Background | Partial | CSS gradient, not using original constellation images |
| Connect page entry | Done | Framer Motion opacity fade (0.6s) |
| Review modal | Done | Full overlay + gold header |
| Star rating | Done | Hover preview, labels, gold highlight |
| Review tags | Done | Toggle selection, max 3, FIFO queue |

### Gaps to Close
- [ ] **Use original constellation background images** (bg1.jpg, bg3.jpg, bg5.jpg) instead of CSS gradient — this is the single biggest visual gap across the whole app
- [ ] Add page-transition fade (300ms opacity) when switching dashboard tabs
- [ ] Body dimming during modals (opacity 0.3-0.5 on parent)

---

## 7. Timing Reference

Quick reference for matching original animation durations:

| Duration | Used For |
|----------|----------|
| Instant | Tab nav, font size, annotations, page swap |
| 200ms | Accordion expand/collapse, search dropdown, category toggle |
| 300ms | Modal overlay fade, content fade-in, tab content appear |
| 400ms | IR checkpoint panel slide-in |
| 500ms | Stats panel fade-in, DnD shake animation |
| 600ms | (our fingerprint unlock — custom) |
| 800ms | Assignment page fade-in, connect refresh spin |
| 1000ms | "No books" message fade-in |
| 1200ms | Swiper/IR slide transitions |
| 2000ms | Book popup focus delay, loading overlay timeout |
| 5000ms | Wrong-answer delay before feedback |

---

## 8. Interaction Patterns We're Missing Entirely

These exist in the original but aren't implemented at all:

| Feature | What It Does | Priority |
|---------|-------------|----------|
| **Interest Inventory** | First-login survey, drag interests into 5 slots | Low |
| **Book Reserve system** | Reserve/remove books from reading list | Low |
| **Broadcast overlay** | Teacher locks student screen during live instruction | Low (needs LTI) |
| **Incremental save overlay** | Background save with spinner during writing | Medium |
| **Graphic organizers** | Venn diagram, timeline, cause-effect templates in notebook | Medium |
| **Collected highlights** | View all annotations grouped by color in reader | Medium |
| **Summary writing + feedback** | Write summary, get rubric-based feedback | High (issue #32) |
