import { clearSessionCookie } from "../../_lib/auth.js";
import { isSameOrigin, json } from "../../_lib/http.js";

export async function onRequestPost({ request }) {
  if (!isSameOrigin(request)) return json({ error: "请求来源无效。" }, 403);
  return json(
    { ok: true },
    200,
    { "set-cookie": clearSessionCookie(request) }
  );
}

