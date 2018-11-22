'use strict';
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

var videoSupport = function (videoPath) {
    let p = new Promise(function (resolve, reject) {
        let command = ffmpeg()
            .input(videoPath)
            .ffprobe(function (err, data) {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('videoPath metadata:');
                console.dir(data);
                var streams = data.streams;
                var checkResult = {
                    videoCodecSupport: false,
                    audioCodecSupport: false,
                }
                if (streams) {
                    streams.map((value) => {
                        if (value.codec_type == 'video' && value.codec_name == 'h264') {
                            checkResult.videoCodecSupport = true;
                        }
                        if (value.codec_type == 'audio' && value.codec_name == 'aac') {
                            checkResult.audioCodecSupport = true;
                        }
                    })
                }
                resolve(checkResult)
            });
    });
    return p;
}

var transAudioCodec = function (videoPath) {
    let p = new Promise(function (resolve, reject) {
        let videoPathTrans = videoPath + ".mp4";
        let command = ffmpeg()
            .input(videoPath)
            .videoCodec('copy')
            .audioCodec('aac')
            .format('mp4')
            .output(videoPathTrans)
            .on('error', function (err) {
                console.log('An error occurred: ' + err.message);
                reject(err);
            })
            .on('progress', function (progress) {
                console.log('Processing: ' + progress.percent + '% done');
            })
            .on('end', function () {
                console.log('Processing finished !:', videoPathTrans);
                resolve(videoPathTrans);
            })
            .run();
    })
    return p;
}

var createVideoServer = function (videoSourcePath, checkResult) {
    var http = require('http');
    let videoStream = null;
    return http.createServer(function (request, response) {
        console.log("on request");
        let audioCodec = checkResult.audioCodecSupport ? 'copy' : 'aac';
        let command = ffmpeg()
            .input(videoSourcePath)
            .nativeFramerate()
            .videoCodec("libx264")
            .audioCodec(audioCodec)
            .format('flv')
            .outputOptions(
                '-tune zerolatency',
            )
            .on('progress', function (progress) {
                console.log('time: ' + progress.timemark);
                console.log('fps:', + progress.currentFps);
            })
            .on('error', function (err) {
                console.log('An error occurred: ' + err.message);
            })
            .on('end', function () {
                console.log('Processing finished !');
                videoStream = null;
            })
        videoStream = command.pipe();
        videoStream.pipe(response);
    }).listen(8888);
}
export {videoSupport, transAudioCodec, createVideoServer}
