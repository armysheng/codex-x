#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
用法:
  scripts/sync_openclaw_memory.sh [push|pull|both|status]

说明:
  push   把本地体系镜像到远端目录
  pull   把远端目录拉回本地镜像目录
  both   先 push 再 pull
  status 打印当前同步配置

环境变量:
  REMOTE_HOST         默认 user@example-host
  REMOTE_ROOT         默认 /home/user/codex-x
  LOCAL_REMOTE_MIRROR 默认 <repo>/external-memory/remote-codex-x
  LOCAL_BACKUP_ROOT   默认 <repo>/5-Archive/sync-backups/remote
USAGE
}

MODE="${1:-both}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

REMOTE_HOST="${REMOTE_HOST:-user@example-host}"
REMOTE_ROOT="${REMOTE_ROOT:-/home/user/codex-x}"
LOCAL_REMOTE_MIRROR="${LOCAL_REMOTE_MIRROR:-${LOCAL_ROOT}/external-memory/remote-codex-x}"
LOCAL_BACKUP_ROOT="${LOCAL_BACKUP_ROOT:-${LOCAL_ROOT}/5-Archive/sync-backups/remote}"
TIMESTAMP="$(date '+%Y%m%d-%H%M%S')"

SYNC_PATHS=(
  "CLAUDE.md"
  "AGENTS.md"
  "0-System"
  "1-Inbox"
  "2-Projects"
  "3-Thinking"
  "4-Assets"
  "5-Archive"
  "references"
  "scripts"
  "skills"
)

log() { printf '[sync-template] %s\n' "$*"; }
fail() { printf '[sync-template] 错误: %s\n' "$*" >&2; exit 1; }
require_cmd() { command -v "$1" >/dev/null 2>&1 || fail "缺少命令: $1"; }

print_status() {
  cat <<STATUS
LOCAL_ROOT=${LOCAL_ROOT}
REMOTE_HOST=${REMOTE_HOST}
REMOTE_ROOT=${REMOTE_ROOT}
LOCAL_REMOTE_MIRROR=${LOCAL_REMOTE_MIRROR}
LOCAL_BACKUP_ROOT=${LOCAL_BACKUP_ROOT}
STATUS
}

stage_local_payload() {
  local staging_dir="$1"
  local rel
  for rel in "${SYNC_PATHS[@]}"; do
    if [[ -e "${LOCAL_ROOT}/${rel}" ]]; then
      mkdir -p "${staging_dir}/$(dirname "${rel}")"
      rsync -a "${LOCAL_ROOT}/${rel}" "${staging_dir}/$(dirname "${rel}")/"
    fi
  done
}

push_local_to_remote() {
  local staging_dir
  staging_dir="$(mktemp -d "${TMPDIR:-/tmp}/sync-template.XXXXXX")"
  trap 'rm -rf "${staging_dir}"' RETURN

  stage_local_payload "${staging_dir}"
  ssh "${REMOTE_HOST}" "mkdir -p '${REMOTE_ROOT}'"
  rsync -az --delete "${staging_dir}/" "${REMOTE_HOST}:${REMOTE_ROOT}/"
  log "push 完成"
}

pull_remote_to_local() {
  mkdir -p "${LOCAL_REMOTE_MIRROR}" "${LOCAL_BACKUP_ROOT}/${TIMESTAMP}"
  rsync -az --delete "${REMOTE_HOST}:${REMOTE_ROOT}/" "${LOCAL_REMOTE_MIRROR}/"
  rsync -a --delete "${LOCAL_REMOTE_MIRROR}/" "${LOCAL_BACKUP_ROOT}/${TIMESTAMP}/"
  log "pull 完成"
}

require_cmd rsync
require_cmd ssh

case "${MODE}" in
  push) push_local_to_remote ;;
  pull) pull_remote_to_local ;;
  both) push_local_to_remote; pull_remote_to_local ;;
  status) print_status ;;
  -h|--help|help) usage ;;
  *) usage; fail "不支持的模式: ${MODE}" ;;
esac
