// --- Inicializar tema guardado ---
export function initTheme() {
    const saved = localStorage.getItem('mf-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    updateIcon(saved);
}

// --- Alternar tema oscuro/claro ---
export function setupThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('mf-theme', next);
        updateIcon(next);
    });
}

// --- Actualizar icono del boton segun tema ---
function updateIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.textContent = theme === 'dark' ? '🌙' : '☀️';
}