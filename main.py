import logging

from browser_client import BrowserClient
from config import CONFIG
from parser import enrich_records
from scraper import scrape_owner_replies
from storage import Storage, save_json
from summarizer import build_daily_summary
from telegram_sender import TelegramSender
from utils import setup_logging, today_str

LOGGER = logging.getLogger(__name__)


def run() -> int:
    setup_logging()
    LOGGER.info("Job started.")

    store = Storage(CONFIG.sqlite_db_path)
    all_scraped = []

    try:
        with BrowserClient(CONFIG.debug_cdp_url) as bc:
            pages = bc.find_section_pages(CONFIG.section_keywords)
            if not pages:
                LOGGER.error("未找到目标板块页面，请先在 Chrome 打开并登录两个板块标签页。")
                return 1

            for page in pages:
                try:
                    rows = scrape_owner_replies(
                        page=page,
                        max_scroll_rounds=CONFIG.max_scroll_rounds,
                        scroll_wait_ms=CONFIG.scroll_wait_ms,
                        max_posts_per_section=CONFIG.max_posts_per_section,
                    )
                    all_scraped.extend(rows)
                except Exception as exc:
                    LOGGER.exception("Scrape failed for one section: %s", exc)

        analyzed = enrich_records(all_scraped)
        new_items = store.save_new_items(analyzed)
        json_file = save_json(new_items, CONFIG.output_json_dir, today_str())
        LOGGER.info("Saved daily JSON: %s", json_file)

        summary = build_daily_summary(new_items)
        tg = TelegramSender(CONFIG.telegram_bot_token, CONFIG.telegram_chat_id)
        tg.send(summary)

        LOGGER.info("Job completed. New items: %s", len(new_items))
        return 0
    finally:
        store.close()


if __name__ == "__main__":
    raise SystemExit(run())
