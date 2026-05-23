// depende de storage.hs para leer los datos

import { getMovements } from './storage.js';

export function calcIncome() {
    const movements = getMovements();
    return movements
        .filter(m => m.type === 'income')
        .reduce((total, m) => total + m.amount, 0);
}

export function calcExpenses() {
    const movements = getMovements();
    return movements
        .filter(m => m.type === 'expense')
        .reduce((total, m) => total + m.amount, 0);
}

export function calcBalance() {
    return calcIncome() - calcExpenses();
}

export function calcSavingsProgress(goal) {
    const balance = calcBalance();
    if (goal <= 0) return 0;
    const percentage = (balance / goal) * 100;
    return Math.min(percentage, 100);
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
    const movements = getMovements();
    return movements.slice(-count).reverse();
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