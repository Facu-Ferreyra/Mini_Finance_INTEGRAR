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

        var cardWidth = cards[0].getBoundingClientRect().width;
        var gap = cards.length > 1
            ? cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().right
            : 0;
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