import { initTheme, setupThemeToggle } from './theme.js';
import { saveMovement, getMovements } from './storage.js';
import { getUniqueCategories, getMovementsByCategory } from './finance.js';
import { renderMetrics, renderRecentMovements, renderAlerts, renderHistory, renderGoalProgress, populateCategoryFilter, showFieldError, clearAllErrors } from './ui.js';
import { validateForm } from './validations.js';


// --- Inicialización del tema ---
// Debe ser lo primero en ejecutarse para evitar el flasheo raro de tema incorrecto
initTheme();
setupThemeToggle();


const page = document.body.dataset.page;

if (page === 'dashboard') initDashboard();
if (page === 'resumen')   initResumen();

function initDashboard() {
    // Renderizado inicial
    renderMetrics();
    renderRecentMovements();
    renderAlerts();

    // Listener del formulario
    const form = document.getElementById('finance-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAllErrors();

        const amountInput   = document.getElementById('amount');
        const categoryInput = document.getElementById('category');

        const amountValue   = amountInput.value.trim();
        const categoryValue = categoryInput.value;

        // Validación
        const { valid, errors } = validateForm(amountValue, categoryValue);

        if (!valid) {
            if (errors.amount)   showFieldError('amount', errors.amount);
            if (errors.category) showFieldError('category', errors.category);
            return;
        }

        // Construcción del objeto movimiento
        const movement = {
            id:       Date.now(),
            amount:   parseFloat(amountValue),
            category: categoryValue,
            type:     parseFloat(amountValue) > 0 ? 'income' : 'expense',
            date:     new Date().toISOString().split('T')[0]
        };

        // Persistencia y re-renderizado
        saveMovement(movement);
        renderMetrics();
        renderRecentMovements();
        renderAlerts();

        // Limpiar formulario
        form.reset();
        amountInput.focus();
    });




    function initResumen() {
    // Meta hardcodeada por ahora — la expandís después
    const GOAL_NAME   = 'Viaje 2026';
    const GOAL_AMOUNT = 5000;

    // Renderizado inicial
    renderGoalProgress(GOAL_NAME, GOAL_AMOUNT);
    populateCategoryFilter(getUniqueCategories());
    renderHistory(getMovements());

    // Listener del filtro
    const filterSelect = document.getElementById('filter-category');
    if (!filterSelect) return;

    filterSelect.addEventListener('change', () => {
        const selected = filterSelect.value;
        renderHistory(getMovementsByCategory(selected));
    });
}
}