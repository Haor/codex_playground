from __future__ import annotations

import os
import shutil
import zipfile
from pathlib import Path

BASE_APPDATA = Path(os.environ.get("APPDATA", Path.cwd() / "appdata_mock"))


def _product_path(product: str) -> Path:
    return BASE_APPDATA / "DefaultCompany" / product


def backup_product(product: str, dest_zip: Path) -> Path:
    root = _product_path(product)
    dest_zip.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(dest_zip, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        if root.exists():
            for path in root.rglob("*"):
                zf.write(path, path.relative_to(root))
    return dest_zip


def restore_product(product: str, src_zip: Path) -> None:
    root = _product_path(product)
    if root.exists():
        shutil.rmtree(root)
    with zipfile.ZipFile(src_zip, "r") as zf:
        zf.extractall(root)
