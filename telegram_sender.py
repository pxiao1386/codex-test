import logging
from typing import List

import requests

LOGGER = logging.getLogger(__name__)
MAX_TG_TEXT = 3900


class TelegramSender:
    def __init__(self, bot_token: str, chat_id: str):
        self.bot_token = bot_token
        self.chat_id = chat_id

    def enabled(self) -> bool:
        return bool(self.bot_token and self.chat_id)

    def _chunks(self, text: str) -> List[str]:
        if len(text) <= MAX_TG_TEXT:
            return [text]

        chunks: List[str] = []
        current = []
        current_len = 0
        for line in text.splitlines(keepends=True):
            if current_len + len(line) > MAX_TG_TEXT:
                chunks.append("".join(current))
                current = [line]
                current_len = len(line)
            else:
                current.append(line)
                current_len += len(line)

        if current:
            chunks.append("".join(current))
        return chunks

    def send(self, text: str) -> bool:
        if not self.enabled():
            LOGGER.warning("Telegram not configured. Skip sending.")
            return False

        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"

        try:
            for part in self._chunks(text):
                payload = {
                    "chat_id": self.chat_id,
                    "text": part,
                    "disable_web_page_preview": True,
                }
                resp = requests.post(url, json=payload, timeout=20)
                resp.raise_for_status()
                data = resp.json()
                if not data.get("ok"):
                    LOGGER.error("Telegram API error: %s", data)
                    return False

            LOGGER.info("Telegram message sent.")
            return True
        except Exception as exc:
            LOGGER.exception("Telegram sending failed: %s", exc)
            return False
