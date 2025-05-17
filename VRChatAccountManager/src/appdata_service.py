from __future__ import annotations

import os
import shutil
import zipfile
from pathlib import Path

APPDATA_ENV = "APPDATA_BASE"


def _base_dir() -> Path:
    env = os.environ.get(APPDATA_ENV)
    if env:
        return Path(env)
    return Path.home() / "AppData" / "LocalLow" / "DefaultCompany"


def backup_product(product: str, dest_zip: Path) -> Path:
    src = _base_dir() / product
    with zipfile.ZipFile(dest_zip, "w", zipfile.ZIP_DEFLATED) as z:
        if src.exists():
            for file in src.rglob("*"):
                arcname = file.relative_to(src)
                if file.is_file():
                    z.write(file, arcname)
    return dest_zip


def restore_product(product: str, src_zip: Path) -> None:
    dest = _base_dir() / product
    if dest.exists():
        shutil.rmtree(dest)
    with zipfile.ZipFile(src_zip, "r") as z:
        z.extractall(dest)
