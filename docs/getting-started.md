# Getting Started

`codex-x` 提供两条路径：

- 只用 `workspace-template` 和初始化器
- 在此基础上再接入飞书桥接

第一版目标是让用户先在本地工作区里跑通记忆系统，不要求任何远端服务。

## 1. 安装依赖

```bash
cd codex-x
npm install
```

## 2. 生成一个工作区

```bash
node ./bin/codex-x.mjs init --answers examples/bootstrap.answers.example.json ./tmp/my-workspace
```

如果不带 `--answers`，初始化器会进入交互式问答。

也可以这样：

```bash
npm run init:workspace -- ./tmp/my-workspace
```

## 3. 进入工作区使用 Codex

```bash
cd ./tmp/my-workspace
codex
```

首次生成后可以重点看这些文件：

- `0-System/about-me/USER.md`
- `0-System/about-me/IDENTITY.md`
- `0-System/about-me/SOUL.md`
- `0-System/status.md`
- `0-System/context.md`
- `0-System/memory/<today>.md`

## 4. 如果要接飞书

```bash
cd ../../
node packages/feishu-codex-cli/bin/feishu-codex.mjs init --write-config
```

这会生成一个本地 `feishu-codex.config.json`。当前第一版真实桥接主路径依赖 `lark-cli` profile，请至少补：

- `larkProfile`
- `codexWorkdir`
- `codexThreadName`

然后启动：

```bash
node packages/feishu-codex-cli/bin/feishu-codex.mjs bridge start
```
