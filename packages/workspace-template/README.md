# workspace-template

这是 `codex-x` 里的默认工作区模板。

它的职责很单纯：

- 给 Codex 一个可以长期积累上下文的目录结构
- 给初始化器一个明确的模板来源
- 不把业务脚本和额外平台逻辑塞进模板本体

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

## 它包含什么

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

## 它不负责什么

- 不负责安装依赖
- 不负责提问初始化
- 不负责飞书桥接

这些分别由：

- `create-codex-x`
- `feishu-codex-cli`

来处理。

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
node ./bin/codex-x.mjs init ...
```

来生成工作区，这样初始化和归档会一起完成。
