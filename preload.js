const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("bridge", {
    exitMaximized: () => ipcRenderer.send("exitMaximized"),
    toggleMaximized: () => ipcRenderer.send("toggleMaximized"),
    contextMenu: () => ipcRenderer.send("contextMenu"),
    appQuit: () => ipcRenderer.send("appQuit"),
    quitAfterEnabled: () => ipcRenderer.send("quitAfterEnabled"),
    quitAfterDisabled: () => ipcRenderer.send("quitAfterDisabled"),
    isPlaying: () => ipcRenderer.send("isPlaying"),
    isPaused: () => ipcRenderer.send("isPaused"),
    openDoc: () => ipcRenderer.send("openDoc"),
});