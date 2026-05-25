import { saveMovement, getMovements, getGoals, saveGoal, deleteGoal, getGoalById } from './storage.js';
import { getUniqueCategories, getMovementsByCategory, assignFundsToGoal, getActiveGoals, getCompletedGoals } from './finance.js';
import { validateForm } from './validations.js';
import { 
    renderMetrics, 
    renderRecentMovements, 
    renderAlerts, 
    renderHistory, 
    renderGoals, 
    renderSavingsRate,
    renderGoalsHeader,
    renderPriorityLegend,
    renderGoalsFooterBanner,
    renderGoalsFilterToggle,
    populateCategoryFilter, 
    showFieldError, 
    clearFieldError,
    clearAllErrors,
    openAssignModal,
    closeAssignModal,
} from './ui.js';

// --- Inicializador de Dashboard ---
function initDashboard() {
    renderMetrics();
    renderRecentMovements();
    renderAlerts();

    const form = document.getElementById('finance-form');
    if (!form) return;

    const categorySelect    = document.getElementById('category');
    const descriptionGroup  = document.getElementById('description-group');
    const descriptionInput  = document.getElementById('description');
    const incomeOptgroup    = categorySelect.querySelector('.optgroup-income');
    const expenseOptgroup   = categorySelect.querySelector('.optgroup-expense');

    const requiresDescription = ['ingreso-extra', 'servicios', 'otros-ingreso', 'otros-gasto'];

    // --- Actualizar opciones de categoria segun tipo ---
    function updateCategoryOptions(type) {
        if (type === 'income') {
            incomeOptgroup.removeAttribute('hidden');
            expenseOptgroup.setAttribute('hidden', '');
            categorySelect.value = 'salario';
        } else {
            incomeOptgroup.setAttribute('hidden', '');
            expenseOptgroup.removeAttribute('hidden');
            categorySelect.value = 'vivienda';
        }
        updateDescriptionVisibility(categorySelect.value);
    }

    // --- Mostrar/ocultar campo de descripcion segun categoria ---
    function updateDescriptionVisibility(category) {
        if (requiresDescription.includes(category)) {
            descriptionGroup.removeAttribute('hidden');
        } else {
            descriptionGroup.setAttribute('hidden', '');
            if (descriptionInput) descriptionInput.value = '';
        }
    }

    document.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateCategoryOptions(e.target.value);
        });
    });

    categorySelect.addEventListener('change', () => {
        updateDescriptionVisibility(categorySelect.value);
    });

    updateCategoryOptions('income');

    // --- Guardar nuevo movimiento ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAllErrors();

        const amountInput   = document.getElementById('amount');
        const categoryInput = document.getElementById('category');

        const amountValue   = amountInput.value.trim();
        const categoryValue = categoryInput.value;

        const { valid, errors } = validateForm(amountValue, categoryValue);

        if (!valid) {
            if (errors.amount)   showFieldError('amount', errors.amount);
            if (errors.category) showFieldError('category', errors.category);
            return;
        }

        const movement = {
            id:          Date.now(),
            amount:      parseFloat(amountValue),
            category:    categoryValue,
            type:        document.querySelector('input[name="type"]:checked')?.value || 'income',
            description: descriptionInput?.value.trim() || '',
            date:        new Date().toISOString().split('T')[0]
        };

        saveMovement(movement);
        renderMetrics();
        renderRecentMovements();
        renderAlerts();

        form.reset();
        updateCategoryOptions('income');
        amountInput.focus();
    });
}

// --- Inicializador de Resumen (Listado de Metas) ---
function initResumen() {
    renderMetrics();
    renderSavingsRate();
    renderGoalsHeader();
    renderPriorityLegend();
    renderGoalsFooterBanner();
    renderGoalsFilterToggle();
    renderGoals(getActiveGoals()); 
    populateCategoryFilter(getUniqueCategories());
    renderHistory(getMovements());

    const goalForm    = document.getElementById('goal-form');
    const saveGoalBtn = document.getElementById('save-goal-btn'); 
    const nameInput   = document.getElementById('goal-name-input');
    const amountInput = document.getElementById('goal-amount-input');
    const prioritySel = document.getElementById('goal-priority');
    const descInput   = document.getElementById('goal-description');

    // --- Guardar nueva meta ---
    const ejecutarGuardado = (e) => {
        if (e) e.preventDefault(); 
        
        clearFieldError('goal-name');
        clearFieldError('goal-amount');

        const name = nameInput?.value.trim();
        const amountAttr = amountInput?.value.trim();
        const amount = parseFloat(amountAttr);
        const priority = prioritySel?.value || 'high';

        let hasError = false;

        if (!name) {
            showFieldError('goal-name', 'Ingresá un nombre para la meta.');
            hasError = true;
        }
        if (!amountAttr || isNaN(amount) || amount <= 0) {
            showFieldError('goal-amount', 'Ingresá un monto válido mayor a cero.');
            hasError = true;
        }

        if (hasError) return;

        const newGoal = {
            id: Date.now(),
            name,
            amount,
            priority,
            description: descInput ? descInput.value.trim() : ''
        };

        saveGoal(newGoal);
        renderGoals(getGoals()); 
        renderSavingsRate();
        renderAlerts();

        if (goalForm) {
            goalForm.reset();
        } else {
            if (nameInput) nameInput.value = '';
            if (amountInput) amountInput.value = '';
        }
    };

    // Soportar tanto estructura de <form> como de <button> suelto
    if (goalForm) {
        goalForm.addEventListener('submit', ejecutarGuardado);
    } else if (saveGoalBtn) {
        saveGoalBtn.addEventListener('click', ejecutarGuardado);
    }

    // --- Eliminar o asignar fondos a una meta ---
    const goalsContainer = document.getElementById('goals-list-container');
    if (goalsContainer) {
        goalsContainer.addEventListener('click', (e) => {
            var btn = e.target.closest('[data-action]');
            if (!btn) return;
            var goalId = parseInt(btn.dataset.id, 10);
            if (btn.dataset.action === 'delete') {
                deleteGoal(goalId);
                renderGoals(getGoals());
                renderGoalsHeader();
                renderSavingsRate();
                renderAlerts();
            } else if (btn.dataset.action === 'assign') {
                var goal = getGoalById(goalId);
                if (goal) openAssignModal(goal);
            }
        });
    }

    // --- Modal de asignacion: confirmar/cancelar ---
    var confirmBtn = document.getElementById('assign-confirm');
    var cancelBtn = document.getElementById('assign-cancel');
    var modalOverlay = document.getElementById('assign-modal');

    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            var modal = document.getElementById('assign-modal');
            var goalId = parseInt(modal.dataset.goalId, 10);
            var amountInput = document.getElementById('assign-amount');
            var errorEl = document.getElementById('assign-error');
            var amount = parseFloat(amountInput.value);

            if (!amount || amount <= 0) {
                errorEl.textContent = 'Ingresa un monto valido mayor a cero.';
                return;
            }

            var result = assignFundsToGoal(goalId, amount);
            if (result) {
                closeAssignModal();
                renderGoals(getGoals());
                renderGoalsHeader();
                renderMetrics();
                renderSavingsRate();
                renderAlerts();
            } else {
                errorEl.textContent = 'No hay suficiente balance disponible.';
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            closeAssignModal();
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeAssignModal();
            }
        });
    }

    // --- Toggle entre metas activas y completadas ---
    window._goalsShowCompleted = false;

    function handleFilterToggle() {
        window._goalsShowCompleted = !window._goalsShowCompleted;
        var goals = window._goalsShowCompleted ? getCompletedGoals() : getActiveGoals();
        renderGoalsFilterToggle();
        renderGoals(goals);
        renderGoalsHeader();
    }

    var filterBtn = document.getElementById('goals-filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', handleFilterToggle);
    }

    // --- Filtro de historial por categoria ---
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
    if (page === 'resumen')   initResumen();
}