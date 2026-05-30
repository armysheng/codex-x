# FAQ

## `codex-x` 和只写一个 `AGENTS.md` 有什么区别？

单个 `AGENTS.md` 更像“规则入口”。

`codex-x` 额外提供的是一整套可持续更新的记忆结构：

- `status.md`
- `context.md`
- `memory/YYYY-MM-DD.md`
- `about-me/MEMORY.md`

它解决的是“项目和用户上下文怎么留住”的问题。

## 如果我完全不用飞书，这个项目还有意义吗？

有。

飞书桥接只是可选模块。对很多人来说，真正值钱的是：

- 初始化器
- 最小工作区骨架
- 可维护的记忆模型

## 为什么不直接做成完整平台？

因为很多项目死在“设计太大、上手太难”。

`codex-x` 的取舍是：

- 先把本地闭环做扎实
- 先让人用起来
- 再决定后面要不要扩更多入口

## 这个项目适合谁 fork / 改造？

适合这些人：

- 想做自己的 Codex 工作区骨架
- 想把消息渠道桥接到本地 AI 工作流
- 想保留本地优先，而不是一开始就托管到远端

## 现在最推荐怎么体验它？

```bash
npm install
node packages/create-codex-x/bin/create-codex-x.mjs \
  --answers examples/bootstrap.answers.example.json \
  ./tmp/my-workspace
```

如果你要看飞书桥接这条线，再跑：

```bash
node packages/feishu-codex-cli/bin/feishu-codex.mjs doctor
node packages/feishu-codex-cli/bin/feishu-codex.mjs bridge smoke
```
