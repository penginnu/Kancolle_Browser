'use strict';

const electron = require('electron');
const storage = require('electron-json-storage');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var ipc = electron.ipcMain;
var settings = {
    zoomMode: 75,
    mainWindow: {
        position: [0, 0]
    },
    toolWindow: {
        position: [0, 0]
    }
};
var firstStart = false;

// ウインドウオブジェクトのグローバル参照を保持してください。さもないと、そのウインドウは
// JavaScript オブジェクトがガベージコレクションを行った時に自動的に閉じられます。
let mainWindow;
let sprashWindow;
let settingWindow;
let toolWindow;

// 仮　ハードウエアクセラレーション無効か
// app.disableHardwareAcceleration();

function createWindow () {

    // browser window を生成する
    mainWindow = new BrowserWindow({width: 900, height: 540, show: false, resizable: false, useContentSize: true, title: "提督の執務室", webPreferences: {zoomFactor: 1}});
    mainWindow.setMenu(null);
    mainWindow.webContents.setZoomFactor(0.75);

    //設定読み込み
    if(firstStart === false) {
        // 位置設定
        console.log("Load Window position (mainWindow)");
        mainWindow.setPosition(settings.mainWindow.position[0], settings.mainWindow.position[1]);
        
        mainWindow.setContentSize( 1200 * ( settings.zoomMode / 100 ) , 720 * ( settings.zoomMode / 100) );
        mainWindow.webContents.setZoomFactor( settings.zoomMode / 100 );
    } else {
        settings.mainWindow.position[0] = 0;
        settings.mainWindow.position[1] = 0;
        settings.zoomMode = 75;
    }

    // 艦これを読み込む
    mainWindow.loadURL('http://www.dmm.com/netgame/social/-/gadgets/=/app_id=854854/');

    // 開発者ツールを開く
    // mainWindow.webContents.openDevTools();

    // ウインドウ移動時
    mainWindow.on('move', () => {
        //ウインドウ位置の保存
        settings.mainWindow.position = mainWindow.getPosition();
        console.log("Window x : " + settings.mainWindow.position[0] + " y : " + settings.mainWindow.position[1]);
    });

    // タイトル変更阻止
    mainWindow.on('page-title-updated', function(event, title) {
        event.preventDefault();
    });

    // ウィンドウが閉じられた時に発火
    mainWindow.on('closed', () => {
        // 設定群の保存
        storage.set('config.json', settings, function(error) {
            

            // ウインドウオブジェクトの参照を外す。
            // 通常、マルチウインドウをサポートするときは、
            // 配列にウインドウを格納する。
            // ここは該当する要素を削除するタイミング。
            mainWindow = null;

            // macOSでは、ユーザが Cmd + Q で明示的に終了するまで、
            // アプリケーションとそのメニューバーは有効なままにするのが一般的。
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
    })

    mainWindow.webContents.on('dom-ready', () => {
        mainWindow.webContents.insertCSS('body { margin:0; overflow:hidden } #game_frame { position:fixed; left:50%; top:-16px; margin-left:-600px; z-index:1 } .area-pickupgame, .area-menu { display:none!important; }');
        mainWindow.show();
        toolWindow.show();
        console.log("Conplete, DOM-READY.");

        // 倍率設定
        if (settings.zoomMode === 100) {
            console.log("Load ZoomFactor 100 (mainWindow)");
            mainWindow.setContentSize(1200, 720);
            mainWindow.webContents.setZoomFactor(1);
        } else if (settings.zoomMode === 50) {
            console.log("Load ZoomFactor 50 (mainWindow)");
            mainWindow.setContentSize(600,360);
            mainWindow.webContents.setZoomFactor(0.5);
        }
    })

    mainWindow.webContents.once('dom-ready', () => {
        sprashWindow.close();
    })

    mainWindow.webContents.on('did-finish-load', () => {
        console.log("Conplete, ALL.");
    })
}

function createSetingWindow () {
    settingWindow = new BrowserWindow({width: 575, height: 400, show: false, title: "提督の執務室"});
    settingWindow.setMenu(null);

    settingWindow.loadFile('src/config/config.html');

    console.log("settingWindow READY");

    settingWindow.on('close', (event) => {
        event.preventDefault();
        settingWindow.hide();
    });
} 

function createToolWindow () {
    // toolWindow = new BrowserWindow({width: 475, height: 85, frame: false, resizable: false, backgroundColor: '#202020'});
    //小さい方
    toolWindow = new BrowserWindow({width: 270, height: 65, show: false, frame: false, resizable: false, backgroundColor: '#202020'});
    // width 320
    toolWindow.setMenu(null);

    //toolWindow.loadFile('src/tools/tools.html');
    //小さい方
    toolWindow.loadFile('src/tools/tools.small.html');

    // toolWindow.webContents.openDevTools();

    //設定読み込み
    if(firstStart === false) {
        console.log("Load Window position (toolWindow)");
        toolWindow.setPosition(settings.toolWindow.position[0], settings.toolWindow.position[1]);
    } else {
        settings.toolWindow.position[0] = 0;
        settings.toolWindow.position[1] = 0;
    }

    // ウインドウ移動時
    toolWindow.on('move', () => {
        //ウインドウ位置の保存
        settings.toolWindow.position = toolWindow.getPosition();
        console.log("Tool x : " + settings.toolWindow.position[0] + " y : " + settings.toolWindow.position[1]);
    });
    
} 

function showSprash () {
    console.log("show sprash");
    sprashWindow = new BrowserWindow({width: 350, height: 200, show: false, frame: false, resizable: false, backgroundColor: '#202020'});
    sprashWindow.setMenu(null);

    // スプラッシュスクリーンの読み込み
    sprashWindow.loadFile('src/sprash.html');

    sprashWindow.once('ready-to-show', () => {
        sprashWindow.show();
        console.log("sprashWidow READY");
    })
}

// 起動
function systemStart() {
    // スプラッシュウインドウ起動
    console.log("App start");
    showSprash();

    // 設定の読み込み
    storage.get('config', function (error, data) {
        if (error) throw error;

        if (Object.keys(data).length === 0) {
            // データがないときの処理
            console.log('First Start');
            firstStart = true;
        } else {
            // データがあるときの処理
            console.log('Load Configs');
            settings = data;
            console.log(data);
        }

        //起動
        createWindow();
        createToolWindow();
        createSetingWindow();
    });
}


// このイベントは、Electronが初期化処理と
// browser windowの作成を完了した時に呼び出されます。
// 一部のAPIはこのイベントが発生した後にのみ利用できます。
app.on('ready', systemStart);

// 全てのウィンドウが閉じられた時に終了する
app.on('window-all-closed', () => {
    // macOSでは、ユーザが Cmd + Q で明示的に終了するまで、
    // アプリケーションとそのメニューバーは有効なままにするのが一般的。
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    // macOSでは、ユーザがドックアイコンをクリックしたとき、
    // そのアプリのウインドウが無かったら再作成するのが一般的。
    if (win === null) {
        createWindow();
    }
})

// このファイル内には、
// 残りのアプリ固有のメインプロセスコードを含めることができます。 
// 別々のファイルに分割してここで require することもできます。

// ミュートコマンド対応
ipc.on('Active-Mute', function(event, arg) {
    console.log('Active-Mute by ipc');
    mainWindow.webContents.setAudioMuted(true);
    event.sender.send('Active-Mute-reply', 'OK');
}); 

// ミュートコマンド対応
ipc.on('Disabled-Mute', function(event, arg) {
    console.log('Disabled-Mute by ipc');
    mainWindow.webContents.setAudioMuted(false);
    event.sender.send('Disabled-Mute-reply', 'OK');
}); 

// ページ再読み込み
ipc.on('Reload-Game', function(event, arg) {
    console.log('Reload-Game by ipc');
    mainWindow.webContents.reload();
    event.sender.send('Reload-Game-reply', 'OK');
});

//表示倍率変更
ipc.on('Change-ZoomFactor', function(event, arg) {
    console.log('Change-ZoomFactor by ipc');
    // 倍率設定
    if (settings.zoomMode === 50) {
        settings.zoomMode = 100;
    } else if (settings.zoomMode === 75) {
        settings.zoomMode = 50;
    } else {
        settings.zoomMode = 75;
    }

    mainWindow.setContentSize( 1200 * ( settings.zoomMode / 100 ) , 720 * ( settings.zoomMode / 100) );
    mainWindow.webContents.setZoomFactor( settings.zoomMode / 100 );

    console.log('Change-ZoomFactor to ' + settings.zoomMode);
    event.sender.send('Change-ZoomFactor-reply', 'OK');
});



ipc.on('Screen-Shot', function(event, arg) {
    console.log('Screen Shot by ipc to ' + settings.zoomMode);
    event.sender.send('Screen-Shot-reply', settings.zoomMode );
});

ipc.on('Open-Setting', function(event, arg) {
    settingWindow.show();
    event.sender.send('Open-Setting-reply', "OK" );
});