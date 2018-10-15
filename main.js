// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu} = require('electron')
const electron = require('electron');
const ipcMain = require('electron').ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let application_menu = [
    {
        label: 'menu1',
        submenu: [
            {
                label: 'Open',
                accelerator: 'CmdOrCtrl+O',
                click: () => {
                    electron.dialog.showOpenDialog({
                        properties: ['openFile'],
                        filters: [
                            {name: 'Movies', extensions: ['mkv', 'avi', 'mp4', 'rmvb']},
                        ]
                    }, (result) => {
                        console.log(result)
                        if (result && mainWindow && result.length > 0) {
                            mainWindow.webContents.send('fileSelected', result[0]);
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
                            if(result[0].endsWith('.vtt')){
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
        label: 'View',
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
    mainWindow.loadFile('index.html')
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

function srtToVtt(srtPath, callback) {
    const readline = require('readline');
    const fs = require('fs');

    const rl = readline.createInterface({
        input: fs.createReadStream(srtPath),
        crlfDelay: Infinity
    });
    var lines = "WEBVTT\n\n";
    rl.on('line', (line) => {
        // console.log(`Line from file: ${line}`);
        if (line.indexOf("-->") != -1) {
            line = line.split(',').join('.')
        }
        lines += line + "\n";
    }).on('close', () => {
        console.log("close");
        console.log(lines);
        var vttPath = srtPath + ".vtt";
        fs.writeFile(vttPath, lines, function (err) {
            if (err) {
                if (callback) {
                    callback(err);
                }
            } else {
                callback(false, vttPath)
            }
        });

    });
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
