'use strict';

const electron = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

var ipc = electron.ipcRenderer;
const desktopCapturer = electron.desktopCapturer
const shell = electron.shell

var muted = false;

//ミュート処理
function mute() {
    if(muted === false) {
        activeMute();
        muted = true;
    } else {
        disableMute();
        muted = false;
    }

    return 0;
}

//ミュート指定送信
function activeMute () {
    console.log("Active Mute");
    ipc.on('Active-Mute-reply', function(responce) {
        console.log("Active-Mute Responce : " + responce);
    });
    ipc.send('Active-Mute', 'ACTIVE_MUTE');

    return 0;
}

//ミュート解除送信
function disableMute () {
    console.log("Disabled Mute");
    ipc.on('Disabled-Mute-reply', function(responce) {
        console.log("Disabled-Mute Responce : " + responce);
    });
    ipc.send('Disabled-Mute', 'DISABLED_MUTE');

    return 0;
}

function getCurrentTime() {
	var now = new Date();
	var res = "KanColle-" + now.getFullYear() +padZero(now.getMonth() + 1) + 
		padZero(now.getDate()) + "-" + padZero(now.getHours()) +
		padZero(now.getMinutes()) +padZero(now.getSeconds());
	return res;
}

function padZero(num) {
	var result;
	if (num < 10) {
		result = "0" + num;
	} else {
		result = "" + num;
	}
	return result;
}

// スクショ送信
function screenShot () {
    console.log("Screen Shot");
    ipc.once('Screen-Shot-reply', function(event, responce) {
        console.log('Responce by Screen Shot : ' + responce);
        if (responce === 50) {
            var windowX = 600;
            var windowY = 360;
        } else if (responce === 75) {
            var windowX = 900;
            var windowY = 540;
        } else if (responce === 100) {
            var windowX = 1200;
            var windowY = 720;
        } else {
            console.log("Screen Shot error");
            return 0;
        }

        let options = {
            types: ['window', 'screen'],
            thumbnailSize: {
                width: windowX,
                height: windowY
            }
        }

        desktopCapturer.getSources(options, function(error, sources) {
            if (error) return console.log(error);

            console.log('Get Screen Shot Sources');
    
            sources.forEach(function(source) {
                console.log(source.name);
                if ( source.name !== 'a') {
                    const screenshotPath = path.join('./screenshot/', getCurrentTime() + source.name + '.png');
    
                    fs.writeFile(screenshotPath, source.thumbnail.toPNG(), function(error) {
                        if (error) return console.log(error);

                        console.log(`Saved screenshot to: ${screenshotPath}`);
                    });
                }
            });
        });
    });
    ipc.send('Screen-Shot', 'DISABLED_MUTE');

    return 0;
}

// リロード送信
function reloadGame () {
    console.log("Reload Gmae");
    ipc.on('Reload-Game', function(responce) {
        console.log("Reload Game : " + responce);
    });
    ipc.send('Reload-Game', 'RELOAD-GAME');

    return 0;
}

//ズームレベル変更送信
function changeZoomFactor () {
    console.log('Change Zoom Factor');
    ipc.on('Change-ZoomFactor', function(responce) {
        console.log("Change Zoom Factor : " + responce);
    });
    ipc.send('Change-ZoomFactor', 'CHANGE-ZOOMFACTOR');

    return 0;
}

// 設定画面送信
function openSettings () {
    console.log("Open Settings Window");
    ipc.on('Open-Settings', function(responce) {
        console.log("Open Settings Window : " + responce);
    });
    ipc.send('Open-Settings', 'OPEN-SETTINGS');

    return 0;
}