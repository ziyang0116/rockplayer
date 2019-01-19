'use strict';

function formatTime(str) {
    if (!str) {
        return -1;
    }
    var arr = str.split(".");
    if (arr.length != 2) {
        return -1;
    }
    var firstArr = arr[0].split(":");
    if (firstArr.length != 3) {
        return -1;
    }
    var second = -1;
    try {
        second = parseInt(firstArr[0]) * 3600 + parseInt(firstArr[1]) * 60 + parseInt(firstArr[2])
            + parseInt(arr[1]) * 0.001;
    } catch (exception) {
    }
    return second;
}

function searchSubtitle(subtitles, index, timeupdate) {
    if (!subtitles || index < 0 || subtitles.length === 0) {
        return null;
    }
    var currentTitle = subtitles[index];
    if (!currentTitle.endTime || timeupdate > currentTitle.endTime) {
        for (var i = index + 1; i < subtitles.length; i++) {
            var title = subtitles[i];
            if (timeupdate < title.beginTime) {
                return null;
            } else if (timeupdate >= title.beginTime && timeupdate <= title.endTime) {
                return {newIndex: i, subtitle: title};
            } else {
                continue;
            }
        }
    }
    return null;
}
function parseVtt(path, callback) {
    var fs = require('fs');
    var subtitles = [];
    fs.readFile(path, 'utf8', function (err, data) {
        if (err) {
            console.log(err);
            if (callback) {
                callback(err);
            }
            return;
        }
        if (data) {
            var arr = data.split("\n");
            var currentTitle = {};
            var currentTitleIndex = 0;
            for (var index in arr) {
                if (index === "0") {
                    continue;
                }
                var line = arr[index];
                if (line.trim().length === 0) {
                    currentTitleIndex = 0;
                    if (currentTitle.title) {
                        subtitles.push(currentTitle);
                    }
                    currentTitle = {};
                    continue;
                }
                switch (currentTitleIndex) {
                    case 0:
                        currentTitle = {};
                        currentTitle.index = line.trim();
                        break;
                    case 1:
                        var timestamp = line.split("-->");
                        if (timestamp.length === 2) {
                            currentTitle.begin = timestamp[0].trim();
                            currentTitle.beginTime = formatTime(currentTitle.begin);
                            currentTitle.end = timestamp[1].trim();
                            currentTitle.endTime = formatTime(currentTitle.end);
                        }
                        break;
                    default:
                        if (currentTitle.title) {
                            currentTitle.title += line.trim();
                        } else {
                            currentTitle.title = line.trim();
                        }
                        break;
                }
                ++currentTitleIndex;
            }
        }
        if (callback) {
            callback(false, subtitles);
        }
    });
}