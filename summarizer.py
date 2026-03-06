from collections import defaultdict
from typing import Dict, List

from utils import clip_text


def _group_by_priority(items: List[Dict]) -> Dict[str, List[Dict]]:
    grouped = {"🔴": [], "🟢": [], "🔵": []}
    for i in items:
        grouped.setdefault(i.get("priority_level", "🔵"), []).append(i)
    return grouped


def _render_priority_block(title: str, items: List[Dict]) -> str:
    if not items:
        return f"{title}\n- 无\n"

    by_section = defaultdict(list)
    for i in items:
        by_section[i.get("section_name", "未知板块")].append(i)

    lines = [title]
    for section, rows in by_section.items():
        lines.append(f"\n[{section}]")
        for row in rows:
            lines.append(
                f"- 摘要：{clip_text(row.get('owner_reply_content',''), 150)}\n"
                f"  理由：{row.get('short_reason','')}"
            )
    lines.append("")
    return "\n".join(lines)


def build_daily_summary(items: List[Dict]) -> str:
    total = len(items)
    if total == 0:
        return "【知识星球每日更新】\n今日没有新的星主回复。"

    items = sorted(items, key=lambda x: x.get("relevance_score", 0), reverse=True)
    grouped = _group_by_priority(items)

    parts = [
        "【知识星球每日更新】",
        f"今日新增星主回复：{total}条\n",
        _render_priority_block("【🔴 最高优先级】", grouped.get("🔴", [])),
        _render_priority_block("【🟢 中优先级】", grouped.get("🟢", [])),
        _render_priority_block("【🔵 低优先级】", grouped.get("🔵", [])),
    ]

    top_actions = grouped.get("🔴", [])[:5]
    parts.append("【今日建议重点吸收】")
    if not top_actions:
        parts.append("- 今日暂无 🔴 内容，可优先阅读 🟢 条目。")
    else:
        for idx, row in enumerate(top_actions, start=1):
            parts.append(
                f"{idx}. [{row.get('section_name','未知板块')}] "
                f"{clip_text(row.get('owner_reply_content',''), 120)}\n"
                f"   理由：{row.get('short_reason','')}"
            )

    return "\n".join(parts)
