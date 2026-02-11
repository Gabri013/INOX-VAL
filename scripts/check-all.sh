#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== Node/NPM =="
node -v
npm -v

echo "== Clean install =="
npm ci

echo "== Typecheck =="
npm run typecheck --if-present

echo "== Lint =="
npm run lint --if-present

echo "== Unit/Integration tests =="
npm test --if-present

echo "== Build =="
npm run build --if-present

echo "== Firebase validation (if present) =="
if [ -f firebase.json ]; then
  if command -v firebase >/dev/null 2>&1; then
    firebase --version
    # valida estrutura do projeto/firebase.json
    firebase projects:list >/dev/null 2>&1 || true
  else
    echo "firebase CLI not installed; skipping firebase checks"
  fi
fi

echo "== OK: check-all passou =="
