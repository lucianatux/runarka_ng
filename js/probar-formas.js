// ============================================================
// probar-formas.js — TEMPORAL. Para que la clienta compare formas.
// Click en el logo del inicio o en la foto de Natalia = alterna
// entre dos versiones. Borrar este archivo y su import en main.js
// cuando decida.
// ============================================================

function alternar(img, alterna) {
  if (!img) return;
  const original = img.getAttribute("src");
  let mostrada = false;
  img.style.cursor = "pointer";
  img.title = "Tocá para cambiar la forma";
  img.addEventListener("click", () => {
    mostrada = !mostrada;
    img.src = mostrada ? alterna : original;
  });
}

export function initProbarFormas() {
  alternar(document.querySelector(".hero__logo"), "assets/img/filosofia.webp");
}