# 台灣薪資背離與人口結構死亡交叉戰情室 (`Taiwan_Living_Paradox_Dashboard`)

**Taiwan Demographic & Economic Disconnect War Room (1990–2045)**

本專案揭露過去 20～30 年台灣總體經濟分配與人口結構的「連鎖反應」：
1. **【第一層：繁榮假象】** 名目平均薪資被少數高科技尖端拉高 ➔ 逾 68.4% 上班族領不到平均薪資 ➔ 扣除通膨後實質薪資廿年原地踏步（累積增幅僅 +1.2%）。
2. **【第二層：物理擠壓】** 實質薪資橫盤 ➔ 實質成屋房價指數狂飆（房價漲幅達薪資之 3.8 倍）➔ 居住成本壓縮青年世代可支配所得。
3. **【第三層：結構坍塌】** 青年世代推遲婚育 ➔ 總生育率（TFR）跌至 0.87（全球墊底梯隊）➔ 2020 年正式步入「出生數低於死亡數」之人口死亡交叉。
4. **【第四層：風暴終局】** 人口金字塔由 1990 年「穩固正金字塔（中位數 27 歲）」扭曲為 2045 年「懸空倒三角龍捲風（中位數 57.1 歲）」。

---

## 目錄結構

```text
Taiwan_Living_Paradox_Dashboard/
├── index.html                     # GitHub Pages 根目錄自動導向入口
├── data/
│   ├── tw_macro_demographics.db   # 本機 SQLite 時序資料庫
│   └── mock_macro_series.json     # 1990-2045 完整時序整合種子資料
├── scripts/
│   ├── init_sqlite.py             # 建立 SQLite 資料表與寫入 1990-2045 時序數據
│   └── fetch_macro_data.py        # 主計總處與內政部資料 CPI 平減換算與指標核算腳本
└── dashboard/
    ├── index.html                 # 戰情室主頁面（Tailwind CDN + 45°斜角半身人影淡橘底圖）
    ├── js/
    │   ├── echarts.min.js         # ECharts 5.4.3 掛載模組
    │   └── app.js                 # 四大動態跳動球與四大趨勢分頁 ECharts 邏輯
    └── css/
        └── custom.css             # 視覺主題與 45° 斜角卡通半身人影背景樣式
```

## 本機端啟動方式

直接以瀏覽器開啟 `dashboard/index.html`，或於 PowerShell 執行：

```powershell
Start-Process "msedge.exe" (Resolve-Path "dashboard\index.html").Path
```
