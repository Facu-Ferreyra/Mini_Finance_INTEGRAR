import { initTheme, setupThemeToggle } from './theme.js';
import { handleRouting } from './router.js';
import { initCarousel } from "./carrusel.js";
import { initAuth } from './auth.js';
import { initPageTransitions } from './transition.js';

// Inicialización del tema
initTheme();
setupThemeToggle();

initCarousel();

initAuth();

initPageTransitions();

// Enrutamiento (dashboard / resumen)
handleRouting();
