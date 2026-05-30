---
name: codex-plugin-unlock-zhuji
description: Use when a user wants to unlock or troubleshoot Codex App Apps/Plugins, plugin marketplace, remote plugins, device-code ChatGPT login, or configure Codex with a Zhuji/筑基 provider while avoiding auth.json or config.toml changes that could break the current Codex conversation.
---

# Codex Plugin Unlock Zhuji

## Core Rule

Treat `~/.codex/auth.json` and `~/.codex/config.toml` as fragile. A bad edit can make Codex unable to continue the conversation. Never ask the user to restart Codex App until you have shown real backup paths and a real rollback command or rollback script.

## Required Workflow

1. Announce the risk in one sentence.
2. Inspect current state without printing secrets:
   - `env -u CODEX_API_KEY codex login status`
   - Redacted `~/.codex/config.toml`
   - Auth structure only, for example `auth_mode`, `has_OPENAI_API_KEY`, `has_tokens`, `has_last_refresh`
3. Back up before any edit. Prefer:
   - `bash ~/.codex/skills/codex-plugin-unlock-zhuji/scripts/backup_codex_state.sh`
4. Relay the backup output to the user, including:
   - backup directory
   - auth backup path
   - config backup path
   - rollback script path
5. Only then change config or login state.
6. Before asking the user to quit or restart Codex App, repeat the rollback script path and exact command:
   - `bash '<backup_dir>/rollback.sh'`

## Target State

- `auth.json`: official ChatGPT/Codex login state for Apps/Plugins.
- `config.toml`: Zhuji/筑基 provider for model requests.
- Do not put Zhuji API keys into `auth.json`.
- Do not route plugin backend or marketplace requests to the Zhuji model endpoint.

## Safer Provider Edits

Prefer minimum changes to the existing active provider. If the active provider is `custom`, do not rename it unless the user explicitly asks; set the display name and auth behavior instead:

```toml
[model_providers.custom]
name = "筑基"
base_url = "https://iaigc.fun/v1"
wire_api = "responses"
requires_openai_auth = false
supports_websockets = true
```

If creating a new provider is explicitly requested:

```toml
model_provider = "zhuji"
model = "gpt-5.5"

[model_providers.zhuji]
name = "筑基"
base_url = "https://iaigc.fun/v1"
wire_api = "responses"
requires_openai_auth = false
supports_websockets = true
experimental_bearer_token = "<ZHUJI_API_KEY>"
```

Preserve any existing key value. Never print it.

If using environment variables, remember macOS GUI apps may not inherit shell variables. Confirm whether the app is launched from shell or desktop before relying on `env_key`.

## Official Login

If `codex login status` is not `Logged in using ChatGPT`, guide the user through official device auth:

```bash
env -u CODEX_API_KEY codex login --device-auth
```

If the user says device auth is blocked, tell them to enable Codex device-code authorization in ChatGPT security settings, then rerun the command.

## Optional Feature Flags

Only add missing flags; do not replace unrelated existing feature settings:

```toml
[features]
apps = true
plugins = true
enable_mcp_apps = true
auth_elicitation = true
remote_plugin = true
apps_mcp_path_override = true
```

## Verification

Run and summarize:

```bash
env -u CODEX_API_KEY codex login status
env -u CODEX_API_KEY codex doctor
```

Expected:

- Login status says `Logged in using ChatGPT`.
- Active model provider points at Zhuji/筑基.
- Provider should not require OpenAI auth for model calls when using Zhuji.

## Restart Gate

Before restart, say this plainly:

```text
重启前先保存这条回滚命令。如果重启后 Codex 不能对话，在 macOS 终端执行：
bash '<backup_dir>/rollback.sh'
```

Do not kill Codex App yourself unless the user explicitly asks. Ask the user to use `Cmd+Q` and reopen after they have copied the rollback command.

## Common Errors

- `invalid character '(' looking for beginning of value`: a plugin/App request or malformed request likely hit the model endpoint. Recheck provider/auth split.
- `未指定模型名称，模型名称不能为空`: a request hit Zhuji/new-api without a model name, or an internal probe was routed to the model endpoint. Recheck top-level `model` and provider routing.
- Plugins still grey after ChatGPT login: check full app restart, local feature cache, account entitlement, and whether the app is actually reading the restored `auth.json`.

## If Things Break

Use the last backup rollback script first. Do not stack more edits on top of a broken state.

```bash
bash '<backup_dir>/rollback.sh'
```

After rollback, reopen Codex App and re-check login/config before trying again.
