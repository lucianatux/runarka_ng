// ============================================================
// theme.js — Modo claro / oscuro.
// Único responsable: recordar la elección y alternarla.
//
// OJO: aplicar el tema acá sería tarde — la página ya se pintó
// clara y se ve un flash blanco en cada navegación. Por eso el
// tema se APLICA con el script inline del <head> de cada página,
// y este módulo solo maneja el botón.
// ============================================================

const STORAGE_KEY = "runarka_theme";

export function initTema() {
  const boton = document.querySelector("#theme-toggle");
  if (!boton) return;                    // la página no tiene header: nada que hacer

  boton.addEventListener("click", () => {
    const html = document.documentElement;
    const nuevo = html.dataset.theme === "dark" ? "" : "dark";
    html.dataset.theme = nuevo;
    try { localStorage.setItem(STORAGE_KEY, nuevo); } catch { /* sin persistencia */ }
  });
}
