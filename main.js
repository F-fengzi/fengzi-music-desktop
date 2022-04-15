// Initialize
var electron = require("electron");
var path = require("path");

var app = electron.app;
var mainWindow = null;
// This can prevent Garbage Collection
var tray = null;
var isQuiting = false;

// Development Mode (Debug / Performance)
var devMode = true;
function devMsg(message){
    if(devMode){
        console.log(message);
    }
}
devMsg("Initialize Complete.");

app.on("ready", ()=>{
    devMsg("App Ready.");
    // Start the load window
    var load = new electron.BrowserWindow({
        width: 128,
        height: 128,
        title: "正在加载...",
        frame: false,
        icon: path.join(__dirname, "winicon.ico"),
        show: false
    });
    load.loadFile(path.join(__dirname, "load.png"));
    // This looks like a shit code but if you set it inside the object, it'll show a really bad-looking areo border for half a second.
    load.setResizable(false);
    load.on("ready-to-show", ()=>{
        load.show();
        devMsg("Load Window Showed.");
    });
    // Load the main window
    mainWindow = new electron.BrowserWindow({
        width: 1280,
        height: 720,
        show: false,
        icon: path.join(__dirname, "winicon.ico")
    });
    // Load File System
    var fs = require("fs");
    var vip = false;
    fs.readFile("VIP", "utf-8", (error, data) => {
        if (error){
            vip = false;
            console.log(error.message);
        }
        if (data == "YESYES"){
            vip = true;
        }
    });
    // Load tray icon
    tray = new electron.Tray(path.join(__dirname, "icon.ico"));
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
        //     isQuiting = true;
        //     app.quit();
        // }},
        {label: "退出", click: ()=>{
            isQuiting = true;
            app.quit();
        }}
    ]);
    tray.setToolTip("疯子音乐 - 正在启动");
    tray.setContextMenu(trayMenu);
    tray.setIgnoreDoubleClickEvents(true);
    tray.on("click", ()=>{
        if(mainWindow.isVisible()){
            mainWindow.hide();
        }else{
            mainWindow.show();
        }
    });
    devMsg("Tray Load Complete.");
    // Set app menu
    var macMenu = new electron.Menu.buildFromTemplate([
        {
            label: "进程",
            submenu: [
                // {label: "打开（啥"},
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
                    isQuiting = true;
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
                }},
                {label: "神奇按钮", click: ()=>{
                    if (!vip){
                        fs.writeFile("VIP", "YESYES", (error) => {
                            if (error){
                                electron.dialog.showErrorBox("OOF! 您没能有幸成为尊贵的疯子音乐VIP！(。_。)", error.message);
                            }else{
                                vip = true;
                                app.relaunch();
                                app.exit();
                            }
                        });
                    }else{
                        electron.dialog.showErrorBox("您已经是尊贵的VIP了！", "做人不能太贪");
                    }
                }}
            ]
        }
    ]);
    // mainWindow.setMenu(macMenu);
    electron.Menu.setApplicationMenu(macMenu);
    devMsg("App Menu Load Complete.");
    mainWindow.loadFile(path.join(__dirname, "index.html"));
    devMsg("Main Content Loaded.");
    // Shrug.
    var startupTimeout = setTimeout(function(){
        if (!mainWindow.isVisible()){
            devMsg("Fix Started.")
            devMsg("Main Window Ready To Show After Fix.");
            load.close();
            mainWindow.show();
            if (vip){
                tray.setToolTip("尊享疯子音乐VIP，彰显不一样的你");
            }else{
                tray.setToolTip("疯子音乐主进程");
            }
            clearTimeout(startupTimeout);
            devMsg("Main Window Ready.");
            devMsg("Fix Finished.")
            electron.dialog.showErrorBox("疯子音乐备用修复系统", "检测到启动超时，已尝试直接为您强制启动。请向作者反馈此问题 (´･ω･`)");
        }
    }, 15000);
    mainWindow.on("ready-to-show", ()=>{
        devMsg("Main Window Ready To Show.");
        load.close();
        mainWindow.show();
        if (vip){
            tray.setToolTip("尊享疯子音乐VIP，彰显不一样的你");
        }else{
            tray.setToolTip("疯子音乐主进程");
        }
        clearTimeout(startupTimeout);
        devMsg("Main Window Ready.");
    });
    // Hide window and continue playing instead of closing
    mainWindow.on("close", (e)=>{
        if(!isQuiting){
            e.preventDefault();
            mainWindow.hide();
        }
    });
    mainWindow.on("unresponsive", ()=>{
        var oof = new electron.BrowserWindow({
            width: 640,
            height: 480,
            icon: path.join(__dirname, "winicon.ico")
        });
        oof.loadFile(path.join(__dirname, "oof.html"));
        oof.setMenu(null);
    });
    mainWindow.on("responsive", ()=>{
        oof.close();
    });
    // Try to load Discord status
    var richPresence = require("discord-rich-presence")("826466733451640852");
    richPresence.updatePresence({
        state: "music.fengzi.ga",
        startTimestamp: new Date(),
        largeImageKey: "logo",
        largeImageText: "Hi!"
    });
    devMsg("Discord Status Module Load Complete.");
});
// Allow manually quit
app.on("before-quit", function(){
    isQuiting = true;
});