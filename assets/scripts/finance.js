import { getMovements, getGoals, updateGoal, saveMovement } from './storage.js';

export function calcIncome() {
    return getMovements()
        .filter(m => m.type === 'income')
        .reduce((total, m) => total + m.amount, 0);
}

export function calcExpenses() {
    return getMovements()
        .filter(m => m.type === 'expense')
        .reduce((total, m) => total + m.amount, 0);
}

export function calcBalance() {
    return calcIncome() - calcExpenses();
}

export function isBalanceCritical() {
    return calcBalance() < 0;
}

export function isExpenseLimitExceeded(limit = 0.8) {
    const income = calcIncome();
    const expenses = calcExpenses();
    if (income <= 0) return false;
    return expenses / income >= limit;
}

export function getRecentMovements(count = 5) {
    return getMovements().slice(-count).reverse();
}

export function getMovementsByCategory(category) {
    const movements = getMovements();
    if (category === 'all') return movements;
    return movements.filter(m => m.category === category);
}

export function getUniqueCategories() {
    const movements = getMovements();
    return [...new Set(movements.map(m => m.category))];
}

export function isGoalUnreached() {
    const goals = getGoals();
    const balance = calcBalance();
    return goals.some(goal => goal.amount > 0 && balance < goal.amount);
}

export function getGoalProgress(goal) {
    const saved = goal.saved || 0;
    const target = goal.amount || 0;
    const percentage = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
    const remaining = Math.max(target - saved, 0);
    return { percentage, remaining, saved, target };
}

export function assignFundsToGoal(goalId, amount) {
    const goals = getGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return false;

    const balance = calcBalance();
    const assignAmount = Math.min(amount, balance);
    if (assignAmount <= 0) return false;

    const newSaved = (goal.saved || 0) + assignAmount;
    updateGoal(goalId, { saved: newSaved });

    saveMovement({
        id: Date.now() + 1,
        amount: assignAmount,
        category: 'ahorro',
        type: 'expense',
        description: `Asignacion a meta: ${goal.name}`,
        date: new Date().toISOString().split('T')[0]
    });

    return true;
}

export function getGoalsSummary() {
    const goals = getGoals();
    const active = goals.length;
    const totalAssigned = goals.reduce((sum, g) => sum + (g.saved || 0), 0);
    const totalTarget = goals.reduce((sum, g) => sum + (g.amount || 0), 0);
    const avgProgress = totalTarget > 0
        ? Math.min((totalAssigned / totalTarget) * 100, 100)
        : 0;
    return { active, totalAssigned, avgProgress };
}
