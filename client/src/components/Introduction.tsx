import React from "react";
import useDebounce from "../hooks/useDebounce";
import smoothscroll from "../functions/smoothscroll";

import "./Introduction.scss";

import overviewBg from "../resources/overviewBg.jpg";
import cover1 from "../resources/cover1.jpg"
import cover2 from "../resources/cover2.jpg"
import cover3 from "../resources/cover3.jpg"
import cover4 from "../resources/cover4.jpg"
import cover5 from "../resources/cover5.jpg"
import artwork1 from "../resources/artwork1.jpg"
import artwork2 from "../resources/artwork2.jpg"
import artwork3 from "../resources/artwork3.jpg"
import artwork4 from "../resources/artwork4.jpg"
import artwork5 from "../resources/artwork5.jpg"
import bocchiFrame1 from "../resources/state1.png"
import bocchiFrame2 from "../resources/state2.png"

import bgMusic from "../resources/bgmusic.mp3";
import PixArtBoard from "./PixArtboard";

const Introduction = () => {
    interface PixDot {
		r: number;
		g: number;
		b: number;
	}
    const screens = [
        "overview",
        "introduction",
        "artworks",
        "place"
    ]
    const [inScreen, setScreen] = React.useState(0);
    const [music, setMusic] = React.useState<HTMLAudioElement | undefined>(undefined);
    const [kickout, setKickout] = React.useState<Function | undefined>(undefined);
    const [pixMatrix, setMatrix] = React.useState<PixDot[][] | undefined>(undefined);
    const [drawerActive, setDrawerActive] = React.useState(false);
    const isPlaying = React.useRef(false);
    const pixArt = React.useRef<HTMLCanvasElement>(null);
    const osc = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        if (pixMatrix === undefined) {
            fetch(`${process.env.REACT_APP_SERVER_HOST}/artwork`)
                .then(response => response.json())
                .then(data => {
                    setMatrix(data);
                })
                .catch(err => {
                    console.warn(err);
                })
        } else {
            if (pixArt.current) {
                let ctx = pixArt.current.getContext("2d");
                if (ctx) {
                    for (let i = 0; i < 128; i++) {
                        for (let j = 0 ; j < 72; j++) {
                            ctx.fillStyle = `rgb(${pixMatrix[i][j].r}, ${pixMatrix[i][j].g}, ${pixMatrix[i][j].b})`
                            ctx.fillRect(i * 20, j * 20, 20, 20);
                        }
                    }
                }
            }
        }
    }, [pixMatrix])

    const refreshOsc = (analyser: AnalyserNode) => {
        analyser.fftSize = 32;
        let bufferLen = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLen);
        analyser.getByteTimeDomainData(dataArray);
        if (osc.current) {
            let ctx = osc.current.getContext("2d");
            if (ctx) {
                ctx.fillStyle = "rgb(254, 249, 227)";
                ctx.fillRect(100, 0, 160, 100);
                ctx.fillStyle = "rgb(255, 117, 158)";
                for (let i = 0; i < 16; i ++) {
                    let volOffset = Math.abs(dataArray[i] - 128) * 1.2;
                    /**
                     * 1px 边框 8px宽度 最大64px高度
                     */
                    ctx.fillRect(i * 10 + 1 + 100, 50 - volOffset / 2, 6, volOffset);
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
    
    const drawBocchi = () => {
        let lock = 2;
        let interval: NodeJS.Timeout;
        const frames = [new Image(), new Image()];
        const handleImgLoad = () => {
            lock--;
            if (lock === 0) {
                let currentFrame = 0;
                interval = setInterval(() => {
                    if (osc.current) {
                        let ctx = osc.current.getContext("2d");
                        if (ctx) {
                            ctx.fillStyle = "rgb(254, 249, 227)";
                            ctx.fillRect(0, 0, 100, 100);
                            ctx.drawImage(frames[currentFrame], 5, 0, 80, 80);
                            currentFrame = 1 - currentFrame;
                        }
                    }
                }, 144);
            }
        }
        frames[0].src = bocchiFrame1;
        frames[1].src = bocchiFrame2;
        frames[0].onload = handleImgLoad;
        frames[1].onload = handleImgLoad;

        return () => {
            clearInterval(interval);
        }
    }

    const tryPlay = () => {
        if (music !== undefined && !isPlaying.current) {
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
                    setKickout(drawBocchi());
                    music.onended = () => {
                        isPlaying.current = false;
                        if (kickout) kickout();
                    };
                    document.getElementById("player")?.setAttribute("class", "player enabled")
                })
                .catch(() => window.requestAnimationFrame(tryPlay))
        }
    }

    React.useEffect(() => {
        if (music === undefined) {
            setMusic(new Audio(bgMusic));
        } else {
            window.requestAnimationFrame(tryPlay);
        }
        // eslint-disable-next-line
    }, [music])

    const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
        if (drawerActive) return;
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
            smoothscroll(target.offsetTop, 60, 180);
        }
    }

    const handleExternalLinkClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        let target = e.target as HTMLDivElement;
        let link = target.getAttribute("data-link");
        window.open(link as string);
    }

    return (
        <div
            className="holder"
            onWheel={useDebounce(handleScroll, 100, [inScreen, drawerActive])}
        >
            <div id="overview" className={inScreen === 0 ? "fullScreen overview active" : "fullScreen overview"}>
                <img src={overviewBg} className="background" alt="Kessoku Band" />
                <div className="tip">
                    向下滑动，发现更多精彩
                    <div className="arrowDown">&#xf078;</div>
                </div>
            </div>
            <div id="introduction" className={inScreen === 1 ? "fullScreen introduction active" : "fullScreen introduction"}>
                <img className="cover left c1" src={cover1} alt="cover of the vol.1" />
                <img className="cover left c2" src={cover2} alt="cover of the vol.2" />
                <img className="cover left c3" src={cover3} alt="cover of the vol.3" />
                <img className="cover left c4" src={cover4} alt="cover of the vol.4" />
                <img className="cover left c5" src={cover5} alt="cover of the vol.5" />
                <div className="title introduction">
                    <div className="titleText" data-title="introduction">简介</div>
                </div>
                <div className="summary">
                    <div 
                        className="summaryText" 
                        data-link="https://mzh.moegirl.org.cn/zh-hans/%E5%AD%A4%E7%8B%AC%E6%91%87%E6%BB%9A%EF%BC%81"
                        onClick={handleExternalLinkClick}
                    >
                        <p>《孤独摇滚！》（日语：ぼっち・ざ・ろっく!；英语：Bocchi the rock）是日本漫画家はまじあき创作的漫画作品，并有动画等衍生作品。</p>
                        <h3>作品简介</h3>
                        <p>作为网络吉他手“Guitar Hero”而广受好评的后藤独，在现实中却是个什么都不会的沟通障碍者。独有着组建乐队的梦想，但因为不敢向人主动搭话而一直没有成功，直到一天在公园中被伊地知虹夏发现并邀请进入缺少吉他手的“结束乐队”。可是，完全没有和他人合作经历的独，在人前完全发挥不出原本的实力。为了努力克服沟通障碍，独与“结束乐队”的成员们一同开始努力……</p>
                    </div>
                </div>
            </div>
            <div id="artworks" className={inScreen === 2 ? "fullScreen artworks active" : "fullScreen artworks"}>
                <img className="artwork a1" src={artwork1} alt="artwork 1" data-link="https://www.pixiv.net/artworks/103170104" onClick={handleExternalLinkClick} />
                <img className="artwork a2" src={artwork2} alt="artwork 2" data-link="https://www.pixiv.net/artworks/103273483" onClick={handleExternalLinkClick} />
                <img className="artwork a3" src={artwork3} alt="artwork 3" data-link="https://www.pixiv.net/artworks/103272094" onClick={handleExternalLinkClick} />
                <img className="artwork a4" src={artwork4} alt="artwork 4" data-link="https://www.pixiv.net/artworks/103262427" onClick={handleExternalLinkClick} />
                <img className="artwork a5" src={artwork5} alt="artwork 5" data-link="https://www.pixiv.net/artworks/103225426" onClick={handleExternalLinkClick} />
                <div className="title artworks">
                    <div className="titleText" data-title="artworks">插画</div>
                </div>
            </div>
            <div id="place" className="fullScreen place">
                {
                    drawerActive && <PixArtBoard setDrawerActive={setDrawerActive} />
                }
                <canvas className={drawerActive ? "drawer hide" : "drawer"} ref={pixArt} width="2560" height="1440" onClick={() => {setDrawerActive(true)}}>Not supported</canvas>
                <div className="tip">
                    点击进入画板
                </div>
                <div className={drawerActive ? "title place inactive" : "title place"}>
                    <div className="titleText" data-title="place">画板</div>
                </div>
            </div>
            <div className="player" id="player" >
                <div className="name">
                    <div className="innerText">
                        [8Bit]ギターと孤独と蒼い惑星 - ぼっち・ざ・ろっく！
                    </div>
                </div>
                <canvas ref={osc} width="260" height="100">Not supported</canvas>
            </div>
        </div>
    )
};

export default Introduction;