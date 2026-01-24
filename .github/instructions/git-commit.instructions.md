---
applyTo: '**'
---

## Istruzione rapida: commit convention + commitlint ✅

Scopo: fornire una regola chiara e verificabile per i messaggi di commit (Conventional Commits) e come controllarli con `commitlint`.

### Regole essenziali 🔧

- Formato obbligatorio: `type(scope): subject`
- Tipi consentiti: **feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, types**
- `scope` in **minuscolo**; `subject` in **minuscolo**, imperativo, **senza punto finale** e **senza !**
- Prima riga (subject) ≤ 100 caratteri; corpo opzionale per dettagli e note di breaking change.

Esempi validi:

- `feat(auth): implementa login con Discord`
- `fix(api): correggi gestione degli errori 500`

Esempi non validi:

- `Add feature` (manca tipo)
- `feat: Add feature` (subject non minuscolo)
- `feat!: breaking change` (punto esclamativo non consentito)

---

### Convenzione branch (raccomandata) 🌿

- `feat/<scope>/<short-desc>`
- `fix/<scope>/<short-desc>`

Esempio: `fix/api/fix-guild-list-pagination`

---

### Controlli locali (come usare `commitlint`) ⚙️

- Verifica ultimo commit:
  - `pnpm commitlint --from HEAD~1 --to HEAD --verbose`
- Verifica un messaggio prima del commit:
  - `echo "feat(api): aggiungi endpoint X" | pnpm commitlint`

> Nota: non usare `--no-verify` se non in emergenza (bypassa i controlli CI/hook).

---

### Template PR consigliato (da incollare nel body della PR) 📋

Usa questo template ridotto per PR che modificano comportamento o documentazione importante.

**Commit / PR (suggerito) 🔖**

- Branch: `fix/<scope>/<short-desc>` (es. `fix/docs/update-examples`)
- Commit (Conventional): `docs: aggiorna istruzioni commitlint`
- PR title: `docs: aggiorna istruzioni commitlint`

**What I changed — breve (3–6 bullet) 🔧**

- Aggiornata `\.github/instructions/git-commit.instructions.md` con la convenzione di commit
- Aggiunti esempi validi/non validi e comandi di verifica
- Aggiunto template PR consigliato per PR description

**How to verify — quick steps 🔎**

1. Controlli automatici:
   - `pnpm lint` → nessun errore
   - `pnpm typecheck` → nessun errore
   - `echo "feat(example): prova" | pnpm commitlint --verbose` → pass
2. Manuale:
   - Apri `\.github/instructions/git-commit.instructions.md` e verifica esempi e comandi

**Impact**: `documentation-only`

**PR checklist ✅**

- [ ] Commit seguono Conventional Commits
- [ ] Documentazione aggiornata (`.github/instructions/...`)
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm build` (se applicabile)

---

Se vuoi, posso: 1) aprire una branch locale suggerita (non eseguire il commit/push), 2) preparare il testo della PR pronto per incollare su GitHub, o 3) creare una PR draft se mi autorizzi a procedere (ti spiego i comandi).

---

## Quick guide: commit convention + commitlint ✅

Purpose: a minimal, actionable rule-set for commit messages (Conventional Commits) and how to validate them with `commitlint`. Paste this into `.github/instructions/git-commit.instructions.md` or link it from CONTRIBUTING.

### Essential rules 🔧

- Required format: `type(scope): subject`
- Allowed types: **feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, types**
- `scope` must be **lowercase**; `subject` must be **lowercase**, imperative, **no trailing period**, **no !**
- Short summary (first line) ≤ 100 characters; optional body for details and breaking changes.

Valid examples:

- `feat(auth): implement Discord login`
- `fix(api): handle 500 error when guild missing`

Invalid examples:

- `Add feature` (missing type)
- `feat: Add feature` (subject not lowercase)
- `feat!: breaking change` (exclamation mark not allowed)

---

### Branch naming (recommended) 🌿

- `feat/<scope>/<short-desc>`
- `fix/<scope>/<short-desc>`

Example: `fix/api/fix-guild-list-pagination`

---

### Local checks (how to use `commitlint`) ⚙️

- Validate the last commit:
  - `pnpm commitlint --from HEAD~1 --to HEAD --verbose`
- Validate a message before committing:
  - `echo "feat(api): add endpoint X" | pnpm commitlint`

> Note: do not use `--no-verify` except in emergencies (it bypasses CI/hooks).

---

### Recommended PR template (paste into PR body) 📋

Use this compact template for behavior or docs changes.

**Commit / PR (suggested) 🔖**

- Branch: `fix/<scope>/<short-desc>` (e.g. `fix/docs/update-examples`)
- Commit (Conventional): `docs: update commitlint instructions`
- PR title: `docs: update commitlint instructions`

**What I changed — short (3–6 bullets) 🔧**

- Updated `\.github/instructions/git-commit.instructions.md` with commit conventions
- Added valid/invalid examples and verification commands
- Added a recommended PR template for consistent descriptions

**How to verify — quick steps 🔎**

1. Automated checks:
   - `pnpm lint` → no errors
   - `pnpm typecheck` → no errors
   - `echo "feat(example): test" | pnpm commitlint --verbose` → pass
2. Manual:
   - Open `\.github/instructions/git-commit.instructions.md` and verify examples/commands

**Impact**: `documentation-only`

**PR checklist ✅**

- [ ] Commits follow Conventional Commits
- [ ] Documentation updated (`.github/instructions/...`)
- [ ] Run: `pnpm lint`, `pnpm typecheck`, `pnpm build`

---
