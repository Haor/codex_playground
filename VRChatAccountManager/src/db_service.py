from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import List

from sqlmodel import SQLModel, Field, Session, create_engine, select


class Account(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str
    token: str
    note: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Binding(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    account_id: int = Field(foreign_key="account.id")
    product_name: str
    last_used: datetime = Field(default_factory=datetime.utcnow)


_engine = None


def init_db(path: Path = Path("accounts.db")) -> None:
    global _engine
    _engine = create_engine(f"sqlite:///{path}")
    SQLModel.metadata.create_all(_engine)


def _get_session() -> Session:
    if _engine is None:
        init_db()
    return Session(_engine)


def add_account(acc: Account) -> None:
    with _get_session() as session:
        session.add(acc)
        session.commit()


def list_accounts() -> List[Account]:
    with _get_session() as session:
        return session.exec(select(Account)).all()


def bind_account_to_project(acc_id: int, product: str) -> None:
    with _get_session() as session:
        binding = session.exec(
            select(Binding).where(Binding.account_id == acc_id, Binding.product_name == product)
        ).first()
        if not binding:
            binding = Binding(account_id=acc_id, product_name=product)
        binding.last_used = datetime.utcnow()
        session.add(binding)
        session.commit()
