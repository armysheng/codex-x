# codex-x

[![GitHub stars](https://img.shields.io/github/stars/armysheng/codex-x?style=flat-square)](https://github.com/armysheng/codex-x/stargazers)
[![GitHub release](https://img.shields.io/github/v/release/armysheng/codex-x?style=flat-square)](https://github.com/armysheng/codex-x/releases)
[![License](https://img.shields.io/github/license/armysheng/codex-x?style=flat-square)](./LICENSE)
[![Codex](https://img.shields.io/badge/Built_for-Codex-0ea5e9?style=flat-square)](https://github.com/armysheng/codex-x)

![codex-x overview](./docs/assets/codex-x-overview.svg)
![codex-x install demo](./docs/assets/codex-x-install-terminal.svg)
![codex-x doctor smoke demo](./docs/assets/codex-x-doctor-smoke.svg)
![codex-x workspace structure](./docs/assets/codex-x-workspace-structure.svg)
![codex-x daily digest](./docs/assets/codex-x-digest.svg)

`codex-x` is a memory-first local workspace toolkit for Codex.

It focuses on a small but useful surface area:

- a workspace that keeps context alive
- a one-command bootstrap path
- an optional Feishu bridge for local Codex workflows

## One-command install

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/armysheng/codex-x/main/install.sh)
```

This command will:

1. clone `codex-x`
2. install dependencies
3. initialize a default workspace

## What it is

> `codex-x` = a memory-first Codex workspace template + a bootstrapper + an optional Feishu bridge.

## Why this project exists

Most AI coding setups are missing one important thing: durable project context.

`codex-x` tries to solve that without forcing you into a heavy platform:

- file-based memory instead of a database-first architecture
- a bootstrapper instead of manual folder copying
- an optional bridge instead of a mandatory messaging layer

## Three modules, three jobs

| Module | What it solves | When you need it |
|---|---|---|
| `workspace-template` | Gives Codex a memory-first workspace structure | You want Codex to remember who you are, what the project is, and what changed recently |
| `create-codex-x` | Turns the template into a ready-to-use workspace | You want setup in one command instead of manual copying |
| `feishu-codex-cli` | Connects Feishu as a message entrypoint to local Codex | You already have a local workspace and want to drive it from Feishu |

`feishu-codex-cli` currently supports:

- `init`
- `doctor`
- `bridge start`
- `bridge status`
- `bridge logs`
- `bridge stop`
- `bridge smoke`
- `send`

`create-codex-x` also includes:

- `digest`
  Summarizes recent daily memory and can write back to `status.md` / `context.md`

## Optional skills

The repo can also host opt-in Codex skills under `skills/`. These skills are not copied into the default workspace template automatically.

Current skills:

| Skill | What it does | Safety boundary |
|---|---|---|
| `codex-plugin-unlock-zhuji` | Safely unlocks Codex App plugins while keeping model requests on a Zhuji provider | Back up `auth.json/config.toml` and show rollback before restart |
| `codex-remote-access` | Plan remote access to a Codex workspace through Feishu bridge, private network, or reversible tunnel | Do not expose local Codex, workspace files, or credentials by default |

Install it locally:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/* "${CODEX_HOME:-$HOME/.codex}/skills/"
chmod +x "${CODEX_HOME:-$HOME/.codex}/skills/codex-plugin-unlock-zhuji/scripts/backup_codex_state.sh"
```

Then ask Codex:

```text
Use $codex-plugin-unlock-zhuji to safely unlock Codex App plugins with Zhuji provider.
```

```text
Use $codex-remote-access to safely set up remote access to my Codex workspace.
```

See [Skills](./docs/skills.md) for details.

## Quick manual setup

```bash
cd codex-x
npm install
node ./bin/codex-x.mjs init --answers examples/bootstrap.answers.example.json ./tmp/my-workspace
cd ./tmp/my-workspace
codex
```

If you later publish the bootstrapper separately, the intended shape is:

```bash
npx create-codex-x my-workspace
cd my-workspace
codex
```

## Let Codex install it for you

You can give Codex this directly:

```text
Please run this in the repo root:

1. `bash <(curl -fsSL https://raw.githubusercontent.com/armysheng/codex-x/main/install.sh)`
2. Tell me the installed repo path and workspace path
3. Remind me to enter the workspace and run `codex`
```

## Daily digest

To summarize the last two days of daily memory:

```bash
node ./bin/codex-x.mjs digest ./tmp/my-workspace --write-status --write-context
```

This will:

- read recent `0-System/memory/*.md`
- generate a digest
- optionally write back to `status.md`
- optionally write back to `context.md`

## Repository shape

The repo intentionally stays small:

```text
packages/
├── workspace-template/
├── create-codex-x/
└── feishu-codex-cli/

skills/
├── codex-plugin-unlock-zhuji/
└── codex-remote-access/
```

The point is not to look “architecturally impressive”.
The point is to keep the top-level understandable and let the project grow from real usage.

## Docs

- [Getting Started](./docs/getting-started.md)
- [Codex Integration](./docs/codex-integration.md)
- [Skills](./docs/skills.md)
- [Memory Model](./docs/memory-model.md)
- [Feishu Setup](./docs/feishu-setup.md)
- [FAQ](./docs/faq.md)
- [Positioning](./docs/positioning.md)
- [Launch Kit](./docs/launch-kit.md)
- [Channel Posts](./docs/channel-posts.md)
- [Screenshots Plan](./docs/screenshots.md)
- [Final Launch Plan](./docs/final-launch-plan.md)
- [Release Checklist](./docs/release-checklist.md)
- [Contributing](./CONTRIBUTING.md)

## License

MIT
