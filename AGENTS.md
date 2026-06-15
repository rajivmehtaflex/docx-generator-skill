# Repository Guidelines

## Project Structure & Module Organization
This repository uses a flat layout. The main runtime code lives in `docx_generator.py`, while the browser entry point is `index.html`. Supporting files include `examples.py`, `test_docx_generator.py`, `start.sh`, `requirements.txt`, and the reference docs `README.md`, `SKILL.md`, `QUICKSTART.md`, and `EXAMPLES.md`. Keep new source files at the top level unless the project grows enough to justify subdirectories.

## Build, Test, and Development Commands
- `npm run start`: starts a local server on `http://localhost:8000` for the browser app.
- `npm test`: runs `python docx_generator.py`; use this for a quick smoke check.
- `npm run lint`: compiles `docx_generator.py` with `python -m py_compile` to catch syntax errors.
- `python3 test_docx_generator.py`: runs the repository’s ad hoc validation script.
- `./start.sh --dev --test`: creates a virtual environment, installs dependencies, runs tests, then starts the server.

## Coding Style & Naming Conventions
Use standard Python style: 4-space indentation, `snake_case` for functions and variables, and `PascalCase` for classes such as `DocxGenerator`. Keep HTML element names and option keys lowercase, matching the existing API (`page_number_format`, `add_toc`). Favor small, direct functions and keep browser-facing text readable and explicit.

## Testing Guidelines
There is no formal test runner configured. Tests currently live in `test_docx_generator.py` and use plain `test_*` functions with `assert` checks and base64 decode validation. When adding coverage, follow the same naming pattern and include at least one smoke test for new document features. Run `python3 test_docx_generator.py` before opening a PR.

## Commit & Pull Request Guidelines
No git history is available in this workspace, so use concise imperative commit messages such as `add table formatting test`. For pull requests, include a short summary, the commands you ran, and screenshots or sample output when changing `index.html` or document rendering. Note any limitations, browser quirks, or dependency changes explicitly.

## Security & Configuration Tips
This project is intended to run locally in the browser. Avoid committing generated artifacts, virtual environments, or `__pycache__` contents. If you add configuration, keep defaults safe for offline use and document any new dependencies in `requirements.txt` and `README.md`.
