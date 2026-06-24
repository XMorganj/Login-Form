# CLAUDE.md

## Project Overview

A static HTML/CSS login form — no build system, no JavaScript framework, no backend. Open `form.html` directly in a browser.

## Repository Structure

```
Login-Form/
├── form.html        # Single-page login form (markup only)
├── formstyle.css    # All styles for the form
├── icon2.png        # User avatar icon shown in the fieldset legend
├── travel3.jpg      # Background image for the page body
├── README.md        # Minimal readme
└── Contact Me.txt   # Author contact info
```

## Key Conventions

### HTML (`form.html`)
- The stylesheet link uses a hardcoded Windows absolute path (`C:\Users\REENYWORLD\...`). Change it to a relative path (`href="formstyle.css"`) if the form is served or opened on any other machine.
- The `<form>` submits via `POST` to `#` (no server-side handler). Any backend integration requires updating the `action` attribute.
- Font Awesome icons (`fa fa-user`, `fa fa-key`) are referenced in the markup but the Font Awesome CDN `<link>` is missing from `<head>` — icons will not render without it.
- Input names: `username` (text), `Password` (password — note capital P), `submit`, `reset`.

### CSS (`formstyle.css`)
- Brand/accent color: `#3fb6b2` (teal). Hover state shifts to `#2a63b8` (blue). Keep changes consistent across both colors.
- Background image is referenced by filename only (`travel3.jpg`) — keep the image at the project root.
- Several rule blocks are commented out (alternative focus/hover styles and a `.container` background). They are intentional experiments, not dead code to delete without review.
- The `.center` div uses absolute positioning with `translate(-50%, -50%)` to center the form card — the parent `body` must remain `position: relative` (or any positioning context) for this to work correctly.

## Development Workflow

This is a zero-toolchain project:
1. Open `form.html` in a browser to preview.
2. Edit `form.html` or `formstyle.css` directly.
3. Refresh the browser to see changes.

No `npm install`, no build step, no dev server required.

## Known Issues / Things to Fix Before Deploying

| Issue | Location | Fix |
|---|---|---|
| Absolute Windows CSS path | `form.html:5` | Change to `href="formstyle.css"` |
| Missing Font Awesome CDN | `form.html` `<head>` | Add `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.x/css/all.min.css">` |
| Form `action="#"` | `form.html:19` | Point to real backend endpoint |
| `opacity: none` (invalid) | `formstyle.css:128` | Remove or replace with a valid opacity value |

## Git Branches

- `master` — main branch
- `claude/claude-md-docs-ovmj4v` — documentation branch (this CLAUDE.md was created here)
