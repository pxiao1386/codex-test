import json
import logging
import sqlite3
from typing import Dict, List

from utils import ensure_dir, ensure_parent_dir, now_str, sha256_text

LOGGER = logging.getLogger(__name__)


class Storage:
    def __init__(self, db_path: str):
        self.db_path = db_path
        ensure_parent_dir(db_path)
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        self._init_tables()

    def close(self):
        self.conn.close()

    def _init_tables(self):
        self.conn.execute(
            """
            CREATE TABLE IF NOT EXISTS replies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id TEXT,
                post_hash TEXT UNIQUE,
                section_name TEXT,
                author TEXT,
                content TEXT,
                reply_time TEXT,
                created_at TEXT,
                priority_level TEXT,
                relevance_score INTEGER,
                short_reason TEXT,
                post_link TEXT,
                post_question TEXT
            )
            """
        )
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_post_id ON replies(post_id)")
        self.conn.commit()

    def make_post_hash(self, item: Dict) -> str:
        raw = (
            f"{item.get('owner_reply_content', '')}|{item.get('reply_time', '')}|"
            f"{item.get('owner_name', '')}|{item.get('section_name', '')}"
        )
        return sha256_text(raw)

    def exists(self, post_id: str, post_hash: str) -> bool:
        cur = self.conn.execute(
            "SELECT 1 FROM replies WHERE (post_id = ? AND post_id != '') OR post_hash = ? LIMIT 1",
            (post_id, post_hash),
        )
        return cur.fetchone() is not None

    def save_new_items(self, items: List[Dict]) -> List[Dict]:
        inserted: List[Dict] = []

        for item in items:
            post_id = item.get("post_id", "")
            post_hash = self.make_post_hash(item)
            if self.exists(post_id, post_hash):
                continue

            payload = (
                post_id,
                post_hash,
                item.get("section_name", ""),
                item.get("owner_name", ""),
                item.get("owner_reply_content", ""),
                item.get("reply_time", ""),
                now_str(),
                item.get("priority_level", ""),
                item.get("relevance_score", 0),
                item.get("short_reason", ""),
                item.get("post_link", ""),
                item.get("post_question", ""),
            )
            self.conn.execute(
                """
                INSERT INTO replies(
                    post_id, post_hash, section_name, author, content, reply_time,
                    created_at, priority_level, relevance_score, short_reason,
                    post_link, post_question
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                payload,
            )
            new_item = dict(item)
            new_item["post_hash"] = post_hash
            inserted.append(new_item)

        self.conn.commit()
        LOGGER.info("Inserted %s new records to SQLite", len(inserted))
        return inserted


def save_json(items: List[Dict], output_dir: str, date_str: str) -> str:
    ensure_dir(output_dir)
    file_path = f"{output_dir}/{date_str}.json"
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    return file_path
