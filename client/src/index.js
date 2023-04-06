// import { io } from "socket.io-client"
// import { io } from "../../node_modules/socket.io-client/build/esm/index"
// import { nanoid } from "nanoid"
// import { io } from "socket.io-client"
// require is not defined
// const io = require('socket.io-client')
// const MP4Box = require('mp4box')
// const socket = io("http://localhost:3000");
// const socket = io.connect("http://localhost:3000")

// So use import
import MP4Box from 'mp4box'
import fs from 'fs'
// Does not work
// Uncaught TypeError: Failed to resolve module specifier "mp4box". Relative references must start with either "/", "./", or "../".
// Tried this
// import MP4Box from '../node_modules/mp4box/dist/mp4box.all'
// Uncaught SyntaxError: The requested module '../node_modules/mp4box/dist/mp4box.all' does not provide an export named 'default'
// Did this for no errors
// import * as MP4Box from 'https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.min.js';
// import * as io from 'https://cdn.socket.io/4.6.0/socket.io.min.js';

////////////////////////////////////////////////////////////////////////
// THIS CODE IS NOT VALID ANYMORE. IT IS USING INDEX.HTML.
////////////////////////////////////////////////////////////////////////

var mp4boxfile = MP4Box.createFile()

var camera_stream = null
var media_recorder = null
var blobs_recorded = []
var counter = 0
var interval
var blob
var url
var videoElement
var videoData
var mp4Writer
var videoEncoder

const startRecordingButton = document.querySelector('button#start-recording')
const stopRecordingButton = document.querySelector('button#stop-recording')
const turnOnCamera = document.querySelector("button#turn-on-camera")
const video = document.querySelector('video')

const constraints = {
    video: {
        width: 1280, height: 720
    },
    audio: true
}

turnOnCamera.addEventListener('click', async function () {
    if (turnOnCamera.textContent === "Turn on camera") {
        console.log('click turn on camera')
        await initCamera(constraints)
    } else {
        stopBothVideoAndAudio(camera_stream)
    }
})

startRecordingButton.addEventListener('click', () => {
    console.log("STARTED RECORDING")
    startRecording(camera_stream)
})

async function initCamera(constraints) {
    turnOnCamera.textContent = "Turn off camera"
    camera_stream = await navigator.mediaDevices.getUserMedia(constraints)
    startRecordingButton.disabled = false
    video.srcObject = camera_stream
}

function stopBothVideoAndAudio(camera_stream) {
    turnOnCamera.textContent = "Turn on camera"
    startRecordingButton.disabled = true
    console.log('click turn off camera');
    camera_stream.getTracks().forEach(function (track) {
        if (track.readyState == 'live') {
            track.stop();
        }
    });
}

async function startRecording(camera_stream) {
    stopRecordingButton.disabled = false
    interval = setInterval(
        () => {
            counter += 1
            console.log('Seconds in the recording', counter)
        },
        1000
    )

    // videoEncoder = new VideoEncoder({
    //     output: (chunk, metadata) => {
    //       mp4Writer.write(chunk, metadata);
    //     },
    //     error: (e) => {
    //       console.error('VideoEncoder error', e);
    //     }
    // });

    // videoEncoder.configure({
    //     codec: 'h264',
    //     width: 640,
    //     height: 480,
    //     framerate: 30
    // });

    // mp4Writer = new MP4Box();

    media_recorder = new MediaRecorder(camera_stream, { mimeType: 'video/webm;codecs=h264' })

    media_recorder.addEventListener('dataavailable', function (event) {
        videoData = event.data;
        // videoEncoder.encode(videoData);

        // const segments = mp4Writer.getSegments();
        // console.log(segments)

        // setInterval(() => {
        //     const segments = mp4Writer.getSegments();
        //     console.log(segments)
        //     for (const segment of segments) {
        //       sendSegmentToServer(segment.buffer);
        //     }
        //     mp4Writer.flush();
        //   }, 3000);

        blobs_recorded.push(event.data)
    })

    media_recorder.addEventListener('stop', function () {
        console.log('The amount of blobs recorded is', blobs_recorded.length)
        clearInterval(interval)
        counter = 0
        blob = new Blob(blobs_recorded, { type: "video/webm" });
        url = URL.createObjectURL(blob);
        videoElement = document.createElement("a");
        document.body.appendChild(videoElement);
        videoElement.style = "display: none";
        videoElement.href = url;
        videoElement.download = 'video.mp4';
        videoElement.click();

        // socket.emit("send video", {url})

        media_recorder = null
        blobs_recorded = []
    })

    media_recorder.start(3000)
}

stopRecordingButton.addEventListener('click', function () {
    //console.log("STOPPED RECORDING")
    stopRecordingButton.disabled = true
    media_recorder.stop()
})

