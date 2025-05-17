import json
from pathlib import Path

from src import registry_service as rs, crypto_service as cs


def test_registry_mock(tmp_path, monkeypatch):
    reg = tmp_path / "reg.json"
    monkeypatch.setattr(rs, "REG_PATH", reg)
    key = cs.md5_key("username")
    rs.import_project("P1", {key: "val"})
    assert "P1" in rs.list_projects()
    data = rs.export_project("P1")
    assert data[key] == "val"
    data = json.loads(reg.read_text())
    assert data["P1"][key] == "val"
