# VRChat Account Manager

A simple manager for VRChat SDK credentials. The tool can list projects that have logged in via the Unity editor, store multiple accounts in an SQLite database and switch between them. It also provides utilities to back up and restore the associated AppData and registry entries.

## Features

- DES encryption helpers compatible with SecurePlayerPrefs
- Registry access with a file-based mock for non‑Windows environments
- AppData backup/restore support
- SQLite models for accounts and project bindings
- Qt based GUI

## Usage

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the GUI application:

```bash
python main.py
```

To build a standalone Windows executable:

```bash
python build_installer.py
```

The resulting `VRChatAccountManager.exe` will appear in the `dist/` folder.

## Testing

Execute the unit tests from the repository root:

```bash
PYTHONPATH=. pytest -q
```
