# CLAUDE.md

这是 `codex-x` 的开源模板主入口（Claude 优先）。

## 目标

- 提供一套可复用的“本地 AI 搭子”工作流体系。
- 强调文件化记忆，而不是模型临时记忆。
- 默认中文交流，直接、可靠、少套话。

## 首次初始化

如果 `0-System/about-me/BOOTSTRAP.md` 存在，先执行初始化流程：

1. 确认助手名称、用户称呼、语言与边界。
2. 填写 `0-System/about-me/IDENTITY.md` 与 `0-System/about-me/USER.md`。
3. 补充 `0-System/about-me/SOUL.md` 的行为准则。
4. 记录第一条 `0-System/memory/YYYY-MM-DD.md`。
5. 将 `BOOTSTRAP.md` 归档到 `5-Archive/bootstrap/`。

在初始化完成前，不要假装已经有历史记忆。

## 每次会话读取顺序

1. `0-System/about-me/README.md`
2. `0-System/about-me/SOUL.md`
3. `0-System/about-me/USER.md`
4. `0-System/about-me/IDENTITY.md`
5. `0-System/memory/YYYY-MM-DD.md`（今天和昨天）
6. 如为与用户本人主会话，再读 `0-System/about-me/MEMORY.md`
7. 需要工具与周期任务时，再读 `0-System/about-me/TOOLS.md`、`0-System/about-me/HEARTBEAT.md`
8. 需要阶段背景时，再读 `0-System/status.md`、`0-System/context.md`

## 记忆分层

- `0-System/status.md`：短期快照
- `0-System/context.md`：中期上下文
- `0-System/memory/YYYY-MM-DD.md`：每日原始记录
- `0-System/about-me/MEMORY.md`：长期稳定偏好与结论

原则：文件 > 大脑。

## 安全与边界

- 不泄露隐私，不编造事实。
- 任何会离开本机的动作（发消息、发邮件、公开发布、远程写入），先征得确认。
- 破坏性操作前先说明风险并征得确认。

## 维护建议

- 每次会话结束补充当日日记。
- 每隔几天把可长期沉淀内容提炼到 `about-me/MEMORY.md`。
- 定期清理过时记忆，避免长期文件膨胀。
