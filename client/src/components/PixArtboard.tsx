import React from "react";
import { io, Socket } from "socket.io-client";
import throttle from "../functions/throttle"

import "./PixArtBoard.scss"

const Palette = () => {


    return (
        <div className="panel">
            111
        </div>
    )
}

const PixArtBoard = () => {
    interface PixDot {
        r: number;
        g: number;
        b: number;
    }

    const [isLoading, setLoading] = React.useState(true);
    const [pixMatrix, setMatrix] = React.useState<PixDot[][] | undefined>(undefined);
    const [socket, setSocket] = React.useState<Socket | undefined>(undefined);
    const [fullImg, setFullImg] = React.useState(document.createElement("canvas"));

    /** 
     * 每颗像素20px * 20px, 1px 边框
    */
    const size = {x: 128, y: 72};
    const screenX = window.innerWidth;
    const screenY = window.innerHeight;
    const boardX = size.x * 20;
    const boardY = size.y * 20;
    let offsets = {
        x: (screenX - boardX) / 2,
        y: (screenY - boardY) / 2
    }
    let view: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let ctxFull: CanvasRenderingContext2D;
    
    // 初始化socket.io，获取当前图像并监听像素改变事件
    React.useEffect(() => {
        if (socket === undefined) {
            setSocket(io("/"));
        } else {
            socket.on("connect", () => {
                console.log("ws established...");
            })
            socket.on("setImg", (PixDotMat: PixDot[][]) => {
                setMatrix(PixDotMat);
                setLoading(false);
            })
            if (isLoading) {
                socket.emit("query");
            }
        }
    // eslint-disable-next-line
    }, [socket])

    // 获取到像素画之后，进行第一轮绘制
    React.useEffect(() => {
        /**/ if (pixMatrix !== undefined) { /*
        if (true) { //*/
            view = document.getElementById("view") as HTMLCanvasElement;
            ctx = view.getContext("2d") as CanvasRenderingContext2D;
            ctxFull = fullImg.getContext("2d") as CanvasRenderingContext2D;

            view.width = screenX;
            view.height = screenY;
            fullImg.width = boardX;
            fullImg.height = boardY;

            ctx.fillStyle = "rgb(230, 230, 230)";
            ctx.fillRect(0, 0, screenX, screenY);

            /**
             * 自内而外填充像素
             * @param x 像素x轴坐标
             * @param y 像素y轴坐标
             * @param ctx 可视范围context
             */
            const expandFill = (x: number, y: number, ctx: CanvasRenderingContext2D) => {
                let dot: PixDot;
                let fillSize = 2;
                let begin = {
                    x: x * 20 + 10 + (screenX - boardX) / 2,
                    y: y * 20 + 10 + (screenY - boardY) / 2
                }
                const step = () => {
                    if (fillSize <= 18) {
                        ctx.fillStyle = `rgb(${dot.r}, ${dot.g}, ${dot.b})`;
                        ctx.fillRect(begin.x - fillSize / 2 + 1, begin.y - fillSize / 2 + 1, fillSize, fillSize);
                        fillSize += 2;
                        window.requestAnimationFrame(step)
                    }
                }
                if (x >= 0 && x < 128 && y >= 0 && y < 72) {
                    dot = pixMatrix[x][y];
                    window.requestAnimationFrame(step)
                }
            }

            const sleep = (latency: number) => {
                let promise = new Promise(res => {
                    setTimeout(res, latency);
                })
                return promise;
            }

            for (let i = 0; i <= Math.max(size.x / 2, size.y / 2); i++) {
                sleep(i * 10).then(() => {
                    let x = size.x / 2 - i;
                    let y = size.y / 2 - i;
                    for (let j = 0; j < 2 * (i + 1); j++) {
                        expandFill(x + j, y, ctx)
                        expandFill(x, y + j, ctx)
                        expandFill(x + 2 * (i + 1) - j - 1, y + 2 * (i + 1) - 1, ctx)
                        expandFill(x + 2 * (i + 1) - 1, y + 2 * (i + 1) - j - 1, ctx)
                    }
                })
                
            }
            
            ctxFull.fillStyle = "rgb(230, 230, 230)";
            ctxFull.fillRect(0, 0, boardX, boardY);
            for (let i = 0; i < 128; i++) {
                for (let j = 0; j < 72; j++) {
                    let dot = pixMatrix[i][j];
                    ctxFull.fillStyle = `rgb(${dot.r}, ${dot.g}, ${dot.b})`;
                    ctxFull.fillRect(i * 20 + 2, j * 20 + 2, 18, 18);
                }
            }
        }
    // eslint-disable-next-line
    }, [pixMatrix])

    const renderSelect = (position: {x: number, y: number}, prevPos: {x: number, y: number}) => {
        if (pixMatrix !== undefined && ctx) {
            let dot = pixMatrix[prevPos.x][prevPos.y];
            let begin = {
                x: prevPos.x * 20 + offsets.x,
                y: prevPos.y * 20 + offsets.y
            };
            ctx.fillStyle = "rgb(230, 230, 230)";
            ctx.fillRect(begin.x + 1, begin.y + 1, 20, 20);
            ctx.fillStyle = `rgb(${dot.r}, ${dot.g}, ${dot.b})`;
            ctx.fillRect(begin.x + 2, begin.y + 2, 18, 18);
            dot = pixMatrix[position.x][position.y];
            begin = {
                x: position.x * 20 + offsets.x,
                y: position.y * 20 + offsets.y
            };
            ctx.fillStyle = `rgb(${dot.r}, ${dot.g}, ${dot.b})`;
            ctx.fillRect(begin.x + 1, begin.y + 1, 20, 20);
        }
    }

    let prevPos = {x: 0, y: 0};
    const handleHover = (e: MouseEvent) => {
        console.log("exec");
        let position = {
            x: Math.floor((e.offsetX - offsets.x) / 20),
            y: Math.floor((e.offsetY - offsets.y) / 20)
        }

        if (position.x !== prevPos.x || position.y !== prevPos.y) {
            renderSelect(position, prevPos);
            prevPos = position;
        }
    }

    const handleResize = (e: Event) => {
        if (view) {
            offsets = {
                x: (window.innerWidth - boardX) / 2,
                y: (window.innerHeight - boardY) / 2
            }
            view.width = window.innerWidth;
            view.height = window.innerHeight;
            ctx.clearRect(0, 0, view.width, view.height);
            ctx.fillStyle = "rgb(230, 230, 230)";
            ctx.fillRect(0, 0, view.width, view.height);
            ctx.drawImage(fullImg, offsets.x, offsets.y);
        }
    }

    setTimeout(() => {
        window.addEventListener("mousemove", throttle(handleHover, 10));
        window.addEventListener("resize", throttle(handleResize, 100));
    }, 1000)

    return (
        <div className="holder">
            <canvas id="view"></canvas>
            <Palette />
        </div>
    )
};

export default PixArtBoard;