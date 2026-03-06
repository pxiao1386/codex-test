# 知识星球星主回复抓取与 TK 电商优先级推送（Windows 本地）

这个项目用于：
1. 连接你本机已登录的 Chrome（Remote Debugging 模式）
2. 从你已打开的知识星球板块标签页抓取内容
3. 仅提取“星主发布/星主回复”相关内容（启发式规则）
4. 做 TK 电商相关性评分与优先级标注（🔴/🟢/🔵）
5. SQLite 去重（避免重复推送）
6. 生成每日 JSON
7. 推送 Telegram 汇总

> 重要：本项目不会尝试破解登录，只复用你本机已经登录的浏览器会话。

---

## 1) 安装依赖

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m playwright install chromium
```

---

## 2) 启动 Chrome Remote Debugging

先完全关闭 Chrome，再使用以下命令启动（Windows）：

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome_debug"
```

说明：
- `--remote-debugging-port=9222`：供程序连接
- `--user-data-dir`：独立用户目录，避免影响你日常 Chrome

---

## 3) 登录知识星球并打开两个板块

在上述 Chrome 实例中：
1. 登录知识星球
2. 打开这两个板块页面（保持标签页打开）
   - 敏哥和他的朋友们
   - 生财有术

程序会从当前标签页中自动识别包含这些关键字的知识星球页面。

---

## 4) 配置环境变量

复制模板：

```bash
copy .env.example .env
```

编辑 `.env`，至少填入：

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

可选参数：
- `SECTION_KEYWORDS`（默认：敏哥和他的朋友们,生财有术）
- `MAX_SCROLL_ROUNDS`（默认 10）
- `SCROLL_WAIT_MS`（默认 2000）
- `MAX_POSTS_PER_SECTION`（默认 50）

---

## 5) 运行

```bash
python main.py
```

执行流程：
- 抓取 -> 去重 -> 打分分级 -> 生成汇总 -> Telegram 发送

输出：
- SQLite：`data/zsxq.db`
- JSON：`outputs/YYYY-MM-DD.json`

如果当天没有新增内容，会发送：
- `今日没有新的星主回复。`

---

## 6) Windows 计划任务（每天自动跑一次）

1. 打开“任务计划程序” -> 创建基本任务
2. 触发器：每天（例如 09:00）
3. 操作：启动程序
4. 程序/脚本：`cmd.exe`
5. 参数（示例）：

```bash
/c cd /d D:\your_project_path && .venv\Scripts\python.exe main.py
```

6. 保存任务

建议：
- 先手动启动带 remote debugging 的 Chrome 并保持登录
- 再让任务执行 `main.py`

---

## 7) 目录结构

- `main.py`：入口与流程编排
- `browser_client.py`：连接 CDP、识别目标标签页
- `scraper.py`：滚动抓取、提取星主相关内容
- `parser.py`：TK 相关性评分与优先级
- `storage.py`：SQLite + JSON 存储与去重
- `summarizer.py`：每日汇总文案
- `telegram_sender.py`：Telegram 发送
- `config.py`：配置加载
- `utils.py`：日志/工具函数

---

## 8) 容错与日志

已覆盖以下常见场景：
- 页面/板块找不到
- 单板块抓取失败不影响其他板块
- 字段缺失不报错
- Telegram 发送失败记录日志

控制台会输出结构化日志，便于排查。

---

## 9) 说明与可调整项

知识星球页面 DOM 可能变动，本项目使用“多选择器 + 启发式”策略：
- 若后续抓不到内容，请优先调整 `scraper.py` 中的选择器：
  - 卡片容器（如 `.topic-item` / `.talk-item`）
  - 作者/正文/回复/时间字段选择器

去重策略：
1. 优先 `post_id`
2. 无 `post_id` 时使用 `SHA256(content + reply_time + author + section_name)`

这确保历史内容不会重复推送。
