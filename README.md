# Mini Finance

Simulador de presupuesto personal para registrar ingresos, gastos y metas de ahorro.

## Integrantes

- Facundo Ferreyra
- Matias Sousa
- Micaela Scarfone

## Idea elegida

**Mini Finance** — Idea 5 del proyecto integrador. Simulador de presupuesto personal que permite registrar ingresos y gastos, visualizar el balance en tiempo real, y gestionar metas de ahorro con alertas visuales.

## Tecnologías utilizadas

- HTML5 semántico
- CSS3 (Flexbox, Grid, Media Queries, animaciones, variables)
- JavaScript vanilla (ES Modules)
- localStorage para persistencia de datos
- Git / GitHub (ramas `main` y `develop`)

## Funcionalidades principales

- Registro de ingresos y gastos con categorización dinámica
- Cálculo de saldo disponible, porcentaje de ahorro y tendencias
- Gestión de metas de ahorro con asignación de fondos desde el balance
- Filtro y ordenamiento del historial completo de movimientos
- Alertas visuales al superar límites de gasto o no alcanzar metas
- Persistencia de cuentas, movimientos y metas en localStorage
- Autenticación local con múltiples cuentas guardadas
- Cambio de tema claro/oscuro
- Diseño responsive mobile-first con menú adaptable

## Links

- Repositorio: https://github.com/Facu-Ferreyra/Mini_Finance_INTEGRAR
- Deploy: *pendiente*

## Instrucciones de uso

1. Ingresar al sitio y crear una cuenta o iniciar sesión con una existente.
2. En el **Dashboard**, registrar ingresos y gastos mediante el formulario. Seleccionar el tipo (ingreso/gasto), la categoría correspondiente y el monto.
3. Visualizar el balance neto, las métricas y la actividad reciente en la misma pantalla.
4. En la sección **Resumen**, crear metas de ahorro estableciendo nombre, monto objetivo y prioridad.
5. Asignar fondos del balance disponible a cada meta usando el botón `+`.
6. Usar el filtro por categoría y los ordenadores de fecha/monto para explorar el historial completo.

## Estructura del proyecto

```
index.html                 ← Landing page con hero, carrusel de pasos y FAQ
pages/
  dashboard.html           ← Panel principal con formulario y métricas
  resumen.html             ← Metas de ahorro e historial completo
assets/
  src/                     ← CSS organizado en capas (reset, variables, layout, components, pages, responsive)
  scripts/                 ← JavaScript modular
    core/                  ← Lógica de negocio (cuentas, finanzas, storage, validaciones)
    routing/               ← Inicializadores por página (dashboard, resumen)
    ui/                    ← Componentes de UI (auth, navbar, carrusel, transiciones)
  img/                     ← Imágenes e iconos
```

## Uso de IA

Este proyecto utilizó herramientas de IA como apoyo durante el desarrollo. Ver el informe completo de uso de IA en `IA_REPORT.md`.
