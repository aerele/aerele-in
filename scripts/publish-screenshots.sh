#!/usr/bin/env bash
# Publish the PNGs in .pr-screenshots/ to a throwaway `screenshots/pr-<N>` branch
# (never merged) and upsert a sticky PR comment that embeds them via raw URLs.
# Used by .github/workflows/pr-screenshots.yml.
set -euo pipefail

PR="${PR_NUMBER:?PR_NUMBER required}"
REPO="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY required}"
BRANCH="screenshots/pr-${PR}"
OUT=".pr-screenshots"
RAW_BASE="https://raw.githubusercontent.com/${REPO}/${BRANCH}"
MARKER="<!-- pr-screenshots -->"

shopt -s nullglob
shots=("$OUT"/*.png)
if [ ${#shots[@]} -eq 0 ]; then
  echo "No screenshots captured; nothing to publish."
  exit 0
fi

# Stash PNGs outside the work tree, then publish to an orphan branch.
tmp="$(mktemp -d)"
cp "$OUT"/*.png "$tmp"/

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

git checkout --orphan "$BRANCH"
git rm -rf . >/dev/null 2>&1 || true
cp "$tmp"/*.png .
git add ./*.png
git commit -q -m "screenshots for PR #${PR}"
git push -f origin "HEAD:${BRANCH}"

# Build the comment body.
body="${MARKER}"$'\n'"### 📸 Page screenshots"$'\n\n'"_Auto-generated from this PR's UI changes._"$'\n\n'
for f in "$tmp"/*.png; do
  n="$(basename "$f")"
  label="${n%.png}"
  if [ "$label" = "home" ]; then label="/"; else label="/${label//__//}/"; fi
  body+="<details><summary><b>${label}</b></summary>"$'\n\n'"![${label}](${RAW_BASE}/${n})"$'\n\n'"</details>"$'\n\n'
done

# Upsert a single sticky comment (find by marker; patch if present, else create).
cid="$(gh api "repos/${REPO}/issues/${PR}/comments" --paginate \
  --jq "map(select(.body|startswith(\"${MARKER}\")))[0].id // empty")"
if [ -n "$cid" ]; then
  gh api -X PATCH "repos/${REPO}/issues/comments/${cid}" -f body="$body" >/dev/null
  echo "Updated screenshots comment on PR #${PR}."
else
  gh api -X POST "repos/${REPO}/issues/${PR}/comments" -f body="$body" >/dev/null
  echo "Created screenshots comment on PR #${PR}."
fi
