#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/node_modules/lucide/dist/umd/lucide.min.js"
DEST="$ROOT/assets/vendor/lucide.min.js"

if [[ ! -f "$SRC" ]]; then
  echo "lucide not installed. Run: npm install" >&2
  exit 1
fi

mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"

echo "Synced lucide.min.js → assets/vendor/"
