import { json } from "./http.js";

export function serializeMoment(row) {
  let tags = [];
  try {
    tags = JSON.parse(row.tags || "[]");
  } catch (error) {
    tags = [];
  }

  return {
    id: row.id,
    date: row.date,
    time: row.time,
    category: row.category,
    tags,
    text: row.text,
    image: row.image || "",
    imageAlt: row.image_alt || "",
    imageCaption: row.image_caption || "",
    link: row.link_href
      ? {
          label: row.link_label || "打开链接",
          href: row.link_href
        }
      : null,
    published: Boolean(row.published),
    updatedAt: row.updated_at
  };
}

export function validateMoment(input) {
  const normalized = {
    date: String(input?.date || "").trim(),
    time: String(input?.time || "").trim(),
    category: String(input?.category || "日常").trim(),
    tags: Array.isArray(input?.tags)
      ? input.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
    text: String(input?.text || "").trim(),
    image: String(input?.image || "").trim(),
    imageAlt: String(input?.imageAlt || "").trim(),
    imageCaption: String(input?.imageCaption || "").trim(),
    linkLabel: String(input?.linkLabel || "").trim(),
    linkHref: String(input?.linkHref || "").trim(),
    published: input?.published !== false
  };

  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(normalized.date)) {
    return { error: "日期格式应为 YYYY.MM.DD。" };
  }
  if (!normalized.text) {
    return { error: "动态正文不能为空。" };
  }
  if (normalized.image && !/^(https?:\/\/|\/|\.\.?\/)/i.test(normalized.image)) {
    return { error: "图片地址必须是 http(s)、根路径或相对路径。" };
  }
  if (normalized.linkHref && !/^(https?:\/\/|\/|\.\.?\/|#)/i.test(normalized.linkHref)) {
    return { error: "链接地址格式不正确。" };
  }
  if (normalized.linkHref && !normalized.linkLabel) {
    normalized.linkLabel = "打开链接";
  }
  return { value: normalized };
}

export function requireDb(env) {
  if (!env.DB) {
    return json({ error: "D1 database binding is not configured." }, 503);
  }
  return null;
}

