import { calcBalance, calcIncome, calcExpenses, isBalanceCritical, isExpenseLimitExceeded, isGoalUnreached, getRecentMovements } from './finance.js';
import { getGoals } from './storage.js';

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

    const income  = calcIncome();
    const balance = calcBalance();

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

// --- Historial completo ---
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
                ${m.description ? `<small class="movement-description">${escapeHTML(m.description)}</small>` : ''}
            </td>
            <td class="${m.type === 'income' ? 'amount-income' : 'amount-expense'}">
                ${m.type === 'income' ? '+' : '-'}${formatCurrency(m.amount)}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Render del Listado de Metas ---
export function renderGoals(goals) {
    const container = document.getElementById('goals-list-container');
    if (!container) return;

    if (goals.length === 0) {
        container.innerHTML = '<p class="empty-state">No tenés metas financieras configuradas en este momento.</p>';
        return;
    }

    const balance = calcBalance(); // Asumo que esta función ya calcula el saldo general
    const priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' };

    container.innerHTML = goals.map(goal => {
        // Lógica matemática de la barra de progreso y faltantes
        const percentage = goal.amount > 0 ? Math.min((balance / goal.amount) * 100, 100) : 0;
        const remaining = Math.max(goal.amount - balance, 0);

        return `
            <article class="goal-card" data-id="${goal.id}">
                <div class="goal-card-main">
                    <div class="goal-info-body">
                        <div class="goal-title-wrapper">
                            <h3>${escapeHTML(goal.name)}</h3>
                            <span class="priority-badge ${goal.priority}">${priorityLabels[goal.priority]}</span>
                        </div>
                        <p class="goal-card-description">Fondo de ahorro personalizado controlado por tus balances.</p>
                        
                        <div class="goal-values-track">
                            <span class="current-saved">${formatCurrency(balance)}</span>
                            <span class="divider" aria-hidden="true">/</span>
                            <span class="target-total">${formatCurrency(goal.amount)}</span>
                        </div>

                        <div class="progress-bar-bg" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percentage.toFixed(0)}">
                            <div class="progress-fill ${goal.priority}" style="width: ${percentage.toFixed(1)}%;"></div>
                        </div>
                    </div>
                </div>

                <div class="goal-card-actions-panel">
                    <div class="goal-remaining-status">
                        ${remaining > 0 
                            ? `<span class="remaining-lbl">Faltan</span>
                               <span class="remaining-money">${formatCurrency(remaining)}</span>
                               <span class="remaining-lbl-sub">para cumplir el objetivo</span>`
                            : `<span class="status-achieved" style="color: #2ecc71; font-weight: bold; font-size: 0.95rem;">¡META ALCANZADA! 🎉</span>`
                        }
                    </div>
                    
                    <div class="action-buttons-stack">
                        <button type="button" class="btn-action-assign btn-add-funds">
                            <span class="btn-icon-span" aria-hidden="true">+</span> Asignar
                        </button>
                        <button type="button" class="btn-action-delete delete-goal-btn" data-id="${goal.id}">
                            <span class="btn-icon-span" aria-hidden="true">🗑️</span> Eliminar
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

// --- Alertas ---
export function renderAlerts() {
    const container = document.getElementById('alerts-container');
    if (!container) return;

    container.innerHTML = '';

    if (isBalanceCritical()) {
        container.appendChild(createAlert('Tu balance es negativo. Revisá tus gastos.', 'error'));
    } else if (isExpenseLimitExceeded()) {
        container.appendChild(createAlert('Has superado el 80% de tu límite de gastos previsto.', 'warning'));
    }

    if (isGoalUnreached()) {
        const goals = getGoals();
        const balance = calcBalance();
        const unreached = goals.find(g => g.amount > 0 && balance < g.amount);
        if (unreached) {
            const remaining = unreached.amount - balance;
            container.appendChild(
                createAlert(`Te faltan ${formatCurrency(remaining)} para alcanzar tu meta "${unreached.name}".`, 'warning')
            );
        }
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
    const inputEl = document.getElementById(fieldId) || document.getElementById(`${fieldId}-input`);

    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
}

export function clearFieldError(fieldId) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId) || document.getElementById(`${fieldId}-input`);

    if (errorEl) errorEl.textContent = '';
    if (inputEl) inputEl.removeAttribute('aria-invalid');
}

export function clearAllErrors() {
    clearFieldError('amount');
    clearFieldError('category');
    clearFieldError('goal-name');
    clearFieldError('goal-amount');
}

// --- Filtro de categorías ---
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

// --- Utilidades ---
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
    }).format(new Date(isoDate + 'T00:00:00'));
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}