# Savvas I-LIT Reference Source Files

Actual HTML, CSS, and JavaScript extracted from the production Savvas I-LIT app (`production.classviewapi.com`) using Chrome DevTools network panel.

## How These Were Captured

1. Logged into the Savvas I-LIT student app via Chrome DevTools MCP
2. Navigated to each tab (Library, Notebook, Assignments, Connect)
3. Downloaded each page's HTML template, CSS, and JS via `get_network_request`
4. Saved locally for reference

## File Inventory

### HTML Templates
| File | Size | Description |
|------|------|-------------|
| `library.html` | 51KB | Library carousel with 3D bookshelf, filter tabs, book detail pane |
| `notebook.html` | 99KB | Spiral-bound notebook with 5 tab panes (Journal, Word Bank, Class Notes, My Work, Resources) |
| `assignment.html` | 193KB | Assignment categories with expandable sections, badge counts |

### CSS
| File | Size | Description |
|------|------|-------------|
| `css/library.css` | 93KB | Library layout, carousel positioning, book detail, filter buttons |
| `css/library_dev.css` | 22KB | Library development overrides |
| `css/library.3dflow.css` | 621B | 3D CSS transform definitions for carousel flow |
| `css/ILITBookShelfRounder.css` | 3.3KB | Bookshelf rounding/perspective effects |
| `css/notebook.css` | 151KB | Full notebook styling — spiral rings, paper lines, colored tabs, sidebar |
| `css/notebook_dev.css` | 11KB | Notebook development overrides |
| `css/assignments.css` | 143KB | Assignment cards, gradient backgrounds, category badges |
| `css/assignments_dev.css` | 75KB | Assignment development overrides |
| `css/style.css` | 59KB | Global styles — bottom nav, dialog modals, common elements |

### JavaScript
| File | Size | Description |
|------|------|-------------|
| `js/ilit_book_shelf_rounder.js` | 36KB | 3D carousel transform logic — touch/drag, perspective, rotation math |
| `js/ilit_flatbook_shelf_rounder.js` | 10KB | Flat (non-3D) carousel variant |
| `js/libraryview.js` | 204KB | Library view controller — book loading, filtering, carousel init, detail pane |
| `js/application.js` | 10KB | App framework — tab switching, iframe communication, session management |
| `js/student.js` | 74KB | Main student app framework, login, tab switching, session management |
| `js/assignments.js` | 1.3MB | Assignments view controller, accordion behavior, category management |
| `js/assignment_helper.js` | 7KB | Assignment helper utilities |
| `js/assignments_frs.js` | 154KB | Assignments FRS (Free Response Scoring) module |
| `js/constants.js` | 120KB | App constants and configuration |
| `js/util.js` | 62KB | Utility functions |
| `js/globals.js` | 496B | Global variables |
| `js/swipe.js` | 33KB | Touch/swipe interaction handling |
| `js/g4_library.js` | varies | Grade 4 library book data (from CloudFront CDN) |
| `js/grade_items.js` | varies | Grade items/assignment data (from CloudFront CDN) |

### Media Assets
| File | Size | Description |
|------|------|-------------|
| `media/bgnn.png` | 29KB | Library/page tiled dark background |
| `media/book_bg.jpg` | 41KB | Book shelf/carousel wood texture background |
| `media/bg2.png` | 3KB | Library detail area gradient |
| `media/bg3.jpg` | 509KB | Assignments/Connect constellation pattern background |
| `media/sprite.png` | 64KB | Global icon sprite sheet (all nav/toolbar icons) |
| `media/sprite3.png` | 26KB | Notebook tab label sprite sheet (vertical text) |
| `media/note_book.png` | 189KB | Notebook closed cover image |
| `media/finger_stamp.png` | 11KB | Notebook fingerprint scanner button |
| `media/notes_rgt_bg.png` | 2KB | Notebook spiral binding (repeat-y PNG) |
| `media/lading_page_bg.jpg` | 1KB | Notebook landing page background |
| `media/left_border.png` | 1KB | Library detail pane left border decoration |
| `media/right_border.png` | 1KB | Library detail pane right border decoration |
| `media/top_bg.png` | 1KB | Library detail pane top border decoration |
| `media/shadow_bg.png` | 1KB | Shadow effect image |

## How to Use

### When implementing a feature:
1. Read the corresponding HTML template to understand the DOM structure and class names
2. Read the CSS to understand the visual styling, animations, and layout
3. Read the JS to understand interactions, transitions, and state management
4. Adapt to our stack (React/Next.js/Tailwind) — don't copy jQuery patterns, translate the *visual result*

### Example: Implementing the notebook
```
1. Read notebook.html — find the spiral ring markup, tab structure, sidebar layout
2. Read css/notebook.css — find the spiral ring styling, paper line backgrounds, tab colors
3. Build React components that produce the same visual result using Tailwind + custom CSS
```

### Key CSS patterns to look for:
- **Spiral binding**: Search for `spiral`, `ring`, `coil` in notebook.css
- **Paper lines**: Search for `repeating-linear-gradient` or `background-image` in notebook.css
- **3D carousel**: The transforms in `ilit_book_shelf_rounder.js` + `library.3dflow.css`
- **Gradient backgrounds**: Search for `gradient` in assignments.css and style.css
- **Tab colors**: Search for tab-related class names in notebook.css

## Notes

- The original app is built with jQuery + jQuery UI on a .NET backend
- Each tab loads in an iframe — the HTML files are self-contained page templates
- CSS files use `_dev.css` suffixes for development/device-specific overrides
- The `libraryview.js` (204KB) contains a lot of business logic mixed with UI — focus on the UI rendering parts
- All files were captured on 2026-02-28 from the production deployment
