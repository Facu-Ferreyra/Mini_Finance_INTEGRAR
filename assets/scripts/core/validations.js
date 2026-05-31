// --- Validar campo monto ---
export function validateAmount(value) {
    const amount = parseFloat(value);

    if (value === '' || value === null || value === undefined) {
        return { valid: false, error: 'El monto no puede estar vacío.' };
    }
    if (isNaN(amount)) {
        return { valid: false, error: 'El monto debe ser un número.' };
    }
    if (amount <= 0) {
        return { valid: false, error: 'El monto debe ser mayor a cero.' };
    }
    return { valid: true, error: null };
}

// --- Validar categoria seleccionada ---
export function validateCategory(value) {
    const allowed = ['salario', 'ingreso-extra', 'otros-ingreso', 'vivienda', 'servicios', 'transporte', 'educacion', 'alimentos', 'delivery', 'indumentaria', 'otros-gasto', 'ahorro'];

    if (!value || value === '') {
        return { valid: false, error: 'Seleccioná una categoría.' };
    }
    if (!allowed.includes(value)) {
        return { valid: false, error: 'La categoría seleccionada no es válida.' };
    }
    return { valid: true, error: null };
}

// --- Validar formulario completo ---
export function validateForm(amount, category) {
    const amountResult = validateAmount(amount);
    const categoryResult = validateCategory(category);

    return {
        valid: amountResult.valid && categoryResult.valid,
        errors: {
            amount: amountResult.error,
            category: categoryResult.error
        }
    };
}