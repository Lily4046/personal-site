import { json } from "../_lib/http.js";
import { requireDb } from "../_lib/moments.js";

export async function onRequestGet({ env }) {
  const dbError = requireDb(env);
  if (dbError) return dbError;

  try {
    const row = await env.DB.prepare(
      "SELECT value, updated_at FROM site_content WHERE key = 'main'"
    ).first();
    if (!row) return json({ content: null, updatedAt: null });
    return json({
      content: JSON.parse(row.value),
      updatedAt: row.updated_at
    });
  } catch (error) {
    return json({ error: "读取整站内容失败。" }, 500);
  }
}

