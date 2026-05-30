export const DEFAULT_LANGUAGE = "中文";

export function normalizeAnswers(input = {}) {
  return {
    ownerName: input.ownerName || "User",
    assistantName: input.assistantName || "codex-x",
    language: input.language || DEFAULT_LANGUAGE,
    confirmationBoundaries: Array.isArray(input.confirmationBoundaries)
      ? input.confirmationBoundaries
      : ["远端写入", "公开发布", "破坏性操作"]
  };
}
