from __future__ import annotations

import os
import shutil
import zipfile
from pathlib import Path

ROOT = Path(os.environ.get("VRCHAT_APPDATA_ROOT", Path.home() / "AppData/LocalLow/DefaultCompany"))


def _product_dir(product: str) -> Path:
    return ROOT / product


def backup_product(product: str, dest_zip: Path) -> Path:
    src = _product_dir(product)
    if not src.exists():
        raise FileNotFoundError(src)
    dest_zip = dest_zip.with_suffix('.zip')
    with zipfile.ZipFile(dest_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        for p in src.rglob('*'):
            zf.write(p, p.relative_to(src))
    return dest_zip


def restore_product(product: str, src_zip: Path) -> None:
    dst = _product_dir(product)
    if dst.exists():
        shutil.rmtree(dst)
    with zipfile.ZipFile(src_zip, 'r') as zf:
        zf.extractall(dst)
