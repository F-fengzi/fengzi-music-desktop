const electron = require("electron");

// 桌面端右键菜单的实现
var rightMenu = new electron.remote.Menu.buildFromTemplate([
    {label: "播放 / 暂停"},
    {label: "上一首"},
    {label: "下一首"},
    {label: "静音 / 取消静音"},
    {label: "查看歌曲信息"}
]);

window.addEventListener("contextmenu", function(e){
    e.preventDefault();
    rightMenu.popup({window: electron.remote.getCurrentWindow()});
});