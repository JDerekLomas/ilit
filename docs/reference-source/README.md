# Savvas I-LIT / ClassView Reference Source

Full source code from the ClassView repository (the Savvas I-LIT platform). Cherry-picked files relevant to the student-facing app.

The complete unzipped repository is at `~/classview/` (2.1GB) for deep dives. This directory contains only the files we actively reference.

## File Inventory

### HTML Templates (`html/`)
| File | Lines | Description |
|------|-------|-------------|
| `student.html` | — | Main student app shell (outer frame, loads tabs via iframe) |
| `library.html` | 935 | Library carousel with 3D bookshelf, filter tabs, book detail pane |
| `notebook.html` | 2257 | Spiral-bound notebook with 5 tab panes (Journal, Word Bank, Class Notes, My Work, Resources) |
| `assignment.html` | 4595 | Assignment categories with expandable sections, badge counts |
| `connect.html` | 662 | Teacher communication + stars |
| `book_review.html` | 326 | Book review modal |
| `student-connect.html` | — | Student connect variant |
| `student_dashboard.html` | 62 | Dashboard shell |

### CSS (`css/`)
| File | Lines | Description |
|------|-------|-------------|
| `global-style.css` | — | Global styles (bottom nav, dialogs, common elements) |
| `library.css` | 1357 | Library layout, carousel, book detail, filter buttons |
| `library_dev.css` | — | Library device-specific overrides |
| `library.3dflow.css` | — | 3D CSS transforms for carousel |
| `ILITBookShelfRounder.css` | 138 | Bookshelf rounding/perspective |
| `notebook.css` | 2055 | Full notebook — spiral rings, paper lines, colored tabs, sidebar |
| `notebook_dev.css` | — | Notebook device overrides |
| `assignments.css` | 2235 | Assignment cards, gradients, category badges |
| `assignments_dev.css` | — | Assignment device overrides |
| `ebookplayer.css` | 863 | eBook reader styles |
| `ebookplayer_dev.css` | — | eBook reader device overrides |
| `book_review.css` | 191 | Book review modal |
| `connect_dev.css` | — | Connect tab device overrides |
| `idangerous.swiper.css` | 119 | Swiper carousel library |
| `idangerous.swiper.3dflow.css` | 54 | Swiper 3D flow |
| `pop-up.css` | — | Modal/popup styles |

### JavaScript (`js/`)
| File | Lines | Description |
|------|-------|-------------|
| `application.js` | 267 | App framework — tab switching, iframe communication |
| `libraryview.js` | 4837 | Library view controller — book loading, filtering, carousel |
| `ilit_book_shelf_rounder.js` | — | 3D carousel transform logic |
| `fetchbooklist.js` | 15187 | Book data fetching and management |
| `notebook.js` | 5331 | Notebook controller — journal entries, word bank, tabs |
| `assignments.js` | 36206 | Assignments view — categories, accordion, status tracking |
| `book_review.js` | 1004 | Book review logic |
| `connect.js` | 2089 | Teacher communication + stars |
| `dashboard.js` | 30 | Dashboard init |
| `constants.js` | — | App constants and configuration |
| `globals.js` | — | Global variables |
| `custom_mvc.js` | — | MVC framework |

### Media Assets (`media/`)
Key background images, notebook textures, and UI elements. See files directly.

### eBook Player (`ebookplayer/`)
The two-page-spread book reader: `PlayerTemp.html`, core CSS, and scripts.

## Full Source Location

The complete ClassView repo (all services) is at:
```
~/classview/
├── Webclient/          # Student + instructor web apps (34MB)
│   └── App/            # All student app files (this is where we cherry-picked from)
├── CMS/                # Django CMS backend (29MB)
├── WebAPI_Services/    # .NET API services (37MB)
├── Graphics/           # Design assets (1.1GB)
├── AppZips/            # Packaged builds (403MB)
└── ...
```

For files not in this cherry-pick (e.g., `assignments_frs.js`, extra media), look in `~/classview/Webclient/App/`.

## How to Use

1. Read the HTML to understand DOM structure and class names
2. Read the CSS for visual styling, animations, and layout
3. Read the JS for interactions, state management, and transitions
4. Adapt to our stack (React/Next.js/Tailwind) — translate the *visual result*, not jQuery patterns

### Key patterns:
- **Spiral binding**: `notes_rgt_bg.png` repeat-y + CSS in `notebook.css`
- **Paper lines**: `repeating-linear-gradient` in `notebook.css`
- **3D carousel**: Transforms in `ilit_book_shelf_rounder.js` + `library.3dflow.css`
- **Gradient backgrounds**: `assignments.css` and `global-style.css`
- **Tab colors**: Tab class names in `notebook.css`

## Notes

- Built with jQuery + jQuery UI on a .NET backend
- Each tab loads in an iframe — HTML files are self-contained page templates
- `_dev.css` suffixes are device-specific overrides (iPad, Chrome, etc.)
- Original captured from `production.classviewapi.com`
