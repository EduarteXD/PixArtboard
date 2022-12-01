import React from "react";
import {
    motion,
    AnimatePresence
} from "framer-motion";
import throttle from "../functions/throttle";

import "./Introduction.scss";

const Introduction = () => {
    const screens = [
        "overview",
        "artworks",
        "soundtracks"
    ]
    const inScreen = React.useRef(0);

    let lock = false;
    let timeout: null | NodeJS.Timeout = null;
    const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
        if (!lock) {
            lock = true;
            if (e.deltaY > 0) {
                // scroll down
                if (inScreen.current + 1 < screens.length) {
                    inScreen.current += 1;
                }
            } else {
                if (inScreen.current > 0) {
                    inScreen.current -= 1;
                }
            }
            let target = document.getElementById(screens[inScreen.current])
            window.requestAnimationFrame(() => {
                window.scrollTo({
                    top: target?.offsetTop
                })
            });
            timeout = setTimeout(() => {
                lock = false;
                timeout = null;
            }, 100);
        } else if (timeout) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                lock = false;
                timeout = null;

            }, 100);
        }
    }

    return (
        <motion.div
            className="holder"
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
            onWheel={handleScroll}
        >
            <div id="overview" className="fullScreen overview">
                
            </div>
            <div id="artworks" className="fullScreen artworks">
                
            </div>
            <div id="soundtracks" className="fullScreen soundtracks">
                
            </div>
        </motion.div>
    )
};

export default Introduction;