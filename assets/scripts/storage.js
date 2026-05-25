const STORAGE_KEY = 'mf-movements';
const GOALS_KEY = 'mf-goals';

export function getMovements() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveMovement(movement) {
    const movements = getMovements();
    movements.push(movement);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movements));
}

export function clearMovements() {
    localStorage.removeItem(STORAGE_KEY);
}

export function getGoals() {
    const data = localStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveGoal(goal) {
    const goals = getGoals();
    goal = { saved: 0, icon: 'target', description: '', completedAt: null, ...goal };
    goals.push(goal);
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function deleteGoal(id) {
    const goals = getGoals();
    const updatedGoals = goals.filter(g => g.id !== id);
    localStorage.setItem(GOALS_KEY, JSON.stringify(updatedGoals));
}

export function updateGoal(id, changes) {
    const goals = getGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) return;
    goals[index] = { ...goals[index], ...changes };
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function getGoalById(id) {
    return getGoals().find(g => g.id === id) || null;
}
