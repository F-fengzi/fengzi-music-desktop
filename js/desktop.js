// 决定是否听完退出的变量
var quitAfter = false;

function toggleQuitAfter(){
    quitAfter = !quitAfter;
    quitAfter ? window.bridge.quitAfterEnabled() : window.bridge.quitAfterDisabled();
}

// 窗口活跃指示
function windowFocused(){
    document.querySelector(".focus-indicator").style.opacity = 0.6;
}
function windowBlurred(){
    document.querySelector(".focus-indicator").style.opacity = 0.8;
}

// 侦测键盘按键
document.addEventListener("keydown", event => {
    switch (event.key){
        case "Escape":
            window.bridge.exitMaximized();
            break;
        case "F11":
            window.bridge.toggleMaximized();
            break;
    }
});

// 桌面端右键菜单的实现
document.addEventListener("contextmenu", event => {
    event.preventDefault();
    window.bridge.contextMenu();
});