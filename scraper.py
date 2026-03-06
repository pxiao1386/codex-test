import logging
import re
from typing import Dict, List

from playwright.sync_api import Locator, Page

LOGGER = logging.getLogger(__name__)

OWNER_HINTS = ("星主", "圈主", "博主", "管理员")
OWNER_REPLY_LABELS = ("星主回复", "圈主回复", "作者回复", "博主回复", "置顶回复")


def _extract_section_name(page: Page) -> str:
    try:
        title = page.title().strip()
        if title:
            return title
    except Exception:
        pass
    return "未知板块"


def _safe_text(locator: Locator) -> str:
    try:
        return (locator.inner_text(timeout=600) or "").strip()
    except Exception:
        return ""


def _extract_post_id(url: str, fallback_text: str) -> str:
    matched = re.search(r"(topic|post|talk)/(\w+)", url)
    if matched:
        return matched.group(2)

    matched = re.search(r"\b(?:id|topic_id)=([\w-]+)\b", url)
    if matched:
        return matched.group(1)

    return fallback_text[:24]


def _collect_cards(page: Page) -> List[Locator]:
    selectors = [".topic-item", ".talk-item", ".feed-item", ".post-item", "article"]
    for selector in selectors:
        loc = page.locator(selector)
        try:
            count = loc.count()
            if count > 0:
                return [loc.nth(i) for i in range(count)]
        except Exception:
            continue
    return []


def _extract_owner_reply_from_card(card: Locator) -> str:
    # 先尝试找明显标记为“星主回复/作者回复”的元素
    for label in OWNER_REPLY_LABELS:
        text = _safe_text(card.locator(f"text={label}").first)
        if text:
            return text

    # 回退到常见回复容器，但要求出现星主/作者提示，避免把普通评论当成星主回复
    reply_container = _safe_text(card.locator(".reply,.comment,.answer,.talk-replies").first)
    if reply_container and any(h in reply_container for h in OWNER_HINTS + OWNER_REPLY_LABELS):
        return reply_container

    return ""


def scrape_owner_replies(
    page: Page,
    max_scroll_rounds: int,
    scroll_wait_ms: int,
    max_posts_per_section: int,
) -> List[Dict]:
    section_name = _extract_section_name(page)
    LOGGER.info("Start scraping section: %s", section_name)

    for i in range(max_scroll_rounds):
        if len(_collect_cards(page)) >= max_posts_per_section * 3:
            break
        page.mouse.wheel(0, 5000)
        page.wait_for_timeout(scroll_wait_ms)
        LOGGER.info("Scrolled round %s/%s", i + 1, max_scroll_rounds)

    results: List[Dict] = []
    cards = _collect_cards(page)

    for card in cards:
        if len(results) >= max_posts_per_section:
            break

        author = _safe_text(card.locator(".author,.name,.creator,.user-name").first)
        content = _safe_text(card.locator(".content,.talk-content,.desc,.text").first)
        reply_time = _safe_text(card.locator("time,.time,.date").first)

        link = ""
        try:
            href = card.locator("a[href*='topic'],a[href*='talk'],a").first.get_attribute("href")
            if href:
                link = href
        except Exception:
            pass

        owner_reply = _extract_owner_reply_from_card(card)

        # 星主本人发布（作者命中）也要抓；普通用户贴仅在有星主回复时抓取。
        is_owner_post = bool(author and any(token in author for token in OWNER_HINTS))
        has_owner_reply = bool(owner_reply)
        if not (is_owner_post or has_owner_reply):
            continue

        owner_name = author if is_owner_post else "星主"
        owner_reply_content = content if is_owner_post else owner_reply
        if not owner_reply_content:
            continue

        post_id = _extract_post_id(link, owner_reply_content)
        post_question = _safe_text(card.locator(".question,.title,.subject").first)

        results.append(
            {
                "section_name": section_name,
                "owner_name": owner_name,
                "owner_reply_content": owner_reply_content,
                "reply_time": reply_time,
                "post_link": link,
                "post_question": post_question,
                "post_id": post_id,
            }
        )

    LOGGER.info("Collected %s valid owner replies from %s", len(results), section_name)
    return results
