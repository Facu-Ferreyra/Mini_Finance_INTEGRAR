import { initTheme, setupThemeToggle } from './theme.js';
import { handleRouting } from './router.js';
import { initCarousel } from "./carrusel.js";
import { initAuth } from './auth.js';

// Inicialización del tema
initTheme();
setupThemeToggle();

initCarousel();

initAuth();

// Enrutamiento (dashboard / resumen)
handleRouting();
