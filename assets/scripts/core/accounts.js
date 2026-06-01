// Gestión de cuentas de usuario con localStorage
// Gestión de cuentas de usuario con localStorage

const ACCOUNTS_KEY = 'mf-accounts';     
const SESSION_KEY = 'mf-active-account'; 

// OBTENER todas las cuentas
export function getAccounts() {
    try {
        const data = localStorage.getItem(ACCOUNTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

// GUARDAR lista de cuentas 
function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

// REGISTRAR nueva cuenta
// Retorno : { ok: true, account } o { ok: false, error: string }
export function registerAccount(username, password) {
    const name = username.trim();
    if (!name || name.length < 3) {
        return { ok: false, error: 'El nombre debe tener al menos 3 caracteres.' };
    }
    if (!password || password.length < 4) {
        return { ok: false, error: 'La contraseña debe tener al menos 4 caracteres.' };
    }

    const accounts = getAccounts();
    const exists = accounts.some(a => a.username.toLowerCase() === name.toLowerCase());
    if (exists) {
        return { ok: false, error: 'Ya existe una cuenta con ese nombre.' };
    }

    // guardado simple, sin hash (alcance académico)
    // guardado simple, sin hash (alcance académico)
    // guardado simple, sin hash (alcance académico)
    const account = {
        id: 'usr_' + Date.now(),
        username: name,
        password: password,   
        createdAt: new Date().toISOString().split('T')[0]
    };

    accounts.push(account);
    saveAccounts(accounts);
    return { ok: true, account };
}

// INICIO de sesión
// Retorno : { ok: true, account } o { ok: false, error: string }
export function loginAccount(username, password) {
    const name = username.trim();
    const accounts = getAccounts();
    const account = accounts.find(
        a => a.username.toLowerCase() === name.toLowerCase() && a.password === password
    );
    if (!account) {
        return { ok: false, error: 'Usuario o contraseña incorrectos.' };
    }
    localStorage.setItem(SESSION_KEY, account.id);
    return { ok: true, account };
}

//  CERRAR sesión
export function logoutAccount() {
    localStorage.removeItem(SESSION_KEY);
}

// GET cuenta activa (o null)
export function getActiveAccount() {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const accounts = getAccounts();
    return accounts.find(a => a.id === id) || null;
}

// VERIFICACIÓN : si hay sesión activa
export function isLoggedIn() {
    return getActiveAccount() !== null;
}

// OBTENER Id usuario activo : (para namespacing en storage)
export function getActiveUserId() {
    const account = getActiveAccount();
    return account ? account.id : null;
}

// ELIMINAR cuenta y todos sus datos
export function deleteAccount(accountId) {
    const accounts = getAccounts();
    const updated = accounts.filter(a => a.id !== accountId);
    saveAccounts(updated);
    // Limpiar datos propios de esa cuenta
    localStorage.removeItem('mf-movements-' + accountId);
    localStorage.removeItem('mf-goals-' + accountId);
    if (localStorage.getItem(SESSION_KEY) === accountId) {
        localStorage.removeItem(SESSION_KEY);
    }
}