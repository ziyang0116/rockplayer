
var path = require('path');
var electronInstaller = require('electron-winstaller');

var CURRENT_PATH = path.resolve(__dirname);
var OUT_PATH = path.resolve(CURRENT_PATH, '../out');

var resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: OUT_PATH + '/rockplayer-win32-x64',
    outputDirectory: OUT_PATH,
    authors: 'My App Inc.',
    exe: 'rockplayer.exe'
  });

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));