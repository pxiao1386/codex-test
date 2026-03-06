import logging
from typing import List

from playwright.sync_api import Browser, Page, sync_playwright

LOGGER = logging.getLogger(__name__)


class BrowserClient:
    def __init__(self, cdp_url: str):
        self.cdp_url = cdp_url
        self._playwright = None
        self.browser: Browser | None = None

    def __enter__(self):
        self._playwright = sync_playwright().start()
        self.browser = self._playwright.chromium.connect_over_cdp(self.cdp_url)
        LOGGER.info("Connected to Chrome CDP: %s", self.cdp_url)
        return self

    def __exit__(self, exc_type, exc, tb):
        try:
            if self.browser:
                self.browser.close()
        finally:
            if self._playwright:
                self._playwright.stop()

    def list_pages(self) -> List[Page]:
        if not self.browser:
            return []
        pages: List[Page] = []
        for ctx in self.browser.contexts:
            pages.extend(ctx.pages)
        LOGGER.info("Detected %s tabs in browser.", len(pages))
        return pages

    def find_section_pages(self, section_keywords: tuple) -> List[Page]:
        pages = self.list_pages()
        matches = []
        for p in pages:
            title = ""
            url = ""
            try:
                title = p.title()
                url = p.url
            except Exception:
                continue
            blob = f"{title} {url}"
            if "zsxq" in blob.lower() and any(k in blob for k in section_keywords):
                matches.append(p)
        LOGGER.info("Matched section tabs: %s", len(matches))
        return matches
