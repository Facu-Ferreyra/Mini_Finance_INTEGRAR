// no depende de nadie, solo habla con localStorage

const STORAGE_KEY = 'mf-movements';
const GOAL_KEY = 'mf-goal';

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


export function getGoal() {
    const data = localStorage.getItem(GOAL_KEY);
    return data ? JSON.parse(data) : { name: '', amount: 0 };
}

export function saveGoal(goal) {
    localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
}

export function deleteGoal() {
    localStorage.removeItem(GOAL_KEY);
}


