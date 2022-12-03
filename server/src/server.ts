import { Server } from "socket.io";
import * as fs from "fs";
import * as http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

interface PixDot {
    r: number,
    g: number,
    b: number
}

let img: PixDot[][];

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

app.get("/artwork", (req, res) => {
    res.json(img);
})

server.listen(1333, () => {
    console.log("started")
})