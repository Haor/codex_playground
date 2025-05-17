from PySide6.QtWidgets import QMainWindow, QLabel
from PySide6.QtCore import Qt


class MainWindow(QMainWindow):
    """Minimal main window placeholder."""

    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("VRChat Account Manager")
        label = QLabel("Hello VRChat", self)
        label.setAlignment(Qt.AlignCenter)
        self.setCentralWidget(label)
