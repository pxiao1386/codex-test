import hashlib
import logging
import os
from datetime import datetime


def setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )


def ensure_parent_dir(file_path: str) -> None:
    os.makedirs(os.path.dirname(file_path), exist_ok=True)


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def sha256_text(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def now_str() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def today_str() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def clip_text(text: str, max_len: int = 140) -> str:
    text = (text or "").strip().replace("\n", " ")
    if len(text) <= max_len:
        return text
    return f"{text[:max_len].rstrip()}..."
