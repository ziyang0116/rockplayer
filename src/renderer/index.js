import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import './js/StreamPlayTech';
const ipcRenderer = require('electron').ipcRenderer;

function createVideoHtml(source){
    let videoHtml =
    `<video id="my-video" class="video-js vjs-big-play-centered" controls preload="auto" width="1000"
    height="560" data-setup="{}">
    <source src="${source}" type="video/mp4">
    <p class="vjs-no-js">
    To view this video please enable JavaScript, and consider upgrading to a web browser that
    <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
    </p>
    </video>`
    return videoHtml;
}

var holder = document.getElementById('holder');
let videoContainer = document.getElementById("video-container")
let videoHtml = createVideoHtml("http://vjs.zencdn.net/v/oceans.mp4")
videoContainer.innerHTML = videoHtml;

var newSettings = {
    backgroundOpacity: '0',
    edgeStyle: 'dropshadow',
    fontPercent: 1.25,
};

holder.ondragover = function () {
    return false;
};
holder.ondragleave = holder.ondragend = function () {
    return false;
};
holder.ondrop = function (e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    console.log('File you dragged here is', file.path);
    ipcRenderer.send('fileDrop', file.path);
    return false;
};
let vid = document.getElementById("my-video");

let player = videojs(vid);
document.onkeydown = (event) => {
    console.log("onkeypress", event);
    if (event.code === "Space") {
        if (player) {
            if (player.paused()) {
                player.play();
            } else {
                player.pause();
            }
        }
        return false;
    }
}

ipcRenderer.on('fileSelected', function (event, message) {
    console.log('fileSelected:', message)
    let vid = document.getElementById("my-video");

    videojs(vid).dispose();

    videoContainer.innerHTML = createVideoHtml(message.videoSource);
    vid = document.getElementById("my-video");
    if (message.type === 'native') {
        player = videojs(vid);
        player.play();
    } else if (message.type === 'stream') {
        player = videojs(vid, {
            techOrder: ['StreamPlay'],
            StreamPlay: { duration: message.duration }
        }, () => {
            player.play()
        });
    }
    // player.textTrackSettings.setDefaults();
    // player.textTrackSettings.setValues(newSettings);
    // player.textTrackSettings.updateDisplay();

});

ipcRenderer.send("ipcRendererReady", "true");



