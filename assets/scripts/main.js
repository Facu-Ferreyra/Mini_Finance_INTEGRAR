import { initTheme, setupThemeToggle } from './theme.js';





// --- Inicialización del tema ---
// Debe ser lo primero en ejecutarse para evitar el flasheo raro de tema incorrecto
initTheme();
setupThemeToggle();