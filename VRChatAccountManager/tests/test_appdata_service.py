import os
import tempfile
from pathlib import Path

from VRChatAccountManager.src import appdata_service as ads


def test_backup_and_restore():
    with tempfile.TemporaryDirectory() as tmp_src, tempfile.TemporaryDirectory() as tmp_dst:
        os.environ[ads.APPDATA_ENV] = tmp_src
        product = "ProdA"
        product_dir = Path(tmp_src) / product / "Cookies"
        product_dir.mkdir(parents=True)
        file_path = product_dir / "data.txt"
        file_path.write_text("hello")

        zip_path = Path(tmp_dst) / "backup.zip"
        ads.backup_product(product, zip_path)
        # remove original
        (Path(tmp_src) / product).rename(Path(tmp_src) / (product + "_old"))

        ads.restore_product(product, zip_path)
        restored = Path(tmp_src) / product / "Cookies" / "data.txt"
        assert restored.read_text() == "hello"
        del os.environ[ads.APPDATA_ENV]
