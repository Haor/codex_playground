import os
import tempfile
from pathlib import Path
import zipfile

from VRChatAccountManager.src.controller import Controller
from VRChatAccountManager.src import appdata_service as ads


def test_backup_custom_path():
    with tempfile.TemporaryDirectory() as tmp_app, tempfile.TemporaryDirectory() as tmp_bak:
        os.environ[ads.APPDATA_ENV] = tmp_app
        product = "ProdX"
        file_dir = Path(tmp_app) / product
        file_dir.mkdir(parents=True)
        (file_dir / "data.txt").write_text("hello")

        ctrl = Controller(Path(tmp_bak))
        dest = Path(tmp_bak) / "out.zip"
        returned = ctrl.backup(product, dest)
        assert returned == dest
        assert dest.exists()
        with zipfile.ZipFile(dest) as z:
            assert "data.txt" in z.namelist()
        del os.environ[ads.APPDATA_ENV]

