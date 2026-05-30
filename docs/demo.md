# Demo

`codex-x` 的 README 不放占位图。要做真实截图时，先跑本地 demo，再截终端输出。

## 运行

```bash
npm run demo
```

这个命令会：

- 在系统临时目录创建一个 `my-workspace`；
- 使用真实 `codex-x init --yes` 初始化工作区；
- 使用临时 `CODEX_HOME` 注册 `codex-x 每日记忆整理` automation；
- 打印工作区记忆结构和 automation 摘要；
- 默认清理临时文件。

如果你想保留生成出来的 workspace 继续检查：

```bash
npm run demo -- --keep
```

## 适合截图的内容

优先截这三段：

- 初始化输出：`Initialized codex-x workspace` 和 `Registered Codex automation`。
- `Workspace memory tree`：展示 `0-System/status.md`、`context.md`、`memory/YYYY-MM-DD.md`、`about-me/MEMORY.md`。
- `Codex automation`：展示 `name`、`schedule`、`prompt-native daily memory: yes`。

## 为什么这样做

这不是画出来的 mock 图，而是从当前仓库真实 CLI 生成的输出。它更适合作为 GitHub README、发布帖和社群传播里的截图素材。
