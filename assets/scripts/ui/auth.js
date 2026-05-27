
import { registerAccount, loginAccount, logoutAccount, getActiveAccount, isLoggedIn, getAccounts, deleteAccount } from '../core/accounts.js';

// Inicializar sistema de autenticación
export function initAuth() {
    const overlay       = document.getElementById('auth-overlay');
    const heroCta       = document.getElementById('hero-cta');
    const navDashboard  = document.getElementById('nav-dashboard-item');

    const navUsername   = document.getElementById('nav-username');
    const navAccountBtn = document.getElementById('nav-account-btn');
    const accountMenu   = document.getElementById('account-menu');
    const accountMenuUsername = document.getElementById('account-menu-username');
    const logoutBtn     = document.getElementById('logout-btn');

    if (!overlay) return;

    function openAuthOverlay() {
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        // Foco al primer input visible para accesibilidad
        const firstInput = overlay.querySelector('input:not([hidden])');
        if (firstInput) setTimeout(function() { firstInput.focus(); }, 50);
    }

    function closeAuthOverlay() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
    }

    // ACTUALIZAR UI según estado de sesión 
    function refreshAuthUI() {
        const account = getActiveAccount();

        if (account) {
            // Sesión activa: ocultar overlay si estaba abierto, mostrar nav
            closeAuthOverlay();
            navDashboard.removeAttribute('hidden');
            
            navUsername.textContent = account.username;
            if (accountMenuUsername) accountMenuUsername.textContent = account.username;
            heroCta.textContent = 'Ir al Dashboard →';
            heroCta.onclick = function() { window.location.href = 'pages/dashboard.html'; };
        } else {
            // Sin sesión: ocultar nav de cuenta/dashboard, ajustar CTA
            // El overlay NO se abre automáticamente
            navDashboard.setAttribute('hidden', '');
            navUsername.textContent = '';
            heroCta.textContent = 'Comenzá GRATIS →';
            heroCta.onclick = function() { openAuthOverlay(); };
        }

        renderAccountsList();
    }

    // Render lista de cuentas guardadas
    function renderAccountsList() {
        const list = document.getElementById('accounts-list');
        const section = document.getElementById('accounts-list-section');
        if (!list || !section) return;

        const accounts = getAccounts();

        if (accounts.length === 0) {
            section.setAttribute('hidden', '');
            return;
        }

        section.removeAttribute('hidden');
        list.innerHTML = '';

        accounts.forEach(function(acc) {
            const li = document.createElement('li');
            li.classList.add('account-item');
            li.innerHTML =
                '<button type="button" class="account-item-btn" data-id="' + acc.id + '">'
                + '<span class="account-avatar" aria-hidden="true">' + acc.username.charAt(0).toUpperCase() + '</span>'
                + '<span class="account-item-name">' + escapeHTML(acc.username) + '</span>'
                + '<span class="account-item-date">Desde ' + acc.createdAt + '</span>'
                + '</button>'
                + '<button type="button" class="account-item-delete" data-id="' + acc.id + '" aria-label="Eliminar cuenta ' + escapeHTML(acc.username) + '">'
                + '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
                + '</button>';
            list.appendChild(li);
        });

        // --------------- Listener de evento ------------------
        // Click en cuenta: pre-rellenar el username en el login
        list.addEventListener('click', function(e) {
            const loginBtn = e.target.closest('.account-item-btn');
            const deleteBtn = e.target.closest('.account-item-delete');

            if (loginBtn) {
                const usernameInput = document.getElementById('login-username');
                if (usernameInput) {
                    usernameInput.value = loginBtn.querySelector('.account-item-name').textContent;
                    document.getElementById('login-password')?.focus();
                }
            }

            if (deleteBtn) {
                const accId = deleteBtn.dataset.id;
                const accName = deleteBtn.closest('li').querySelector('.account-item-name')?.textContent || 'esta cuenta';
                showConfirmDelete(accId, accName);
            }
        });
    }

    // Confirm delete mini-UI (DOM, sin alert())
    function showConfirmDelete(accId, accName) {
        const existing = document.getElementById('auth-confirm-delete');
        if (existing) existing.remove();

        const panel = document.createElement('aside');
        panel.id = 'auth-confirm-delete';
        panel.classList.add('auth-confirm-delete');
        panel.setAttribute('role', 'alert');
        panel.innerHTML =
            '<p>¿Desea ELIMINAR la cuenta <strong>' + escapeHTML(accName) + '</strong> y TODOS sus datos?</p>'
            + '<nav class="auth-confirm-actions">'
            + '<button type="button" id="auth-delete-yes" class="btn-danger">Sí, ELIMINAR.</button>'
            + '<button type="button" id="auth-delete-no" class="btn-secondary">Cancelar</button>'
            + '</nav>';

        const section = document.getElementById('accounts-list-section');
        if (section) section.appendChild(panel);

        document.getElementById('auth-delete-yes').addEventListener('click', function() {
            deleteAccount(accId);
            panel.remove();
            refreshAuthUI();
        });
        document.getElementById('auth-delete-no').addEventListener('click', function() {
            panel.remove();
        });
    }

    // Tabs login / registro
    const tabs = document.querySelectorAll('.auth-tab');
    const loginPanel    = document.getElementById('auth-login');
    const registerPanel = document.getElementById('auth-register');

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            tabs.forEach(function(t) {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            clearAuthErrors();

            if (tab.dataset.tab === 'login') {
                loginPanel.removeAttribute('hidden');
                registerPanel.setAttribute('hidden', '');
            } else {
                loginPanel.setAttribute('hidden', '');
                registerPanel.removeAttribute('hidden');
            }
        });
    });

    // Helpers de errores
    // Posible abstracción a otra clase helper.
    function setError(id, msg) {
        const el = document.getElementById(id);
        if (el) el.textContent = msg || '';
    }

    function clearAuthErrors() {
        ['login-username-error', 'login-password-error', 'login-general-error',
         'register-username-error', 'register-password-error', 'register-password2-error', 'register-general-error']
            .forEach(function(id) { setError(id, ''); });
    }

    // Formulario de Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            clearAuthErrors();

            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;

            let hasError = false;
            if (!username) { setError('login-username-error', 'Ingresá tu usuario.'); hasError = true; }
            if (!password) { setError('login-password-error', 'Ingresá tu contraseña.'); hasError = true; }
            if (hasError) return;

            const result = loginAccount(username, password);
            if (!result.ok) {
                setError('login-general-error', result.error);
                return;
            }

            refreshAuthUI();
        });
    }

    // Form de Registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            clearAuthErrors();

            const username  = document.getElementById('register-username').value.trim();
            const password  = document.getElementById('register-password').value;
            const password2 = document.getElementById('register-password2').value;

            let hasError = false;
            if (!username || username.length < 3) { setError('register-username-error', 'Mínimo 3 caracteres.'); hasError = true; }
            if (!password || password.length < 4)  { setError('register-password-error', 'Mínimo 4 caracteres.'); hasError = true; }
            if (password !== password2)             { setError('register-password2-error', 'Las contraseñas no coinciden.'); hasError = true; }
            if (hasError) return;

            const result = registerAccount(username, password);
            if (!result.ok) {
                setError('register-general-error', result.error);
                return;
            }

            // Loguear automáticamente al registrarse
            loginAccount(username, password);
            refreshAuthUI();
        });
    }

    // Botón de cuenta en navbar (dropdown)
    if (navAccountBtn && accountMenu) {
        navAccountBtn.addEventListener('click', function() {
            const account = getActiveAccount();

            if (!account) {
                // Sin sesión: abrir el overlay de login
                openAuthOverlay();
                return;
            }

            // Con sesión: toggle del dropdown
            const hidden = accountMenu.hasAttribute('hidden');
            if (hidden) {
                accountMenu.removeAttribute('hidden');
                navAccountBtn.setAttribute('aria-expanded', 'true');
            } else {
                accountMenu.setAttribute('hidden', '');
                navAccountBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Cerrar dropdown al clickear fuera
        document.addEventListener('click', function(e) {
            if (navAccountBtn && accountMenu &&
                !navAccountBtn.contains(e.target) &&
                !accountMenu.contains(e.target)) {
                accountMenu.setAttribute('hidden', '');
                navAccountBtn.setAttribute('aria-expanded', 'false');
            }
        });

    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logoutAccount();
            accountMenu.setAttribute('hidden', '');
            navAccountBtn.setAttribute('aria-expanded', 'false');
            refreshAuthUI();
        });
    }

    // Inicializar estado
    refreshAuthUI();
    
    // Cerrar overlay al hacer click fuera de la card
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeAuthOverlay();
        }
    });
}

// Escape HTML básico
function escapeHTML(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}