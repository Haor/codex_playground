from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Dict, List

MD5_KEYS = [
    "14C4B06B824EC593239362517F538B29",  # username
    "5F4DCC3B5AA765D61D8327DEB882CF99",  # password (unused)
    "E1F946CE2FD302B954E26AD92C0B30BF",  # authTokenProvider
    "BCD9D91ED8D8F1926B20D3D620647C8E",  # authTokenProviderUserId
    "BD2E932A03A19217AB5A1DFB5AA93340",  # authToken
    "785C2BDD2C43070A10BC35E5E687A467",  # twoFactorAuthToken
    "93D3AE97F80BEDA8E396065DC4770A93",  # humanName
]


_DEF_FILE = Path(os.environ.get("VRCHAT_REGISTRY_FILE", "registry_mock.json"))

WINREG = sys.platform.startswith("win")
if WINREG:
    import winreg


def _load_data(file: Path) -> Dict[str, Dict[str, str]]:
    if not file.exists():
        return {}
    with file.open("r", encoding="utf-8") as f:
        return json.load(f)


def _save_data(file: Path, data: Dict[str, Dict[str, str]]) -> None:
    file.parent.mkdir(parents=True, exist_ok=True)
    with file.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def list_projects() -> List[str]:
    if WINREG:
        path = r"Software\Unity\UnityEditor\DefaultCompany"
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, path) as key:
                projects = []
                i = 0
                while True:
                    try:
                        sub = winreg.EnumKey(key, i)
                        projects.append(sub)
                        i += 1
                    except OSError:
                        break
                return projects
        except FileNotFoundError:
            return []
    data = _load_data(_DEF_FILE)
    return sorted(data.keys())


def export_project(product: str) -> Dict[str, str]:
    if WINREG:
        base = rf"Software\Unity\UnityEditor\DefaultCompany\{product}"
        result = {}
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, base) as key:
                for md5 in MD5_KEYS:
                    try:
                        val, _ = winreg.QueryValueEx(key, md5 + "_h0")
                        result[md5] = val
                    except FileNotFoundError:
                        pass
            return result
        except FileNotFoundError:
            return {}
    data = _load_data(_DEF_FILE)
    return data.get(product, {}).copy()


def import_project(product: str, data_dict: Dict[str, str]) -> None:
    if WINREG:
        base = rf"Software\Unity\UnityEditor\DefaultCompany\{product}"
        key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, base)
        for md5, val in data_dict.items():
            winreg.SetValueEx(key, md5 + "_h0", 0, winreg.REG_BINARY, val)
        winreg.CloseKey(key)
        return
    data = _load_data(_DEF_FILE)
    data[product] = data_dict
    _save_data(_DEF_FILE, data)
