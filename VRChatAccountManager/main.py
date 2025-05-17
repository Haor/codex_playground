from PySide6.QtWidgets import QApplication

from VRChatAccountManager.src.controller import Controller
from VRChatAccountManager.src.ui.main_window import MainWindow


def main():
    app = QApplication([])
    controller = Controller()
    w = MainWindow(controller)
    w.show()
    app.exec()


if __name__ == "__main__":
    main()
