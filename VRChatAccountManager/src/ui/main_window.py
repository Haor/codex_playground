from __future__ import annotations

from PySide6.QtWidgets import (
    QApplication,
    QMainWindow,
    QListWidget,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QPushButton,
    QLabel,
)

from .. import controller, db_service


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("VRChat Account Manager")
        central = QWidget()
        self.setCentralWidget(central)

        main_layout = QHBoxLayout()
        central.setLayout(main_layout)

        left = QVBoxLayout()
        right = QVBoxLayout()
        main_layout.addLayout(left)
        main_layout.addLayout(right)

        left.addWidget(QLabel("Projects"))
        self.project_list = QListWidget()
        left.addWidget(self.project_list)

        left_buttons = QHBoxLayout()
        self.btn_refresh = QPushButton("Refresh")
        self.btn_backup = QPushButton("Backup")
        left_buttons.addWidget(self.btn_refresh)
        left_buttons.addWidget(self.btn_backup)
        left.addLayout(left_buttons)

        right.addWidget(QLabel("Accounts"))
        self.account_list = QListWidget()
        right.addWidget(self.account_list)
        self.btn_switch = QPushButton("Switch")
        right.addWidget(self.btn_switch)

        self.btn_refresh.clicked.connect(self.refresh)
        self.btn_backup.clicked.connect(self.backup)
        self.btn_switch.clicked.connect(self.switch_account)

        self.statusBar()
        self.refresh()

    def refresh(self):
        self.project_list.clear()
        self.account_list.clear()
        projects, accounts = controller.refresh_model()
        for p in projects:
            self.project_list.addItem(p)
        for acc in accounts:
            self.account_list.addItem(f"{acc.id}: {acc.username}")

    def backup(self):
        item = self.project_list.currentItem()
        if not item:
            return
        controller.backup(item.text())
        self.statusBar().showMessage(f"Backup complete for {item.text()}", 3000)

    def switch_account(self):
        proj_item = self.project_list.currentItem()
        acc_item = self.account_list.currentItem()
        if not proj_item or not acc_item:
            return
        acc_id = int(acc_item.text().split(":")[0])
        controller.switch_account(proj_item.text(), acc_id)
        self.statusBar().showMessage(
            f"Switched {proj_item.text()} to account {acc_id}", 3000
        )


def main():
    db_service.init_db()
    app = QApplication([])
    w = MainWindow()
    w.show()
    app.exec()


if __name__ == "__main__":
    main()
