import { initTheme, setupThemeToggle } from './theme.js';
import { handleRouting } from './router.js';
import { initCarousel } from "./carrusel.js";

// --- Inicialización del tema ---
initTheme();
setupThemeToggle();

initCarousel();

// --- Enrutamiento Ejecutivo ---
handleRouting();
