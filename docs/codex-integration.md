# Codex Integration

这份文档将说明：

- Codex 进入工作区时应优先读取哪些文件
- 初始化后哪些文件最常被用户维护
- 初始化如何注册 Codex automation 做每日记忆整理
- 飞书桥接如何把消息注入本地 Codex thread

第一版会以 `packages/workspace-template/` 中的读取顺序为准。

## 推荐读取顺序

进入工作区后，优先读取：

1. `0-System/about-me/README.md`
2. `0-System/about-me/SOUL.md`
3. `0-System/about-me/USER.md`
4. `0-System/about-me/IDENTITY.md`
5. `0-System/memory/YYYY-MM-DD.md`（今天和昨天）
6. `0-System/about-me/MEMORY.md`
7. `0-System/status.md`
8. `0-System/context.md`

## 最常维护的文件

- `status.md`
  当前阶段、当前焦点、临时提醒。
- `context.md`
  本周主线和阶段背景。
- `memory/YYYY-MM-DD.md`
  每日原始记录。
- `about-me/MEMORY.md`
  长期稳定偏好和判断。

## 飞书桥接注入方式

飞书桥接的目标不是替代工作区，而是把飞书消息转成一条本地 Codex 输入：

- 文本直接作为 prompt
- 图片以本地路径 Markdown 形式注入
- 文件以本地路径说明注入

Codex 仍然在本地工作区里读取和更新记忆文件。

## Codex automation

`codex-x init` 可以写入一条本地 Codex automation。交互式初始化会询问用户是否注册；`--yes` 和 `--answers` 默认注册；`--no-automation` 可关闭。

- `id`: `codex-x-memory-digest`
- `name`: `codex-x 每日记忆整理`
- `rrule`: 每天 `23:40`
- `cwd`: 初始化出来的工作区

这条 automation 会在 Codex 里执行本地整理命令：

```bash
node <codex-x-repo>/bin/codex-x.mjs digest <workspace> --write-status --write-context
```

已有工作区可以用下面的命令补装或重建：

```bash
node ./bin/codex-x.mjs automation install <workspace>
```
