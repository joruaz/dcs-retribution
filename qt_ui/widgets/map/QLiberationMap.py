from __future__ import annotations

import logging
import os
from pathlib import Path

from PySide6.QtCore import QUrl
from PySide6.QtWebEngineCore import (
    QWebEnginePage,
    QWebEngineSettings,
    QWebEngineProfile,
)
from PySide6.QtWebEngineWidgets import QWebEngineView

from game.server.settings import ServerSettings
from qt_ui.liberation_install import server_port
from qt_ui.models import GameModel

MAX_CACHE_BYTES = 100 * 1024 * 1024


class LoggingWebPage(QWebEnginePage):
    def javaScriptConsoleMessage(
        self,
        level: QWebEnginePage.JavaScriptConsoleMessageLevel,
        message: str,
        line_number: int,
        source: str,
    ) -> None:
        if level == QWebEnginePage.JavaScriptConsoleMessageLevel.ErrorMessageLevel:
            logging.error(message)
        elif level == QWebEnginePage.JavaScriptConsoleMessageLevel.WarningMessageLevel:
            logging.warning(message)
        else:
            logging.info(message)


class QLiberationMap(QWebEngineView):
    def __init__(self, game_model: GameModel, dev: bool, parent) -> None:
        super().__init__(parent)
        self.game_model = game_model
        self.setMinimumSize(800, 600)

        # Store profile in %LOCALAPPDATA%/DCSRetribution/web_profile
        local_app_data = os.getenv("LOCALAPPDATA")
        if local_app_data:
            storage_dir = Path(local_app_data) / "DCSRetribution" / "web_profile"
        else:
            storage_dir = Path.home() / ".config" / "DCSRetribution" / "web_profile"

        storage_dir.mkdir(parents=True, exist_ok=True)
        storage_path = str(storage_dir.resolve())

        # Instantiate an explicit named profile (forces a new persistent Chromium session)
        self.profile = QWebEngineProfile("LiberationMapProfile", self)
        self.profile.setPersistentStoragePath(storage_path)

        self.profile.setHttpCacheType(QWebEngineProfile.HttpCacheType.DiskHttpCache)
        self.profile.setHttpCacheMaximumSize(MAX_CACHE_BYTES)
        self.profile.setCachePath(storage_path)

        self.page = LoggingWebPage(self.profile, self)

        settings = self.page.settings()
        settings.setAttribute(QWebEngineSettings.WebAttribute.LocalStorageEnabled, True)

        # Required to allow "cross-origin" access from file:// scoped canvas.html to the
        # localhost HTTP backend.
        self.page.settings().setAttribute(
            QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls, True
        )

        if dev:
            url = QUrl("http://localhost:3000")
        else:
            url = QUrl.fromLocalFile(str(Path("client/build/index.html").resolve()))
        server_settings = ServerSettings.get(server_port())
        host = server_settings.server_bind_address
        if host.startswith("::"):
            host = f"[{host}]"
        port = server_settings.server_port
        url.setQuery(f"server={host}:{port}")
        self.page.load(url)
        self.setPage(self.page)
