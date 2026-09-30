#!/usr/bin/env bash
# Starts Taskly locally on Linux: Kestrel backend + Vite frontend.
# Launches both processes in the background with prefixed output; Ctrl+C stops both.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOLUTION_ROOT="$(dirname "$SCRIPT_DIR")"

BACKEND_PATH="$SOLUTION_ROOT/src/Taskly.Web"
FRONTEND_PATH="$SOLUTION_ROOT/src/Taskly.Web/ClientApp"

cleanup() {
    echo ""
    echo "Shutting down all processes..."
    kill 0 2>/dev/null
    wait 2>/dev/null
    echo "Done."
}

trap cleanup EXIT INT TERM

echo "============================================="
echo "  Taskly Dev Environment (Linux)"
echo "============================================="
echo ""
echo "  Frontend : http://localhost:2026"
echo "  Backend  : https://localhost:1998"
echo ""
echo "  Stop with: Ctrl+C"
echo "============================================="
echo ""

# Start backend (Kestrel)
echo "[Backend] Starting Kestrel..."
(cd "$BACKEND_PATH" && dotnet run --launch-profile https 2>&1 | sed 's/^/[backend] /') &

# Start frontend (Vite)
echo "[Frontend] Starting Vite..."
(cd "$FRONTEND_PATH" && npm run dev 2>&1 | sed 's/^/[frontend] /') &

# Wait for all background processes
wait
