import { saveMovement, getMovementById, updateMovement, deleteMovement } from '../core/storage.js';
import { validateForm } from '../core/validations.js';
import {
    renderMetrics,
    renderRecentMovements,
    renderDashboardGoalsPanel,
    setFieldError,
    clearAllErrors,
    openEditMovementModal,
    closeEditMovementModal,
    openDeleteMovementConfirm,
    closeDeleteMovementConfirm
} from '../ui/ui.js';

export function initDashboard() {
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
    renderRecentMovements();
    renderDashboardGoalsPanel();

    const form = document.getElementById('finance-form');
    if (!form) return;

    const categorySelect    = document.getElementById('category');
    const descriptionGroup  = document.getElementById('description-group');
    const descriptionInput  = document.getElementById('description');
    const incomeOptgroup    = categorySelect.querySelector('.optgroup-income');
    const expenseOptgroup   = categorySelect.querySelector('.optgroup-expense');

    const requiresDescription = ['ingreso-extra', 'servicios', 'otros-ingreso', 'otros-gasto'];

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

        form.reset();
        renderDashboardGoalsPanel();
        updateCategoryOptions('income');
        amountInput.focus();
    });

    // Movement action buttons: edit / delete
    const recentList = document.getElementById('recent-list');
    if (recentList) {
        recentList.addEventListener('click', function(e) {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const id = parseInt(btn.dataset.id, 10);

            if (btn.dataset.action === 'edit-mov') {
                const movement = getMovementById(id);
                if (movement) openEditMovementModal(movement);
            } else if (btn.dataset.action === 'delete-mov') {
                openDeleteMovementConfirm(id);
            }
        });
    }

    // Edit movement modal confirm
    document.getElementById('edit-mov-confirm')?.addEventListener('click', function() {
        const modal = document.getElementById('edit-movement-modal');
        const id = parseInt(modal.dataset.movementId, 10);
        const amount = parseFloat(document.getElementById('edit-mov-amount').value);
        const type = document.querySelector('input[name="edit-mov-type"]:checked')?.value;
        const category = document.getElementById('edit-mov-category').value;
        const description = document.getElementById('edit-mov-description').value.trim();
        const errorEl = document.getElementById('edit-mov-error');

        if (!amount || amount <= 0) {
            errorEl.textContent = 'Ingresá un monto válido mayor a cero.';
            return;
        }

        updateMovement(id, { amount, type, category, description });
        closeEditMovementModal();
        renderMetrics();
        renderRecentMovements();
        renderDashboardGoalsPanel();
    });

    // Edit movement modal cancel
    document.getElementById('edit-mov-cancel')?.addEventListener('click', function() {
        closeEditMovementModal();
    });

    // Edit movement modal overlay click
    document.getElementById('edit-movement-modal')?.addEventListener('click', function(e) {
        if (e.target === this) closeEditMovementModal();
    });

    // Delete movement modal confirm
    document.getElementById('delete-mov-confirm')?.addEventListener('click', function() {
        const modal = document.getElementById('delete-movement-modal');
        const id = parseInt(modal.dataset.movementId, 10);
        deleteMovement(id);
        closeDeleteMovementConfirm();
        renderMetrics();
        renderRecentMovements();
        renderDashboardGoalsPanel();
    });

    // Delete movement modal cancel
    document.getElementById('delete-mov-cancel')?.addEventListener('click', function() {
        closeDeleteMovementConfirm();
    });

    // Delete movement modal overlay click
    document.getElementById('delete-movement-modal')?.addEventListener('click', function(e) {
        if (e.target === this) closeDeleteMovementConfirm();
    });
}
