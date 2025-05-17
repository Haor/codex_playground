import sys, pathlib
sys.path.append(str(pathlib.Path(__file__).resolve().parents[2]))
import os
import json
import tempfile
from importlib import reload

import VRChatAccountManager.src.registry_service as rs


def test_registry_json_roundtrip(tmp_path):
    path = tmp_path / 'reg.json'
    os.environ['VRCHAT_REGISTRY_FILE'] = str(path)
    reload(rs)

    assert rs.list_projects() == []

    data = {'key': 'value'}
    rs.import_project('proj', data)
    assert rs.list_projects() == ['proj']
    assert rs.export_project('proj') == data

    # Ensure persistence
    reload(rs)
    assert rs.list_projects() == ['proj']
