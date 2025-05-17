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
pytest -q
```

Run the demo GUI:

```bash
python main.py
```
