#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
deploy_github.py
自動透過本機 Git Credential Manager 取得 GitHub 認證、建立遠端儲存庫、推送程式碼並啟用 GitHub Pages。
"""

import json
import subprocess
import urllib.error
import urllib.request

REPO_OWNER = "goldmund517-cpu"
REPO_NAME = "Taiwan_Living_Paradox_Dashboard"
REPO_DESC = "台灣薪資背離與人口結構死亡交叉戰情室 | Taiwan Demographic & Economic Disconnect War Room (1990-2045)"


def get_github_token():
    proc = subprocess.run(
        ["git", "credential", "fill"],
        input="protocol=https\nhost=github.com\n\n",
        text=True,
        capture_output=True,
        check=False,
    )
    for line in proc.stdout.splitlines():
        if line.startswith("password="):
            return line.split("=", 1)[1].strip()
    return None


def github_api(method, url, token, payload=None):
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "Antigravity-Deployer",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    if data is not None:
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, {"message": err_body}


def main():
    token = get_github_token()
    if not token:
        print("[ERROR] 無法從本機 Git Credential Manager 取得 GitHub 憑證。")
        return

    # 1. 檢查或建立 GitHub Repository
    repo_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}"
    status, info = github_api("GET", repo_url, token)
    if status == 404:
        print(f"[INFO] 正在於 GitHub 建立公開儲存庫 {REPO_OWNER}/{REPO_NAME} ...")
        c_status, c_info = github_api(
            "POST",
            "https://api.github.com/user/repos",
            token,
            {
                "name": REPO_NAME,
                "description": REPO_DESC,
                "private": False,
                "has_issues": True,
                "has_projects": False,
                "has_wiki": False,
            },
        )
        if c_status in (200, 201):
            print(f"[OK] 成功建立儲存庫：https://github.com/{REPO_OWNER}/{REPO_NAME}")
        else:
            print(f"[WARN] 建立儲存庫回應 ({c_status}): {c_info.get('message')}")
    else:
        print(f"[OK] 遠端儲存庫已存在：https://github.com/{REPO_OWNER}/{REPO_NAME}")

    # 2. 設定 git remote 並推送 main 分支
    remote_https = f"https://github.com/{REPO_OWNER}/{REPO_NAME}.git"
    subprocess.run(["git", "remote", "remove", "origin"], capture_output=True)
    subprocess.run(["git", "remote", "add", "origin", remote_https], check=True)
    subprocess.run(["git", "add", "."], check=True)
    subprocess.run(["git", "commit", "-m", "Add GitHub deployment scripts"], capture_output=True)

    print("[INFO] 正在推送 main 分支至 GitHub ...")
    push_res = subprocess.run(["git", "push", "-u", "origin", "main", "--force"], text=True, capture_output=True)
    if push_res.returncode == 0:
        print("[OK] Git Push 成功！")
    else:
        print(f"[ERROR] Git Push 失敗：{push_res.stderr}")
        return

    # 3. 啟用 GitHub Pages (main 分支 / root 目錄)
    pages_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/pages"
    p_status, p_info = github_api("GET", pages_url, token)
    if p_status == 404:
        print("[INFO] 正在自動啟用 GitHub Pages ...")
        cp_status, cp_info = github_api(
            "POST",
            pages_url,
            token,
            {"source": {"branch": "main", "path": "/"}},
        )
        if cp_status in (200, 201, 202):
            print(f"[OK] GitHub Pages 已啟用：https://{REPO_OWNER}.github.io/{REPO_NAME}/")
        else:
            print(f"[INFO] GitHub Pages 狀態 ({cp_status}): {cp_info.get('message')}")
    else:
        print(f"[OK] GitHub Pages 已經啟用：https://{REPO_OWNER}.github.io/{REPO_NAME}/")


if __name__ == "__main__":
    main()
