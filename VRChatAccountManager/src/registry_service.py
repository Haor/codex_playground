from __future__ import annotations

import json
from pathlib import Path

from .crypto_service import md5_key

REG_PATH = Path("registry_mock.json")

RAW_KEYS = [
    "username",
    "password",
    "authTokenProvider",
    "authTokenProviderUserId",
    "authToken",
    "twoFactorAuthToken",
    "humanName",
]
HASH_KEYS = [md5_key(k) for k in RAW_KEYS]


def _load() -> dict:
    if REG_PATH.exists():
        with REG_PATH.open("r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def _save(data: dict) -> None:
    REG_PATH.write_text(json.dumps(data, indent=2))


def list_projects() -> list[str]:
    data = _load()
    return list(data.keys())


def export_project(product: str) -> dict:
    data = _load()
    proj = data.get(product, {})
    # filter to known keys
    return {k: v for k, v in proj.items() if k in HASH_KEYS}


def import_project(product: str, dat: dict) -> None:
    data = _load()
    proj = data.get(product, {})
    for k in HASH_KEYS:
        if k in dat:
            proj[k] = dat[k]
    data[product] = proj
    _save(data)
