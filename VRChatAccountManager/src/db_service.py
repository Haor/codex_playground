from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Optional, List

from sqlmodel import Field, Session, SQLModel, create_engine, select

_engine = None
_db_path = Path("accounts.db")


class Account(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    token: str
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Binding(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    account_id: int = Field(foreign_key="account.id")
    product_name: str
    last_used: datetime = Field(default_factory=datetime.utcnow)


def init_db(path: Path = Path("accounts.db")) -> None:
    global _engine, _db_path
    _db_path = path
    _engine = create_engine(f"sqlite:///{path}")
    SQLModel.metadata.create_all(_engine)


def _get_session() -> Session:
    if _engine is None:
        init_db(_db_path)
    return Session(_engine)


def add_account(acc: Account) -> None:
    with _get_session() as session:
        session.add(acc)
        session.commit()
        session.refresh(acc)


def list_accounts() -> List[Account]:
    with _get_session() as session:
        statement = select(Account)
        return list(session.exec(statement))


def bind_account_to_project(acc_id: int, product: str) -> None:
    with _get_session() as session:
        binding = Binding(account_id=acc_id, product_name=product)
        session.add(binding)
        session.commit()
