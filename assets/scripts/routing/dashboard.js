import { saveMovement } from '../core/storage.js';
import { validateForm } from '../core/validations.js';
import {
    renderMetrics,
    renderRecentMovements,
    renderAlerts,
    renderDashboardGoalsPanel,
    setFieldError,
    clearAllErrors
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
    renderAlerts();
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
        renderAlerts();

        form.reset();
        renderDashboardGoalsPanel();
        updateCategoryOptions('income');
        amountInput.focus();
    });
}
