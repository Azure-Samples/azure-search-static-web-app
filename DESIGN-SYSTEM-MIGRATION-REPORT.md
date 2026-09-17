# Single design system migration — reconciliation report

Date: 2026-09-17
Worktree: `azure-search-static-web-app.worktrees\azure-search-design-system-migration-d090c6f9`
Local branch: `design-system-reconcile` (created from `origin/main`, never pushed)

## 1. Starting points

| Ref | Commit | Notes |
|---|---|---|
| `origin/main` | `062b1c0` | Includes PR #43 (Playwright coverage, merged), #41 (pinned Action SHAs), #37 (AZD infra), #39/#38 |
| PR #36 head | `a268653a` (`diberry/0731-class`) | 15 commits, 67 files, **OPEN**, GitHub-reported `mergeable: CONFLICTING` / `mergeStateStatus: DIRTY` |
| Reconciled branch | `ab6791d` (HEAD) | `origin/main` + PR #36 merged + 3 fix commits, local only |

PR #36 predates PR #37 (AZD infra), #41, and #43 (Playwright suite), so it never saw the
`window.__APP_CONFIG__` runtime-config feature or the new `client/tests/` Playwright/policy
scaffolding that main now carries.

### 1.1 Baseline gate verification (re-fetched from `origin` before any further work)

A mandatory baseline check was run to confirm the reconciliation branch is not carrying
unrelated local-`main` commits and is founded exactly on current `origin/main`:

```
git fetch origin --prune
git rev-parse origin/main
  → 062b1c0bbfa0fb39fc55299d35584c841a365b4c   ("Add Playwright API and UI test coverage (#43)")
git merge-base design-system-reconcile origin/main
  → 062b1c0bbfa0fb39fc55299d35584c841a365b4c   (identical to origin/main HEAD)
git merge-base --is-ancestor origin/main design-system-reconcile
  → exit code 0 (true — origin/main fully contained)
git log origin/main..design-system-reconcile --oneline
  → only PR #36's 14 original commits (down to a268653a) + 4 fix/report commits
    from this session; zero unrelated commits
```

The local repository's `main` branch (`78b939a`) is stale — 3+ commits behind
`origin/main`, missing PR #37/#39/#41/#43 — and was **not used** as the reconciliation
base. `design-system-reconcile` was created with
`git checkout -b design-system-reconcile origin/main`, branching directly from the
verified current `origin/main` tip, so none of local `main`'s staleness carried in. No
force operations, resets, or destructive rewrites were used at any point; nothing has
been pushed to `origin`.

## 2. Reconciliation strategy

1. Fetched `origin` and the PR #36 head into a disposable ref (`pr-36-head`,
   `a268653a`), never touching Microsoft-owned refs.
2. Created a local-only branch `design-system-reconcile` from `origin/main` (not from the
   stale local `main`, which was 3 commits behind).
3. Ran `git merge --no-ff --no-commit pr-36-head` to reproduce and resolve exactly what a
   GitHub merge/rebase of PR #36 onto current `main` would need to resolve. No `--force`,
   `push`, or history rewriting was used anywhere.
4. Resolved 4 real conflicts (see §3), committed the merge, then found and fixed 3
   post-merge defects that the merge alone could not have caught (build success does not
   imply app correctness — see §4).
5. Validated with the repository's own Playwright projects and structure gate, not by
   re-approving/updating any reviewed screenshot baseline.

## 3. Conflict resolution (commit `4704452`)

| File | Conflict | Resolution |
|---|---|---|
| `.devcontainer/devcontainer.json` | `main` added `docker-in-docker` + AZD/VS Code tooling extensions (PR #37); PR #36 added ESLint/Prettier/TS extensions and a `postCreateCommand` that also runs `dotnet restore`/`npm install` | Combined both feature/extension sets; merged `postCreateCommand` to run API restore, client install, and `az bicep install` |
| `client/package.json` | `main` added the `test:*` Playwright scripts (PR #43); PR #36 added `build`/`type-check`/`clean:vit e`/`dev:build` TypeScript scripts | Kept both script sets. Dependency sections merged cleanly with **no manual edits** — Bootstrap/jQuery/Popper were already absent, MUI/Playwright/axe/TypeScript deps were already compatible |
| `client/package-lock.json` | Diverged after the `package.json` merge | Regenerated via `npm install` (221 packages, 0 vulnerabilities) rather than hand-editing |
| `client/src/components/SearchBar/SearchBar.jsx` | Modify/delete: `main` still had the file, PR #36 deleted it (superseded by `SearchBar.tsx`) | Took the deletion (`git rm`) — the `.tsx` replacement was already part of the merge |

`url-fetch.js`/`url-fetch.ts` auto-merged without a conflict marker (git treated PR #36's
JS→TS rewrite and main's `window.__APP_CONFIG__` runtime-config addition as
non-overlapping edits) — this produced a real, silent defect, fixed in §4.

## 4. Defects found and fixed (not visible from the merge diff alone)

These were only caught by actually building and running the Playwright suites — a
clean `git merge` and even a clean `tsc`/`vite build` did **not** prove the app worked.

### 4.1 `client/src/types/global.d.ts` — missing `Window.__APP_CONFIG__` typing (commit `ef83abd`)
`url-fetch.ts` (auto-merged) reads `window.__APP_CONFIG__.BACKEND_URL`, a runtime-config
mechanism added to `main` after PR #36 branched (`client/docker-entrypoint.sh`, AZD infra
work, PR #37). PR #36's stricter `tsconfig.json` (`strict: true`) failed `tsc` with
`TS2339: Property '__APP_CONFIG__' does not exist`. **Fix:** declared
`interface Window { __APP_CONFIG__?: AppRuntimeConfig }` in `global.d.ts`.

### 4.2 `client/index.html` — stale entry point reference (commit `ef83abd`, critical)
PR #36 never touched `client/index.html` (not in its file list), so it still pointed at
`<script type="module" src="/src/main.jsx">` — a file PR #36 deletes in favor of
`src/main.tsx`. **`npm run build` succeeded anyway** because Vite only resolves/bundles
`<script type="module">` tags whose target it can find; the mis-typed extension made Vite
silently treat the reference as unresolved rather than erroring, so the resulting
`build/index.html` shipped **no application bundle at all** (confirmed by diffing the
built `index.html` before/after the fix — before the fix there was no
`<script type="module" src="/assets/index-*.js">` injected). **Fix:** point the tag at
`/src/main.tsx`. This is the single most important fix in this reconciliation — without
it the combined branch would build "successfully" and deploy a blank page.

### 4.3 Hardcoded colors that don't come from the theme (commit `ab6791d`)
`client/design-system.policy.json` requires all visual color/spacing constants to resolve
from `src/theme.ts`; `client/tests/e2e/design-theme.spec.js` (added by PR #43 as the
reviewed/approved contract for the finished migration) asserts computed colors against
that theme. Three PR #36 components violated the policy with hardcoded raw hex, and only
one of the two "Azure blue" values used matched the theme's:

* `AppHeader.tsx` — app bar hardcoded to `#0078d7` (rgb(0,120,215)) instead of
  `theme.palette.secondary.main` (`#0078d4`, rgb(0,120,212) — a 1-bit-per-channel typo).
* `Results/Result/styled.tsx` (`TitleText`) — same wrong hex; and `Result.tsx`'s wrapping
  `<a>` had no color at all, so it inherited the theme's **global primary link color**
  override (`#646cff`) instead of the approved secondary/Azure-blue result-card link
  color. Added a themed `ResultLink` styled anchor and used it in `Result.tsx` (this also
  fixed a stale `from './styled.jsx'` import that should reference `./styled`).
* `SearchBar/styles.tsx` — the Search button and input focus ring hardcoded MUI's
  *default* theme blue (`#1976d2`/`#1565c0`) instead of this app's actual theme primary
  (`theme.palette.primary.main` `#646cff` / `.dark` `#535bf2`).

After these three fixes, `npm run test:design` (structure gate + `design-theme` +
`visual-diagnostic` projects) passes **8/8**, including all 6 reviewed design screenshots.

### Not fixed (flagged only)
* `client/vite.config.ts`'s `manualChunks` produces a `Circular chunk: vendor -> mui ->
  vendor` build warning. Pre-existing in PR #36, non-fatal, out of scope for this
  reconciliation.
* `CheckboxFacet.tsx` and `Facets.tsx` import from `./styles.jsx` even though the file is
  `styles.tsx` (same stale-extension pattern as the `Result.tsx` bug in §4.3, but these two
  happen to still resolve under Vite/TS "bundler" module resolution). Left alone to keep
  this change surgical; recommend cleaning up in the follow-up PR.

## 5. Test results (all run locally, no push, no PR comments)

Client dev server: `vite --host --port 3000` (port 3000 was already in use by another
process in this shared environment, Vite auto-selected **3001**;
`PLAYWRIGHT_CLIENT_URL=http://127.0.0.1:3001` was set for all suites below).

| Command | Result | Notes |
|---|---|---|
| `npm run test:structure` | ✅ pass | current-mode structure gate |
| `npm run test:structure:design` | ✅ pass | design-mode structure gate (no Bootstrap/jQuery/Popper, no leftover `.jsx`/`.css`, `ThemeProvider`+`CssBaseline` wired) |
| `npm run lint` (eslint) | ✅ pass, 0 problems | |
| `npm run build` (`tsc && vite build`) | ✅ pass after §4.1/§4.2 fixes | before the fixes: `tsc` failed with `TS2339`, and even after that was fixed, the unfixed `index.html` bundled successfully but with no app entry |
| `dotnet restore .\api\azure-search-function.csproj` / `dotnet build … -c Release` | ✅ pass, 0 errors (28 pre-existing nullable warnings) | Restoring the full `.sln` fails (`MSB3202`, missing generated `WorkerExtensions.csproj`) — a pre-existing Azure Functions tooling artifact unrelated to the client migration; restoring/building the `api` project directly works |
| `npm run test:diagnostic` | ✅ 9/9 passed | mocked-API diagnostics, no cloud dependency |
| `npm run test:native` | ✅ 5/5 passed (as expected) | 3 of these are `test.fail(...)`-marked known defects (HTTP 302 contract, Bootstrap mobile toggle) and are expected to fail; none of them unexpectedly passed (no XPASS) |
| `npm run test:visual` (current baseline) | ❌ 6/6 failed — **expected, reported, not "fixed"** | See §6 |
| `npm run test:design` (design baseline: structure + `design-theme` + `visual-diagnostic`) | ✅ 8/8 passed | After §4.3 fixes |
| `npm run test:api` (Playwright `api` project) | **Not run** | Requires a provisioned Azure AI Search `good-books` index and a running `func start` API. No `azd` environment or `SearchServiceName`/`SearchIndexName` was configured in this workspace, and none could be resolved without provisioning/changing Azure configuration, which is out of scope. `az account show` / `azd auth login --check-status` confirm an authenticated Azure identity, but no already-wired search service or index was unambiguously available. |
| Live `func start` + real backend for `test:native`'s two API-hitting assertions | **Not run** | Same reason as above; those two `native` assertions are `test.fail`-marked and validated only against a refused/absent local connection, consistent with `TESTING.md`'s guidance to run every non-cloud suite that can run |

## 6. Visual diffs — current vs. design baselines

### 6.1 Against the reviewed **`current`** (pre-migration, Bootstrap) baselines — all 6 fail, as expected
The reconciled branch **is** the single design system; the old Bootstrap markup no longer
exists, so these diffs are the intended, permanent result of the migration, not a
regression to fix:

| Scenario | Diff |
|---|---|
| `home-desktop.png` | expected 1280×873, got 1280×861 — 61,738 px different (6%) |
| `home-mobile-menu.png` | expected 390×873, got 390×853 — 27,093 px different (8%) |
| suggestions (cloud order) | `toHaveCount` assertion fails — old Bootstrap-era suggestion list markup no longer present |
| results page 1/2 (`results-*`) | expected 1280×739, got 1280×775 — 136,838 px different (14%) |
| `details-result`/`details-raw-data` | expected 1280×720, got 1280×731 — 25,837 px different (3%) |
| `no-results.png` | image comparison fails (dimension/pixel mismatch) |

**No baseline was updated.** Per `TESTING.md`, updating these would require deliberate,
reviewed acceptance that the "current" baseline is retired — a product decision, not a
technical one.

### 6.2 Against the reviewed **`design`** baselines — 6/6 pass
`home-desktop`, `home-mobile-menu`, suggestions-in-cloud-order, results page 1/2,
details-result/raw-data, and no-results all pixel-match the already-approved design
screenshots once the theme-color fixes in §4.3 were applied. Combined with the passing
`design-theme.spec.js` computed-CSS assertions, the reconciled implementation matches the
approved design source of truth.

## 7. Architecture / dependency migration summary

* **Removed:** `bootstrap`, `jquery`, `popper.js` runtime dependencies; all `.jsx`/`.css`
  component implementations under `client/src` (superseded by `.tsx` + MUI `styled`).
* **Added:** `@mui/material`, `@mui/icons-material`, `@emotion/react`/`styled`,
  TypeScript (`typescript`, `tsconfig.json`/`tsconfig.node.json`), `src/theme.ts` (MUI
  theme + `GlobalStyles`), typed `src/types/*`, `ThemeProvider`+`CssBaseline`+
  `GlobalStyles` wiring in `src/main.tsx`.
* **File-structure simplification:** each component/page folder flattened to a single
  `.tsx` + colocated `styled.tsx`, replacing the old folder-per-component
  `Component/Component.jsx` + `Component.css` pattern.
* **Compatible with `main`'s independent work:** AZD infra (`azure.yaml`, `infra/`,
  `client/docker-entrypoint.sh`, runtime `window.__APP_CONFIG__`), pinned GitHub Action
  SHAs, and the full Playwright/`design-system.policy.json` test harness from PR #43 all
  now coexist with the design-system rewrite in the reconciled branch.

## 8. Remaining blockers / follow-ups for the real PR #36 update

1. **Cloud validation gap:** `test:api` and the two API-dependent `test:native`
   assertions have not been run against a live, seeded `good-books` Azure AI Search
   index in this session. Before merging, run them against the project's actual
   provisioned environment (see `TESTING.md`).
2. **Retire or replace the `current` visual baseline set** as a deliberate, reviewed step
   — once PR #36 lands, there is no more Bootstrap UI for `tests/visual/__screenshots__/current`
   to represent, and `test:visual`/`test:native`'s Bootstrap-era expectations
   (`test.fail` markers for the mobile toggle, "current" screenshots) should be revisited
   with the reviewer, not silently updated.
3. **Minor cleanup (non-blocking):** the `vendor -> mui -> vendor` circular-chunk build
   warning in `vite.config.ts`, and the stale `./styles.jsx` imports in
   `CheckboxFacet.tsx`/`Facets.tsx` (see §4.3 "Not fixed").
4. PR #36 is currently `CONFLICTING`/`DIRTY` against `main` on GitHub. This worktree's
   `design-system-reconcile` branch (local only, commits `4704452`, `ef83abd`,
   `ab6791d` on top of `pr-36-head` merged into `origin/main`) is a validated,
   ready-to-push resolution. No push was made per instructions; the PR author/maintainer
   should either (a) push this reconciliation to `diberry/0731-class` (rebasing/merging
   `main` in) and update PR #36, or (b) open a fresh PR from this branch referencing
   #36 once the cloud-dependent tests in item 1 have been run.

## 9. Commands run (chronological, condensed)

```powershell
git fetch origin --prune
git fetch origin pull/36/head:pr-36-head
git checkout -b design-system-reconcile origin/main
git merge --no-commit --no-ff pr-36-head        # 4 conflicts (see §3)
# manual conflict resolution + npm install (regenerate package-lock.json)
git commit                                       # 4704452
npm run test:structure ; npm run test:structure:design   # both pass
npm run lint                                     # pass
npm run build                                    # tsc TS2339 failure -> fixed global.d.ts
git commit                                       # ef83abd (index.html + global.d.ts)
npm run build                                    # pass
npm run dev -- --port 3000                       # -> auto-selected 3001 (port 3000 in use)
npm run test:diagnostic ; npm run test:native    # both pass
npm run test:visual                              # 6/6 fail against `current` baseline (expected)
npm run test:design                              # 1/8 fail: design-theme color assertions
# fix AppHeader.tsx, Result/styled.tsx, Result.tsx, SearchBar/styles.tsx
git commit                                       # ab6791d
npm run test:design                              # 8/8 pass
npm run test:structure ; npm run test:diagnostic ; npm run test:native   # re-verified, all pass
dotnet restore .\api\azure-search-function.csproj
dotnet build .\api\azure-search-function.csproj -c Release --no-restore  # 0 errors
```

No `git push`, no PR comments, no Azure resource creation/configuration changes were made.
