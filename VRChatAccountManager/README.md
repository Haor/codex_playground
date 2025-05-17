# VRChat Account Manager

This project provides utilities to manage VRChat SDK login data for multiple Unity projects.

## Features
- DES-based encryption utilities compatible with SecurePlayerPrefs
- Mockable registry service for testing
- AppData backup and restore helpers
- SQLite database models using SQLModel
- Minimal Qt UI demo

## Development
Install requirements and run tests:

```bash
pip install -r requirements.txt
PYTHONPATH=. pytest -q
```

Run the demo GUI:

```bash
python main.py
```

The controller exposes a `backup(project, dest_zip)` method which saves the registry and AppData for the given Unity project into the provided zip file.


## Building an Installer

Create a standalone Windows executable using PyInstaller:

```bash
pip install pyinstaller
python build_installer.py
```

The resulting `VRChatAccountManager.exe` is placed in the `dist/` directory.
