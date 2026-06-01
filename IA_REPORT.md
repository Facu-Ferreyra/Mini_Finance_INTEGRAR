# Informe de uso de Inteligencia Artificial

## Mini Finance — Proyecto Integrador

---

### 1. ¿Qué herramientas de IA utilizaron?

Se utilizaron dos herramientas de IA en distintas etapas del proyecto:

- **opencode** (modelo **DeepSeek V4 Flash**): utilizado en las primeras etapas para refactorización,
  generación de README y correcciones iniciales de accesibilidad.
- **Claude Code** (modelo **Claude Sonnet 4.6**, Anthropic): utilizado en las etapas finales para
  auditoría QA de responsive, parches de seguridad, corrección de bugs de capa CSS (`@layer`),
  animaciones de transición y auditoría completa de accesibilidad WCAG.

Ambas herramientas son agentes CLI que operan directamente sobre el sistema de archivos y el repositorio.
No se utilizaron herramientas web como ChatGPT, GitHub Copilot ni asistentes visuales.

---

### 2. ¿Para qué las utilizaron?

La IA se utilizó como herramienta de apoyo en las siguientes áreas:

- Refactorización de código JavaScript (reemplazo de `var` por `const`/`let`)
- Mejoras de UI/UX compacta (badges, cards, métricas)
- Corrección de bugs de layout responsive y `@layer` en CSS
- Auditoría completa de accesibilidad WCAG y aplicación de 16 correcciones
- Generación de `README.md` completo
- Corrección de errores en handlers de eventos y modales
- Implementación de focus trap en modales y formularios
- Auditoría QA de responsive en 3 viewports (320px, 768px, 1200px) con reporte estructurado
- Corrección de arquitectura CSS con `@layer` (cascade vs especificidad de selectores)
- Parches de seguridad: whitelist `safePriority()` contra inyección de clases CSS
- Corrección de null crashes en modales y backfill de campo `completedAt` en metas
- Animaciones de transición de página desde elementos no-`<a>` con `navigateTo()`
- Navbar convertido de `sticky` a `position:fixed` con variable CSS `--navbar-h`
- Auditoría completa de accesibilidad WCAG: focus trap en 6 modales, roles ARIA,
  `prefers-reduced-motion`, navegación por teclado y `aria-hidden` en decorativos

---

### 3. ¿Qué partes del proyecto fueron asistidas por IA?

| Archivo | Asistencia |
|---------|-----------|
| `assets/src/components/responsive.css` | Corrección de arquitectura mobile-first, punto y coma faltante, bloques duplicados, orden de `@layer` |
| `assets/src/components/forms.css` | Fix de `outline: none` → `outline: 2px solid` en `input:focus` |
| `assets/src/components/hero.css` | Fix de selector `prefers-reduced-motion` |
| `assets/src/components/modals.css` | Animación condicional en `prefers-reduced-motion: reduce` |
| `assets/src/components/carousel.css` | Transición condicional en `prefers-reduced-motion: reduce` |
| `assets/src/components/history.css` | Estilo `:focus-visible` en `<th>` ordenable |
| `assets/src/main.css` | `scroll-behavior: smooth` condicional |
| `assets/scripts/routing/dashboard.js` | Fix de handler Escape: eliminadas llamadas a funciones no importadas |
| `assets/scripts/routing/resumen.js` | Handler global de tecla Escape para cerrar modales |
| `assets/scripts/ui/ui.js` | Focus trap en 6 modales (setup/teardown + restauración de `activeElement`) |
| `assets/scripts/ui/auth.js` | Focus trap + Escape handler + restauración de foco en `#auth-overlay` |
| `index.html` | Roles ARIA (`tablist`, `tab`, `tabpanel`, `region`, `button`), `aria-hidden` en emojis decorativos |
| `pages/dashboard.html` | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` en modal de eliminar movimiento |
| `pages/resumen.html` | `aria-labelledby` en modal de confirmación |
| `README.md` | Generación completa con estructura, funcionalidades, integrantes y referencias |
| `assets/scripts/ui/transition.js`          | Función `navigateTo()` para transición desde botones no-link |
| `assets/scripts/ui/auth.js`                | Import de `navigateTo`; hero CTA wired a animación de salida |
| `assets/scripts/ui/ui.js`                  | `safePriority()` whitelist anti-inyección CSS; focus trap en 6 modales |
| `assets/scripts/core/storage.js`           | Extracción de `generateId()` — eliminación de `Date.now()+1` |
| `assets/scripts/core/validations.js`       | Categoría `ahorro` agregada a whitelist de validaciones |
| `assets/scripts/routing/resumen.js`        | Fix `filterSelect` ReferenceError; backfill `completedAt` en metas |
| `assets/scripts/routing/dashboard.js`      | Fix handler Escape: eliminadas llamadas a funciones no importadas |
| `assets/src/base/variables.css`            | Variable `--navbar-h: 4.5rem` para altura del navbar fijo |
| `assets/src/components/navbar.css`         | `position: fixed` en `header.main-navbar`; `z-index: 100` |
| `assets/src/layout/layout.css`             | `grid-template-rows: 1fr auto`; `padding-top: var(--navbar-h)` |
| `assets/src/main.css`                      | `scroll-padding-top: var(--navbar-h)` para anchor links correctos |
| `assets/src/components/auth.css`           | `account-menu` usa `--navbar-h` en lugar de `72px` hardcoded |
| `assets/src/responsive.css`                | Fix `main.main-home` override de capa; restore benefits-list grid; fix dropdown width |
| `assets/src/components/landing-extras.css` | `mobile-bottom-nav` con `space-evenly` y `flex: 1` en items |

---

### 4. ¿Qué prompts o consultas les resultaron más útiles?

Los prompts más efectivos fueron aquellos que pedían tareas concretas y delimitadas:

- *"Audit this HTML file for WCAG accessibility issues and list them by priority"*
- *"Find and fix the bug in the Escape key handler for modals"*
- *"Check the responsive layout — is this truly mobile-first?"*
- *"Review AGENTS.md and verify it matches the actual project structure"*
- *"Generate a complete README.md for a student project with these features"*
- *"Implement focus trap for all modals without external libraries"*
- *"Actúa como un QA Engineer experto. Evalúa la adaptabilidad del proyecto en viewports de
  escritorio, tablet (768px) y móvil (320px-420px). Identifica fallas en el menú hamburguesa,
  desbordamiento horizontal, fuentes ilegibles e imágenes rotas."*
- *"El navbar debe aparecer fijo más allá de que el usuario esté scrolleando"*
- *"Caso de prueba: Cuando el usuarrio inicia sesión, el botón 'Ir al Dashboard' debe hacer la animación de transición. Evalúa esta experiencia y resalta errores principales"*
- *"Audit this code for CSS class injection and null crash vulnerabilities"*

La clave fue pedir **una cosa por vez** con contexto específico (ruta de archivo, línea, comportamiento esperado).

---

### 5. ¿Qué respuestas de la IA tuvieron que corregir?

- En el focus trap, la IA sugirió una implementación genérica que no funcionaba correctamente con todos los modales. Hubo que ajustar la restauración del `activeElement` específica para cada modal (asignación, edición, confirmación de borrado).
- En el fix de `responsive.css`, la IA propuso reestructurar completamente las capas `@layer`, cuando solo faltaba un punto y coma y eliminar bloques duplicados.
- En `dashboard.js`, la IA intentó mantener las llamadas a `closeAssignModal` y `closeEditModal` que ya no existían como importaciones, en lugar de eliminarlas directamente.
- En el responsive audit, la IA propuso fixes de alta especificidad CSS (ej. `.main-navbar
  .navbar-container`) sin tener en cuenta que la arquitectura `@layer` hace que la capa
  `responsive` siempre gane sin importar la especificidad. Se simplificaron los selectores.
- El fix de `filterSelect` fue generado con una función wrapper innecesaria; se redujo a
  inline `document.getElementById()` en el punto de uso.

---

### 6. ¿Qué problemas tuvieron al trabajar con IA?

- **Alucinaciones de rutas**: La IA sugirió archivos que no existían en el proyecto o asumió ubicaciones incorrectas.
- **Sugerencias fuera de las reglas**: En algunas ocasiones propuso usar bibliotecas externas o frameworks, lo cual no está permitido en la consigna (solo HTML, CSS y JS vanilla).
- **Contexto limitado**: Al trabajar con archivos grandes, la IA a veces perdía el contexto de la arquitectura general del proyecto y sugería cambios inconsistentes.
- **Código muerto**: La IA mantuvo funciones como `isBalanceCritical()` e `isGoalUnreached()` en `finance.js` sin advertir que no se estaban utilizando, hasta que se lo señaló explícitamente.
- **Compactación de contexto**: En conversaciones largas, Claude Code compacta automáticamente
  el historial. Esto causó que en un reinicio de sesión la IA no recordara cambios previos
  y sugiriera fixes que revertían trabajo ya hecho. Se resolvió leyendo el estado actual
  del código antes de aplicar cambios.

---

### 7. ¿Qué aprendieron durante el proceso?

- **Comprensión de `@layer` en CSS**: Cómo funciona el orden de capas y la especificidad al usar `@layer` para organizar estilos.
- **Cascada `@layer` vs especificidad**: En CSS con `@layer`, el orden de capas siempre
  gana sobre la especificidad del selector. Una regla `.a .b` en `@layer responsive` vence
  a `.a .b .c .d` en `@layer components`. Esto cambia completamente cómo se estructuran
  los overrides responsive.
- **Focus trap nativo sin librerías**: Cómo implementar un ciclo de foco accesible usando `querySelectorAll` y `keydown` events.
- **`prefers-reduced-motion`**: Cómo respetar las preferencias del sistema operativo para animaciones accesibles.
- **Roles ARIA**: Uso correcto de `tablist`/`tab`/`tabpanel`, `dialog`, `alert`, `region`, y `aria-hidden` en iconos decorativos.
- **Mobile-first responsive**: La diferencia entre simplemente encoger elementos y realmente reorganizar el layout con `min-width`.
- **Conventional Commits**: Escribir mensajes de commit descriptivos siguiendo el formato `tipo: descripción`.
- **`position: fixed` como containing block**: Al remover `position: relative` de un
  contenedor, el containing block del descendiente `position: absolute` sube al próximo
  ancestro posicionado. Usado para corregir el ancho del menú mobile dropdown.
- **`navigateTo()` para transiciones no-link**: Patrón para triggear `animationend` desde
  cualquier elemento, no solo `<a>`.
- **CSS Variable vs valor hardcoded**: Usar `--navbar-h` como única fuente de verdad para
  la altura del navbar evita desincronización entre `padding-top`, `scroll-padding-top` y
  `account-menu top`.

---

### 8. ¿Qué partes del código puede explicar cada integrante?

| Integrante | Rol principal | Puede explicar |
|------------|---------------|----------------|
| **Facundo Ferreyra** | Arquitecto de funcionalidades | Sistema de autenticación multi-cuenta con login, register y rutas protegidas. Toggle de tema claro/oscuro con persistencia. Landing page completa con hero, carrusel de pasos, gradientes y botón GitHub. Dashboard con panel de metas, filtro de categorías por tipo de movimiento y actividad reciente. Transiciones de página con fade+slide. Parches de seguridad contra inyección de clases CSS. Validaciones de formularios en español. Múltiples fixes responsive en modales, carrusel, navbar y layout general |
| **Matias Sousa** | Arquitecto de interfaz | Setup del repositorio y estructura de carpetas del proyecto. Arquitectura completa de CSS con `@layer`, reset, grid y tokens de diseño. Sistema de metas de ahorro con renderizado dinámico, progress bars y asignación de fondos. Tabla de historial completo con ordenamiento por fecha y monto. Acciones de editar y eliminar movimientos recientes. Compactación visual de cards de métricas y badges de metas. Refactor de JavaScript en módulos core/ui/routing. Conversión a responsive mobile-first. Auditoría completa de accesibilidad con focus trap, roles ARIA y soporte para `prefers-reduced-motion` |
| **Camila Scarfone** | Creadora de Mockup HTML Templates |


---

### 9. ¿Qué decisiones tomó el grupo sin depender de la IA?

- **Elección del proyecto**: Mini Finance (Idea 5) como simulador de presupuesto personal.
- **Arquitectura de almacenamiento**: Datos por usuario con claves namespaced (`mf-movements-{userId}`, `mf-goals-{userId}`).
- **Diseño visual**: Paleta de colores, tipografía, sombras y espaciados definidos por el grupo.
- **Flujo de navegación**: Página de landing → autenticación → dashboard (operaciones) → resumen (metas e historial).
- **Tema claro/oscuro**: Implementación con atributo `data-theme` en `<html>` y persistencia en `localStorage`.
- **Estructura del proyecto**: Organización en `pages/`, `assets/scripts/`, `assets/src/` con separación por responsabilidades.
- **Categorías de movimientos**: Definición de categorías de ingresos y gastos con comportamiento dinámico (campo de descripción para categorías específicas).

---

### 10. ¿Hubo código sugerido por IA que descartaron? ¿Por qué?

Sí. El caso más relevante fue el de las **alertas visuales**. La IA generó las funciones `isBalanceCritical()`, `isExpenseLimitExceeded()` e `isGoalUnreached()` en `assets/scripts/core/finance.js` con la intención de mostrar advertencias en el DOM cuando el usuario superara un límite de gasto o no alcanzara una meta de ahorro. Sin embargo, el grupo decidió **descartar la implementación DOM** de esas alertas porque las cards del dashboard ya son visualmente informativas por sí mismas: los montos de gasto se muestran con color de alerta (`--color-alert`), las tendencias tienen badges direccionales, y las métricas permiten al usuario interpretar su situación financiera sin necesidad de mensajes adicionales. Por lo que las funciones quedaron como código muerto y nunca se integraron al flujo principal de la aplicación.

---

