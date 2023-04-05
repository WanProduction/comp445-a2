
const app = require('express')();
const server = require('http').createServer(app);
const fs = require("fs");
const ffmpeg = require('fluent-ffmpeg');
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost",
    methods: ["GET", "POST"]
  }
})
var counter = 0

io.on("connection", (socket) => {
  console.log("Server socket id", socket.id, "is active")

  socket.emit("hello", "Server sent the following: you are connected to server websocket id " + socket.id);

  socket.on("confirm", (arg) => {
    console.log(arg)
  })

  socket.on("send blob", (payload) => {
    counter += 1
    // console.log("What is payload?", payload)
    console.log("Received blob on server")
    io.emit("received video", "Server sent the following: Blob succesfully received")
    
    // const writeStream = fs.createWriteStream('./video/file-' + counter + '.mp4');
    // //fs.writeFile('./video/video-' + counter + '.mp4', Buffer.from(webmToMp4(fs.readFile(writeStream))));
    // writeStream.write(payload, (err) => {
    //   if (err) throw err;
    //   console.log('Video segment saved successfully!');
    // });

    // writeStream.end();

    fs.writeFile('./video/file-' + counter + '.mp4', payload, (err) => {
      if (err) throw err;
      console.log('Video saved successfully!');
    });
  })

  socket.on("reset counter", (arg) => {
    console.log('Resetting counter')
    counter = arg
  })
})

server.listen(3000, () => console.log("Server is listening on port 3000"))