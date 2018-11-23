'use strict';
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);
const http = require('http');
export default class VideoServer{

    constructor(props){
        this._videoServer;
        this._videoSourceInfo;
        this._ffmpegCommand;
    }

    set videoSourceInfo(info){
        this._videoSourceInfo = info;
    }

    get videoSourceInfo(){
        return this._videoSourceInfo;
    }
    createServer(){
        if(!this._videoServer && this.videoSourceInfo){
            let videoStream = null;
            this._videoServer = http.createServer((request, response) => {
                console.log("on request");
                let audioCodec = this.videoSourceInfo.checkResult.audioCodecSupport ? 'copy' : 'aac';
                if(this._ffmpegCommand){
                    this._ffmpegCommand.kill();
                }
                this._ffmpegCommand = ffmpeg()
                    .input(this.videoSourceInfo.videoSourcePath)
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
                    })
                let videoStream = this._ffmpegCommand.pipe();
                videoStream.pipe(response);
            }).listen(8888);
        }
    }
}
