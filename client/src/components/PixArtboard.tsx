import React from 'react';
import { io, Socket } from "socket.io-client";

import "./PixArtBoard.scss"

const PixArtBoard = () => {
    interface PixDot {
        r: number;
        g: number;
        b: number;
    }
    /** 
     * 每颗像素20px * 20px, 1px 边框
    */
    const size = {x: 128, y: 72};

    const [isLoading, setLoading] = React.useState(true);
    const [matrix, setMatrix] = React.useState<PixDot[][] | undefined>(undefined);
    const [socket, setSocket] = React.useState<Socket | undefined>(undefined);
    
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
            if (!isLoading) {
                socket.emit("query");
            }
        }
    // eslint-disable-next-line
    }, [socket])

    // 获取到像素画之后，进行第一轮绘制
    React.useEffect(() => {
        /**/ if (matrix !== undefined) { /*
        if (true) { //*/
            let screenX = window.innerWidth;
            let screenY = window.innerHeight;
            let boardX = size.x * 20;
            let boardY = size.y * 20;
            let board = document.getElementById("board") as HTMLCanvasElement;

            board.width = screenX;
            board.height = screenY;
            let ctx = board.getContext("2d") as CanvasRenderingContext2D;
            ctx.fillStyle = "rgb(230, 230, 230)";
            ctx.fillRect(0, 0, boardX, boardY);

            /**
             * 自内而外填充像素
             * @param x 像素x轴坐标
             * @param y 像素y轴坐标
             * @dot 像素点信息
             */
            const expandFill = (x: number, y: number, ctx: CanvasRenderingContext2D) => {
                let dot = matrix[x][y];
                let fillSize = 2;
                let begin = {
                    x: x * 20 + 10 + (screenX - boardX) / 2,
                    y: y * 20 + 10 + (screenY - boardY) / 2
                }
                const step = (timestamp: number) => {
                    if (fillSize <= 18) {
                        ctx.fillStyle = `rgb(${dot.r}, ${dot.g}, ${dot.b})`;
                        ctx.fillRect(begin.x - fillSize / 2 + 1, begin.y - fillSize / 2 + 1, fillSize, fillSize);
                        fillSize += 2;
                        window.requestAnimationFrame(step)
                    }
                }
                if (x >= 0 && x < 128 && y >= 0 && y < 72) {
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
        }
    // eslint-disable-next-line
    }, [matrix])

    return <canvas id="board"></canvas>
};

export default PixArtBoard;