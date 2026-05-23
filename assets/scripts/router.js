import { saveMovement, getMovements } from './storage.js';
import { getUniqueCategories, getMovementsByCategory } from './finance.js';
import { validateForm } from './validations.js';
import { 
    renderMetrics, 
    renderRecentMovements, 
    renderAlerts, 
    renderHistory, 
    renderGoalProgress, 
    populateCategoryFilter, 
    showFieldError, 
    clearAllErrors 
} from './ui.js';

// --- Inicializador de Dashboard ---
function initDashboard() {
    // Renderizado inicial
    renderMetrics();
    renderRecentMovements();
    renderAlerts();

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
}


    const GOAL_NAME   = 'exampleMeta';
    const GOAL_AMOUNT = 5000;

    // Renderizado inicial
    renderGoalProgress(GOAL_NAME, GOAL_AMOUNT);
    populateCategoryFilter(getUniqueCategories());
    renderHistory(getMovements());

    const filterSelect = document.getElementById('filter-category');
    if (!filterSelect) return;

    filterSelect.addEventListener('change', () => {
        const selected = filterSelect.value;
        renderHistory(getMovementsByCategory(selected));
    });



export function handleRouting() {
    const page = document.body.dataset.page;

    if (page === 'dashboard') initDashboard();
    if (page === 'resumen')   initResumen();
}