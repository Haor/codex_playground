import tempfile
from pathlib import Path

from VRChatAccountManager.src.controller import Controller
from VRChatAccountManager.src.db_service import Account, list_accounts


def test_delete_account():
    with tempfile.TemporaryDirectory() as tmp:
        ctrl = Controller(Path(tmp))
        account = Account(username="bob", token="tok")
        # add account directly via service
        from VRChatAccountManager.src import db_service as db
        db.add_account(account)
        assert len(list_accounts()) == 1

        ctrl.delete_account(account.id)
        assert len(list_accounts()) == 0
