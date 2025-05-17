from __future__ import annotations

from pathlib import Path

from PySide6.QtWidgets import QFileDialog, QWidget


class BackupWizard(QWidget):
    def __init__(self, controller):
        super().__init__()
        self.controller = controller

    def select_backup(self, project: str):
        path, _ = QFileDialog.getSaveFileName(self, "Select Backup", f"{project}.zip")
        if path:
            self.controller.backup(project, Path(path))
