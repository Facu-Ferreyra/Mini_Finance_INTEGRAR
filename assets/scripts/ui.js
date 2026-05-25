import { calcBalance, calcIncome, calcExpenses, isBalanceCritical, isExpenseLimitExceeded, isGoalUnreached, getRecentMovements, getGoalProgress, getGoalsSummary, getActiveGoals, getCompletedGoals } from './finance.js';
import { getGoals, deleteGoal } from './storage.js';

const GOAL_ICONS = {
    plane: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
    laptop: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="21" x2="22" y2="21"/></svg>',
    shield: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    piggy: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.4-1 1.4-1.8"/><path d="M21 9c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1z"/></svg>',
    car: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>',
    education: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 11h6"/><path d="M9 7h6"/><path d="M9 15h4"/></svg>',
    home: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    target: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'
};

export function renderMetrics() {
    const balance = document.getElementById('balance-total');
    const income = document.getElementById('income-total');
    const expense = document.getElementById('expense-total');
    if (balance) balance.textContent = formatCurrency(calcBalance());
    if (income) income.textContent = formatCurrency(calcIncome());
    if (expense) expense.textContent = formatCurrency(calcExpenses());
}

export function renderSavingsRate() {
    const el = document.getElementById('savings-rate');
    if (!el) return;
    const income = calcIncome();
    const balance = calcBalance();
    if (income <= 0 || balance <= 0) { el.textContent = '0%'; return; }
    el.textContent = ((balance / income) * 100).toFixed(1) + '%';
}

export function renderRecentMovements() {
    const list = document.getElementById('recent-list');
    if (!list) return;
    const movements = getRecentMovements(5);
    list.innerHTML = '';
    if (movements.length === 0) {
        list.innerHTML = '<li class=\"empty-state\">No hay movimientos aun.</li>';
        return;
    }
    movements.forEach(function(m) {
        var li = document.createElement('li');
        li.classList.add('movement-item', m.type === 'income' ? 'movement-income' : 'movement-expense');
        li.innerHTML = '<span class=\"movement-category\">' + escapeHTML(capitalizeFirst(m.category)) + '</span>'
            + '<span class=\"movement-amount\">' + (m.type === 'income' ? '+' : '-') + formatCurrency(m.amount) + '</span>'
            + '<time class=\"movement-date\" datetime=\"' + m.date + '\">' + formatDate(m.date) + '</time>';
        list.appendChild(li);
    });
}

export function renderHistory(movements) {
    const tbody = document.getElementById('history-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (movements.length === 0) {
        tbody.innerHTML = '<tr><td colspan=\"4\" class=\"empty-state\">No hay movimientos para esta categoria.</td></tr>';
        return;
    }
    movements.forEach(function(m) {
        var tr = document.createElement('tr');
        var typeLabel = m.type === 'income' ? 'Ingreso' : 'Gasto';
        var typeClass = m.type === 'income' ? 'income' : 'expense';
        var descHtml = m.description ? '<small class=\"movement-description\">' + escapeHTML(m.description) + '</small>' : '';
        tr.innerHTML = '<td><time datetime=\"' + m.date + '\">' + formatDate(m.date) + '</time></td>'
            + '<td><span class=\"type-badge ' + typeClass + '\">' + typeLabel + '</span></td>'
            + '<td>' + escapeHTML(capitalizeFirst(m.category)) + descHtml + '</td>'
            + '<td class=\"' + (m.type === 'income' ? 'amount-income' : 'amount-expense') + '\">'
            + (m.type === 'income' ? '+' : '-') + formatCurrency(m.amount) + '</td>';
        tbody.appendChild(tr);
    });
}

export function renderGoalsHeader() {
    const headerEl = document.getElementById('goals-header-info');
    if (!headerEl) return;
    var summary = getGoalsSummary();
    var targetSvg = '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/></svg>';
    var moneySvg = '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 1v22\"/><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/></svg>';
    var chartSvg = '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 12h-4l-3 9L9 3l-3 9H2\"/></svg>';
    headerEl.innerHTML = '<div class=\"goals-count-badge\">' + targetSvg + '<span>' + summary.active + ' metas activas</span></div>'
        + '<div class=\"goals-count-badge\">' + moneySvg + '<span>' + formatCurrency(summary.totalAssigned) + ' Asignado</span></div>'
        + '<div class=\"goals-count-badge\">' + chartSvg + '<span>' + summary.avgProgress.toFixed(0) + '% Progreso promedio</span></div>';
}

export function renderPriorityLegend() {
    const legendEl = document.getElementById('priority-legend');
    if (!legendEl) return;
    legendEl.innerHTML = '<p class=\"legend-title\">Leyenda de Prioridades</p>'
        + '<div class=\"legend-items\">'
        + '<span class=\"legend-item\"><span class=\"priority-dot high\"></span> Alta prioridad</span>'
        + '<span class=\"legend-item\"><span class=\"priority-dot medium\"></span> Media prioridad</span>'
        + '<span class=\"legend-item\"><span class=\"priority-dot low\"></span> Baja prioridad</span>'
        + '</div>';
}

export function renderGoalsFooterBanner() {
    const bannerEl = document.getElementById('goals-footer-banner');
    if (!bannerEl) return;
    bannerEl.innerHTML = '<div class=\"banner-info-icon\" aria-hidden=\"true\">'
        + '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"/><line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"/></svg></div>'
        + '<div class=\"banner-content-text\"><strong>Asigna fondos desde tu balance</strong><p>Usa el boton + para asignar dinero a cada meta. Esto reducira tu balance actual y aumentara el progreso de la meta seleccionada.</p></div>'
        + '<div class=\"banner-decorations\" aria-hidden=\"true\">'
        + '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/></svg>'
        + '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 1v22\"/><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/></svg>'
        + '</div>';
}

export function renderGoalsFilterToggle() {
    var container = document.getElementById('goals-filter-toggle');
    if (!container) return;

    var showingCompleted = window._goalsShowCompleted || false;

    container.innerHTML = '<button type="button" id="goals-filter-btn" class="btn-filter-toggle">'
        + '<span class="btn-icon-span">'
        + (showingCompleted
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>')
        + '</span> '
        + (showingCompleted ? 'Ver activas' : 'Ver completadas')
        + '</button>';
}

export function renderGoals(goals) {
    var container = document.getElementById('goals-list-container');
    if (!container) return;

    var showingCompleted = window._goalsShowCompleted || false;

    if (goals.length === 0) {
        container.innerHTML = showingCompleted
            ? '<p class="empty-state">No hay metas completadas aun. Debes completar una para verla aqui.</p>'
            : '<p class="empty-state">No tenes metas financieras configuradas en este momento.</p>';
        return;
    }

    var priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' };

    container.innerHTML = goals.map(function(goal) {
        var progress = getGoalProgress(goal);
        var pct = progress.percentage;
        var saved = progress.saved;
        var target = progress.target;
        var iconHtml = GOAL_ICONS[goal.icon] || GOAL_ICONS.target;
        var priorityLabel = priorityLabels[goal.priority] || goal.priority;

        if (showingCompleted) {
            var doneDate = goal.completedAt ? formatDate(goal.completedAt) : '—';
            return '<article class="goal-card completed-card" data-id="' + goal.id + '">'
                + '<div class="goal-card-main">'
                + '<div class="goal-icon-avatar completed-icon" aria-hidden="true">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
                + '</div>'
                + '<div class="goal-info-body">'
                + '<div class="goal-title-wrapper">'
                + '<h3>' + escapeHTML(goal.name) + '</h3>'
                + '<span class="priority-badge completed" style="background: rgba(16,185,129,0.15); color: var(--color-success);">Completada</span>'
                + '</div>'
                + '<p class="goal-card-description">' + (goal.description ? escapeHTML(goal.description) : '') + '</p>'
                + '<div class="completed-date-row">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
                + '<span>Completada el ' + doneDate + '</span>'
                + '</div>'
                + '</div>'
                + '</div>'
                + '<div class="goal-card-actions-panel">'
                + '<div class="goal-remaining-status">'
                + '<span class="status-achieved" style="color: var(--color-success); font-weight: 700;">'
                + formatCurrency(target) + ' alcanzados'
                + '</span>'
                + '</div>'
                + '<div class="action-buttons-stack">'
                + '<button type="button" class="btn-action-delete delete-goal-btn" data-id="' + goal.id + '" data-action="delete">'
                + '<span class="btn-icon-span"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></span> Eliminar'
                + '</button>'
                + '</div>'
                + '</div>'
                + '</article>';
        }

        var remaining = progress.remaining;
        var remainingHtml = remaining > 0
            ? '<span class="remaining-lbl">Faltan</span><span class="remaining-money">' + formatCurrency(remaining) + '</span><span class="remaining-lbl-sub">para completar tu objetivo</span>'
            : '<span class="status-achieved" style="color: #2ecc71; font-weight: bold; font-size: 0.95rem;">META ALCANZADA!</span>';

        return '<article class="goal-card ' + (goal.priority || 'medium') + '" data-id="' + goal.id + '">'
            + '<div class="goal-card-main">'
            + '<div class="goal-icon-avatar ' + goal.priority + '-icon" aria-hidden="true">' + iconHtml + '</div>'
            + '<div class="goal-info-body">'
            + '<div class="goal-title-wrapper">'
            + '<h3>' + escapeHTML(goal.name) + '</h3>'
            + '<span class="priority-badge ' + goal.priority + '">' + priorityLabel + '</span>'
            + '</div>'
            + '<p class="goal-card-description">' + (goal.description ? escapeHTML(goal.description) : 'Fondo de ahorro personalizado controlado por tus balances.') + '</p>'
            + '<div class="progress-row">'
            + '<div class="progress-bar-bg"><div class="progress-fill ' + (goal.priority || 'medium') + '" style="width: ' + pct.toFixed(1) + '%;"></div></div>'
            + '<span class="percentage-text">' + pct.toFixed(0) + '%</span>'
            + '</div>'
            + '<div class="goal-values-track">'
            + '<span class="current-saved">' + formatCurrency(saved) + '</span>'
            + '<span class="divider">/</span>'
            + '<span class="target-total">' + formatCurrency(target) + '</span>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="goal-card-actions-panel">'
            + '<div class="goal-remaining-status">' + remainingHtml + '</div>'
            + '<div class="action-buttons-stack">'
            + '<button type="button" class="btn-action-assign" data-id="' + goal.id + '" data-action="assign">'
            + '<span class="btn-icon-span"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span> Asignar'
            + '</button>'
            + '<button type="button" class="btn-action-delete delete-goal-btn" data-id="' + goal.id + '" data-action="delete">'
            + '<span class="btn-icon-span"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></span> Eliminar'
            + '</button>'
            + '</div>'
            + '</div>'
            + '</article>';
    }).join('');
}

export function renderAlerts() {
    const container = document.getElementById('alerts-container');
    if (!container) return;
    container.innerHTML = '';
    if (isBalanceCritical()) {
        container.appendChild(createAlert('Tu balance es negativo. Revisa tus gastos.', 'error'));
    } else if (isExpenseLimitExceeded()) {
        container.appendChild(createAlert('Has superado el 80% de tu limite de gastos previsto.', 'warning'));
    }
    if (isGoalUnreached()) {
        var goals = getGoals();
        var balance = calcBalance();
        var unreached = goals.find(function(g) { return g.amount > 0 && balance < g.amount; });
        if (unreached) {
            container.appendChild(createAlert('Te faltan ' + formatCurrency(unreached.amount - balance) + ' para alcanzar tu meta "' + unreached.name + '".', 'warning'));
        }
    }
}

function createAlert(message, type) {
    var el = document.createElement('div');
    el.classList.add('alert', 'alert-' + type);
    el.setAttribute('role', 'alert');
    el.innerHTML = '<span aria-hidden="true">&#9888;</span> ' + escapeHTML(message);
    return el;
}

export function showFieldError(fieldId, message) {
    var errorEl = document.getElementById(fieldId + '-error');
    var inputEl = document.getElementById(fieldId) || document.getElementById(fieldId + '-input');
    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
}

export function clearFieldError(fieldId) {
    var errorEl = document.getElementById(fieldId + '-error');
    var inputEl = document.getElementById(fieldId) || document.getElementById(fieldId + '-input');
    if (errorEl) errorEl.textContent = '';
    if (inputEl) inputEl.removeAttribute('aria-invalid');
}

export function clearAllErrors() {
    clearFieldError('amount');
    clearFieldError('category');
    clearFieldError('goal-name');
    clearFieldError('goal-amount');
}

export function populateCategoryFilter(categories) {
    var select = document.getElementById('filter-category');
    if (!select) return;
    select.innerHTML = '<option value="all">Todas las categorias</option>';
    categories.forEach(function(cat) {
        var opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = capitalizeFirst(cat);
        select.appendChild(opt);
    });
}

export function openAssignModal(goal) {
    var modal = document.getElementById('assign-modal');
    if (!modal) return;
    modal.dataset.goalId = goal.id;
    document.getElementById('assign-goal-name').textContent = goal.name;
    document.getElementById('assign-balance').textContent = formatCurrency(calcBalance());
    document.getElementById('assign-amount').value = '';
    document.getElementById('assign-error').textContent = '';
    modal.classList.add('open');
}

export function closeAssignModal() {
    var modal = document.getElementById('assign-modal');
    if (!modal) return;
    modal.classList.remove('open');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(amount);
}

function formatDate(isoDate) {
    return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(isoDate + 'T00:00:00'));
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export { formatCurrency, formatDate, capitalizeFirst, escapeHTML };
