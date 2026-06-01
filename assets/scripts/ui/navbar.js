export function initMobileNavbar() {
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', function() {
        const isOpen = navLinks.classList.toggle('mobile-nav');
        menuToggle.classList.toggle('is-active', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.addEventListener('click', function(e) {
        if (!e.target.closest('a, button')) return;

        navLinks.classList.remove('mobile-nav');
        menuToggle.classList.remove('is-active');
        menuToggle.setAttribute('aria-expanded', 'false');
    });
}