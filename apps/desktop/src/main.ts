import { app, BrowserWindow, Menu } from "electron";
import * as path from "path";
import serve from "electron-serve";

const isDev = process.env.NODE_ENV === "development";

if (isDev) {
  try {
    require("electron-reload")(__dirname, {
      electron: path.join(__dirname, "..", "node_modules", ".bin", "electron"),
      hardResetMethod: "exit",
    });
  } catch (e) {
    // electron-reload is optional in development
  }
}

const loadURL = serve({ directory: "web-dist" });

let mainWindow: BrowserWindow;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    titleBarStyle: "default",
    show: false,
    title: "Autobattler",
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    loadURL(mainWindow);
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null as any;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Create application menu
const template: Electron.MenuItemConstructorOptions[] = [
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
        click: () => {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  {
    label: "Window",
    submenu: [{ role: "minimize" }, { role: "close" }],
  },
];

if (process.platform === "darwin") {
  template.unshift({
    label: app.getName(),
    submenu: [
      { role: "about" },
      { type: "separator" },
      { role: "services" },
      { type: "separator" },
      { role: "hide" },
      { role: "hideOthers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" },
    ],
  });
}

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
