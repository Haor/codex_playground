# VRChat Account Manager

Simple tool for managing VRChat SDK login credentials across multiple Unity projects. This repo contains a minimal reference implementation with mock registry storage so it can run on any platform.

## Setup

```bash
pip install -r requirements.txt
```

## Usage

Run the GUI:

```bash
python main.py
```

The left list shows projects stored in the mock registry. The right list shows accounts stored in the local SQLite database (`accounts.db`). Buttons allow refreshing the lists, backing up a project and switching a project to the selected account.

Backups are stored under the `backups/` directory.

## Tests

Run unit tests with `pytest`:

```bash
pytest -q
```
