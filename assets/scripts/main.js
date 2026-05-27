import { initTheme, setupThemeToggle } from './ui/theme.js';
import { handleRouting } from './routing/router.js';
import { initCarousel } from "./ui/carrusel.js";
import { initAuth } from './ui/auth.js';
import { initPageTransitions } from './ui/transition.js';

// Inicialización del tema
initTheme();
setupThemeToggle();

initCarousel();

initAuth();

initPageTransitions();

// Enrutamiento (dashboard / resumen)
handleRouting();
