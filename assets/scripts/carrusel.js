export function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots   = document.querySelectorAll('.dot');

    if (slides.length === 0) return;

    let current  = 0;
    let interval = null;

    function goTo(index) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');

        current = index % slides.length;

        slides[current].classList.add('active');
        dots[current].classList.add('active');
    }

    function next() {
        goTo(current + 1);
    }

    function start() {
        interval = setInterval(next, 6000);
    }

    function stop() {
        clearInterval(interval);
    }

    // Pausar movimiento cuando la pestaña no está visible, ahorra recursos
    // Pausar movimiento cuando la pestaña no está visible, ahorra recursos
    document.addEventListener('visibilitychange', () => {
        document.hidden ? stop() : start();
    });

    start();
}