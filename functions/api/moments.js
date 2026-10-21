import { json } from "../_lib/http.js";
import { requireDb, serializeMoment } from "../_lib/moments.js";

const BASE_CATEGORIES = ["全部", "站点", "设计", "工程", "无线电", "日常"];

export async function onRequestGet({ env }) {
  const dbError = requireDb(env);
  if (dbError) return dbError;

  try {
    const [momentRows, settingRows] = await Promise.all([
      env.DB.prepare(
        `SELECT id, date, time, category, tags, text, image, image_alt,
                image_caption, link_label, link_href, published, updated_at
           FROM moments
          WHERE published = 1
          ORDER BY date DESC, id ASC`
      ).all(),
      env.DB.prepare("SELECT key, value FROM settings").all()
    ]);

    const settings = Object.fromEntries(
      (settingRows.results || []).map((row) => [row.key, row.value])
    );
    const entries = (momentRows.results || []).map(serializeMoment);
    const foundCategories = entries.map((entry) => entry.category).filter(Boolean);
    const categories = [
      ...BASE_CATEGORIES,
      ...foundCategories.filter(
        (category, index, list) =>
          !BASE_CATEGORIES.includes(category) && list.indexOf(category) === index
      )
    ];

    return json({
      updated: entries[0]?.date || "",
      status: {
        title: settings.status_title || "最近的动态",
        note: settings.status_note || "记录正在发生的事。"
      },
      categories,
      entries
    });
  } catch (error) {
    return json({ error: "读取动态失败。" }, 500);
  }
}

