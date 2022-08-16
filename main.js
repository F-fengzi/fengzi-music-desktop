// Load basics
var electron = require("electron");
var path = require("path");
var app = electron.app;
// Prevent garbage collection
var mainWindow = null;
var tray = null;
var isQuitting = false;

// devMode
var devMode = false;
if (devMode){console.time("time")}
function devMsg(message, last){
    if(devMode){
        console.log(message);
        console.timeEnd("time");
        if (!last){
            console.time("time");
        } 
    }
}
// Discord RPC module
function loadRPC(){
    let richPresence = require("discord-rich-presence")("826466733451640852");
    richPresence.updatePresence({
        startTimestamp: new Date(),
        largeImageKey: "logo",
        largeImageText: "Hi!"
    });
    devMsg("Discord Status Module Load Complete.");
}

// System tray options
var trayMenu = new electron.Menu.buildFromTemplate([
    {label: "打开疯子音乐", click: ()=>{mainWindow.show()}},
    {type: "separator"},
    {label: "播放 / 暂停", click: ()=>{
        mainWindow.webContents.executeJavaScript("pause()");
    }},
    {label: "上一首", click: ()=>{
        mainWindow.webContents.executeJavaScript("prevMusic()");
    }},
    {label: "下一首", click: ()=>{
        mainWindow.webContents.executeJavaScript("nextMusic()");
    }},
    {type: "separator"},
    {label: "重新加载", click: ()=>{
        app.relaunch();
        app.exit();
    }},
    // {label: "听完退出", click: ()=>{
    //     isQuitting = true;
    //     app.quit();
    // }},
    {label: "退出", click: ()=>{
        isQuitting = true;
        app.quit();
    }}
]);
// App menu options
var appMenu = new electron.Menu.buildFromTemplate([
    {
        label: "应用",
        submenu: [
            {label: "切换全屏", click: ()=>{
                if (mainWindow.isFullScreen()){
                    mainWindow.setFullScreen(false);
                }else{
                    mainWindow.setFullScreen(true);
                }
            }},
            {label: "切换窗口置顶", click: ()=>{
                if (mainWindow.isAlwaysOnTop()){
                    mainWindow.setAlwaysOnTop(false);
                }else{
                    mainWindow.setAlwaysOnTop(true, "status");
                }
            }},
            {label: "重新加载", click: ()=>{
                app.relaunch();
                app.exit();
            }},
            {label: "退出", click: ()=>{
                isQuitting = true;
                app.quit();
            }}
        ]
    },
    {
        label: "控制",
        submenu: [
            {label: "播放 / 暂停", click: ()=>{
                mainWindow.webContents.executeJavaScript("pause()");
            }},
            {label: "上一首", click: ()=>{
                mainWindow.webContents.executeJavaScript("prevMusic()");
            }},
            {label: "下一首", click: ()=>{
                mainWindow.webContents.executeJavaScript("nextMusic()");
            }},
            // {label: "静音 / 取消静音", click: ()=>{
            //     // not original mk function name, just added by fengzi music.
            // }},
            // {label: "查看歌曲详情", click: ()=>{}},
            // {label: "下载歌曲封面（啥"}
        ] 
    },
    {
        label: "关于",
        submenu: [
            {label: "打开文档", click: ()=>{
                var doc = new electron.BrowserWindow({
                    width: 1280,
                    height: 720,
                    icon: path.join(__dirname, "winicon.ico")
                });
                doc.loadURL("https://docs.music.fengzi.ga");
                doc.setMenu(null);
            }},
            {label: "关于疯子音乐", click: ()=>{
                var about = new electron.BrowserWindow({
                    width: 720,
                    height: 480,
                    icon: path.join(__dirname, "winicon.ico")
                });
                about.loadFile(path.join(__dirname, "about.html"));
                about.setMenu(null);
            }}
        ]
    }
]);

devMsg("Initialized");

app.on("ready", ()=>{
    devMsg("App ready");
    // Load main window
    mainWindow = new electron.BrowserWindow({
        width: 1280,
        height: 720,
        show: false,
        icon: path.join(__dirname, "winicon.ico")
    });
    mainWindow.loadFile(path.join(__dirname, "index.html"));
    devMsg("Content loaded");

    // Load system tray
    tray = new electron.Tray(path.join(__dirname, "icon.ico"));
    tray.setToolTip("疯子音乐 - 畅听无止境");
    tray.setContextMenu(trayMenu);
    tray.setIgnoreDoubleClickEvents(true);
    tray.on("click", ()=>{
        if(mainWindow.isVisible()){
            mainWindow.hide();
        }else{
            mainWindow.show();
        }
    });
    devMsg("System tray loaded");

    // Load app menu
    electron.Menu.setApplicationMenu(appMenu);
    devMsg("App menu loaded");

    // Show main window
    mainWindow.on("ready-to-show", ()=>{
        mainWindow.show();
        devMsg("Main window up", true);
    });

    // Hide window and continue playing instead of closing
    mainWindow.on("close", (event)=>{
        if(!isQuitting){
            event.preventDefault();
            mainWindow.hide();
        }
    });

    // On unresponsive
    mainWindow.on("unresponsive", ()=>{
        devMsg("Unresponsive");
        var oof = new electron.BrowserWindow({
            width: 640,
            height: 480,
            icon: path.join(__dirname, "winicon.ico")
        });
        oof.loadFile(path.join(__dirname, "oof.html"));
        oof.setMenu(null);
    });
    mainWindow.on("responsive", ()=>{
        devMsg("Responsive again");
        oof.close();
    });

    // Attempt to load Discord RPC
    loadRPC();
});

// Allow manually quit
app.on("before-quit", ()=>{
    isQuitting = true;
});