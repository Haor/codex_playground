from __future__ import annotations

from PySide6.QtWidgets import (
    QMainWindow, QListWidget, QSplitter, QWidget, QVBoxLayout,
    QApplication
)
from PySide6.QtCore import Qt

from .. import controller


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("VRChat Account Manager")
        self.projects = QListWidget()
        self.accounts = QListWidget()

        splitter = QSplitter()
        splitter.addWidget(self.projects)
        splitter.addWidget(self.accounts)
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.addWidget(splitter)
        self.setCentralWidget(widget)

        self.refresh()

    def refresh(self):
        projects, accounts = controller.refresh_model()
        self.projects.clear()
        self.accounts.clear()
        self.projects.addItems(projects)
        self.accounts.addItems([a.username for a in accounts])


def main():
    app = QApplication([])
    w = MainWindow()
    w.show()
    app.exec()


if __name__ == "__main__":
    main()
