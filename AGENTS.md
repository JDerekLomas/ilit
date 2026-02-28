# AGENTS.md — Multi-Agent Coordination

This file defines how multiple Claude Code agents work on I-LIT in parallel without conflicts.

## File Ownership Map

Each work stream owns specific files. Only touch files in your assigned stream. If you need to modify a shared file, check `git diff HEAD` first.

### Dashboard Tabs (one agent per tab)
| Stream | Owner Files | Spec |
|--------|-------------|------|
| Library | `app/dashboard/library/page.tsx` | `docs/reference-source/library-feature-spec.md` |
| Assignments | `app/dashboard/assignments/page.tsx` | `docs/reference-source/assignments-ux-spec.md` |
| Notebook | `app/dashboard/notebook/page.tsx` | `docs/reference-source/notebook-feature-spec.md` |
| Connect | `app/dashboard/connect/page.tsx` | `docs/reference-source/connect-spec.md` |
| Review | `app/dashboard/review/page.tsx` | `docs/reference-source/review-spec.md` |

### Readers (one agent per reader)
| Stream | Owner Files | Spec |
|--------|-------------|------|
| eBook Reader | `app/reader/[bookId]/page.tsx`, `components/reader/*.tsx` | `docs/reference-source/ebook-reader-spec.md` |
| Interactive Reader | `app/interactive/[passageId]/page.tsx`, `components/interactive/*.tsx` | `docs/reference-source/interactive-reader-spec.md` |

### Shared Files (coordinate before editing)
| File | Purpose | Risk |
|------|---------|------|
| `app/dashboard/layout.tsx` | Bottom nav bar, tab routing | HIGH — all dashboard tabs depend on this |
| `lib/types.ts` | Shared TypeScript types | HIGH — breaking changes affect all streams |
| `app/globals.css` | Global styles | MEDIUM — additive changes OK, avoid modifying existing rules |
| `content/books/*.json` | Book data | LOW — add new files freely, don't modify existing |
| `content/passages/*.json` | Passage data | LOW — add new files freely, don't modify existing |
| `content/vocabulary/*.json` | Vocabulary data | LOW — add new files freely, don't modify existing |

## Work Streams

### Stream 1: Dashboard Polish
Bring each of the 5 dashboard tabs to visual parity with the Savvas reference.

**Files**: `app/dashboard/{library,assignments,notebook,connect,review}/page.tsx`
**Specs**: Corresponding `*-spec.md` files in `docs/reference-source/`
**Approach**: Each tab is a self-contained page file. Agents work on separate tabs simultaneously with zero merge conflicts.

### Stream 2: eBook Reader
Build the two-page spread eBook reader with toolbar, annotations, TOC, and text interaction.

**Files**: `app/reader/[bookId]/page.tsx`, `components/reader/*.tsx`
**Spec**: `docs/reference-source/ebook-reader-spec.md`
**Approach**: Single agent owns this stream. Can create new component files in `components/reader/` freely.

### Stream 3: Interactive Reader
Build the slide-based interactive reading experience with checkpoints, drag-drop, highlighting, and summary writing.

**Files**: `app/interactive/[passageId]/page.tsx`, `components/interactive/*.tsx`
**Spec**: `docs/reference-source/interactive-reader-spec.md`
**Approach**: Single agent owns this stream. Can create new component files in `components/interactive/` freely.

### Stream 4: Content Authoring
Populate `content/` with book data, passages, and vocabulary.

**Files**: `content/**/*.json`
**Approach**: Additive only. Create new JSON files, never modify existing ones.

## Coordination Protocol

### Claiming Work
1. Check open issues: `gh issue list --repo JDerekLomas/ilit --state open`
2. Pick one without a `wip` label
3. Claim it: `gh issue edit N --add-label wip`
4. Comment what you're doing

### While Working
- Commit directly to `main` — file ownership prevents conflicts
- Before touching a shared file, run `git pull` and check `git diff HEAD`
- Read the relevant spec file before implementing
- Check `docs/screenshots/` for visual reference

### Finishing Work
1. `npx tsc --noEmit` — fix any type errors
2. Commit and push to `main`
3. Deploy: `vercel --prod --yes`
4. Remove label: `gh issue edit N --remove-label wip`
5. Close issue: `gh issue close N`
6. Comment with what was done + deploy URL

## Adding New Components

When a page file gets too large (>400 lines), extract components:

- Dashboard tab components go in `components/dashboard/{tabname}/`
- Reader components go in `components/reader/`
- Interactive components go in `components/interactive/`

New component files are owned by the stream that creates them. No coordination needed for new files in your own component directory.

## Adding New Types

If you need a new type in `lib/types.ts`:
1. `git pull` to get latest
2. Add your types at the bottom of the file (don't modify existing types)
3. Commit and push immediately (don't batch with other changes)

If you need to modify an existing type, comment on the relevant issue first and wait for confirmation.

## Reference Material

Before implementing any feature, read:
1. `docs/reference-design-spec.md` — colors, fonts, spacing
2. The relevant feature spec in `docs/reference-source/`
3. Screenshots in `docs/screenshots/` for visual targets
4. Source files in `docs/reference-source/` for implementation details
