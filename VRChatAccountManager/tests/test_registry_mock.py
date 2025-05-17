import json
import os
import tempfile

from VRChatAccountManager.src import registry_service as reg


def test_registry_mock_roundtrip():
    with tempfile.TemporaryDirectory() as tmp:
        mock_file = os.path.join(tmp, "reg.json")
        data = {"A": {"K1": "V1"}, "B": {}}
        with open(mock_file, "w", encoding="utf-8") as f:
            json.dump(data, f)
        os.environ[reg.MOCK_ENV] = mock_file

        projects = reg.list_projects()
        assert set(projects) == {"A", "B"}

        exp = reg.export_project("A")
        assert exp == {"K1": "V1"}

        reg.import_project("C", {"X": "Y"})
        with open(mock_file, "r", encoding="utf-8") as f:
            loaded = json.load(f)
        assert loaded["C"] == {"X": "Y"}

        del os.environ[reg.MOCK_ENV]
