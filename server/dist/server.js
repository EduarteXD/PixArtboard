"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const fs = __importStar(require("fs"));
const http = __importStar(require("http"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const server = http.createServer(app);
let img;
fs.readFile("./testImg.json", (err, buff) => {
    let dist = buff.toString();
    img = JSON.parse(dist);
});
const io = new socket_io_1.Server(server);
io.on("connection", socket => {
    socket.on("query", () => {
        socket.emit("setImg", img);
    });
    socket.on("mutate", data => {
        img[data.x][data.y] = {
            r: data.pixDot.r,
            g: data.pixDot.g,
            b: data.pixDot.b
        };
        socket.emit("mutateStat", "success");
    });
});
app.get("/artwork", (req, res) => {
    res.json(img);
});
server.listen(1333, () => {
    console.log("started");
});
