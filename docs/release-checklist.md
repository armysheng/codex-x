# Release Checklist

在发布到 GitHub 前，至少确认这些事：

## 仓库内容

- [ ] `README.md` 能在 30 秒内解释项目价值
- [ ] `packages/workspace-template/` 是默认模板入口
- [ ] 根目录没有会误导用户的实验性残留
- [ ] 示例配置不包含真实账号、真实 chat、真实路径

## 质量

- [ ] `npm test` 通过
- [ ] `node ./scripts/check-redactions.mjs` 通过
- [ ] `create-codex-x` 能生成工作区
- [ ] `feishu-codex-cli doctor` 能输出可解释的结果
- [ ] `feishu-codex-cli bridge smoke` 可通过

## 发布面

- [ ] License 明确
- [ ] `CONTRIBUTING.md` 存在
- [ ] Docs 链接有效
- [ ] 至少准备 1 张截图或 1 段 GIF
- [ ] 决定好 repo 名、可见性和归属

## 发布后

- [ ] 补 GitHub Topics
- [ ] 补一句清晰的 repo description
- [ ] 发第一条介绍帖时强调“解决什么问题”，不要只讲实现
