import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


def _parse_sections() -> tuple[str, ...]:
    raw = os.getenv("SECTION_KEYWORDS", "敏哥和他的朋友们,生财有术")
    parts = [p.strip() for p in raw.split(",") if p.strip()]
    return tuple(parts) if parts else ("敏哥和他的朋友们", "生财有术")


@dataclass
class Config:
    debug_cdp_url: str = os.getenv("DEBUG_CDP_URL", "http://127.0.0.1:9222")
    max_scroll_rounds: int = int(os.getenv("MAX_SCROLL_ROUNDS", "10"))
    scroll_wait_ms: int = int(os.getenv("SCROLL_WAIT_MS", "2000"))
    max_posts_per_section: int = int(os.getenv("MAX_POSTS_PER_SECTION", "50"))
    telegram_bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    telegram_chat_id: str = os.getenv("TELEGRAM_CHAT_ID", "")
    output_json_dir: str = os.getenv("OUTPUT_JSON_DIR", "outputs")
    sqlite_db_path: str = os.getenv("SQLITE_DB_PATH", "data/zsxq.db")
    section_keywords: tuple[str, ...] = _parse_sections()


CONFIG = Config()
