from __future__ import annotations

from pathlib import Path
import json

from . import appdata_service as ads
from . import db_service as db
from . import registry_service as reg
from . import crypto_service as cs


class Controller:
    def __init__(self, backup_dir: Path = Path("backups")):
        self.backup_dir = backup_dir
        self.backup_dir.mkdir(exist_ok=True)

    def refresh_model(self) -> tuple[list[str], list[db.Account]]:
        return reg.list_projects(), db.list_accounts()

    def backup(self, project: str, dest_zip: Path | None = None) -> Path:
        """Backup registry and AppData for a project.

        Parameters
        ----------
        project: str
            Name of the Unity product to back up.
        dest_zip: Path | None, optional
            Destination zip file. If omitted, a file named
            ``<project>_app.zip`` is created inside ``backup_dir``.
        """

        data = reg.export_project(project)
        reg_path = self.backup_dir / f"{project}_reg.json"
        reg_path.write_text(json.dumps(data))
        if dest_zip is None:
            dest_zip = self.backup_dir / f"{project}_app.zip"
        ads.backup_product(project, dest_zip)
        return dest_zip

    def switch_account(self, project: str, acc_id: int) -> None:
        accounts = {a.id: a for a in db.list_accounts()}
        acc = accounts.get(acc_id)
        if not acc:
            raise ValueError("account not found")
        # simplistic example: only authToken
        reg.import_project(project, {cs.md5_key("authToken"): acc.token})
        db.bind_account_to_project(acc_id, project)

    def delete_account(self, acc_id: int) -> None:
        # not fully implemented
        pass
