#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${CODEX_X_REPO_URL:-https://github.com/armysheng/codex-x.git}"
DEFAULT_TARGET_DIR="${CODEX_X_TARGET_DIR:-$HOME/codex-x}"
DEFAULT_WORKSPACE_DIR="${CODEX_X_WORKSPACE_DIR:-$DEFAULT_TARGET_DIR/my-workspace}"

TARGET_DIR="$DEFAULT_TARGET_DIR"
WORKSPACE_DIR="$DEFAULT_WORKSPACE_DIR"
ANSWERS_FILE=""
YES=0
NO_AUTOMATION=0

usage() {
  cat <<'USAGE'
Usage:
  ./install.sh [--target DIR] [--workspace DIR] [--answers FILE] [--yes] [--no-automation]

Examples:
  ./install.sh
  ./install.sh --target "$HOME/codex-x"
  ./install.sh --workspace "$HOME/codex-x-workspace"
  ./install.sh --answers ./examples/bootstrap.answers.example.json
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      TARGET_DIR="$2"
      shift 2
      ;;
    --workspace)
      WORKSPACE_DIR="$2"
      shift 2
      ;;
    --answers)
      ANSWERS_FILE="$2"
      shift 2
      ;;
    --yes)
      YES=1
      shift
      ;;
    --no-automation)
      NO_AUTOMATION=1
      shift
      ;;
    -h|--help|help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require_cmd git
require_cmd npm
require_cmd node

if [[ ! -d "$TARGET_DIR/.git" ]]; then
  mkdir -p "$(dirname "$TARGET_DIR")"
  git clone --depth=1 "$REPO_URL" "$TARGET_DIR"
else
  git -C "$TARGET_DIR" pull --ff-only
fi

cd "$TARGET_DIR"
npm install

INIT_ARGS=()
if [[ -n "$ANSWERS_FILE" ]]; then
  INIT_ARGS+=(--answers "$ANSWERS_FILE")
elif [[ "$YES" -eq 1 ]]; then
  INIT_ARGS+=(--yes)
fi
if [[ "$NO_AUTOMATION" -eq 1 ]]; then
  INIT_ARGS+=(--no-automation)
fi

node ./bin/codex-x.mjs init "${INIT_ARGS[@]}" "$WORKSPACE_DIR"

cat <<EOF

codex-x installed successfully.

Repo: $TARGET_DIR
Workspace: $WORKSPACE_DIR

Next:
  cd "$WORKSPACE_DIR"
  codex

Codex automation:
  默认会注册每日记忆整理；如本次使用 --no-automation，则不会注册。
  如需重建：node "$TARGET_DIR/bin/codex-x.mjs" automation install "$WORKSPACE_DIR"
EOF
