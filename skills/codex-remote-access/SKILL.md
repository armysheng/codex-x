---
name: codex-remote-access
description: Use when a user wants to access or operate a Codex workspace from another device, network, city, or remote message channel; set up remote access through Feishu bridge, SSH tunnel, Tailscale, Cloudflare Tunnel, reverse proxy, or a similar path while avoiding unsafe public exposure of local Codex, workspace files, or credentials.
---

# Codex Remote Access

## Core Rule

Do not expose a local Codex workspace, app server, bridge endpoint, token, or filesystem path to the public internet by default. Prefer private, authenticated, reversible access paths.

## Decide the Access Mode

Use the smallest surface that solves the user's need:

1. **Message-based access**: Prefer `feishu-codex-cli` when the user only needs to send tasks and receive replies from another place.
2. **Private network access**: Prefer Tailscale, VPN, or SSH tunnel when the user needs direct access to a local service.
3. **Temporary public tunnel**: Use Cloudflare Tunnel or similar only when the user explicitly accepts the exposure and auth boundary.
4. **Reverse proxy / domain**: Treat as production-like. Require authentication, TLS, logs, rollback, and explicit confirmation.

## Required Workflow

1. Ask what must be reachable remotely: messages, files, local web UI, Codex App, or a specific service.
2. Identify the local endpoint and workspace path without printing secrets.
3. State the proposed access mode and risk in one sentence.
4. Before changing network exposure, write down:
   - local endpoint
   - remote URL or tunnel target
   - auth method
   - stop / rollback command
5. Prefer dry-run checks before starting a long-running tunnel or bridge.
6. After setup, verify from the remote side when possible.

## Feishu Bridge Path

For message-based remote access, keep the flow inside the existing bridge:

```bash
node packages/feishu-codex-cli/bin/feishu-codex.mjs init --write-config
node packages/feishu-codex-cli/bin/feishu-codex.mjs doctor
node packages/feishu-codex-cli/bin/feishu-codex.mjs bridge smoke
node packages/feishu-codex-cli/bin/feishu-codex.mjs bridge start
```

Minimum checks:

- `codexWorkdir` points at the intended workspace.
- `larkProfile` is logged in.
- `bridge smoke` passes before `bridge start`.
- Logs and stop command are known:
  - `codex-x bridge logs`
  - `codex-x bridge stop`

## Tunnel / Network Path

Before starting a tunnel, confirm:

- Is it private or public?
- Is authentication enforced?
- How long should it run?
- Which command stops it?
- Which logs show access?

Never bind a local service to `0.0.0.0` unless the user explicitly accepts that risk and there is a firewall or auth layer.

## Secrets and Files

- Do not print API keys, cookies, OAuth refresh tokens, or full auth files.
- Do not expose the whole home directory.
- Prefer exposing one explicit workspace or one explicit local endpoint.
- If screenshots/files are bridged, store them under a predictable local artifact directory and report paths.

## Verification

Summarize:

- what is reachable remotely
- who can reach it
- how to stop it
- where logs live
- what was not exposed

If any of those are unclear, stop and ask before proceeding.
