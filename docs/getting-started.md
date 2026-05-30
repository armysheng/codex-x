# Getting Started

`codex-x` 提供两条路径：

- 一条命令安装
- 手动控制每一步

第一版目标是让用户先在本地工作区里跑通记忆系统，不要求任何远端服务。

## 1. 一条命令安装

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/armysheng/codex-x/main/install.sh)
```

这条命令会自动完成：

- 拉取仓库
- 安装依赖
- 初始化默认工作区

## 2. 手动安装（如果你想自己控制每一步）

```bash
cd codex-x
npm install
```

## 3. 生成一个工作区

```bash
node ./bin/codex-x.mjs init --answers examples/bootstrap.answers.example.json ./tmp/my-workspace
```

如果不带 `--answers`，初始化器会进入交互式问答。

也可以这样：

```bash
npm run init:workspace -- ./tmp/my-workspace
```

## 4. 进入工作区使用 Codex

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

## 5. 如果要接飞书

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
