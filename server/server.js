const { Server } = require("socket.io");
const fs = require("fs");
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);

let img;

fs.readFile("./testImg.json", (err, buff) => {
    let dist = buff.toString();
    img = JSON.parse(dist);
})

const io = new Server(server);

io.on("connection", socket => {
    socket.on("query", () => {
        socket.emit("setImg", img);
    })

    socket.on("mutate", data => {
        img[data.x][data.y] = {
            r: data.pixDot.r,
            g: data.pixDot.g,
            b: data.pixDot.b
        };
        socket.emit("mutateStat", "success");
    })
})

server.listen(1333, () => {
    console.log("started")
})