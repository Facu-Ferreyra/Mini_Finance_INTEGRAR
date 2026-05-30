/*import { getActiveAccount } from "./accounts";*/
import { getActiveUserId } from './accounts.js';

/*
// --- Claves de almacenamiento en localStorage ---
const STORAGE_KEY = 'mf-movements';
const GOALS_KEY = 'mf-goals';
*/

// OBTENCIÓN de KEY con namespace de USER ACCTIVO
// Si NO hay USER ACTIVO, usa la clave base sin prefijo
function key(base) {
    const uid = getActiveUserId();
    return uid ? base + '-' + uid : base;
}

function getCollection(base) {
    try {
        const data = localStorage.getItem(key(base));
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Corrupted localStorage data:', e);
        return [];
    }
}

function saveCollection(base, data) {
    localStorage.setItem(key(base), JSON.stringify(data));
}



/*
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
*/

// Movimientos
export function getMovements() {
    return getCollection('mf-movements');
}

export function saveMovement(movement) {
    const movements = getMovements();
    movements.push(movement);
    saveCollection('mf-movements', movements);
}


// Metas de ahorro
export function getGoals() {
    return getCollection('mf-goals');
}

export function saveGoal(goal) {
    const goals = getGoals();
    goal = { saved: 0, icon: 'target', description: '', completedAt: null, ...goal };
    goals.push(goal);
    saveCollection('mf-goals', goals);
}

export function deleteGoal(id) {
    const goals = getGoals();
    saveCollection('mf-goals', goals.filter(g => g.id !== id));
}

export function updateGoal(id, changes) {
    const goals = getGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) return;
    goals[index] = { ...goals[index], ...changes };
    saveCollection('mf-goals', goals);
}

export function getGoalById(id) {
    return getGoals().find(g => g.id === id) || null;
}

export function getMovementById(id) {
    return getMovements().find(m => m.id === id) || null;
}

export function updateMovement(id, changes) {
    const movements = getMovements();
    const index = movements.findIndex(m => m.id === id);
    if (index === -1) return false;
    movements[index] = { ...movements[index], ...changes };
    saveCollection('mf-movements', movements);
    return true;
}

export function deleteMovement(id) {
    const movements = getMovements();
    saveCollection('mf-movements', movements.filter(m => m.id !== id));
}
