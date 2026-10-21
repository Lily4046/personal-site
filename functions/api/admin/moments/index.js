import { isAuthenticated } from "../../../_lib/auth.js";
import { isSameOrigin, json, readJson } from "../../../_lib/http.js";
import {
  requireDb,
  serializeMoment,
  validateMoment
} from "../../../_lib/moments.js";

async function authorize(request, env) {
  if (!(await isAuthenticated(request, env))) {
    return json({ error: "请先登录后台。" }, 401);
  }
  return null;
}

export async function onRequestGet({ request, env }) {
  const authError = await authorize(request, env);
  if (authError) return authError;
  const dbError = requireDb(env);
  if (dbError) return dbError;

  const rows = await env.DB.prepare(
    `SELECT id, date, time, category, tags, text, image, image_alt,
            image_caption, link_label, link_href, published, updated_at
       FROM moments
      ORDER BY date DESC, id ASC`
  ).all();

  return json({ entries: (rows.results || []).map(serializeMoment) });
}

export async function onRequestPost({ request, env }) {
  const authError = await authorize(request, env);
  if (authError) return authError;
  if (!isSameOrigin(request)) return json({ error: "请求来源无效。" }, 403);
  const dbError = requireDb(env);
  if (dbError) return dbError;

  const input = await readJson(request);
  const validated = validateMoment(input);
  if (validated.error) return json({ error: validated.error }, 400);
  const value = validated.value;

  const result = await env.DB.prepare(
    `INSERT INTO moments
      (date, time, category, tags, text, image, image_alt, image_caption,
       link_label, link_href, published, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  )
    .bind(
      value.date,
      value.time,
      value.category,
      JSON.stringify(value.tags),
      value.text,
      value.image || null,
      value.imageAlt || null,
      value.imageCaption || null,
      value.linkLabel || null,
      value.linkHref || null,
      value.published ? 1 : 0
    )
    .run();

  return json({ ok: true, id: result.meta.last_row_id }, 201);
}

