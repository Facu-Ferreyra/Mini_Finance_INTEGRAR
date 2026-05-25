import { getMovements, getGoals } from './storage.js';

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

export function calcSavingsProgress(goalAmount) {
    const balance = calcBalance();
    if (goalAmount <= 0) return 0;
    return Math.min((balance / goalAmount) * 100, 100);
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

// Verifica si hay alguna meta pendiente en la lista
export function isGoalUnreached() {
    const goals = getGoals();
    const balance = calcBalance();
    return goals.some(goal => goal.amount > 0 && balance < goal.amount);
}