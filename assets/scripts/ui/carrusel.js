/* TEMPORAL, HASTA TERMINAR DISEÑO DEL INDEX*/ 

/*
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
*/
export function initStepsCarousel() {
    const track   = document.getElementById('steps-track');
    const dotsContainer = document.getElementById('steps-dots');
    const prevBtn = document.getElementById('steps-prev');
    const nextBtn = document.getElementById('steps-next');

    if (!track) return;

    const cards = Array.from(track.querySelectorAll('.step-card'));
    let current = 0;

    // --- Generar dots dinámicamente ---
    cards.forEach(function(_, i) {
        const btn = document.createElement('button');
        btn.classList.add('steps-dot');
        if (i === 0) btn.classList.add('active');
        btn.setAttribute('aria-label', 'Ir al paso ' + (i + 1));
        btn.setAttribute('role', 'tab');
        btn.dataset.index = i;
        dotsContainer.appendChild(btn);
    });

    const dots = Array.from(dotsContainer.querySelectorAll('.steps-dot'));

    function goTo(index) {
        current = (index + cards.length) % cards.length;

        // Scroll suave al card activo
        var cardWidth = cards[0].getBoundingClientRect().width;
        var gap = 16; // gap en px entre cards (coincide con el CSS)
        track.style.transform = 'translateX(-' + (current * (cardWidth + gap)) + 'px)';

        // Actualizar dots
        dots.forEach(function(d, i) {
            d.classList.toggle('active', i === current);
        });

        // Actualizar aria-selected
        dots.forEach(function(d, i) {
            d.setAttribute('aria-selected', i === current ? 'true' : 'false');
        });
    }

    if (prevBtn) prevBtn.addEventListener('click', function() { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function() { goTo(current + 1); });

    dotsContainer.addEventListener('click', function(e) {
        var btn = e.target.closest('.steps-dot');
        if (btn) goTo(parseInt(btn.dataset.index, 10));
    });

    // Recalcular posición al cambiar tamaño de ventana
    window.addEventListener('resize', function() { goTo(current); });
}