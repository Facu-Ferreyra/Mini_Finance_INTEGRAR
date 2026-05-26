import { saveMovement, getMovements, getGoals, saveGoal, deleteGoal, getGoalById, updateGoal} from './storage.js';
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
    setFieldError, 
    clearAllErrors,
    openAssignModal,
    closeAssignModal,
    openEditModal,
    closeEditModal,
    openConfirmModal,
    closeConfirmModal
} from './ui.js';
import {isLoggedIn} from './accounts.js';

let goalsShowCompleted = false;

// --- Refrescar toda la UI de metas despues de una mutacion ---
function refreshGoalsUI() {
    const goals = goalsShowCompleted ? getCompletedGoals() : getActiveGoals();
    renderGoals(goals);
    renderGoalsHeader();
    renderSavingsRate();
    renderAlerts();
    renderMetrics();
}

// --- Inicializador de Dashboard ---
function initDashboard() {
    const logoutPageBtn = document.getElementById('logout-page-btn');
    if (logoutPageBtn) {
        logoutPageBtn.addEventListener('click', function() {
            import('./accounts.js').then(function(m) {
                m.logoutAccount();
                window.location.replace('../index.html');
            });
        });
    }
    
    
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
            if (errors.amount)   setFieldError('amount', errors.amount);
            if (errors.category) setFieldError('category', errors.category);
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
    const logoutPageBtn = document.getElementById('logout-page-btn');
    if (logoutPageBtn) {
        logoutPageBtn.addEventListener('click', function() {
            import('./accounts.js').then(function(m) {
                m.logoutAccount();
                window.location.replace('../index.html');
            });
        });
    }
    
    
    renderMetrics();
    renderSavingsRate();
    renderGoalsHeader();
    renderPriorityLegend();
    renderGoalsFooterBanner();
    renderGoalsFilterToggle();
    renderGoals(getActiveGoals()); 
    populateCategoryFilter(getUniqueCategories());
    /*renderHistory(getMovements());*/

    const goalForm    = document.getElementById('goal-form');
    const saveGoalBtn = document.getElementById('save-goal-btn'); 
    const nameInput   = document.getElementById('goal-name-input');
    const amountInput = document.getElementById('goal-amount-input');
    const prioritySel = document.getElementById('goal-priority');
    const descInput   = document.getElementById('goal-description');

    /*
    if (nameInput) {
        nameInput.addEventListener('input', () => setFieldError('goal-name'));
    }
    if (amountInput) {
        amountInput.addEventListener('input', () => setFieldError('goal-amount'));
    }
    */
    // --- Guardar nueva meta ---
    const ejecutarGuardado = (e) => {
        if (e) e.preventDefault(); 
        
        setFieldError('goal-name');
        setFieldError('goal-amount');

        const name = nameInput?.value.trim();
        const amountAttr = amountInput?.value.trim();
        const amount = parseFloat(amountAttr);
        const priority = prioritySel?.value || 'high';

        let hasError = false;

        if (!name) {
            setFieldError('goal-name', 'Ingresá un nombre para la meta.');
            hasError = true;
        }
        if (!amountAttr || isNaN(amount) || amount <= 0) {
            setFieldError('goal-amount', 'Ingresá un monto válido mayor a cero.');
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
        refreshGoalsUI();

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
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const goalId = parseInt(btn.dataset.id, 10);
            if (btn.dataset.action === 'delete') {
                const goalToConfirm = getGoalById(goalId);
                if (goalToConfirm) openConfirmModal(goalId, goalToConfirm.name);
            } else if (btn.dataset.action === 'assign') {
                const goal = getGoalById(goalId);
                if (goal) openAssignModal(goal);
            } else if (btn.dataset.action === 'edit') {
                const goalToEdit = getGoalById(goalId);
                if (goalToEdit) openEditModal(goalToEdit);
            }
        });
    }

    // --- Modal de asignacion: confirmar/cancelar ---
    const confirmBtn = document.getElementById('assign-confirm');
    const cancelBtn = document.getElementById('assign-cancel');
    const modalOverlay = document.getElementById('assign-modal');

    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const modal = document.getElementById('assign-modal');
            const goalId = parseInt(modal.dataset.goalId, 10);
            const amountInput = document.getElementById('assign-amount');
            const errorEl = document.getElementById('assign-error');
            const amount = parseFloat(amountInput.value);

            if (!amount || amount <= 0) {
                errorEl.textContent = 'Ingresa un monto valido mayor a cero.';
                return;
            }

            const result = assignFundsToGoal(goalId, amount);
            if (result) {
                closeAssignModal();
                refreshGoalsUI();
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


    // --- Modal de edición: confirmar/cancelar ---
    const editConfirmBtn = document.getElementById('edit-confirm');
    const editCancelBtn = document.getElementById('edit-cancel');
    const editModalOverlay = document.getElementById('edit-modal');

    if (editConfirmBtn) {
        editConfirmBtn.addEventListener('click', function() {
            const modal = document.getElementById('edit-modal');
            const goalId = parseInt(modal.dataset.goalId, 10);
            const amountInput = document.getElementById('edit-goal-amount');
            const errorEl = document.getElementById('edit-error');
            const amount = parseFloat(amountInput.value);

            if (!amount || amount <= 0) {
                errorEl.textContent = 'Ingresá un monto válido mayor a cero.';
                return;
            }

            updateGoal(goalId, { amount });
            closeEditModal();
            refreshGoalsUI();
        });
    }

    if (editCancelBtn) {
        editCancelBtn.addEventListener('click', function() {
            closeEditModal();
        });
    }

    if (editModalOverlay) {
        editModalOverlay.addEventListener('click', function(e) {
            if (e.target === editModalOverlay) {
                closeEditModal();
            }
        });
    }

    // --- Modal de confirmación de eliminación ---
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    const confirmModalOverlay = document.getElementById('confirm-modal');

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const modal = document.getElementById('confirm-modal');
            const goalId = parseInt(modal.dataset.goalId, 10);
            deleteGoal(goalId);
            closeConfirmModal();
            refreshGoalsUI();
        });
    }

    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', function() {
            closeConfirmModal();
        });
    }

    if (confirmModalOverlay) {
        confirmModalOverlay.addEventListener('click', function(e) {
            if (e.target === confirmModalOverlay) {
                closeConfirmModal();
            }
        });
    }

    // --- Toggle entre metas activas y completadas ---
    goalsShowCompleted = false;

    function handleFilterToggle() {
        goalsShowCompleted = !goalsShowCompleted;
        const goals = goalsShowCompleted ? getCompletedGoals() : getActiveGoals();
        renderGoalsFilterToggle();
        renderGoals(goals);
        renderGoalsHeader();
    }

    const toggleContainer = document.getElementById('goals-filter-toggle');
    if (toggleContainer) {
        toggleContainer.addEventListener('click', function(e) {
            if (e.target.closest('#goals-filter-btn')) {
                handleFilterToggle();
            }
        });
    }

    // --- Filtro de historial por categoria ---
    // --- Filtro de historial por categoria ---
    // --- Filtro de historial por categoria ---
    const filterSelect = document.getElementById('filter-category');
    let historySortAsc = false; // false = más reciente primero (DESC)

    function getSortedMovements(movements) {
        return [...movements].sort((a, b) => {
            if (historySortAsc) return a.date.localeCompare(b.date);
            return b.date.localeCompare(a.date);
        });
    }

    function refreshHistory() {
        const filterSelect = document.getElementById('filter-category');
        const category = filterSelect ? filterSelect.value : 'all';
        const movements = getMovementsByCategory(category);
        renderHistory(getSortedMovements(movements));
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
        refreshHistory();});
    }

    const sortDateBtn = document.getElementById('sort-date-btn');
    if (sortDateBtn) {
        sortDateBtn.addEventListener('click', () => {
            historySortAsc = !historySortAsc;
            sortDateBtn.setAttribute('aria-sort', historySortAsc ? 'ascending' : 'descending');
            const icon = sortDateBtn.querySelector('.sort-icon');
            if (icon) icon.textContent = historySortAsc ? '▲' : '▼';
            refreshHistory();
        });
        sortDateBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                sortDateBtn.click();
            }
        });
    }

    refreshHistory();
    }

    // Orquestador de Rutas
    export function handleRouting() {
        const page = document.body.dataset.page;

        // Redirigir si no hay sesión activa
        if ((page === 'dashboard' || page === 'resumen') && !isLoggedIn()) {
            // replace no queda en el historial (asi, cuando se vuelva atras no marque error, lo que si sucede con href)
            window.location.replace('../index.html');
            return;
        }
        if (page === 'dashboard') initDashboard();
        if (page === 'resumen')   initResumen();
}