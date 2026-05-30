# Skills

`codex-x` 的默认工作区模板保持克制：不把业务专用 skill 自动塞进每个新工作区。

仓库根目录的 `skills/` 是可选能力包发布位。用户需要时再安装，尤其是会改 `~/.codex/auth.json`、`~/.codex/config.toml`、网络暴露或远程入口的高风险 skill。

## Skill Registry

| Skill | 适用场景 | 触发示例 |
|---|---|---|
| `codex-plugin-unlock-zhuji` | 解锁 Codex App 插件、处理插件灰屏、配置筑基 Provider，同时避免把当前 Codex 对话搞坏 | `使用 $codex-plugin-unlock-zhuji 帮我安全解锁 Codex 插件，Provider 用筑基。` |
| `codex-remote-access` | 从异地、另一台设备或消息渠道访问 Codex 工作区；选择飞书桥接、SSH/Tailscale/Cloudflare Tunnel 等入口，并控制暴露面 | `使用 $codex-remote-access 帮我安全配置 Codex 工作区的异地访问。` |

## 推荐安装方式

在 `codex-x` 仓库根目录执行：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/* "${CODEX_HOME:-$HOME/.codex}/skills/"
chmod +x "${CODEX_HOME:-$HOME/.codex}/skills/codex-plugin-unlock-zhuji/scripts/backup_codex_state.sh"
```

如果只想安装单个 skill：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/codex-plugin-unlock-zhuji "${CODEX_HOME:-$HOME/.codex}/skills/"
```

或：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/codex-remote-access "${CODEX_HOME:-$HOME/.codex}/skills/"
```

## 让 Codex 代装

可以把下面这段交给 Codex：

```text
请从当前 codex-x 仓库安装可选 skills 到我的本机 Codex skills 目录。

要求：
1. 先检查 `skills/` 下有哪些 `SKILL.md`，不要修改 auth.json/config.toml，也不要开启任何远程访问。
2. 复制到 `${CODEX_HOME:-$HOME/.codex}/skills/`。
3. 如果 skill 里有 scripts，按需加执行权限。
4. 如果本机有 `quick_validate.py`，逐个运行 skill 校验。
5. 只告诉我安装结果和可用 prompt，不要直接执行任何高风险 skill。
```

## 安全原则

- **Opt-in**：默认工作区不预装这些 skill，用户明确需要时再安装。
- **先备份**：凡是会改 Codex 登录态、配置或网络入口的 skill，都必须先说明风险和回滚方式。
- **最小暴露**：异地访问优先走消息桥接或私有网络，不默认公开本机服务。
- **可审计**：skill 目录只放 `SKILL.md`、`agents/openai.yaml` 和必要脚本，不放额外说明文档。

## 发布到 SkillHub

发布时保持标准结构：

```text
skills/<skill-name>/
├── SKILL.md
├── agents/openai.yaml
└── scripts/                # 可选
```

提交或公开发布前至少跑：

```bash
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/codex-plugin-unlock-zhuji
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/codex-remote-access
rg -n "sk-[A-Za-z0-9]" skills || true
```
