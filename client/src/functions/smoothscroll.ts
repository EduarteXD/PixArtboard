/**
 * @param dist 目标offsetTop
 * @param ticks 步数
 * @param dura 持续毫秒
 */
const smoothscroll = (dist: number, ticks: number, dura: number) => {
    let current = document.documentElement.scrollTop || document.body.scrollTop
    let interval: NodeJS.Timeout
    let progress = 0
    const step = () => {
        if (progress < ticks) {
            progress++;
            window.scrollTo({ top: (dist - current) * (progress / ticks) + current });
        } else {
            clearInterval(interval);
        }
    }
    interval = setInterval(step, dura / ticks);
}

export default smoothscroll;