from __future__ import annotations

from typing import List

from . import appdata_service, crypto_service, db_service, registry_service


def refresh_model() -> tuple[List[str], List[db_service.Account]]:
    projects = registry_service.list_projects()
    accounts = db_service.list_accounts()
    return projects, accounts


def backup(project: str, dest_zip) -> None:
    data = registry_service.export_project(project)
    db_service.bind_account_to_project(0, project)  # placeholder for tracking
    appdata_service.backup_product(project, dest_zip)
    registry_service.import_project(project, data)


def switch_account(project: str, acc_id: int) -> None:
    accs = {a.id: a for a in db_service.list_accounts()}
    acc = accs.get(acc_id)
    if not acc:
        raise ValueError("account not found")
    data = {crypto_service.md5_key("authToken"): crypto_service.encrypt(acc.token)}
    registry_service.import_project(project, data)
    db_service.bind_account_to_project(acc_id, project)


def delete_account(acc_id: int) -> None:
    pass  # left as TODO
