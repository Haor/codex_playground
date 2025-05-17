# VRChat Account Manager

Prototype project for managing multiple VRChat SDK accounts. The codebase
currently provides skeleton modules, tests, and packaging helpers.

## Setup

1. Install Python 3.11 or later.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running Tests

Run the bundled unit tests with `pytest`:

```bash
pytest -q
```

## Packaging

Windows users can build a one-file executable using PyInstaller. Execute
`make_win.bat` from the project root:

```cmd
make_win.bat
```

The resulting `dist/VRChatAcctMgr.exe` can be distributed as a standalone
binary.

## Roadmap

This repository follows a milestone plan to gradually implement registry
handling, encryption helpers, a GUI, and final packaging. More functionality
will be added in subsequent commits.
