import { isLoggedIn } from '../core/accounts.js';
import { initDashboard } from './dashboard.js';
import { initResumen } from './resumen.js';

export function handleRouting() {
    const page = document.body.dataset.page;

    if ((page === 'dashboard' || page === 'resumen') && !isLoggedIn()) {
        window.location.replace('../index.html');
        return;
    }
    if (page === 'dashboard') initDashboard();
    if (page === 'resumen')   initResumen();
}
