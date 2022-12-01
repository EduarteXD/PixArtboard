import React from "react";
import {
    motion,
    AnimatePresence
} from "framer-motion";
import useDebounce from "../hooks/useDebounce";
import smoothscroll from "../functions/smoothscroll";

import "./Introduction.scss";

import overviewBg from "../resources/overviewBg.jpg";
import banner1 from "../resources/banner1.jpg"
import banner2 from "../resources/banner2.jpg"
import banner3 from "../resources/banner3.jpg"
import banner4 from "../resources/banner4.jpg"
import banner5 from "../resources/banner5.jpg"

import bgMusic from "../resources/bgmusic.mp3";

const Introduction = () => {
    const screens = [
        "overview",
        "introduction",
        "artworks",
        "soundtracks"
    ]
    // const inScreen = React.useRef(0);
    const [inScreen, setScreen] = React.useState(0);
    const [music, setMusic] = React.useState<HTMLAudioElement | null>(null);
    const isPlaying = React.useRef(false);
    const osc = React.useRef<HTMLCanvasElement>(null);

    const refreshOsc = (analyser: AnalyserNode) => {
        analyser.fftSize = 32;
        let bufferLen = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLen);
        analyser.getByteTimeDomainData(dataArray);
        if (osc.current) {
            let ctx = osc.current.getContext("2d");
            if (ctx) {
                ctx.fillStyle = "rgb(254, 249, 227)";
                ctx.fillRect(0, 0, osc.current.width, osc.current.height);
                ctx.fillStyle = "rgb(255, 117, 158)";
                for (let i = 0; i < 16; i ++) {
                    let volOffset = Math.abs(dataArray[i] - 128) * 1.5;
                    /**
                     * 1px 边框 8px宽度 最大64px高度
                     */
                    ctx.fillRect(i * 10 + 1, 50 - volOffset / 2, 6, volOffset);
                }
            }
        }
        if (isPlaying.current) {
            setTimeout(() => {
                refreshOsc(analyser)
            }, 48); 
        } else {
            document.getElementById("player")?.setAttribute("class", "player")
        }
    }

    const tryPlay = () => {
        if (music !== null && !isPlaying.current) {
            music
                .play()
                .then(() => {
                    isPlaying.current = true;
                    let audioCtx = new window.AudioContext();
                    let analyser = audioCtx.createAnalyser();
                    let source = audioCtx.createMediaElementSource(music as HTMLAudioElement);
                    source.connect(analyser);
                    analyser.connect(audioCtx.destination);
                    window.requestAnimationFrame(() => refreshOsc(analyser));
                    music.onended = () => {
                        isPlaying.current = false
                    };
                    document.getElementById("player")?.setAttribute("class", "player enabled")
                })
                .catch(() => window.requestAnimationFrame(tryPlay))
        }
    }

    React.useEffect(() => {
        if (music === null) {
            setMusic(new Audio(bgMusic));
        } else {
            window.requestAnimationFrame(tryPlay);
        }
    }, [music])

    const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
        let naviTo = inScreen;
        if (e.deltaY > 0) {
            if (inScreen + 1 < screens.length) {
                naviTo += 1;
                setScreen(naviTo);
            }
        } else {
            if (inScreen > 0) {
                naviTo -= 1;
                setScreen(naviTo);
            }
        }
        let target = document.getElementById(screens[naviTo]);
        if (target) {
            smoothscroll(target.offsetTop, 60, 300);
        }
    }

    return (
        <motion.div
            className="holder"
            initial={{
                opacity: 0
            }}
            animate={{
                opacity: 1
            }}
            exit={{
                opacity: 0
            }}
            onWheel={useDebounce(handleScroll, 100)}
        >
            <div id="overview" className={inScreen === 0 ? "fullScreen overview active" : "fullScreen overview"}>
                <img src={overviewBg} className="background" />
                <div className="tip">
                    向下滑动，发现更多精彩
                    <div className="arrowDown">&#xf078;</div>
                </div>
            </div>
            <div id="introduction" className="fullScreen introduction">
                <img className="banner left b1" src={banner1} />
                <img className="banner left b2" src={banner2} />
                <img className="banner left b3" src={banner3} />
                <img className="banner left b4" src={banner4} />
                <img className="banner left b5" src={banner5} />
                <div className="title introduction">
                    <div className="titleText" data-title="introduction">简介</div>
                </div>
            </div>
            <div id="artworks" className="fullScreen artworks">

            </div>
            <div id="soundtracks" className="fullScreen soundtracks">

            </div>
            <div className="player" id="player" >
                <div className="name">
                    <div className="innerText">
                        ギターと孤独と蒼い惑星 - ぼっち・ざ・ろっく！
                    </div>
                </div>
                <canvas ref={osc} width="160" height="100">Not supported</canvas>
            </div>
        </motion.div>
    )
};

export default Introduction;