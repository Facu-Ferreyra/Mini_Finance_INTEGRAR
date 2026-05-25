import { getMovements, getGoals, updateGoal, saveMovement } from './storage.js';

// --- Calculo de ingresos totales ---
export function calcIncome() {
    return getMovements()
        .filter(m => m.type === 'income')
        .reduce((total, m) => total + m.amount, 0);
}

// --- Calculo de gastos totales ---
export function calcExpenses() {
    return getMovements()
        .filter(m => m.type === 'expense')
        .reduce((total, m) => total + m.amount, 0);
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
    return goals.some(goal => goal.amount > 0 && balance < goal.amount);
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
    const assignAmount = Math.min(amount, balance);
    if (assignAmount <= 0) return false;

    const newSaved = (goal.saved || 0) + assignAmount;
    var updates = { saved: newSaved };

    if (newSaved >= (goal.amount || 0) && !goal.completedAt) {
        updates.completedAt = new Date().toISOString().split('T')[0];
    }

    updateGoal(goalId, updates);

    saveMovement({
        id: Date.now() + 1,
        amount: assignAmount,
        category: 'ahorro',
        type: 'expense',
        description: 'Asignacion a meta: ' + goal.name,
        date: new Date().toISOString().split('T')[0]
    });

    return true;
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
