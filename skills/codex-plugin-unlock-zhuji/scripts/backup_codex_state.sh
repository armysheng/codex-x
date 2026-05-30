#!/usr/bin/env bash
set -euo pipefail

CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
STAMP="${1:-$(date +%Y%m%d-%H%M%S)}"
BACKUP_DIR="$CODEX_HOME_DIR/backups/plugin-unlock-zhuji-$STAMP"
ROLLBACK_SCRIPT="$BACKUP_DIR/rollback.sh"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

auth_src="$CODEX_HOME_DIR/auth.json"
config_src="$CODEX_HOME_DIR/config.toml"
auth_backup="$BACKUP_DIR/auth.json"
config_backup="$BACKUP_DIR/config.toml"

if [ -f "$auth_src" ]; then
  cp -p "$auth_src" "$auth_backup"
  chmod 600 "$auth_backup"
else
  auth_backup="MISSING"
fi

if [ -f "$config_src" ]; then
  cp -p "$config_src" "$config_backup"
  chmod 600 "$config_backup"
else
  echo "ERROR: $config_src not found" >&2
  exit 1
fi

cat > "$ROLLBACK_SCRIPT" <<EOF
#!/usr/bin/env bash
set -euo pipefail

CODEX_HOME_DIR="\${CODEX_HOME:-\$HOME/.codex}"

if [ -f "$BACKUP_DIR/auth.json" ]; then
  cp -p "$BACKUP_DIR/auth.json" "\$CODEX_HOME_DIR/auth.json"
  chmod 600 "\$CODEX_HOME_DIR/auth.json"
fi

cp -p "$BACKUP_DIR/config.toml" "\$CODEX_HOME_DIR/config.toml"
chmod 600 "\$CODEX_HOME_DIR/config.toml"

echo "Rolled back Codex auth/config from: $BACKUP_DIR"
EOF

chmod 700 "$ROLLBACK_SCRIPT"

cat <<EOF
backup_dir=$BACKUP_DIR
auth_backup=$auth_backup
config_backup=$config_backup
rollback_script=$ROLLBACK_SCRIPT

rollback_command:
bash '$ROLLBACK_SCRIPT'
EOF
