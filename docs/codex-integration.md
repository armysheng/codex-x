# Codex Integration

这份文档将说明：

- Codex 进入工作区时应优先读取哪些文件
- 初始化后哪些文件最常被用户维护
- 初始化如何注册 Codex automation 做每日记忆整理
- 可选 Codex skill 如何安装和触发
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

这条 automation 不依赖系统 cron，也不要求用户理解额外脚本。它本质是一条本地 Codex prompt：到点后唤醒 Codex，让模型按工作区规则自己整理记忆。

默认整理逻辑：

- 先读取 `AGENTS.md` / `CLAUDE.md`，遵守安全、记忆和外部动作边界。
- 读取今天和昨天的 `0-System/memory/YYYY-MM-DD.md`，必要时创建今天的 daily memory。
- 尽量把重要信息写进当天 daily memory，包括关键决策、项目进展、资源变化、工具变化、错误教训、用户明确偏好、承诺过的待办。
- 每条重要信息尽量保留证据线索，例如文件路径、命令结果、会话中明确确认的结论或可复查来源。
- 用简短摘要更新 `0-System/status.md`，阶段背景变化时更新 `0-System/context.md`。
- 只有稳定偏好或长期结论才更新 `0-System/about-me/MEMORY.md`。

已有工作区可以用下面的命令补装或重建：

```bash
node ./bin/codex-x.mjs automation install <workspace>
```

## 解锁插件 skill 和移动端访问 skill

`packages/workspace-template/skills/` 是用户工作区里的扩展位，默认不预装会改登录态或网络入口的 skill。

仓库根目录的 `skills/` 现在只放两个明确能力：

- 解锁插件 skill：`codex-plugin-unlock-zhuji`，安全解锁 Codex App 插件并配置筑基 Provider。
- 移动端访问 skill：`codex-remote-access`，从手机、平板或另一台设备访问 Codex 工作区，优先走飞书桥接或私有网络。

安装到本机 Codex：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/* "${CODEX_HOME:-$HOME/.codex}/skills/"
chmod +x "${CODEX_HOME:-$HOME/.codex}/skills/codex-plugin-unlock-zhuji/scripts/backup_codex_state.sh"
```

触发方式：

```text
使用 $codex-plugin-unlock-zhuji 帮我安全解锁 Codex 插件，Provider 用筑基。
```

```text
使用 $codex-remote-access 帮我安全配置 Codex 工作区的移动端访问。
```

这类 skill 的原则是 opt-in：让用户明确安装、明确触发，不在初始化阶段自动改动 `~/.codex/auth.json`、`~/.codex/config.toml` 或网络暴露面。
