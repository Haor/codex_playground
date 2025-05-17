from PySide6.QtWidgets import QApplication

from VRChatAccountManager.src.ui.main_window import MainWindow


def main():
    app = QApplication([])
    w = MainWindow()
    w.load_demo()
    w.show()
    app.exec()


if __name__ == "__main__":
    main()
