// Load dependencies
const electron = require("electron");
const path = require("path");
const windowStateKeeper = require("electron-window-state");
const app = electron.app;

// Limit one instance of app
if (!app.requestSingleInstanceLock()) app.quit();

// Constants
const APP_VERSION = "0.4.7 Beta";
const DEV_MSGS = false;
const DEV_TOOLS = false;
const ICON = path.join(__dirname, "icons", "appicon.png"); // Icon path

// Logic variables
let mainWindow = null;
let tray = null;
let appMenu = null;
let trayMenu = null;
let contextMenu = null;

let isQuitting = false;
let quitAfter = false;
let isPlaying = false;

/** Show startup timings and other devMsgs when enabled */
function devMsg(message, time) {
    if (DEV_MSGS) {
        console.log(message);
        switch (time) {
            case "start":
                console.time("subtime");
                console.time("total")
                break;
            case "time":
                console.timeEnd("subtime");
                console.time("subtime");
                break;
            case "end":
                console.timeEnd("subtime");
                console.timeEnd("total");
                break;
        }
    }
}

/** Update and apply menus to their latest state */
function reloadMenus() {
    // Define app menu (mainly for macOS)
    appMenu = new electron.Menu.buildFromTemplate([
        {
            label: "应用",
            submenu: [
                {
                    type: "checkbox", checked: mainWindow.isFullScreen(), label: "全屏模式", click: () => {
                        if (mainWindow.isFullScreen()) {
                            mainWindow.setFullScreen(false);
                        } else {
                            mainWindow.setFullScreen(true);
                            mainWindow.webContents.executeJavaScript("layer.msg('按 Esc 即可退出全屏喔 ╰(*°▽°*)╯', { icon: 1 })");
                        }
                        reloadMenus();
                    }
                },
                {
                    type: "checkbox", checked: mainWindow.isAlwaysOnTop(), label: "窗口置顶", click: () => {
                        if (mainWindow.isAlwaysOnTop()) {
                            mainWindow.setAlwaysOnTop(false);
                        } else {
                            mainWindow.setAlwaysOnTop(true, "status");
                        }
                        reloadMenus();
                    }
                },
                { type: "separator" },
                {
                    label: "重新加载", click: () => {
                        app.relaunch();
                        app.exit();
                    }
                },
                {
                    type: "checkbox", checked: quitAfter, label: "听完退出", click: () => {
                        mainWindow.webContents.executeJavaScript("toggleQuitAfter()");
                    }
                },
                {
                    label: "退出", click: () => {
                        isQuitting = true;
                        app.quit();
                    }
                },
            ]
        },
        {
            label: "控制",
            submenu: [
                {
                    label: isPlaying ? "暂停" : "播放", click: () => {
                        mainWindow.webContents.executeJavaScript("pause()");
                    }
                },
                {
                    label: "上一首", click: () => {
                        mainWindow.webContents.executeJavaScript("prevMusic()");
                    }
                },
                {
                    label: "下一首", click: () => {
                        mainWindow.webContents.executeJavaScript("nextMusic()");
                    }
                },
                {
                    label: "查看歌曲详情", click: () => {
                        mainWindow.webContents.executeJavaScript("musicInfoFull(rem.playlist, rem.playid)");
                    }
                },
            ],
        },
        {
            label: "关于",
            submenu: [
                { label: "查看文档", click: openDoc },
                // { label: "检查更新", click: checkUpdates },
                { label: "关于疯子音乐", click: openAbout },
            ],
        },
    ]);

    // Define system tray menu
    trayMenu = new electron.Menu.buildFromTemplate([
        {
            label: "打开疯子音乐", click: () => {
                mainWindow.show();
            }
        },
        { type: "separator" },
        {
            label: isPlaying ? "暂停" : "播放", click: () => {
                mainWindow.webContents.executeJavaScript("pause()");
            }
        },
        {
            label: "上一首", click: () => {
                mainWindow.webContents.executeJavaScript("prevMusic()");
            }
        },
        {
            label: "下一首", click: () => {
                mainWindow.webContents.executeJavaScript("nextMusic()");
            }
        },
        { type: "separator" },
        // {
        //     label: "检查更新", click: checkUpdates
        // },
        {
            label: "重新加载", click: () => {
                app.relaunch();
                app.exit();
            }
        },
        {
            type: "checkbox", checked: quitAfter, label: "听完退出", click: () => {
                mainWindow.webContents.executeJavaScript("toggleQuitAfter()");
            }
        },
        {
            label: "退出", click: () => {
                isQuitting = true;
                app.quit();
            }
        },
    ]);

    // Define context menu
    contextMenu = new electron.Menu.buildFromTemplate([
        {
            label: isPlaying ? "暂停" : "播放", click: () => {
                mainWindow.webContents.executeJavaScript("pause()");
            }
        },
        {
            label: "上一首", click: () => {
                mainWindow.webContents.executeJavaScript("prevMusic()");
            }
        },
        {
            label: "下一首", click: () => {
                mainWindow.webContents.executeJavaScript("nextMusic()");
            }
        },
        {
            label: "查看歌曲信息", click: () => {
                mainWindow.webContents.executeJavaScript("musicInfoFull(rem.playlist, rem.playid)");
            }
        },
        { type: "separator" },
        {
            type: "checkbox", checked: mainWindow.isFullScreen(), label: "全屏模式", click: () => {
                if (mainWindow.isFullScreen()) {
                    mainWindow.setFullScreen(false);
                } else {
                    mainWindow.setFullScreen(true);
                    mainWindow.webContents.executeJavaScript("layer.msg('按 Esc 即可退出全屏喔 ╰(*°▽°*)╯', { icon: 1 })");
                }
                reloadMenus();
            }
        },
        {
            type: "checkbox", checked: mainWindow.isAlwaysOnTop(), label: "窗口置顶", click: () => {
                if (mainWindow.isAlwaysOnTop()) {
                    mainWindow.setAlwaysOnTop(false);
                } else {
                    mainWindow.setAlwaysOnTop(true, "status");
                }
                reloadMenus();
            }
        },
        {
            type: "checkbox", checked: quitAfter, label: "听完退出", click: () => {
                mainWindow.webContents.executeJavaScript("toggleQuitAfter()");
            }
        },
        { type: "separator" },
        { label: "查看文档", click: openDoc },
        { label: "关于疯子音乐", click: openAbout },
    ]);

    // Set the menus
    electron.Menu.setApplicationMenu(appMenu);
    tray.setContextMenu(trayMenu);
}

/** Show Discord RPC */
function loadRPC() {
    const richPresence = require("discord-rich-presence")("826466733451640852");
    richPresence.updatePresence({
        startTimestamp: new Date(),
        largeImageKey: "macicon",
        largeImageText: "v" + APP_VERSION,
    });
    devMsg("Discord RPC module loaded and started", "time");
}

/** Open the About window */
function openAbout() {
    const about = new electron.BrowserWindow({
        width: 720,
        height: 480,
        icon: ICON,
    });
    about.loadFile(path.join(__dirname, "src", "desktop", "about.html"));
    about.setMenu(null);
}

/** Open the Oof window */
function openOof() {
    const oof = new electron.BrowserWindow({
        width: 640,
        height: 480,
        icon: ICON,
    });
    oof.loadFile(path.join(__dirname, "src", "desktop", "oof.html"));
    oof.setMenu(null);
}

/** Open the documentation window */
function openDoc() {
    const doc = new electron.BrowserWindow({
        width: 1080,
        height: 720,
        icon: ICON,
    });
    doc.loadURL("https://docs.music.fengzi.dev/");
    doc.setMenu(null);
}

/** Check for app updates */
function checkUpdates() {
    const { autoUpdater } = require("electron-updater");
    autoUpdater.checkForUpdatesAndNotify();
    devMsg("Checked for updates", "end");
}



/* ------------------------------ */



devMsg("", "start"); // NOTE: skips initialization timing

// On app ready
app.on("ready", () => {
    devMsg("Electron app ready", "time");

    // Get stored window size and position and set fallback
    let mainWindowState = windowStateKeeper({
        defaultWidth: 1280,
        defaultHeight: 720,
    });

    // Load main window
    mainWindow = new electron.BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        show: false,
        backgroundColor: "#4F2F60",
        icon: ICON,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    // Remember window size and position
    mainWindowState.manage(mainWindow);

    // Load app
    mainWindow.loadFile(path.join(__dirname, "src", "index.html"));
    devMsg("Fengzi Music loaded", "time");

    if (DEV_TOOLS) mainWindow.webContents.openDevTools();

    // Load system tray
    try {
        tray = new electron.Tray(path.join(__dirname, "icons", "trayicon.ico"));
    } catch (error) {
        tray = new electron.Tray(path.join(__dirname, "icons", "trayicon.png"));
        devMsg("Using non-Windows tray icon: " + error);
    }
    tray.setToolTip("疯子音乐 - 畅听无止境");
    tray.setIgnoreDoubleClickEvents(true);
    tray.on("click", () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });
    devMsg("System tray loaded", "time");

    // Load app menu, system tray menu, and context menu
    reloadMenus();
    devMsg("App menu, system tray menu, and context menu loaded", "time");

    // Main window events
    // - Show main window when ready
    mainWindow.on("ready-to-show", () => {
        mainWindow.show();
        devMsg("Main window up", "time")

        // Load and start Discord RPC
        loadRPC();
        
        // Check for updates
        checkUpdates();
    });

    // - Hide window when closed out and continue playing instead of quitting
    mainWindow.on("close", (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    // - Window focus and blur indicator
    mainWindow.on("focus", () => {
        mainWindow.webContents.executeJavaScript("windowFocused()");
    });
    mainWindow.on("blur", () => {
        mainWindow.webContents.executeJavaScript("windowBlurred()");
    });

    // - On unresponsive
    mainWindow.on("unresponsive", () => {
        devMsg("Unresponsive");
        openOof();
    });
    mainWindow.on("responsive", () => {
        devMsg("Responsive again");
        oof.close();
        oof = null;
    });
});

// Show original window if user tries to open a second instance
app.on("second-instance", () => {
    if (mainWindow) {
        if (!mainWindow.isVisible()) mainWindow.show();
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
});

// Allow manually quit
app.on("before-quit", () => {
    isQuitting = true;
});

// Disable unexpected window creations
app.on("web-contents-created", (event, contents) => {
    contents.setWindowOpenHandler(() => {
        return { action: "deny" };
    });
});



/* ------------------------------ */



// IPCs
electron.ipcMain.on("isPlaying", () => {
    isPlaying = true;
    reloadMenus();
});
electron.ipcMain.on("isPaused", () => {
    isPlaying = false;
    reloadMenus();
});
electron.ipcMain.on("isOnline", () => {
    tray.setToolTip("疯子音乐 - 畅听无止境");
});
electron.ipcMain.on("isOffline", () => {
    tray.setToolTip("疯子音乐 - 已离线");
});
electron.ipcMain.on("openDoc", openDoc);
electron.ipcMain.on("contextMenu", () => {
    contextMenu.popup({ window: mainWindow });
});
electron.ipcMain.on("exitMaximized", () => {
    if (mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(false);
        reloadMenus();
    }
});
electron.ipcMain.on("toggleMaximized", () => {
    if (mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(false);
    } else {
        mainWindow.setFullScreen(true);
    }
    reloadMenus();
});
electron.ipcMain.on("quitAfterEnabled", () => {
    quitAfter = true;
    reloadMenus();
});
electron.ipcMain.on("quitAfterDisabled", () => {
    quitAfter = false;
    reloadMenus();
});
electron.ipcMain.on("appQuit", () => {
    app.quit();
});