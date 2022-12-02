import React from "react";
import useDebounce from "../hooks/useDebounce";
import smoothscroll from "../functions/smoothscroll";

import "./Introduction.scss";

import overviewBg from "../resources/overviewBg.jpg";
import banner1 from "../resources/banner1.jpg"
import banner2 from "../resources/banner2.jpg"
import banner3 from "../resources/banner3.jpg"
import banner4 from "../resources/banner4.jpg"
import banner5 from "../resources/banner5.jpg"
import artwork1 from "../resources/artwork1.jpg"
import artwork2 from "../resources/artwork2.jpg"
import artwork3 from "../resources/artwork3.jpg"
import artwork4 from "../resources/artwork4.jpg"
import artwork5 from "../resources/artwork5.jpg"

import bgMusic from "../resources/bgmusic.mp3";

const Introduction = () => {
    const screens = [
        "overview",
        "introduction",
        "artworks",
        "soundtracks"
    ]
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
        // eslint-disable-next-line
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
            smoothscroll(target.offsetTop, 30, 300);
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
            onWheel={useDebounce(handleScroll, 100, [inScreen])}
        >
            <div id="overview" className={inScreen === 0 ? "fullScreen overview active" : "fullScreen overview"}>
                <img src={overviewBg} className="background" alt="Kessoku Band" />
                <div className="tip">
                    向下滑动，发现更多精彩
                    <div className="arrowDown">&#xf078;</div>
                </div>
            </div>
            <div id="introduction" className={inScreen === 1 ? "fullScreen introduction active" : "fullScreen introduction"}>
                <img className="banner left b1" src={banner1} alt="cover of the vol.1" />
                <img className="banner left b2" src={banner2} alt="cover of the vol.2" />
                <img className="banner left b3" src={banner3} alt="cover of the vol.3" />
                <img className="banner left b4" src={banner4} alt="cover of the vol.4" />
                <img className="banner left b5" src={banner5} alt="cover of the vol.5" />
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
            <div id="soundtracks" className="fullScreen soundtracks">

            </div>
            <div className="player" id="player" >
                <div className="name">
                    <div className="innerText">
                        [8Bit]ギターと孤独と蒼い惑星 - ぼっち・ざ・ろっく！
                    </div>
                </div>
                <canvas ref={osc} width="160" height="100">Not supported</canvas>
            </div>
        </div>
    )
};

export default Introduction;