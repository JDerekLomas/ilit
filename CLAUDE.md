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

Multiple Claude Code windows work on this project simultaneously via cmux.
GitHub Issues is the shared task board. Each issue maps to a specific page file.

### Before starting work
1. Run `gh issue list --repo JDerekLomas/ilit --state open` to see what's available
2. Pick an issue that does NOT have the `wip` label
3. Claim it: `gh issue edit N --add-label wip`
4. Comment on the issue with what you're about to do

### While working
- Commit directly to main — each issue touches a different file, so no conflicts
- If you need to touch a shared file (types.ts, layout.tsx), check `git diff HEAD` first
- Reference screenshots are in `docs/screenshots/` — check them before and after

### When done
1. Commit and push to main
2. Deploy: `vercel --prod --yes`
3. Remove wip label: `gh issue edit N --remove-label wip`
4. Close the issue: `gh issue close N`
5. Comment with what was done and the deploy URL

### Current open issues
- **#4** Library carousel density — `app/dashboard/library/page.tsx` (HIGH)
- **#11** Notebook skeuomorphic redesign — `app/dashboard/notebook/page.tsx` (MEDIUM)
- **#12** Connect tab polish — `app/dashboard/connect/page.tsx` (LOW)
- **#14** Assignments particle effect — `app/dashboard/assignments/page.tsx` (LOW)
- **#1** LTI integration plan (PLANNING — don't start yet)

## Design Philosophy

We're replicating the *feel* of I-LIT, not pixel-perfect cloning. Key principles:
- Skeuomorphic where the original is skeuomorphic (notebook, bookshelf)
- Dark UI for immersive reading experiences
- Vibrant gradients for navigation/dashboard screens
- Large touch targets — this is a tablet-first app for kids
- Content is different (our own book covers, passages) but the *structure* and *interactions* should match
