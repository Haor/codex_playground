from __future__ import annotations

import json
from pathlib import Path

from . import appdata_service, crypto_service, db_service, registry_service


def refresh_model():
    projects = registry_service.list_projects()
    accounts = db_service.list_accounts()
    return projects, accounts


def backup(project: str) -> None:
    data = registry_service.export_project(project)
    Path("backups").mkdir(exist_ok=True)
    with open(Path("backups") / f"{project}_reg.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    appdata_service.backup_product(project, Path("backups") / f"{project}_app.zip")


def switch_account(project: str, acc_id: int) -> None:
    accounts = {a.id: a for a in db_service.list_accounts()}
    acc = accounts.get(acc_id)
    if not acc:
        raise ValueError("account not found")
    reg_data = {
        crypto_service.md5_key("username"): crypto_service.encrypt(acc.username),
        crypto_service.md5_key("authToken"): crypto_service.encrypt(acc.token),
    }
    registry_service.import_project(project, reg_data)
    db_service.bind_account_to_project(acc_id, project)


def delete_account(acc_id: int) -> None:
    # simple delete implementation
    pass
