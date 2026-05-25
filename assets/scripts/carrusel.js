export function initCarousel() {

    const slides = document.querySelectorAll('.carousel-slide');
    const dots   = document.querySelectorAll('.dot');

    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');

    if (slides.length === 0) return;

    let current  = 0;
    let interval = null;

    function goTo(index) {

        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
    }

    function next() {
        goTo(current + 1);
    }

    function prev() {
        goTo(current - 1);
    }

    function start() {
        stop();
        interval = setInterval(() => {
            next();
        }, 6000);
    }

    function stop() {
        if (interval) {
            clearInterval(interval);
        }
    }

    function restart() {
        stop();
        start();
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            next();
            restart();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prev();
            restart();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goTo(index);
            restart();
        });
    });

    document.addEventListener('visibilitychange', () => {
        document.hidden
            ? stop()
            : start();
    });
    start();
}