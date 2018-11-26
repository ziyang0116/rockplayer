// Modules to control application life and create native browser window
import {app, BrowserWindow, Menu, ipcMain} from 'electron'
const electron = require('electron');
import {videoSupport} from './app/ffmpeg-helper';
import VideoServer from './app/VideoServer';
import {srtToVtt} from './app/subtitle-helper';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
const INDEX_HTML = 'view/index.html';
const INDEX_STREAM_HTML = 'view/index-stream.html';
let mainWindow;
let httpServer;
let currentLoadFile;

function onVideoFileSeleted(videoFilePath) {
    videoSupport(videoFilePath).then((checkResult) => {
        if (checkResult.videoCodecSupport && checkResult.audioCodecSupport) {
            if(httpServer){
                httpServer.killFfmpegCommand();
            }
            if(currentLoadFile == INDEX_HTML) {
                mainWindow.webContents.send('fileSelected', videoFilePath);
            } else{
                ipcMain.once("ipcRendererReady", (event, args)=>{
                    mainWindow.webContents.send('fileSelected', videoFilePath);
                })
                mainWindow.loadFile(INDEX_HTML);
                currentLoadFile = INDEX_HTML;

            }
        }
        if (!checkResult.videoCodecSupport || !checkResult.audioCodecSupport) {
            if(!httpServer){
                httpServer = new VideoServer();
            }
            httpServer.videoSourceInfo = {videoSourcePath:videoFilePath, checkResult: checkResult};
            httpServer.createServer();
            if (httpServer) {
                console.log("createVideoServer success");
                ipcMain.once("ipcRendererReady", (event, args)=>{
                    mainWindow.webContents.send('duration', checkResult.duration);
                })
                mainWindow.loadFile(INDEX_STREAM_HTML);
                currentLoadFile = INDEX_STREAM_HTML;
            }
        }
    })
}

let application_menu = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open',
                accelerator: 'CmdOrCtrl+O',
                click: () => {
                    electron.dialog.showOpenDialog({
                        properties: ['openFile'],
                        filters: [
                            {name: 'Movies', extensions: ['mkv', 'avi', 'mp4', 'rmvb', 'flv', 'ogv','webm', '3gp', 'mov']},
                        ]
                    }, (result) => {
                        console.log(result);

                        if (result && mainWindow && result.length > 0) {
                                onVideoFileSeleted(result[0])
                        }
                    });
                }
            },
            {
                label: 'Subtitile',
                click: () => {
                    electron.dialog.showOpenDialog({
                        properties: ['openFile'],
                        filters: [
                            {name: 'subtitiles', extensions: ['srt', 'vtt']},
                        ]
                    }, (result) => {
                        console.log(result)
                        if (result && mainWindow && result.length > 0) {
                            if (result[0].endsWith('.vtt')) {
                                mainWindow.webContents.send('subtitleSelected', result[0]);
                            } else {
                                srtToVtt(result[0], (err, vttpath) => {
                                    if (!err) {
                                        console.log(vttpath)
                                        mainWindow.webContents.send('subtitleSelected', vttpath);
                                    }
                                });
                            }
                        }
                    });
                }
            }

        ]
    },
    {
        label: 'Tools',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click: function (item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.reload();
                }
            },
            {
                label: 'Toggle Developer Tools',
                accelerator: (function () {
                    if (process.platform == 'darwin')
                        return 'Alt+Command+I';
                    else
                        return 'Ctrl+Shift+I';
                })(),
                click: function (item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.toggleDevTools();
                }
            },
        ]
    },
];


function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 1000, height: 800})

    // and load the index.html of the app.
    mainWindow.loadFile(INDEX_HTML)
    currentLoadFile = INDEX_HTML;
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    var menu = Menu.buildFromTemplate(application_menu);
    Menu.setApplicationMenu(menu);
    ipcMain.on('fileDrop', (event, arg)=>{
        console.log("fileDrop:", arg);
        onVideoFileSeleted(arg);
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
