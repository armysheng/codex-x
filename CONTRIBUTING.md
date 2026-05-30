# Contributing to codex-x

`codex-x` 目前还在快速收口阶段，所以贡献原则很简单：

## 先看什么

开始前建议先看：

- [README.md](./README.md)
- [docs/getting-started.md](./docs/getting-started.md)
- [docs/codex-integration.md](./docs/codex-integration.md)
- [docs/feishu-setup.md](./docs/feishu-setup.md)

## 这个项目最欢迎的贡献

- 把模板再收小一点，让默认工作区更干净
- 改善初始化体验，让第一次上手更顺
- 补更多 `doctor / smoke / send` 这类低门槛工具
- 提高飞书桥接的稳定性和可观测性
- 写更清楚的文档、示例和演示

## 开发原则

- 优先本地优先，不先上复杂服务
- 优先文件化记忆，不先引入数据库
- 优先清晰边界，不先拆过多包
- 优先让用户真的用起来，不只做“看起来完整”的系统

## 提交前建议

```bash
npm test
node ./scripts/check-redactions.mjs
```

## 当前结构约定

顶层只保留 3 个功能包：

- `packages/workspace-template/`
- `packages/create-codex-x/`
- `packages/feishu-codex-cli/`

如果未来真的长出第 4、5 个功能，再考虑拆共享层。
