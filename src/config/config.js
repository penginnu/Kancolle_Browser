'use strict';

const electron = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

var ipc = electron.ipcRenderer;
const shell = electron.shell

function ChangeTab(tabname) {
    // タブメニュー非表示
    document.getElementById('tab1').style = 'display: none;';
    document.getElementById('tab2').style = 'display: none;';
    document.getElementById('tab3').style = 'display: none;';
    // タブメニュー実装
    document.getElementById(tabname).style = 'display: block;';
 }

 function reloadCacheCrear () {
    ipc.on('Reload-Cache-Delete-reply', function(responce) {
        console.log("Reload-Cache-Crear Responce : " + responce);
    });
    ipc.send('Reload-Cache-Delete', 'RELOAD-CACHE-CREAR');

    return 0;
 }