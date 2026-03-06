from typing import Dict, List, Tuple

TK_KEYWORDS_HIGH = {
    "tk": 5,
    "tiktok": 5,
    "短视频": 4,
    "直播": 4,
    "带货": 5,
    "店铺": 4,
    "选品": 5,
    "爆款": 4,
    "投流": 5,
    "广告": 3,
    "达人": 4,
    "供应链": 3,
    "履约": 3,
    "发货": 3,
    "gmv": 4,
    "美区": 3,
    "东南亚": 3,
    "转化率": 4,
    "点击率": 3,
    "完播率": 3,
    "商品卡": 4,
    "起号": 4,
}

TK_KEYWORDS_MID = {
    "电商": 2,
    "运营": 2,
    "增长": 2,
    "转化": 2,
    "策略": 2,
    "复盘": 2,
    "效率": 2,
    "执行": 2,
}

ACTION_WORDS = {"立刻", "马上", "今天", "步骤", "方法", "实操", "模板", "清单"}


def score_tk_relevance(content: str) -> Tuple[int, str, str]:
    text = (content or "").lower()
    score = 0
    reason_parts: List[str] = []

    for kw, w in TK_KEYWORDS_HIGH.items():
        if kw in text:
            score += w
            reason_parts.append(kw)

    for kw, w in TK_KEYWORDS_MID.items():
        if kw in text:
            score += w

    if any(word in text for word in ACTION_WORDS):
        score += 3

    if score >= 12:
        level = "🔴"
        reason = "高度相关：涉及 TK 电商核心实操与增长环节"
    elif score >= 6:
        level = "🟢"
        reason = "中度相关：涉及电商运营方法，具备参考价值"
    else:
        level = "🔵"
        reason = "低度相关：偏泛商业/泛认知，当前优先级较低"

    if reason_parts:
        reason = f"{reason}（命中：{', '.join(reason_parts[:4])}）"

    return score, level, reason


def enrich_records(records: List[Dict]) -> List[Dict]:
    out = []
    for rec in records:
        score, level, reason = score_tk_relevance(rec.get("owner_reply_content", ""))
        item = dict(rec)
        item["relevance_score"] = score
        item["priority_level"] = level
        item["short_reason"] = reason
        out.append(item)
    return out
