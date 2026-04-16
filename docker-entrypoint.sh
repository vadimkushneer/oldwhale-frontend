#!/bin/sh
# Used by ../docker-compose.yml web service: bind-mount hides image node_modules; named volume may be stale.
set -e
LOCK_SHA=$(sha256sum package-lock.json | cut -d" " -f1)
STAMP=node_modules/.compose-lock-sha
if [ ! -x node_modules/.bin/vite ] ||
  [ ! -f node_modules/@vitejs/plugin-react/package.json ] ||
  [ ! -f "$STAMP" ] ||
  [ "$(cat "$STAMP" 2>/dev/null)" != "$LOCK_SHA" ]; then
  npm ci
  printf %s "$LOCK_SHA" >"$STAMP"
fi
exec npm run dev -- --host 0.0.0.0 --port 5173
