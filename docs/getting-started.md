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
- 注册 Codex automation：每天唤醒 Codex，让模型按工作区规则整理重要信息并回写记忆文件

不想注册自动整理任务时，可以加：

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/armysheng/codex-x/main/install.sh) --no-automation
```

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

交互式初始化会询问是否注册 Codex automation；`--yes` 和 `--answers` 默认注册。它每天 `23:40` 在该工作区唤醒 Codex，让模型直接整理记忆。

默认机制是：

- 先读工作区规则：`AGENTS.md` / `CLAUDE.md`
- 再读今天和昨天的 daily memory
- 把关键决策、项目进展、资源变化、错误教训、用户偏好和待办写回当天记忆
- 用摘要更新 `status.md` / `context.md`

如果这次不想注册：

```bash
node ./bin/codex-x.mjs init --no-automation ./tmp/my-workspace
```

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

## 5. 安装解锁插件 skill 和移动端访问 skill

`codex-x` 的默认工作区不会自动带会改登录态或网络入口的 skill。需要时可以从仓库根目录安装这两个明确能力：

- 解锁插件 skill：`codex-plugin-unlock-zhuji`
- 移动端访问 skill：`codex-remote-access`

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/* "${CODEX_HOME:-$HOME/.codex}/skills/"
chmod +x "${CODEX_HOME:-$HOME/.codex}/skills/codex-plugin-unlock-zhuji/scripts/backup_codex_state.sh"
```

然后新开一轮 Codex 对话：

```text
使用 $codex-plugin-unlock-zhuji 帮我安全解锁 Codex 插件，Provider 用筑基。
```

```text
使用 $codex-remote-access 帮我安全配置 Codex 工作区的移动端访问。
```

这类 skill 可能会修改本机 Codex 登录态、配置或网络暴露面，执行前必须先说明风险、备份或给出停止/回滚命令。

## 6. 如果要接飞书

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

## 7. 每天自动整理

默认初始化已经注册 Codex automation。如果你是已有工作区，或者想重建这条任务：

```bash
node ./bin/codex-x.mjs automation install ./tmp/my-workspace
```

手动调试时可以运行：

```bash
node ./bin/codex-x.mjs digest ./tmp/my-workspace --write-status --write-context
```

它会读取最近两天的 daily memory，并把摘要回写到：

- `0-System/status.md`
- `0-System/context.md`
