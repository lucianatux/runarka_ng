// ============================================================
// dom.js — Utilidades mínimas de DOM.
// Único responsable: que los textos del JSON no rompan el HTML.
// ============================================================

// La clienta edita productos.json a mano. Si escribe un nombre con
// comillas o un < , sin esto se rompe el markup de la tarjeta.
export function esc(texto) {
  const d = document.createElement("div");
  d.textContent = texto ?? "";
  return d.innerHTML;
}
