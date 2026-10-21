CREATE TABLE IF NOT EXISTS moments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '日常',
  tags TEXT NOT NULL DEFAULT '[]',
  text TEXT NOT NULL,
  image TEXT,
  image_alt TEXT,
  image_caption TEXT,
  link_label TEXT,
  link_href TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS moments_public_order
  ON moments (published, date DESC, id DESC);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('status_title', '在哈尔滨，整理主页。'),
  ('status_note', '正在把散落的项目、卡片和文字放到同一个坐标里。');

