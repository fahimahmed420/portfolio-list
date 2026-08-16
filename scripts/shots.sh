#!/usr/bin/env bash
# Screenshot every design with headless Chrome.
#
#   npm run dev          # in another terminal
#   bash scripts/shots.sh [width] [height]
#
# Writes one PNG per design into .shots/. Chrome needs a separate --user-data-dir
# per run or the second invocation silently attaches to the first and writes
# nothing. Output paths must use forward slashes even on Windows.

set -u

W="${1:-1440}"
H="${2:-900}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/.shots"
mkdir -p "$OUT"

CHROME=""
for p in \
  "/c/Program Files/Google/Chrome/Application/chrome.exe" \
  "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
  "/c/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe" \
  "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
  "/usr/bin/google-chrome" \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
do
  [ -f "$p" ] && CHROME="$p" && break
done

if [ -z "$CHROME" ]; then
  echo "No Chromium-based browser found. Edit the list in scripts/shots.sh." >&2
  exit 1
fi

# Slugs come from the registry, so a new design is picked up automatically.
SLUGS=$(grep -oE '^import ([a-zA-Z]+) from "\./[a-z]+/meta"' designs/registry.ts \
  | sed -E 's/.*"\.\/([a-z]+)\/meta"/\1/')

shot () {
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
    --user-data-dir="$OUT/.profile-$1" \
    --virtual-time-budget=5000 --window-size="$W,$H" \
    --screenshot="$OUT/$1.png" "http://localhost:3000$2" >/dev/null 2>&1
  [ -f "$OUT/$1.png" ] && echo "  ok   $1" || echo "  FAIL $1"
}

echo "Shooting at ${W}x${H} into .shots/"
shot gallery "/"
for s in $SLUGS; do shot "$s" "/d/$s"; done

rm -rf "$OUT"/.profile-*
echo "Done."
