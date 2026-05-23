// no depende de nadie, solo habla con localStorage

const STORAGE_KEY = 'mf-movements';

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


