import tempfile
from pathlib import Path

from VRChatAccountManager.src import db_service as db
from VRChatAccountManager.src.db_service import Account


def test_db_crud():
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "acc.db"
        db.init_db(path)
        acc = Account(username="user", token="tok")
        db.add_account(acc)
        accounts = db.list_accounts()
        assert len(accounts) == 1
        assert accounts[0].username == "user"

        db.bind_account_to_project(accounts[0].id, "Proj")
        # ensure binding saved
        from sqlmodel import Session, select
        with db._get_session() as session:
            bindings = list(session.exec(select(db.Binding)))
            assert len(bindings) == 1
            assert bindings[0].product_name == "Proj"
