from __future__ import annotations

from PySide6.QtWidgets import (
    QApplication,
    QMainWindow,
    QListWidget,
    QWidget,
    QVBoxLayout,
    QLabel,
)


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("VRChat Account Manager")
        central = QWidget()
        layout = QVBoxLayout(central)
        self.projects = QListWidget()
        self.accounts = QListWidget()
        layout.addWidget(QLabel("Projects"))
        layout.addWidget(self.projects)
        layout.addWidget(QLabel("Accounts"))
        layout.addWidget(self.accounts)
        self.setCentralWidget(central)

    def load_demo(self):
        self.projects.addItems(["DemoProjectA", "DemoProjectB"])
        self.accounts.addItems(["alice", "bob"])


if __name__ == "__main__":
    app = QApplication([])
    w = MainWindow()
    w.load_demo()
    w.show()
    app.exec()
