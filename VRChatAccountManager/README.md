# VRChat Account Manager

This project provides a cross-platform utility to manage multiple VRChat SDK accounts across Unity projects. It supports exporting and importing registry credentials and backing up associated AppData. The UI is written with PySide6.

## Features

- Encrypts and decrypts SecurePlayerPrefs values using DES/PBKDF2
- Stores account information in a local SQLite database via SQLModel
- Lists projects from the registry or mock JSON store
- Backups and restores project AppData to zip archives
- Minimal Qt GUI to view projects and accounts

## Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run tests:
   ```bash
   pytest -q
   ```
3. Launch the application:
   ```bash
   python main.py
   ```

## Packaging

The project can be packaged on Windows using PyInstaller:
```bat
pyinstaller --onefile --noconsole main.py
```
This will produce `dist/VRChatAcctMgr.exe`.
