import { existsSync } from "node:fs";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"]);
const CARD_FENCE_RE = /```(?:feishu-card|lark-card)\s*\n([\s\S]*?)\n```/gi;
const MARKDOWN_MEDIA_RE = /(!)?\[([^\]]*)\]\(([^)\s]+)\)/g;

function compactText(text) {
  return String(text || "").replace(/[ \t]+\n/g, "\n").trim();
}

function parseJsonMaybe(value) {
  if (value && typeof value === "object") return value;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function isRemoteReference(ref) {
  return /^[a-z][a-z0-9+.-]*:/i.test(ref) && !ref.startsWith("file:");
}

function isImagePath(ref) {
  const pathname = ref.split(/[?#]/, 1)[0];
  return IMAGE_EXTENSIONS.has(path.extname(pathname).toLowerCase());
}

function resolveLocalReference(ref, cwd) {
  if (!ref || isRemoteReference(ref)) return null;
  const withoutFileProtocol = ref.startsWith("file://") ? new URL(ref).pathname : ref;
  let decoded = withoutFileProtocol;
  try {
    decoded = decodeURIComponent(withoutFileProtocol);
  } catch {
    // Ignore malformed URI encoding and keep the raw string.
  }
  return path.isAbsolute(decoded) ? decoded : path.resolve(cwd, decoded);
}

function pushText(segments, text) {
  const trimmed = compactText(text);
  if (trimmed) segments.push({ type: "text", text: trimmed });
}

function planTextMediaFragment(fragment, options) {
  const cwd = options.cwd || process.cwd();
  const segments = [];
  let cursor = 0;
  MARKDOWN_MEDIA_RE.lastIndex = 0;
  for (const match of fragment.matchAll(MARKDOWN_MEDIA_RE)) {
    const [raw, bang, title, href] = match;
    pushText(segments, fragment.slice(cursor, match.index));
    const localPath = resolveLocalReference(href, cwd);
    if (localPath && existsSync(localPath)) {
      if (bang || isImagePath(localPath)) {
        segments.push({ type: "image", path: localPath, alt: title || path.basename(localPath) });
      } else {
        segments.push({ type: "file", path: localPath, title: title || path.basename(localPath) });
      }
    } else if (bang && isRemoteReference(href)) {
      segments.push({ type: "markdown", text: raw });
    } else {
      pushText(segments, raw);
    }
    cursor = (match.index || 0) + raw.length;
  }
  pushText(segments, fragment.slice(cursor));
  return segments;
}

export function planFeishuReplies(answer, options = {}) {
  const segments = [];
  const source = String(answer || "");
  let cursor = 0;
  CARD_FENCE_RE.lastIndex = 0;
  for (const match of source.matchAll(CARD_FENCE_RE)) {
    segments.push(...planTextMediaFragment(source.slice(cursor, match.index), options));
    const card = parseJsonMaybe(match[1]);
    if (card) segments.push({ type: "interactive", content: card });
    else pushText(segments, match[0]);
    cursor = (match.index || 0) + match[0].length;
  }
  segments.push(...planTextMediaFragment(source.slice(cursor), options));
  if (segments.length === 0) return [{ type: "text", text: "我这边完成了，但没有拿到可发送的文本回复。" }];
  return segments;
}

export function parseFeishuContent(messageType, content) {
  const parsed = parseJsonMaybe(content);
  if (messageType === "text") {
    return { text: compactText(parsed?.text ?? content), attachments: [] };
  }
  if (messageType === "image") {
    const imageKey = parsed?.image_key || parsed?.imageKey || compactText(content);
    return { text: "", attachments: imageKey ? [{ type: "image", fileKey: imageKey }] : [] };
  }
  if (messageType === "file") {
    const fileKey = parsed?.file_key || parsed?.fileKey;
    const name = parsed?.file_name || parsed?.name;
    return { text: "", attachments: fileKey ? [{ type: "file", fileKey, name }] : [] };
  }
  return {
    text: compactText(content ? `[暂不支持的飞书消息类型：${messageType}]\n${content}` : `[暂不支持的飞书消息类型：${messageType}]`),
    attachments: []
  };
}

export function createCodexInputText(event) {
  const parts = [];
  const text = compactText(event?.text || "");
  if (text) parts.push(text);
  for (const attachment of event?.attachments || []) {
    if (!attachment.path) continue;
    const name = attachment.name || path.basename(attachment.path);
    if (attachment.type === "image") {
      parts.push(`用户上传了图片：${name}\n![${name}](${attachment.path})`);
    } else {
      parts.push(`用户上传了文件：${name}\n本机路径：${attachment.path}`);
    }
  }
  return parts.join("\n\n").trim();
}
