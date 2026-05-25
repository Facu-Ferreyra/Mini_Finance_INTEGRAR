const STORAGE_KEY = 'mf-movements';
const GOALS_KEY = 'mf-goals'; // Cambiado a plural para evitar conflictos con datos viejos

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

// --- Ahora maneja un LISTADO de metas ---
export function getGoals() {
    const data = localStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveGoal(goal) {
    const goals = getGoals();
    goals.push(goal);
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function deleteGoal(id) {
    const goals = getGoals();
    const updatedGoals = goals.filter(g => g.id !== id);
    localStorage.setItem(GOALS_KEY, JSON.stringify(updatedGoals));
}