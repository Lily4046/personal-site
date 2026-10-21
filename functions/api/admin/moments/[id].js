import { isAuthenticated } from "../../../_lib/auth.js";
import { isSameOrigin, json, readJson } from "../../../_lib/http.js";
import { requireDb, validateMoment } from "../../../_lib/moments.js";

async function authorize(request, env) {
  if (!(await isAuthenticated(request, env))) {
    return json({ error: "请先登录后台。" }, 401);
  }
  if (!isSameOrigin(request)) return json({ error: "请求来源无效。" }, 403);
  const dbError = requireDb(env);
  return dbError;
}

function parseId(params) {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function onRequestPut({ request, env, params }) {
  const authError = await authorize(request, env);
  if (authError) return authError;
  const id = parseId(params);
  if (!id) return json({ error: "动态 ID 无效。" }, 400);

  const input = await readJson(request);
  const validated = validateMoment(input);
  if (validated.error) return json({ error: validated.error }, 400);
  const value = validated.value;

  const result = await env.DB.prepare(
    `UPDATE moments
        SET date = ?, time = ?, category = ?, tags = ?, text = ?,
            image = ?, image_alt = ?, image_caption = ?, link_label = ?,
            link_href = ?, published = ?, updated_at = datetime('now')
      WHERE id = ?`
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
      value.published ? 1 : 0,
      id
    )
    .run();

  if (!result.meta.changes) return json({ error: "没有找到这条动态。" }, 404);
  return json({ ok: true, id });
}

export async function onRequestDelete({ request, env, params }) {
  const authError = await authorize(request, env);
  if (authError) return authError;
  const id = parseId(params);
  if (!id) return json({ error: "动态 ID 无效。" }, 400);

  const result = await env.DB.prepare("DELETE FROM moments WHERE id = ?")
    .bind(id)
    .run();
  if (!result.meta.changes) return json({ error: "没有找到这条动态。" }, 404);
  return json({ ok: true, id });
}

