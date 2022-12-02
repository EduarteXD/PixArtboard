import React from "react";
import { io, Socket } from "socket.io-client";
import useThrottle from "../hooks/useThrottle";
import { motion } from "framer-motion";

import placeAudio from "../resources/place.mp3";
import "./PixArtBoard.scss";

const Palette: React.FC<{
	colorActive: number,
	setColor: React.Dispatch<React.SetStateAction<number>>,
    customColor:  React.MutableRefObject<{
        r: number,
        g: number,
        b: number
    }>
}> = ({ colorActive, setColor, customColor }) => {
	const colors = [
		"--palette-yellow",
		"--palette-pink",
		"--palette-red",
		"--palette-blue",
		"--palette-green"
	];

    const colorsRGB = [
        {r: 253, g: 244, b: 61},
        {r: 255, g: 193, b: 203},
        {r: 253, g: 74, b: 74},
        {r: 171, g: 221, b: 238},
        {r: 94, g: 255, b: 94}
    ]

    const useSlider = (min: number, max: number, defaultState: number, label: string, fn: Function) => {
        const [state, setSlide] = React.useState(defaultState);
        const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
          setSlide(parseInt(e.currentTarget.value));
          fn();
        }
      
        const props = { 
          type: 'range',
          min,
          max,
          step: 0.5,
          value: state,
          label: label,
          onChange: handleChange
        }
        return props
    };

    const setCustomColor = () => {
        customColor.current = ({r: sliderR.value, g: sliderG.value, b: sliderB.value});
    };
    const sliderR = useSlider(0, 255, 127, "r", setCustomColor);
    const sliderG = useSlider(0, 255, 127, "g", setCustomColor);
    const sliderB = useSlider(0, 255, 127, "b", setCustomColor);

	return (
		<div className="panel">
			<div className="palette">
				{colors.map((color, index) => (
					<div
                        key={index}
						className={colorActive === index ? "colorPicker active" : "colorPicker"}
						style={{ backgroundColor: `var(${color})` }}
                        onClick={() => {
                            setColor(index);
                            customColor.current = colorsRGB[index];
                        }}
					/>
				))}
                <div style={{
                    height: "90px"
                }}>
                    <div 
                        className={colorActive === -1 ? "colorPicker active" : "colorPicker"}
                        style={{ 
                            backgroundColor: `rgb(${sliderR.value}, ${sliderG.value}, ${sliderB.value})`,
                            display: "inline-block",
                            margin: "25px 0"
                        }}
                        onClick={() => {
                            setColor(-1);
                            setCustomColor();
                        }}
                    />
                    <div className="customColor">
                        <div className="container">
                            <input {...sliderR} className={colorActive === -1 ? "active" : ""} />
                            <input {...sliderG} className={colorActive === -1 ? "active" : ""} />
                            <input {...sliderB} className={colorActive === -1 ? "active" : ""} />
                        </div>
                    </div>
                </div>
			</div>
		</div>
	);
};

const PixArtBoard = () => {
	interface PixDot {
		r: number;
		g: number;
		b: number;
	}

	const [isLoading, setLoading] = React.useState(true);
	const [pixMatrix, setMatrix] = React.useState<PixDot[][] | undefined>(
		undefined
	);
	const [socket, setSocket] = React.useState<Socket | undefined>(undefined);
	const [colorActive, setColor] = React.useState<number>(0);
    const customColor = React.useRef({r: 253, g: 244, b: 61});

	/**
	 * 每颗像素20px * 20px, 1px 边框
	 */
	const size = { x: 128, y: 72 };
	const boardX = size.x * 20;
	const boardY = size.y * 20;
	const viewMeta = React.useRef({
		x: 0,
		y: 0,
		scale: 1
	});
	const view = React.useRef<HTMLCanvasElement>(null);
	const ctx = view.current?.getContext("2d") as CanvasRenderingContext2D;
	const fullImg = React.useRef(document.createElement("canvas")).current;
	let ctxFull = fullImg.getContext("2d") as CanvasRenderingContext2D;

	// 初始化socket.io，获取当前图像并监听像素改变事件
	React.useEffect(() => {
		if (socket === undefined) {
			setSocket(io("/"));
		} else {
			socket.on("connect", () => {
				console.log("ws established...");
			});
			socket.on("setImg", (PixDotMat: PixDot[][]) => {
				setMatrix(PixDotMat);
                setLoading(false);
			});
			if (isLoading) {
				socket.emit("query");
			}
		}
		// eslint-disable-next-line
	}, [socket]);

	// 获取到像素画之后，进行第一轮绘制
	React.useEffect(() => {
		/**/ if (pixMatrix !== undefined && view.current) {
			/*
        if (true) { //*/
			view.current.width = window.innerWidth;
			view.current.height = window.innerHeight;
			fullImg.width = boardX * 2;
			fullImg.height = boardY * 2;

			ctx.fillStyle = "rgb(255, 255, 255)";
			ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

			/**
			 * 自内而外填充像素
			 * @param x 像素x轴坐标
			 * @param y 像素y轴坐标
			 * @param ctx 可视范围context
			 */
			const expandFill = (
				x: number,
				y: number,
				ctx: CanvasRenderingContext2D
			) => {
				let dot: PixDot;
				let fillSize = 2 * viewMeta.current.scale;
				let begin = {
					x: x * 20 * viewMeta.current.scale + 10 * viewMeta.current.scale + (window.innerWidth - boardX * viewMeta.current.scale) / 2,
					y: y * 20 * viewMeta.current.scale + 10 * viewMeta.current.scale + (window.innerHeight - boardY * viewMeta.current.scale) / 2,
				};
				viewMeta.current.x = (window.innerWidth - boardX * viewMeta.current.scale) / 2;
				viewMeta.current.y = (window.innerHeight - boardY * viewMeta.current.scale) / 2;
				const step = () => {
					if (fillSize <= 18 * viewMeta.current.scale) {
						ctx.fillStyle = `rgb(${dot.r}, ${dot.g}, ${dot.b})`;
						ctx.fillRect(
							begin.x - fillSize / 2 + 1 * viewMeta.current.scale,
							begin.y - fillSize / 2 + 1 * viewMeta.current.scale,
							fillSize,
							fillSize
						);
						fillSize += 2 * viewMeta.current.scale;
						window.requestAnimationFrame(step);
					}
				};
				if (x >= 0 && x < 128 && y >= 0 && y < 72) {
					dot = pixMatrix[x][y];
					window.requestAnimationFrame(step);
				}
			};

			const sleep = (latency: number) => {
				let promise = new Promise((res) => {
					setTimeout(res, latency);
				});
				return promise;
			};

			for (let i = 0; i <= Math.max(size.x / 2, size.y / 2); i++) {
				sleep(i * 10).then(() => {
					let x = size.x / 2 - i;
					let y = size.y / 2 - i;
					for (let j = 0; j < 2 * (i + 1); j++) {
						expandFill(x + j, y, ctx);
						expandFill(x, y + j, ctx);
						expandFill(x + 2 * (i + 1) - j - 1, y + 2 * (i + 1) - 1, ctx);
						expandFill(x + 2 * (i + 1) - 1, y + 2 * (i + 1) - j - 1, ctx);
					}
				});
			}

			ctxFull.fillStyle = "rgb(255, 255, 255)";
			ctxFull.fillRect(0, 0, boardX * 2, boardY * 2);
			for (let i = 0; i < 128; i++) {
				for (let j = 0; j < 72; j++) {
					let dot = pixMatrix[i][j];
					ctxFull.fillStyle = `rgb(${dot.r}, ${dot.g}, ${dot.b})`;
					ctxFull.fillRect(i * 40 + 4, j * 40 + 4, 36, 36);
				}
			}
		}
		// eslint-disable-next-line
	}, [pixMatrix]);

	const renderSelect = (
		position: { x: number; y: number },
		prevPos: { x: number; y: number }
	) => {
		if (pixMatrix !== undefined && ctx) {
			let dot = pixMatrix[prevPos.x][prevPos.y];
			let begin = {
				x: prevPos.x * 20 * viewMeta.current.scale + viewMeta.current.x,
				y: prevPos.y * 20 * viewMeta.current.scale + viewMeta.current.y,
			};
			ctx.fillStyle = "rgb(255, 255, 255)";
			ctx.fillRect(begin.x, begin.y, 22 * viewMeta.current.scale, 22 * viewMeta.current.scale);
			ctx.fillStyle = `rgb(${dot.r}, ${dot.g}, ${dot.b})`;
			ctx.fillRect(begin.x + 2 * viewMeta.current.scale, begin.y + 2 * viewMeta.current.scale, 20 * viewMeta.current.scale - 2 * viewMeta.current.scale, 20 * viewMeta.current.scale - 2 * viewMeta.current.scale);
			begin = {
				x: position.x * 20 * viewMeta.current.scale + viewMeta.current.x,
				y: position.y * 20 * viewMeta.current.scale + viewMeta.current.y,
			};
            ctx.fillStyle = `rgb(${customColor.current.r}, ${customColor.current.g}, ${customColor.current.b})`;
			ctx.fillRect(begin.x + 1 * viewMeta.current.scale, begin.y + 1 * viewMeta.current.scale, 20 * viewMeta.current.scale, 20 * viewMeta.current.scale);
		}
	};

	let prevPos = { x: 0, y: 0 };
	const handleHover = (e: MouseEvent) => {
		let position = {
			x: Math.floor((e.offsetX - viewMeta.current.x) / (20 * viewMeta.current.scale)),
			y: Math.floor((e.offsetY - viewMeta.current.y) / (20 * viewMeta.current.scale)),
		};

		if (position.x !== prevPos.x || position.y !== prevPos.y) {
			if (position.x >= 0 && position.x < size.x && position.y >=0 && position.y < size.y) {
				renderSelect(position, prevPos);
				prevPos = position;
			} else {
				if (pixMatrix) {
					let dot = pixMatrix[prevPos.x][prevPos.y];
					let begin = {
						x: prevPos.x * 20 * viewMeta.current.scale + viewMeta.current.x,
						y: prevPos.y * 20 * viewMeta.current.scale + viewMeta.current.y,
					};
					ctx.fillStyle = "rgb(255, 255, 255)";
					ctx.fillRect(begin.x, begin.y, 22 * viewMeta.current.scale, 22 * viewMeta.current.scale);
					ctx.fillStyle = `rgb(${dot.r}, ${dot.g}, ${dot.b})`;
					ctx.fillRect(begin.x + 2 * viewMeta.current.scale, begin.y + 2 * viewMeta.current.scale, 20 * viewMeta.current.scale - 2 * viewMeta.current.scale, 20 * viewMeta.current.scale - 2 * viewMeta.current.scale);
					prevPos = { x: 0, y: 0 };
				}
			}
		}
	};

    const handleMutate = (e: MouseEvent) => {
        if (pixMatrix) {
            let position = {
                x: Math.floor((e.offsetX - viewMeta.current.x) / (20 * viewMeta.current.scale)),
                y: Math.floor((e.offsetY - viewMeta.current.y) / (20 * viewMeta.current.scale)),
            };
			let audio = new Audio(placeAudio);
			if (socket && position.x >= 0 && position.x < size.x && position.y >= 0 && position.y < size.y) {
				socket.emit("mutate", {
					x: position.x,
					y: position.y,
					pixDot: {
						r: customColor.current.r,
						g: customColor.current.g,
						b: customColor.current.b
					}
				})
				audio.play();
				pixMatrix[position.x][position.y] = {
					r: customColor.current.r,
					g: customColor.current.g,
					b: customColor.current.b
				}
				ctxFull.fillStyle = `rgb(${customColor.current.r}, ${customColor.current.g}, ${customColor.current.b})`;
				ctxFull.fillRect(position.x * 40 + 4, position.y * 40 + 4, 36, 36);
			}
        }
	};

	const handleResize = (e: Event) => {
		if (view.current && ctx) {
			viewMeta.current = {
				x: viewMeta.current.x,
				y: viewMeta.current.y,
				scale: viewMeta.current.scale
			};
			view.current.width = window.innerWidth;
			view.current.height = window.innerHeight;
			ctx.clearRect(0, 0, view.current.width, view.current.height);
			ctx.fillStyle = "rgb(255, 255, 255)";
			ctx.fillRect(0, 0, view.current.width, view.current.height);
			ctx.drawImage(fullImg, viewMeta.current.x, viewMeta.current.y, boardX * viewMeta.current.scale, boardY * viewMeta.current.scale);
		}
	};

    let timer: number | null = null;
    const handleMove = (type: "enter" | "leave", direction: string) => {
        if (type === "enter") {
            if (timer !== null) {
                window.cancelAnimationFrame(timer);
                timer = null;
            }

            const performMove = () => {
                switch(direction) {
                    case "left":
						if (viewMeta.current.x + 5 * viewMeta.current.scale < 60) {
							viewMeta.current.x += 5 * viewMeta.current.scale;
						}
                        break;
                    case "right":
						if (window.innerWidth - (viewMeta.current.x + 5 * viewMeta.current.scale + boardX * viewMeta.current.scale) < 60) {
                        	viewMeta.current.x -= 5 * viewMeta.current.scale;
						}
                        break;
                    case "top":
						if (viewMeta.current.y + 5 * viewMeta.current.scale < 60) {
							viewMeta.current.y += 5 * viewMeta.current.scale;
						}
                        break;
                    case "bottom":
						if (window.innerHeight - (viewMeta.current.y + 5 * viewMeta.current.scale + boardY * viewMeta.current.scale) < 60) {
                        	viewMeta.current.y -= 5 * viewMeta.current.scale;
						}
                        break;
                }
                if (view.current) {
                    ctx.clearRect(0, 0, view.current.width, view.current.height);
                    ctx.fillStyle = "rgb(255, 255, 255)";
                    ctx.fillRect(0, 0, view.current.width, view.current.height);
                    ctx.drawImage(fullImg, viewMeta.current.x, viewMeta.current.y, boardX * viewMeta.current.scale, boardY * viewMeta.current.scale);
                }
                timer = window.requestAnimationFrame(performMove);
            }

            timer = window.requestAnimationFrame(performMove);
        } else {
            if (timer !== null) {
                window.cancelAnimationFrame(timer);
                timer = null;
            }
        }
    };

	const handleZoom = (e: WheelEvent) => {
		let delta = {
			x: boardX * 0.01 * viewMeta.current.scale,
			y: boardY * 0.01 * viewMeta.current.scale
		};
		if (e.deltaY > 0) {
			if (viewMeta.current.scale > 0.5) {
				viewMeta.current.x += ((e.offsetX - viewMeta.current.x) / (boardX * viewMeta.current.scale)) * delta.x;
				viewMeta.current.y += ((e.offsetY - viewMeta.current.y) / (boardY * viewMeta.current.scale)) * delta.y;
				viewMeta.current.scale *= 0.99;
				if (boardX * viewMeta.current.scale < window.innerWidth - 120) {
					viewMeta.current.x = (window.innerWidth - boardX * viewMeta.current.scale) / 2;
				}
				if (boardY * viewMeta.current.scale < window.innerHeight - 120) {
					viewMeta.current.y = (window.innerHeight - boardY * viewMeta.current.scale) / 2;
				}
			}
		} else {
			if (viewMeta.current.scale < 2) {
				viewMeta.current.x -= ((e.offsetX - viewMeta.current.x) / (boardX * viewMeta.current.scale)) * delta.x;
				viewMeta.current.y -= ((e.offsetY - viewMeta.current.y) / (boardY * viewMeta.current.scale)) * delta.y;
				viewMeta.current.scale *= 1.01;
			}
		}
		if (view.current && ctx) {
			ctx.clearRect(0, 0, view.current.width, view.current.height);
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillRect(0, 0, view.current.width, view.current.height);
            ctx.drawImage(fullImg, viewMeta.current.x, viewMeta.current.y, boardX * viewMeta.current.scale, boardY * viewMeta.current.scale);
		}
	}

	/*
	const handleHover_t = useThrottle(handleHover, -1, [pixMatrix, viewMeta]);
	const handleMutate_t = useThrottle(handleMutate);
	const handleZoom_t = useThrottle(handleZoom);
	const handleResize_t = useThrottle(handleResize);
	*/

    setTimeout(() => {
        if (view.current) {
            view.current.addEventListener("mousemove", handleHover);
            view.current.addEventListener("mousedown", handleMutate);
			view.current.addEventListener("wheel", handleZoom);
        }
        window.addEventListener("resize", handleResize);
    }, 1000);

	return (
		<motion.div 
			className="placerHolder"
			initial={{
                opacity: 0,
                transform: 'translate(-50%, 0)'
            }}
            animate={{
                opacity: 1,
                transform: 'translate(0, 0)'
            }}
            exit={{
                opacity: 0,
                transform: 'translate(-50%, 0)'
            }}
		>
			<canvas id="view" ref={view}>Not supported</canvas>
            {
                ["left", "right", "top", "bottom"].map((direction, index) => (
                    <div className={`naviPad ${direction}`} key={index}
                        onMouseEnter={() => handleMove("enter", direction)} 
                        onMouseLeave={() => handleMove("leave", direction)}
                    />
                ))
            }
            <Palette 
                colorActive={colorActive} 
                setColor={setColor}
                customColor={customColor}
            />
		</motion.div>
	);
};

export default PixArtBoard;
