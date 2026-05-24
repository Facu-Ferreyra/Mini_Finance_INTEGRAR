import { saveMovement, getMovements, getGoal, saveGoal, deleteGoal } from './storage.js';
import { getUniqueCategories, getMovementsByCategory } from './finance.js';
import { validateForm } from './validations.js';
import { 
    renderMetrics, 
    renderRecentMovements, 
    renderAlerts, 
    renderHistory, 
    renderGoalProgress, 
    renderSavingsRate,
    populateCategoryFilter, 
    showFieldError, 
    clearAllErrors, 
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
            type:     document.querySelector('input[name="type"]:checked')?.value || 'income',
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


function initResumen() {
    const goal = getGoal();

    // Render inicial
    renderMetrics();
    renderSavingsRate();
    renderGoalProgress(goal.name || 'Sin meta', goal.amount);
    populateCategoryFilter(getUniqueCategories());
    renderHistory(getMovements());

    // Prellenar el formulario con la meta guardada (si existe)
    const nameInput   = document.getElementById('goal-name-input');
    const amountInput = document.getElementById('goal-amount-input');

    if (nameInput && goal.name)     nameInput.value   = goal.name;
    if (amountInput && goal.amount) amountInput.value = goal.amount;

    // Listener guardar meta
    const saveGoalBtn = document.getElementById('save-goal-btn');
    if (saveGoalBtn) {
        saveGoalBtn.addEventListener('click', () => {
            const name   = nameInput?.value.trim();
            const amount = parseFloat(amountInput?.value);

            if (!name) {
                document.getElementById('goal-name-error').textContent = 
                    'Ingresá un nombre para la meta.';
                return;
            }

            if (isNaN(amount) || amount <= 0) {
                document.getElementById('goal-amount-error').textContent = 
                    'Ingresá un monto válido mayor a cero.';
                return;
            }

            // Limpiar errores
            document.getElementById('goal-name-error').textContent   = '';
            document.getElementById('goal-amount-error').textContent = '';

            saveGoal({ name, amount });
            renderGoalProgress(name, amount);
            renderSavingsRate();
            renderAlerts();
        });
    }

    const deleteGoalBtn = document.getElementById('delete-goal-btn');
    if (deleteGoalBtn) {
        deleteGoalBtn.addEventListener('click', () => {
            deleteGoal();

            // Limpiar formulario
            if (nameInput)   nameInput.value   = '';
            if (amountInput) amountInput.value = '';

            // Limpiar errores
            document.getElementById('goal-name-error').textContent   = '';
            document.getElementById('goal-amount-error').textContent = '';

            // Re-renderizar con estado vacío
            renderGoalProgress('', 0);
            renderSavingsRate();
            renderAlerts();
        });
    }

    // Listener filtro categorías
    const filterSelect = document.getElementById('filter-category');
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            renderHistory(getMovementsByCategory(filterSelect.value));
        });
    }

}
 

// --- Orquestador de Rutas ---
export function handleRouting() {
    const page = document.body.dataset.page;

    if (page === 'dashboard') initDashboard();
    if (page === 'resumen')   initResumen(); // Ahora sí va a encontrar la función perfectamente
}