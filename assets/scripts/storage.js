// --- Claves de almacenamiento en localStorage ---
const STORAGE_KEY = 'mf-movements';
const GOALS_KEY = 'mf-goals';

function getCollection(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Corrupted localStorage data for key:', key, e);
        return [];
    }
}

function saveCollection(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// --- Movimientos ---
export function getMovements() {
    return getCollection(STORAGE_KEY);
}

export function saveMovement(movement) {
    const movements = getMovements();
    movements.push(movement);
    saveCollection(STORAGE_KEY, movements);
}

// --- Metas de ahorro ---
export function getGoals() {
    return getCollection(GOALS_KEY);
}

export function saveGoal(goal) {
    const goals = getGoals();
    goal = { saved: 0, icon: 'target', description: '', completedAt: null, ...goal };
    goals.push(goal);
    saveCollection(GOALS_KEY, goals);
}

export function deleteGoal(id) {
    const goals = getGoals();
    const updatedGoals = goals.filter(g => g.id !== id);
    saveCollection(GOALS_KEY, updatedGoals);
}

export function updateGoal(id, changes) {
    const goals = getGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) return;
    goals[index] = { ...goals[index], ...changes };
    saveCollection(GOALS_KEY, goals);
}

export function getGoalById(id) {
    return getGoals().find(g => g.id === id) || null;
}
