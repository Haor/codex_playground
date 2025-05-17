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
    def __init__(self, controller):
        super().__init__()
        self.controller = controller
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
        self.refresh()

    def refresh(self):
        projects, accounts = self.controller.refresh_model()
        self.projects.clear()
        self.projects.addItems(projects)
        self.accounts.clear()
        self.accounts.addItems([a.username for a in accounts])


if __name__ == "__main__":
    from VRChatAccountManager.src.controller import Controller

    app = QApplication([])
    controller = Controller()
    w = MainWindow(controller)
    w.show()
    app.exec()
