import videojs from 'video.js';

const Tech = videojs.getComponent('Tech');
const Html5 = Tech.getTech('Html5');

class StreamPlayTech extends Html5 {

    constructor(options, ready) {
        super(options, ready);
        this._actualDuration = options.duration;
        this._startTime = 0;
    }

    duration() {
        return this._actualDuration ? this._actualDuration : 60;
    }

    setCurrentTime(seconds) {
        this._startTime = seconds;
        try {
            var src = "http://127.0.0.1:8888?startTime=" + seconds
            this.setSrc(src);
        } catch (e) {
            // videojs.log.warn('Video is not ready. (Video.js)');
        }
    }

    currentTime() {
        return this._startTime + this.el_.currentTime;
    }
}
if (Tech.getTech('StreamPlay')) {
    videojs.log.warn('Not using videojs-StreamPlay as it appears to already be registered');
    videojs.log.warn('videojs-StreamPlay should only be used with video.js@6 and above');
} else {
    videojs.registerTech('StreamPlay', StreamPlayTech);
}

export default StreamPlayTech;