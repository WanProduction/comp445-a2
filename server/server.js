
const app = require('express')();
const server = require('http').createServer(app);
const { promises: fs } = require("fs");
const webmToMp4 = require("webm-to-mp4");
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

var serverCounter = 0
var server_blobs_recorded = []
var video_index = 1

io.on("connection", (socket) => {
  console.log("Server socket id", socket.id, "is active")

  socket.emit("hello", "Server sent the following: you are connected to server websocket id " + socket.id);

  socket.on("confirm", (arg) => {
    console.log(arg)
  })

  socket.on("send blob", async (payload) => {
    serverCounter += 1
    console.log("Received blob", serverCounter, "on server")
    io.emit("received video", "Server sent the following: Blob succesfully received")
    server_blobs_recorded.push(payload)
  })

  socket.on("check for missing segment", async (client_blobs_recorded) => {
    console.log("Checking if missing any segments")
    if (client_blobs_recorded.length == server_blobs_recorded.length) {
      console.log("Response is TRUE. The lengths are the same")
      socket.emit("return validation", true)
    } else {
      console.log("Response is FALSE. The lengths are not the same")
      socket.emit("return validation", false)
    }
  })

  socket.on("blob array reset", async (empty_array) => {
    server_blobs_recorded = empty_array
  })

  socket.on("reset server counter", async (arg) => { 
    // ***************IMPORTANT***************
    // The reason the Blob URLs you downloaded are not playable is that they represent fragments of 
    // the recorded media, and they need to be concatenated together in order to form a complete and 
    // playable media file. When you download a Blob URL, you are effectively downloading a single 
    // fragment of the recorded media, and it may not be playable on its own.

    console.log('Resetting counter and downloading/converting video... blob length of', server_blobs_recorded.length)
    await fs.writeFile('./video/webm-fullvideo-' + video_index + '.webm', server_blobs_recorded)
    console.log('Webm successfully created!')
    await fs.writeFile('./video/mp4-fullvideo-' + video_index + '.mp4', Buffer.from(webmToMp4(await fs.readFile('./video/webm-fullvideo-' + video_index + '.webm'))))
    console.log('Mp4 successfully created!')
    await fs.unlink('./video/webm-fullvideo-' + video_index + '.webm')
    console.log('Webm successfully deleted!')
    console.log('Recorded # of videos -', video_index)
    console.log('VIDEO TRANSFER COMPLETE!')
    serverCounter = arg
    server_blobs_recorded = []
    video_index++
  })
})

server.listen(3000, () => console.log("Server is listening on port 3000"))
// server.listen(8091, () => console.log("Server is listening on port 8091"))