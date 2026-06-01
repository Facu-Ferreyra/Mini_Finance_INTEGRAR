import { initTheme, setupThemeToggle } from './ui/theme.js';
import { handleRouting } from './routing/router.js';
import { initStepsCarousel } from "./ui/carrusel.js";
import { initAuth } from './ui/auth.js';
import { initPageTransitions } from './ui/transition.js';
import { initMobileNavbar } from './ui/navbar.js';

// Inicialización del tema
initTheme();
setupThemeToggle();

initStepsCarousel();

initAuth();
initMobileNavbar();
initPageTransitions();

// Enrutamiento (dashboard / resumen)
handleRouting();
