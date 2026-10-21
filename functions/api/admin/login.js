import {
  createSession,
  passwordMatches,
  sessionCookie
} from "../../_lib/auth.js";
import { isSameOrigin, json, readJson } from "../../_lib/http.js";

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return json({ error: "请求来源无效。" }, 403);
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return json(
      { error: "后台尚未设置 ADMIN_PASSWORD 和 SESSION_SECRET。" },
      503
    );
  }

  const body = await readJson(request);
  const valid = await passwordMatches(
    String(body?.password || ""),
    env.ADMIN_PASSWORD
  );
  if (!valid) return json({ error: "密码错误。" }, 401);

  const token = await createSession(env.SESSION_SECRET);
  return json(
    { ok: true },
    200,
    { "set-cookie": sessionCookie(request, token) }
  );
}

