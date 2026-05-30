import { getMovements, getGoals, saveGoal, deleteGoal, getGoalById, updateGoal } from '../core/storage.js';
import { getUniqueCategories, getMovementsByCategory, assignFundsToGoal, getActiveGoals, getCompletedGoals } from '../core/finance.js';
import {
    renderMetrics,
    renderGoals,
    renderSavingsRate,
    renderGoalsHeader,
    renderPriorityLegend,
    renderGoalsFooterBanner,
    renderGoalsFilterToggle,
    populateCategoryFilter,
    renderHistory,
    setFieldError,
    clearAllErrors,
    openAssignModal,
    closeAssignModal,
    openEditModal,
    closeEditModal,
    openConfirmModal,
    closeConfirmModal
} from '../ui/ui.js';

let goalsShowCompleted = false;

export function initResumen() {
    const logoutPageBtn = document.getElementById('logout-page-btn');
    if (logoutPageBtn) {
        logoutPageBtn.addEventListener('click', function() {
            import('../core/accounts.js').then(function(m) {
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

    if (goalForm) {
        goalForm.addEventListener('submit', ejecutarGuardado);
    } else if (saveGoalBtn) {
        saveGoalBtn.addEventListener('click', ejecutarGuardado);
    }

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
                errorEl.textContent = 'No se pudo asignar. Verificá el monto, el balance o si la meta ya está completa.';
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

            const prioritySelect = document.getElementById('edit-goal-priority');
            const priority = prioritySelect ? prioritySelect.value : 'medium';
            const currentGoal = getGoals().find((goal) => goal.id === goalId);
            const changes = { amount, priority };

            if (currentGoal.saved >= amount) {
                changes.completedAt = currentGoal.completedAt || new Date().toISOString().split('T')[0];
            } else {
                changes.completedAt = null;
            }

            updateGoal(goalId, changes);
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

    goalsShowCompleted = false;
    window._goalsShowCompleted = false;

    function handleFilterToggle() {
        goalsShowCompleted = !goalsShowCompleted;
        window._goalsShowCompleted = goalsShowCompleted;
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

    const filterSelect = document.getElementById('filter-category');
    let historySortBy = 'date';
    let historySortAsc = false;

    function updateSortUI(activeBtnId) {
        ['sort-date-btn', 'sort-amount-btn'].forEach(function(id) {
            const btn = document.getElementById(id);
            if (!btn) return;
            const isActive = id === activeBtnId;
            const icon = btn.querySelector('.sort-icon');
            if (isActive) {
                btn.setAttribute('aria-sort', historySortAsc ? 'ascending' : 'descending');
                if (icon) icon.textContent = historySortAsc ? '▲' : '▼';
            } else {
                btn.setAttribute('aria-sort', 'none');
                if (icon) icon.textContent = '▼';
            }
        });
    }

    function getSortedMovements(movements) {
        return [...movements].sort((a, b) => {
            const cmp = historySortBy === 'date'
                ? a.date.localeCompare(b.date)
                : a.amount - b.amount;
            return historySortAsc ? cmp : -cmp;
        });
    }

    function setupSortButton(btnId, sortBy) {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        btn.addEventListener('click', function() {
            if (historySortBy === sortBy) {
                historySortAsc = !historySortAsc;
            } else {
                historySortBy = sortBy;
                historySortAsc = false;
            }
            updateSortUI(btnId);
            refreshHistory();
        });
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            refreshHistory();
        });
    }

    
    function refreshHistory() {
        const filterSelect = document.getElementById('filter-category');
        const category = filterSelect ? filterSelect.value : 'all';
        const movements = getMovementsByCategory(category);
        renderHistory(getSortedMovements(movements));
    }

    function refreshGoalsUI() {
        const goals = goalsShowCompleted ? getCompletedGoals() : getActiveGoals();
        renderGoals(goals);
        populateCategoryFilter(getUniqueCategories());
        refreshHistory();
        renderGoalsHeader();
        renderSavingsRate();
        renderMetrics();
    }
    
    setupSortButton('sort-date-btn', 'date');
    setupSortButton('sort-amount-btn', 'amount');
    updateSortUI('sort-date-btn');



    refreshHistory();
}
