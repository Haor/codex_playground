from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Dict

try:
    import winreg  # type: ignore
except ImportError:  # Not on Windows
    winreg = None

REG_BASE = r"Software\Unity\UnityEditor\DefaultCompany"
MOCK_ENV = "REGISTRY_MOCK_PATH"


def _load_mock() -> Dict[str, Dict[str, str]]:
    path = os.environ.get(MOCK_ENV)
    if not path:
        return {}
    file = Path(path)
    if file.exists():
        with file.open("r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def _save_mock(data: Dict[str, Dict[str, str]]) -> None:
    path = os.environ.get(MOCK_ENV)
    if not path:
        return
    file = Path(path)
    with file.open("w", encoding="utf-8") as f:
        json.dump(data, f)


def list_projects() -> list[str]:
    if winreg is None or os.environ.get(MOCK_ENV):
        data = _load_mock()
        return list(data.keys())
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, REG_BASE) as root:
        projects = []
        i = 0
        while True:
            try:
                proj = winreg.EnumKey(root, i)
                projects.append(proj)
                i += 1
            except OSError:
                break
        return projects


def export_project(product: str) -> Dict[str, str]:
    if winreg is None or os.environ.get(MOCK_ENV):
        data = _load_mock()
        return data.get(product, {})
    path = f"{REG_BASE}\{product}"
    result: Dict[str, str] = {}
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, path) as key:
            i = 0
            while True:
                try:
                    name, value, _ = winreg.EnumValue(key, i)
                    result[name] = value
                    i += 1
                except OSError:
                    break
    except FileNotFoundError:
        pass
    return result


def import_project(product: str, data: Dict[str, str]) -> None:
    if winreg is None or os.environ.get(MOCK_ENV):
        mock = _load_mock()
        mock[product] = data
        _save_mock(mock)
        return
    path = f"{REG_BASE}\{product}"
    with winreg.CreateKey(winreg.HKEY_CURRENT_USER, path) as key:
        for name, val in data.items():
            winreg.SetValueEx(key, name, 0, winreg.REG_BINARY, val)
