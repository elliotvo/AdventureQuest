# AGENTS.md

## Cursor Cloud specific instructions

This is a zero-dependency static web project (HTML + CSS + vanilla JS). There is no package manager, build step, bundler, linter, or test framework.

### Running the application

Serve the project root with any static file server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser. The game loads from `index.html` → `styles.css` + `game.js`.

### Key notes

- No `npm install`, `pip install`, or other dependency installation is needed.
- No build step — files are served as-is.
- No automated tests or linting exist in the repo. Manual browser testing is the only verification method.
- The game UI is in Danish. Hero selection starts the game; arrow keys or on-screen buttons control movement.
