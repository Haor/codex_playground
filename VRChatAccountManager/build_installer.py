"""Build a Windows executable using PyInstaller."""

import PyInstaller.__main__


def main() -> None:
    PyInstaller.__main__.run([
        "--name=VRChatAccountManager",
        "--onefile",
        "main.py",
    ])


if __name__ == "__main__":
    main()
