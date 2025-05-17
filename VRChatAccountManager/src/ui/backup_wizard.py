from __future__ import annotations

from pathlib import Path
from PySide6.QtWidgets import QFileDialog, QMessageBox

from .. import appdata_service


def backup_project_gui(project: str) -> None:
    file, _ = QFileDialog.getSaveFileName(None, "Select backup file", f"{project}.zip", "Zip Files (*.zip)")
    if file:
        try:
            appdata_service.backup_product(project, Path(file))
            QMessageBox.information(None, "Backup", "Backup completed")
        except Exception as e:
            QMessageBox.critical(None, "Error", str(e))
