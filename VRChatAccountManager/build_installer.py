from __future__ import annotations

import subprocess
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parent
    cmd = [
        "pyinstaller",
        "--noconfirm",
        "--windowed",
        "--onefile",
        "--name",
        "VRChatAccountManager",
        str(root / "main.py"),
    ]
    subprocess.check_call(cmd)


if __name__ == "__main__":
    main()
