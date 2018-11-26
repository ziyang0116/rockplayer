'use strict';
const readline = require('readline');
const fs = require('fs');

var srtToVtt = function (srtPath, callback) {
    const rl = readline.createInterface({
        input: fs.createReadStream(srtPath),
        crlfDelay: Infinity
    });
    var lines = "WEBVTT\n\n";
    rl.on('line', (line) => {
        if (line.indexOf("-->") != -1) {
            line = line.split(',').join('.')
        }
        lines += line + "\n";
    }).on('close', () => {
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
export {srtToVtt}
