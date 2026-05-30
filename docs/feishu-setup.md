# Feishu Setup

`packages/feishu-codex-cli/` 是可选模块。

第一版会覆盖：

- 环境变量与配置文件格式
- 初始化命令
- 启动桥接命令
- 常见故障排查

## 1. 打印示例配置

```bash
cd codex-x
node packages/feishu-codex-cli/bin/feishu-codex.mjs init --write-config
```

如果你只想打印环境变量示例，不想写文件，可以改用：

```bash
node packages/feishu-codex-cli/bin/feishu-codex.mjs init --print-example
```

## 2. 准备配置

你可以使用两种方式：

- `.env`
- `feishu-codex.config.json`

建议至少配置：

- `FEISHU_LARK_PROFILE`
- `CODEX_WORKDIR`
- `CODEX_THREAD_NAME`

说明：

- 当前第一版桥接运行时复用了现有 `lark-cli` 事件/发消息链路，所以真正起桥接时最关键的是 `lark-cli` profile，而不是直接在 CLI 内走 `appId/appSecret`。
- `FEISHU_APP_ID / FEISHU_APP_SECRET` 仍然保留在配置模型里，方便后续切到更纯的飞书 app 模式。

## 3. 启动桥接

当前第一版提供的是可执行 CLI 骨架：

```bash
node packages/feishu-codex-cli/bin/feishu-codex.mjs bridge start
node packages/feishu-codex-cli/bin/feishu-codex.mjs bridge status
node packages/feishu-codex-cli/bin/feishu-codex.mjs bridge logs
node packages/feishu-codex-cli/bin/feishu-codex.mjs bridge stop
node packages/feishu-codex-cli/bin/feishu-codex.mjs doctor
node packages/feishu-codex-cli/bin/feishu-codex.mjs bridge smoke
node packages/feishu-codex-cli/bin/feishu-codex.mjs send "看图：![chart](./chart.png)"
```

`doctor` 会输出一份 JSON 体检报告，至少检查：

- `codex` 是否可用
- `lark-cli` 是否可用
- `larkProfile` 是否已配置
- `codexWorkdir` 是否存在

同时还会给出 `nextActions`，告诉用户下一步应该先补哪一项环境。

`bridge smoke` 会在 `DRY_RUN` 模式下真实启动一次 runtime 脚本，但不会去连接飞书或 Codex 外部链路，适合在正式启桥前做一次本地冒烟。

`bridge status` 现在也会尝试根据 `pid` 判断桥接进程是否还活着，并把状态收口为：

- `running`
- `stale`
- `stopped`
- 或原始准备态

## 4. 常见问题

- `CHAT_ID` / `USER_ID` 为空：
  第一版不再内置任何真实默认值，需要用户自己配置。
- `CODEX_WORKDIR` 没填：
  桥接无法把消息投递到正确工作区。
- 想直接复制旧脚本：
  不建议。`codex-x` 的目标是收口成可发布 CLI，而不是继续沿用私有部署包装。
