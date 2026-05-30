# workspace-template

这是 `codex-x` 里的最小工作区模板。

它不是一个“完整个人系统”，而是一套足够小、足够稳的默认骨架：

- `0-System/`
  身份、记忆、上下文
- `1-Inbox/`
  临时输入
- `2-Projects/`
  项目区
- `3-Thinking/`
  思考与沉淀
- `4-Assets/`
  资产与复用资料
- `5-Archive/`
  归档

## 设计原则

- 优先本地文件，不依赖数据库
- 先把记忆系统跑起来，再谈更复杂的协作能力
- 保持模板最小，不把业务脚本和私有流程塞进来

## 初始化链路

首次初始化围绕 `0-System/about-me/BOOTSTRAP.md` 展开：

1. 决定助手名称与语气
2. 决定用户称呼与时区
3. 明确边界
4. 写入首批 `about-me` 文件
5. 生成第一条日记
6. 归档 `BOOTSTRAP`

## 使用方式

正常情况下，不建议直接手动复制这个模板。

推荐通过：

```bash
node packages/create-codex-x/bin/create-codex-x.mjs ...
```

来生成工作区，这样初始化和归档会一起完成。
