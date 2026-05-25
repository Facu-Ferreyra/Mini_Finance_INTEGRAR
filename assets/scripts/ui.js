// depende de finance.js para mostrar resultados


import { calcBalance, calcIncome, calcExpenses, isBalanceCritical, isExpenseLimitExceeded, isGoalUnreached, getRecentMovements} from './finance.js';
import { getGoal } from './storage.js';
// --- Métricas ---

export function renderMetrics() {
    const balance = document.getElementById('balance-total');
    const income = document.getElementById('income-total');
    const expense = document.getElementById('expense-total');

    if (balance) balance.textContent = formatCurrency(calcBalance());
    if (income)  income.textContent  = formatCurrency(calcIncome());
    if (expense) expense.textContent = formatCurrency(calcExpenses());
}

export function renderSavingsRate() {
    const el = document.getElementById('savings-rate');
    if (!el) return;

    const income   = calcIncome();
    const balance  = calcBalance();

    if (income <= 0 || balance <= 0) {
        el.textContent = '0%';
        return;
    }

    const rate = ((balance / income) * 100).toFixed(1);
    el.textContent = `${rate}%`;
}

// --- Actividad reciente ---

export function renderRecentMovements() {
    const list = document.getElementById('recent-list');
    if (!list) return;

    const movements = getRecentMovements(5);
    list.innerHTML = '';

    if (movements.length === 0) {
        list.innerHTML = '<li class="empty-state">No hay movimientos aún.</li>';
        return;
    }

    movements.forEach(m => {
        const li = document.createElement('li');
        li.classList.add('movement-item', m.type === 'income' ? 'movement-income' : 'movement-expense');
        li.innerHTML = `
            <span class="movement-category">${escapeHTML(capitalizeFirst(m.category))}</span>
            <span class="movement-amount">${m.type === 'income' ? '+' : '-'}${formatCurrency(m.amount)}</span>
            <time class="movement-date" datetime="${m.date}">${formatDate(m.date)}</time>
        `;
        list.appendChild(li);
    });
}

// --- Historial completo (resumen.html) ---

export function renderHistory(movements) {
    const tbody = document.getElementById('history-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (movements.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-state">No hay movimientos para esta categoría.</td>
            </tr>`;
        return;
    }

    movements.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><time datetime="${m.date}">${formatDate(m.date)}</time></td>
        <td>
            ${escapeHTML(capitalizeFirst(m.category))}
            ${m.description 
                ? `<small class="movement-description">${escapeHTML(m.description)}</small>` 
                : ''}
        </td>
        <td class="${m.type === 'income' ? 'amount-income' : 'amount-expense'}">
            ${m.type === 'income' ? '+' : '-'}${formatCurrency(m.amount)}
        </td>
    `;
    tbody.appendChild(tr);
    });
}

// --- Barra de progreso (resumen.html) ---

export function renderGoalProgress(goalName, goalAmount) {
    const nameEl   = document.getElementById('goal-name');
    const statusEl = document.getElementById('goal-status');
    const fillEl   = document.getElementById('goal-progress');
    const barEl    = fillEl?.parentElement;

    if (!nameEl || !statusEl || !fillEl) return;

    const balance    = calcBalance();
    const percentage = goalAmount > 0 ? Math.min((balance / goalAmount) * 100, 100) : 0;
    const remaining  = Math.max(goalAmount - balance, 0);

    nameEl.textContent   = goalName;
    fillEl.style.width   = `${percentage.toFixed(1)}%`;
    statusEl.textContent = remaining > 0
        ? `Faltan ${formatCurrency(remaining)} para completar tu objetivo.`
        : '¡Objetivo alcanzado!';

    if (barEl) barEl.setAttribute('aria-valuenow', percentage.toFixed(1));
}



// --- Alertas ---

export function renderAlerts() {
    const container = document.getElementById('alert-container');
    if (!container) return;

    container.innerHTML = '';

    if (isBalanceCritical()) {
        container.appendChild(createAlert('Tu balance es negativo. Revisá tus gastos.', 'error'));
    } else if (isExpenseLimitExceeded()) {
        container.appendChild(createAlert('Has superado el 80% de tu límite de gastos previsto.', 'warning'));
    }

    if (isGoalUnreached()) {
        const goal      = getGoal();
        const remaining = goal.amount - calcBalance();
        container.appendChild(
        createAlert(`Te faltan ${formatCurrency(remaining)} para alcanzar tu meta "${goal.name}".`, 'warning')
    );
}
}

function createAlert(message, type) {
    const alert = document.createElement('div');
    alert.classList.add('alert', `alert-${type}`);
    alert.setAttribute('role', 'alert');
    alert.innerHTML = `<span aria-hidden="true">⚠️</span> ${escapeHTML(message)}`;
    return alert;
}

// --- Errores de formulario ---

export function showFieldError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);

    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
}

export function clearFieldError(fieldId) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);

    if (errorEl) errorEl.textContent = '';
    if (inputEl) inputEl.removeAttribute('aria-invalid');
}

export function clearAllErrors() {
    clearFieldError('amount');
    clearFieldError('category');
}


// --- Filtro de categorías (resumen.html) ---

export function populateCategoryFilter(categories) {
    const select = document.getElementById('filter-category');
    if (!select) return;

    select.innerHTML = '<option value="all">Todas las categorías</option>';

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value       = cat;
        option.textContent = capitalizeFirst(cat);
        select.appendChild(option);
    });
}

// --- Utilidades privadas ---

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    }).format(amount);
}

function formatDate(isoDate) {
    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(isoDate));
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}