/**
 * @param dist 目标offsetTop
 * @param ticks 步数
 */
const smoothscroll = (dist: number, ticks: number) => {
    let current = document.documentElement.scrollTop || document.body.scrollTop
    const step = (progress: number) => {
        if (progress <= ticks) {
            window.requestAnimationFrame(() => step(progress + 1));
            window.scrollTo({ top: (dist - current) * (progress / ticks) + current })
        }
    }
    window.requestAnimationFrame(() => step(0));
}

export default smoothscroll;