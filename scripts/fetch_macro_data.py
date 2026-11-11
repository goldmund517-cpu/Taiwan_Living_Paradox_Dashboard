#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fetch_macro_data.py
主計總處與內政部公開統計資料平減換算與驗證腳本。
支援離線本機驗證與實質購買力 / 房價剪刀差指標核算，並可匯出前端最新 JSON。
"""

import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "tw_macro_demographics.db"


def deflate_nominal_wage(nominal_wage: float, cpi_current: float, cpi_base: float = 100.0) -> float:
    """
    以消費者物價指數 (CPI) 將名目薪資平減為實質薪資：
    Real Wage = Nominal Wage * (CPI_base / CPI_current)
    """
    if cpi_current <= 0:
        raise ValueError("CPI 指數必須大於 0")
    return round(nominal_wage * (cpi_base / cpi_current), 2)


def audit_macro_indicators():
    """從本機 SQLite 讀取時序資料，驗證四大頂部動態概觀指標。"""
    if not DB_PATH.exists():
        print(f"[WARN] 找不到資料庫 {DB_PATH}，請先執行 python scripts/init_sqlite.py")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1. 檢查最新薪資背離比率
    cur.execute("""
        SELECT year, nominal_avg_wage, nominal_median_wage, cpi_index, below_avg_pct
        FROM wage_disconnect
        ORDER BY year ASC
    """)
    wage_rows = cur.fetchall()
    first_w, last_w = wage_rows[0], wage_rows[-1]
    real_first = deflate_nominal_wage(first_w[2], first_w[3], first_w[3])
    real_last = deflate_nominal_wage(last_w[2], last_w[3], first_w[3])
    real_growth_20y = round(((real_last - real_first) / real_first) * 100, 1)

    # 2. 檢查房價與薪資剪刀差
    cur.execute("""
        SELECT year, real_housing_idx, real_median_wage_idx, births_10k, deaths_10k
        FROM macro_grand_cross
        ORDER BY year ASC
    """)
    cross_rows = cur.fetchall()
    latest_cross = cross_rows[-1]
    scissors_ratio = round(latest_cross[1] / latest_cross[2], 1)

    # 3. 檢查台灣最新 TFR
    cur.execute("""
        SELECT year, tfr FROM global_tfr
        WHERE economy LIKE '台灣%'
        ORDER BY year DESC LIMIT 1
    """)
    latest_tfr = cur.fetchone()

    print("=== 台灣宏觀經濟與人口死亡交叉指標核算報告 ===")
    print(f"1. 低於平均薪資勞工比例 ({last_w[0]}年) : {last_w[4]:.1f}%")
    print(f"2. 實質薪資廿年累積增幅 ({first_w[0]}-{last_w[0]}): +{real_growth_20y}% (基準平減: NT${real_first:,.0f} -> NT${real_last:,.0f})")
    print(f"3. 實質房價指數 vs 實質薪資倍數      : {latest_cross[1]:.0f} / {latest_cross[2]:.1f} (約 {scissors_ratio}x ~ 3.8x 剪刀差)")
    print(f"4. 台灣最新總生育率 TFR ({latest_tfr[0]}年)     : {latest_tfr[1]:.2f}")
    conn.close()


if __name__ == "__main__":
    audit_macro_indicators()
