# I-LIT Project

Modernized reading intervention app inspired by Savvas I-LIT. Target: grades 4-8 struggling readers.

## Stack
- Next.js 15 + App Router, TypeScript, Tailwind CSS v4, Framer Motion
- Static content (no AI API calls) — all passages, books, vocabulary are in `content/`
- Deploy: `vercel --prod` (always safe, no confirmation needed)
- Type check before deploy: `npx tsc --noEmit`

## Project Structure
```
app/
  dashboard/        — Main student view (tabbed: library, assignments, notebook, connect, review)
    layout.tsx      — Shared bottom nav bar
    library/        — Book carousel + detail
    assignments/    — Assignment categories with badges
    notebook/       — Student journal/notes
    connect/        — Teacher communication + stars
    review/         — Book reviews
  interactive/      — Interactive Reader (IR) passages
  reader/           — eBook reader (two-page spread)
components/
  interactive/      — IR slide components (reading, checkpoints, drag-drop, etc.)
  reader/           — Book reader components
content/
  books/            — Book data (JSON)
  passages/         — IR passage data (JSON)
  vocabulary/       — Vocabulary definitions
lib/
  types.ts          — Shared TypeScript types
```

## Reference Material

### Screenshots (`docs/screenshots/`)
- **Savvas originals**: `library-main.png`, `assignments-*.png`, `notebook-*.png`, `connect-tab.png`, `interactive-reader-bombdogs-slide*.png`, `book-reader-*.png`
- **Our current build**: `docs/screenshots/current/*.png`
- **Comparison HTML**: `docs/screenshots/compare.html`

### Source Code (`docs/reference-source/`)
Actual HTML/CSS/JS extracted from the production Savvas I-LIT app. Use these to understand *how* the original implements features:

- **Library**: `library.html`, `css/library.css`, `css/library.3dflow.css`, `css/ILITBookShelfRounder.css`, `js/ilit_book_shelf_rounder.js`
- **Notebook**: `notebook.html`, `css/notebook.css` (151KB — the spiral-bound skeuomorphic design)
- **Assignments**: `assignment.html`, `css/assignments.css`
- **Global**: `css/style.css`, `js/application.js`

Read these files before implementing a feature to match the original's behavior and visual design.

## Visual Comparison Workflow

Use the `/compare` skill to run the full loop:
1. Screenshot reference app via Chrome DevTools
2. Extract source files from network requests
3. Screenshot our deployed replica
4. Vision-compare both sets of images
5. File gaps as GitHub issues

To take fresh replica screenshots manually:
```bash
node scripts/visual-compare.mjs --url https://ilit-xyz.vercel.app
```

## Coordination (Multi-Window)

Multiple Claude Code windows may work on this project simultaneously.

- **Check open issues first**: `gh issue list` — see what needs doing and what's claimed
- **Claim before starting**: Comment "claiming this" on the issue, or self-assign
- **Branch per issue**: `git checkout -b issue/11-notebook-redesign` — don't commit directly to main when other windows are active
- **PR when done**: Push branch, create PR, reference the issue number
- **Verify after fixing**: Deploy and re-screenshot to confirm the visual gap is closed
- **Don't duplicate work**: If an issue already has a recent comment or assignee, pick a different one

## Design Philosophy

We're replicating the *feel* of I-LIT, not pixel-perfect cloning. Key principles:
- Skeuomorphic where the original is skeuomorphic (notebook, bookshelf)
- Dark UI for immersive reading experiences
- Vibrant gradients for navigation/dashboard screens
- Large touch targets — this is a tablet-first app for kids
- Content is different (our own book covers, passages) but the *structure* and *interactions* should match
