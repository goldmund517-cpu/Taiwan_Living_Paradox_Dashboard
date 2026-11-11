#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
init_sqlite.py
建立本機 SQLite 資料庫 (data/tw_macro_demographics.db) 並注入 1990-2045 台灣宏觀經濟與人口統計時序資料。
零商業 API 成本，純本機 Python 標準庫 sqlite3 實作。
"""

import json
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "tw_macro_demographics.db"
JSON_SEED_PATH = DATA_DIR / "mock_macro_series.json"


def init_database():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(JSON_SEED_PATH, "r", encoding="utf-8") as f:
        seed = json.load(f)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1. 全景死亡交叉時序表 (2000-2024)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS macro_grand_cross (
            year INTEGER PRIMARY KEY,
            real_housing_idx REAL NOT NULL,
            real_median_wage_idx REAL NOT NULL,
            births_10k REAL NOT NULL,
            deaths_10k REAL NOT NULL,
            event_note TEXT
        )
    """)

    # 2. 薪資背離與實質購買力時序表 (2005-2025)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS wage_disconnect (
            year INTEGER PRIMARY KEY,
            nominal_avg_wage INTEGER NOT NULL,
            nominal_median_wage INTEGER NOT NULL,
            real_median_wage INTEGER NOT NULL,
            cpi_index REAL NOT NULL,
            median_to_avg_ratio REAL NOT NULL,
            below_avg_pct REAL NOT NULL
        )
    """)

    # 3. 人口年齡結構雙向金字塔時序表 (1990-2045)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS population_pyramid (
            year_label TEXT NOT NULL,
            age_group TEXT NOT NULL,
            male_10k REAL NOT NULL,
            female_10k REAL NOT NULL,
            median_age REAL NOT NULL,
            PRIMARY KEY (year_label, age_group)
        )
    """)

    # 4. 國際 8 個代表經濟體總生育率對照表 (2000-2024)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS global_tfr (
            economy TEXT NOT NULL,
            year INTEGER NOT NULL,
            tfr REAL NOT NULL,
            PRIMARY KEY (economy, year)
        )
    """)

    # 清空舊資料並重新寫入
    cur.execute("DELETE FROM macro_grand_cross")
    for row in seed["grand_cross_series"]:
        cur.execute(
            """
            INSERT INTO macro_grand_cross
            (year, real_housing_idx, real_median_wage_idx, births_10k, deaths_10k, event_note)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                row["year"],
                row["real_housing_idx"],
                row["real_median_wage_idx"],
                row["births_10k"],
                row["deaths_10k"],
                row.get("event", ""),
            ),
        )

    cur.execute("DELETE FROM wage_disconnect")
    for row in seed["wage_disconnect_series"]:
        cur.execute(
            """
            INSERT INTO wage_disconnect
            (year, nominal_avg_wage, nominal_median_wage, real_median_wage, cpi_index, median_to_avg_ratio, below_avg_pct)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                row["year"],
                row["nominal_avg_wage"],
                row["nominal_median_wage"],
                row["real_median_wage"],
                row["cpi_index"],
                row["median_to_avg_ratio"],
                row["below_avg_pct"],
            ),
        )

    cur.execute("DELETE FROM population_pyramid")
    age_groups = seed["population_tornado"]["age_groups"]
    median_ages = seed["population_tornado"]["median_age"]
    pyramids = seed["population_tornado"]["pyramids"]
    for year_label, gender_data in pyramids.items():
        med_age = median_ages.get(year_label, 40.0)
        for idx, age_grp in enumerate(age_groups):
            cur.execute(
                """
                INSERT INTO population_pyramid
                (year_label, age_group, male_10k, female_10k, median_age)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    year_label,
                    age_grp,
                    abs(gender_data["male"][idx]),
                    gender_data["female"][idx],
                    med_age,
                ),
            )

    cur.execute("DELETE FROM global_tfr")
    tfr_years = seed["global_tfr_comparison"]["years"]
    for economy, values in seed["global_tfr_comparison"]["economies"].items():
        for yr, val in zip(tfr_years, values):
            cur.execute(
                "INSERT INTO global_tfr (economy, year, tfr) VALUES (?, ?, ?)",
                (economy, yr, val),
            )

    conn.commit()

    # 驗證寫入筆數
    tables = ["macro_grand_cross", "wage_disconnect", "population_pyramid", "global_tfr"]
    print(f"[OK] SQLite 資料庫初始化完成：{DB_PATH}")
    for tbl in tables:
        cnt = cur.execute(f"SELECT COUNT(*) FROM {tbl}").fetchone()[0]
        print(f"  - 資料表 {tbl:<20}: {cnt:>4} 筆紀錄")

    conn.close()


if __name__ == "__main__":
    init_database()
