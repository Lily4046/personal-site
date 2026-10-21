import { isAuthenticated } from "../../_lib/auth.js";
import { isSameOrigin, json, readJson } from "../../_lib/http.js";
import { requireDb } from "../../_lib/moments.js";
import { validateSiteContent } from "../../_lib/site.js";

async function authorize(request, env) {
  if (!(await isAuthenticated(request, env))) {
    return json({ error: "请先登录后台。" }, 401);
  }
  if (request.method !== "GET" && !isSameOrigin(request)) {
    return json({ error: "请求来源无效。" }, 403);
  }
  return requireDb(env);
}

export async function onRequestGet({ request, env }) {
  const authError = await authorize(request, env);
  if (authError) return authError;
  const row = await env.DB.prepare(
    "SELECT value, updated_at FROM site_content WHERE key = 'main'"
  ).first();
  if (!row) return json({ content: null, updatedAt: null });
  return json({ content: JSON.parse(row.value), updatedAt: row.updated_at });
}

export async function onRequestPut({ request, env }) {
  const authError = await authorize(request, env);
  if (authError) return authError;

  const body = await readJson(request);
  const validated = validateSiteContent(body?.content);
  if (validated.error) return json({ error: validated.error }, 400);

  await env.DB.prepare(
    `INSERT INTO site_content (key, value, updated_at)
     VALUES ('main', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       updated_at = datetime('now')`
  )
    .bind(validated.serialized)
    .run();

  return json({ ok: true });
}

