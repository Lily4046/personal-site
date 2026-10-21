const REQUIRED_SECTIONS = ["identity", "work", "log", "now", "contact"];

export function validateSiteContent(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { error: "整站内容必须是一个 JSON 对象。" };
  }
  for (const section of REQUIRED_SECTIONS) {
    if (!value[section] || typeof value[section] !== "object") {
      return { error: `缺少必需内容区块：${section}。` };
    }
  }
  if (!value.identity?.title || !value.identity?.lead) {
    return { error: "identity.title 和 identity.lead 不能为空。" };
  }
  if (!Array.isArray(value.work?.projects)) {
    return { error: "work.projects 必须是数组。" };
  }
  if (!Array.isArray(value.log?.entries)) {
    return { error: "log.entries 必须是数组。" };
  }
  if (!Array.isArray(value.now?.cards)) {
    return { error: "now.cards 必须是数组。" };
  }
  if (!Array.isArray(value.contact?.links)) {
    return { error: "contact.links 必须是数组。" };
  }

  const serialized = JSON.stringify(value);
  if (serialized.length > 160000) {
    return { error: "整站内容过大，请把图片上传为文件而不是内嵌数据。" };
  }
  if (
    /<\s*\/?\s*(script|iframe|object|embed|style|link|meta)\b/i.test(serialized) ||
    /\bon[a-z]+\s*=/i.test(serialized) ||
    /javascript\s*:/i.test(serialized) ||
    /data\s*:\s*text\/html/i.test(serialized)
  ) {
    return { error: "内容中包含不允许的脚本或可执行 HTML。" };
  }
  return { value, serialized };
}

