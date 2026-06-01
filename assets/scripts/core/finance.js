import { getMovements, getGoals, updateGoal, saveMovement, generateId } from './storage.js';

function calcByType(type) {
    return getMovements()
        .filter(m => m.type === type)
        .reduce((total, m) => total + m.amount, 0);
}

// --- Calculo de ingresos totales ---
export function calcIncome() {
    return calcByType('income');
}

// --- Calculo de gastos totales ---
export function calcExpenses() {
    return calcByType('expense');
}

// --- Balance neto (ingresos - gastos) ---
export function calcBalance() {
    return calcIncome() - calcExpenses();
}

// --- Verificar si el balance es negativo ---
export function isBalanceCritical() {
    return calcBalance() < 0;
}

// --- Verificar si los gastos superan el 80% de los ingresos ---
export function isExpenseLimitExceeded(limit = 0.8) {
    const income = calcIncome();
    const expenses = calcExpenses();
    if (income <= 0) return false;
    return expenses / income >= limit;
}

// --- Obtener los ultimos N movimientos ---
export function getRecentMovements(count = 5) {
    return getMovements().slice(-count).reverse();
}

// --- Filtrar movimientos por categoria ---
export function getMovementsByCategory(category) {
    const movements = getMovements();
    if (category === 'all') return movements;
    return movements.filter(m => m.category === category);
}

// --- Obtener categorias unicas ---
export function getUniqueCategories() {
    const movements = getMovements();
    return [...new Set(movements.map(m => m.category))];
}

// --- Verificar si alguna meta no fue alcanzada ---
export function isGoalUnreached() {
    const goals = getGoals();
    const balance = calcBalance();
    return goals.some(goal => goal.amount > 0 && (goal.saved || 0) < goal.amount && balance < goal.amount);
}

// --- Progreso individual de una meta ---
export function getGoalProgress(goal) {
    if (!goal) return { percentage: 0, remaining: 0, saved: 0, target: 0 };
    const saved = goal.saved || 0;
    const target = goal.amount || 0;
    const percentage = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
    const remaining = Math.max(target - saved, 0);
    return { percentage, remaining, saved, target };
}

// --- Obtener metas activas (no completadas) ---
export function getActiveGoals() {
    return getGoals().filter(function(g) { return (g.saved || 0) < (g.amount || 0); });
}

// --- Obtener metas completadas ---
export function getCompletedGoals() {
    return getGoals().filter(function(g) { return (g.saved || 0) >= (g.amount || 0) && g.amount > 0; });
}

// --- Asignar fondos a una meta ---
export function assignFundsToGoal(goalId, amount) {
    const goals = getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return false;

    const balance = calcBalance();
    const remaining = Math.max((goal.amount || 0) - (goal.saved || 0), 0);
    const assignAmount = Math.min(amount, balance, remaining);
    if (assignAmount <= 0) return false;

    const newSaved = (goal.saved || 0) + assignAmount;
    const updates = { saved: newSaved };

    if (newSaved >= (goal.amount || 0) && !goal.completedAt) {
        updates.completedAt = new Date().toISOString().split('T')[0];
    }

    updateGoal(goalId, updates);

    saveMovement({
        id: generateId(),
        goalId,
        amount: assignAmount,
        category: 'ahorro',
        type: 'expense',
        description: 'Asignacion a meta: ' + goal.name,
        date: new Date().toISOString().split('T')[0]
    });

    return true;
}

// --- Calcular tendencia mensual para un tipo ---
function getMonthsCount(type) {
    const movements = getMovements().filter(function(m) { return m.type === type; });
    const months = new Set(movements.map(function(m) { return m.date.slice(0, 7); }));
    return months.size || 1;
}

export function calcAvgMonthlyIncome() {
    const count = getMonthsCount('income');
    return calcIncome() / count;
}

export function calcAvgMonthlyExpenses() {
    const count = getMonthsCount('expense');
    return calcExpenses() / count;
}

export function calcNetIncomeRate() {
    const income = calcIncome();
    if (income <= 0) return 0;
    return (calcBalance() / income) * 100;
}

export function calcIncomeShare() {
    const income = calcIncome();
    const expenses = calcExpenses();
    const total = income + expenses;
    if (total <= 0) return 0;
    return (income / total) * 100;
}

export function calcExpenseRate() {
    const income = calcIncome();
    if (income <= 0) return 0;
    return (calcExpenses() / income) * 100;
}

// --- Resumen de metas activas ---
export function getGoalsSummary() {
    const goals = getActiveGoals();
    const totalAssigned = goals.reduce(function(sum, g) { return sum + (g.saved || 0); }, 0);
    const totalTarget = goals.reduce(function(sum, g) { return sum + (g.amount || 0); }, 0);
    const active = goals.length;
    const avgProgress = totalTarget > 0
        ? Math.min((totalAssigned / totalTarget) * 100, 100)
        : 0;
    return { active, totalAssigned, avgProgress };
}
