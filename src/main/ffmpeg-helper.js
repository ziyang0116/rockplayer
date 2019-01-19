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
                var streams = data.streams;
                var checkResult = {
                    videoCodecSupport: false,
                    audioCodecSupport: false,
                    duration: data.format.duration
                }
                if (streams) {
                    streams.map((value) => {
                        // mp4, webm, ogg
                        if (value.codec_type == 'video' && (value.codec_name == 'h264' || 
                        value.codec_name == 'vp8' || value.codec_name == 'theora')) {
                            checkResult.videoCodecSupport = true;
                        }
                        if (value.codec_type == 'audio' && (value.codec_name == 'aac' || 
                        value.codec_name == 'vorbis')) {
                            checkResult.audioCodecSupport = true;
                        }
                    })
                }
                resolve(checkResult)
            });
    });
    return p;
}
export {videoSupport}
