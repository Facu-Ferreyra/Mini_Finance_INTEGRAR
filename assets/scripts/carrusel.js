// --- Inicializar carrusel de imagenes ---
export function initCarousel() {

    const slides = document.querySelectorAll('.carousel-slide');
    const dots   = document.querySelectorAll('.dot');

    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');

    if (slides.length === 0) return;

    let current  = 0;
    let interval = null;

    // --- Navegar a un slide especifico ---
    function goTo(index) {

        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
    }

    // --- Siguiente / Anterior ---
    function next() {
        goTo(current + 1);
    }

    function prev() {
        goTo(current - 1);
    }

    // --- Auto-play ---
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

    // --- Eventos de botones y dots ---
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

    // --- Pausar al cambiar de pestaña ---
    document.addEventListener('visibilitychange', () => {
        document.hidden
            ? stop()
            : start();
    });
    start();
}