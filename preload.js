const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("bridge", {
    isPlaying: () => ipcRenderer.send("isPlaying"),
    isPaused: () => ipcRenderer.send("isPaused"),
    isOnline: () => ipcRenderer.send("isOnline"),
    isOffline: () => ipcRenderer.send("isOffline"),
    openDoc: () => ipcRenderer.send("openDoc"),
    contextMenu: () => ipcRenderer.send("contextMenu"),
    exitMaximized: () => ipcRenderer.send("exitMaximized"),
    toggleMaximized: () => ipcRenderer.send("toggleMaximized"),
    quitAfterEnabled: () => ipcRenderer.send("quitAfterEnabled"),
    quitAfterDisabled: () => ipcRenderer.send("quitAfterDisabled"),
    appQuit: () => ipcRenderer.send("appQuit"),
});