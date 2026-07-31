#!/usr/bin/env bash
# Setup & build script for epubObsidianConverter.
# Run from the project root:
#   ./epubObsidianConverter/setup.sh
#   ./epubObsidianConverter/build.sh

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV="$PROJECT_ROOT/.venv"

# ── setup ──────────────────────────────────────────────────────
setup_venv() {
    if [ ! -d "$VENV" ]; then
        echo "Creating virtual environment..."
        python3 -m venv "$VENV"
    fi
    source "$VENV/bin/activate"
    echo "Installing dependencies..."
    pip install -r "$(dirname "$0")/requirements.txt"
    echo "Done. Virtual environment ready at $VENV"
}

# ── build ──────────────────────────────────────────────────────
build_epub() {
    if [ ! -d "$VENV" ]; then
        echo "Virtual environment not found. Run setup first:"
        echo "  ./epubObsidianConverter/setup.sh"
        exit 1
    fi
    source "$VENV/bin/activate"
    python3 "$(dirname "$0")/build_epub.py"
}

# ── dispatch ───────────────────────────────────────────────────
case "${1:-build}" in
    setup)
        setup_venv
        ;;
    build)
        build_epub
        ;;
    *)
        echo "Usage: $0 {setup|build}"
        echo "  setup  — create virtual env and install dependencies"
        echo "  build  — run the EPUB converter (default)"
        exit 1
        ;;
esac
