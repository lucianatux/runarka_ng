// ============================================================
// toast.js — Aviso breve abajo a la derecha.
// Único responsable: confirmar una acción sin robar el foco.
// ============================================================

const DURACION = 2200;
let pendiente;

export function toast(texto) {
  document.querySelector(".toast")?.remove();
  clearTimeout(pendiente);

  const t = document.createElement("div");
  t.className = "toast";
  t.setAttribute("role", "status");     // los lectores de pantalla lo anuncian
  t.textContent = texto;
  document.body.appendChild(t);

  // Un frame después, para que la transición de entrada corra.
  requestAnimationFrame(() => t.classList.add("is-visible"));

  // Se saca por tiempo, no por transitionend: con "reduced motion"
  // las transiciones están apagadas y ese evento nunca llegaría.
  pendiente = setTimeout(() => {
    t.classList.remove("is-visible");
    setTimeout(() => t.remove(), 300);
  }, DURACION);
}
