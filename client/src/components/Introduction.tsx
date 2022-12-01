import React from "react";
import {
    motion,
    AnimatePresence
} from "framer-motion";
import debounce from "../functions/debounce";

import "./Introduction.scss";

const Introduction = () => {
    const screens = [
        "overview",
        "artworks",
        "soundtracks"
    ]
    const inScreen = React.useRef(0);

    const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
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
        let target = document.getElementById(screens[inScreen.current]);
        if (target) {
            window.scrollTo({top: target.offsetTop});
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
            onWheel={debounce(handleScroll, 200)}
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