export function initPageTransitions() {

    // Al cargar, el CSS ya aplica pageFadeIn sobre body

    document.addEventListener('click', function(e) {
        // Buscar el <a> más cercano al elemento clickeado
        var link = e.target.closest('a');

        if (!link) return;

        var href = link.getAttribute('href');

        // Ignorar: sin href, anclas puras, links externos, nueva pestaña, mailto/tel
        if (
            !href ||
            href.startsWith('#') ||
            href.startsWith('http') ||
            href.startsWith('mailto') ||
            href.startsWith('tel') ||
            link.target === '_blank' ||
            e.ctrlKey || e.metaKey || e.shiftKey   // atajos de teclado del navegador
        ) return;

        e.preventDefault();

        // Añadir clase de salida y navegar al terminar la animación
        document.body.classList.add('page-leaving');

        setTimeout(function() {
            window.location.href = href;
        }, 260);   // debe coincidir con la duración de pageFadeOut (0.25s + margen)
    });
}